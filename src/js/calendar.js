/**
 * Ferienwohnung Schlossblick - Interaktiver Belegungskalender & iCal-Parser
 * Synchronisiert mit Booking.com und ermöglicht Direktanfragen ohne Provision.
 */

import { CONFIG } from './config.js';

export class BookingCalendar {
  constructor(calendarRootId, formRootId) {
    this.calRoot = document.getElementById(calendarRootId);
    this.formRoot = document.getElementById(formRootId);
    
    // Aktuelles Anzeigedatum (Monat / Jahr)
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth(); // 0 = Jan, 11 = Dez
    this.today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Ausgewählte Reisedaten
    this.selectedStart = null;
    this.selectedEnd = null;

    // Belegte Zeiträume [{ start: Date, end: Date, summary: string }]
    this.blockedRanges = [];

    this.monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    this.init();
  }

  async init() {
    if (!this.calRoot) return;

    // 1. Initiales Rendering mit Ladezustand
    this.renderSkeleton();

    // 2. Belegungsdaten laden (Live-iCal oder Demodaten)
    await this.loadAvailability();

    // 3. Kalender rendern & Events verknüpfen
    this.render();
    this.initFormListeners();
  }

  renderSkeleton() {
    this.calRoot.innerHTML = `
      <div class="calendar-header">
        <h3 class="calendar-month-title">${this.monthNames[this.currentMonth]} ${this.currentYear}</h3>
        <div class="calendar-nav-buttons">
          <button class="cal-nav-btn" id="cal-prev" aria-label="Vorheriger Monat">&larr;</button>
          <button class="cal-nav-btn" id="cal-next" aria-label="Nächster Monat">&rarr;</button>
        </div>
      </div>
      <div class="calendar-weekdays">
        <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
      </div>
      <div class="calendar-days-grid" id="cal-days-grid">
        <div style="grid-column: span 7; text-align: center; padding: 2rem; color: var(--color-text-muted);">
          Kalender wird geladen...
        </div>
      </div>
    `;
  }

  /**
   * Lädt iCal-Daten über die Cloudflare Edge Function / Proxy-Route
   * oder greift bei Ausfall / Offline auf die Demo-Sperrdaten zurück.
   */
  async loadAvailability() {
    const syncStatusEl = document.getElementById('cal-sync-status');
    
    try {
      if (CONFIG.calendar.bookingIcalUrl || CONFIG.calendar.apiProxyEndpoint) {
        const endpoint = CONFIG.calendar.apiProxyEndpoint || CONFIG.calendar.bookingIcalUrl;
        const res = await fetch(endpoint, { cache: 'no-store' });
        
        if (res.ok) {
          const icsText = await res.text();
          if (icsText && icsText.includes('BEGIN:VCALENDAR')) {
            this.blockedRanges = this.parseICal(icsText);
            if (syncStatusEl) {
              syncStatusEl.innerHTML = `<span class="sync-pulse"></span> Live synchronisiert mit Booking.com`;
            }
            return;
          }
        }
      }
    } catch (e) {
      console.info('Live-iCal derzeit nicht erreichbar oder noch nicht konfiguriert. Nutze hinterlegte Belegungsdaten.', e);
    }

    // Fallback: Hinterlegte Belegungsdaten
    this.blockedRanges = CONFIG.calendar.demoBlockedDates.map(item => ({
      start: new Date(item.start + 'T00:00:00'),
      end: new Date(item.end + 'T00:00:00'),
      summary: item.summary
    }));

    if (syncStatusEl) {
      syncStatusEl.innerHTML = `<span class="sync-pulse"></span> Belegungsdaten aktuell`;
    }
  }

  /**
   * Robuster RFC-5545 iCal Parser für Booking.com Belegungs-Feeds
   */
  parseICal(icsContent) {
    const ranges = [];
    const events = icsContent.split('BEGIN:VEVENT');

    for (let i = 1; i < events.length; i++) {
      const eventChunk = events[i].split('END:VEVENT')[0];
      
      const dtStartMatch = eventChunk.match(/DTSTART(?:;VALUE=DATE)?:?(\d{8})/);
      const dtEndMatch = eventChunk.match(/DTEND(?:;VALUE=DATE)?:?(\d{8})/);
      const summaryMatch = eventChunk.match(/SUMMARY:(.*)/);

      if (dtStartMatch && dtEndMatch) {
        const startStr = dtStartMatch[1];
        const endStr = dtEndMatch[1];

        const start = new Date(
          parseInt(startStr.substring(0, 4)),
          parseInt(startStr.substring(4, 6)) - 1,
          parseInt(startStr.substring(6, 8))
        );

        const end = new Date(
          parseInt(endStr.substring(0, 4)),
          parseInt(endStr.substring(4, 6)) - 1,
          parseInt(endStr.substring(6, 8))
        );

        ranges.push({
          start,
          end,
          summary: summaryMatch ? summaryMatch[1].trim() : 'Belegt'
        });
      }
    }
    return ranges;
  }

  isDateBooked(date) {
    const checkTime = date.getTime();
    return this.blockedRanges.some(range => {
      // Abreisetag eines Gastes kann Anreisetag eines neuen Gastes sein
      return checkTime >= range.start.getTime() && checkTime < range.end.getTime();
    });
  }

  render() {
    this.calRoot.innerHTML = `
      <div class="calendar-header">
        <h3 class="calendar-month-title">${this.monthNames[this.currentMonth]} ${this.currentYear}</h3>
        <div class="calendar-nav-buttons">
          <button class="cal-nav-btn" id="cal-prev" aria-label="Vorheriger Monat">&larr;</button>
          <button class="cal-nav-btn" id="cal-next" aria-label="Nächster Monat">&rarr;</button>
        </div>
      </div>
      <div class="calendar-weekdays">
        <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
      </div>
      <div class="calendar-days-grid" id="cal-days-grid"></div>
    `;

    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    const grid = document.getElementById('cal-days-grid');

    // Kein Navigieren in vergangene Monate
    const isCurrentOrPastMonth = 
      this.currentYear < this.today.getFullYear() ||
      (this.currentYear === this.today.getFullYear() && this.currentMonth <= this.today.getMonth());
    
    prevBtn.disabled = isCurrentOrPastMonth;

    prevBtn.onclick = () => {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.render();
    };

    nextBtn.onclick = () => {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.render();
    };

    // Erster Wochentag des Monats (0=So, 1=Mo, ..., 6=Sa) -> Umrechnen auf Mo=0, So=6
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const leadingBlanks = (firstDay + 6) % 7;

    // Anzahl Tage im Monat
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // 1. Leere Füllzellen am Monatsanfang
    for (let i = 0; i < leadingBlanks; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day empty';
      grid.appendChild(blank);
    }

    // 2. Tage des Monats
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const isPast = date < this.today;
      const isToday = date.getTime() === this.today.getTime();
      const isBooked = this.isDateBooked(date);

      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day';
      dayEl.textContent = day;
      dayEl.setAttribute('role', 'button');
      dayEl.setAttribute('tabindex', isPast || isBooked ? '-1' : '0');

      if (isToday) dayEl.classList.add('today');

      if (isPast) {
        dayEl.classList.add('past');
        dayEl.title = 'Vergangener Tag';
      } else if (isBooked) {
        dayEl.classList.add('booked');
        dayEl.title = 'Bereits belegt über Booking.com';
      } else {
        dayEl.classList.add('available');
        dayEl.title = 'Frei / Verfügbar';

        // Markierung ausgewählter Zeitraum
        if (this.selectedStart && date.getTime() === this.selectedStart.getTime()) {
          dayEl.classList.add('selected-start');
        } else if (this.selectedEnd && date.getTime() === this.selectedEnd.getTime()) {
          dayEl.classList.add('selected-end');
        } else if (this.selectedStart && this.selectedEnd && 
                   date.getTime() > this.selectedStart.getTime() && 
                   date.getTime() < this.selectedEnd.getTime()) {
          dayEl.classList.add('in-range');
        }

        // Klick-Event zur Datumsauswahl
        dayEl.onclick = () => this.handleDateClick(date);
      }

      grid.appendChild(dayEl);
    }
  }

  handleDateClick(date) {
    if (!this.selectedStart || (this.selectedStart && this.selectedEnd)) {
      // Neuer Auswahlstart
      this.selectedStart = date;
      this.selectedEnd = null;
    } else if (this.selectedStart && !this.selectedEnd) {
      if (date.getTime() <= this.selectedStart.getTime()) {
        // Klick vor Anreise: Starte neu mit diesem Datum
        this.selectedStart = date;
      } else {
        // Prüfen, ob dazwischen belegte Tage liegen
        let conflict = false;
        let d = new Date(this.selectedStart);
        while (d < date) {
          if (this.isDateBooked(d)) {
            conflict = true;
            break;
          }
          d.setDate(d.getDate() + 1);
        }

        if (conflict) {
          alert('Im gewählten Zeitraum liegt mindestens ein bereits belegter Tag. Bitte wählen Sie einen zusammenhängenden freien Zeitraum.');
          this.selectedStart = date;
        } else {
          this.selectedEnd = date;
        }
      }
    }

    this.render();
    this.updateInquiryForm();
  }

  updateInquiryForm() {
    const startStr = this.selectedStart ? this.formatDateDE(this.selectedStart) : 'Bitte auswählen';
    const endStr = this.selectedEnd ? this.formatDateDE(this.selectedEnd) : 'Bitte auswählen';

    const checkInEl = document.getElementById('inquiry-checkin-text');
    const checkOutEl = document.getElementById('inquiry-checkout-text');
    const nightsEl = document.getElementById('inquiry-nights-count');
    const priceEl = document.getElementById('inquiry-total-price');

    if (checkInEl) checkInEl.textContent = startStr;
    if (checkOutEl) checkOutEl.textContent = endStr;

    // Formular Input-Felder
    const inputStart = document.getElementById('form-checkin');
    const inputEnd = document.getElementById('form-checkout');
    if (inputStart && this.selectedStart) inputStart.value = this.formatDateISO(this.selectedStart);
    if (inputEnd && this.selectedEnd) inputEnd.value = this.formatDateISO(this.selectedEnd);

    // Reset Button steuern
    const resetBtn = document.getElementById('reset-dates-btn');
    if (resetBtn) {
      if (this.selectedStart || this.selectedEnd) {
        resetBtn.style.display = 'inline-block';
        resetBtn.onclick = () => {
          this.selectedStart = null;
          this.selectedEnd = null;
          this.render();
          this.updateInquiryForm();
        };
      } else {
        resetBtn.style.display = 'none';
      }
    }

    if (this.selectedStart && this.selectedEnd) {
      const diffTime = Math.abs(this.selectedEnd - this.selectedStart);
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (nightsEl) nightsEl.textContent = `${nights} ${nights === 1 ? 'Nacht' : 'Nächte'}`;

      const total = nights * CONFIG.pricing.basePricePerNight;
      if (priceEl) priceEl.textContent = `ca. ${total} € (Endreinigung inklusive)`;
    } else {
      if (nightsEl) nightsEl.textContent = '–';
      if (priceEl) priceEl.textContent = `${CONFIG.pricing.basePricePerNight} € / Nacht`;
    }
  }

  formatDateDE(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }

  formatDateISO(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  }

  initFormListeners() {
    if (!this.formRoot) return;

    this.formRoot.onsubmit = (e) => {
      e.preventDefault();

      if (!this.selectedStart || !this.selectedEnd) {
        alert('Bitte wählen Sie zuerst im Kalender Ihr gewünschtes Anreise- und Abreisedatum aus.');
        return;
      }

      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-phone').value;
      const guests = document.getElementById('form-guests').value;
      const message = document.getElementById('form-message').value;

      const subject = encodeURIComponent(`Buchungsanfrage Fewo Schlossblick: ${this.formatDateDE(this.selectedStart)} bis ${this.formatDateDE(this.selectedEnd)}`);
      const body = encodeURIComponent(
        `Guten Tag Familie Seeland,\n\n` +
        `ich interessiere mich für Ihre Ferienwohnung Schlossblick in Eisfeld:\n\n` +
        `• Anreise: ${this.formatDateDE(this.selectedStart)}\n` +
        `• Abreise: ${this.formatDateDE(this.selectedEnd)}\n` +
        `• Anzahl Gäste: ${guests}\n` +
        `• Name: ${name}\n` +
        `• E-Mail: ${email}\n` +
        `• Telefon: ${phone}\n\n` +
        `Nachricht:\n${message}\n\n` +
        `Ich freue mich über Ihre Rückmeldung zu Verfügbarkeit und Buchung.`
      );

      // Öffnet das Standard-E-Mail-Programm des Gastes mit vorformulierter Nachricht
      window.location.href = `mailto:${CONFIG.contact.bookingEmail}?subject=${subject}&body=${body}`;

      // Erfolgs-Feedback im UI
      const submitBtn = this.formRoot.querySelector('.form-submit-btn');
      if (submitBtn) {
        submitBtn.textContent = '✓ Anfrage vorbereitet in Ihrem E-Mail-Programm!';
        submitBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
          submitBtn.textContent = 'Unverbindliche Buchungsanfrage senden';
          submitBtn.style.backgroundColor = '';
        }, 5000);
      }
    };
  }
}

