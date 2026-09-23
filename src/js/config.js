/**
 * Ferienwohnung Schlossblick - Zentrale Konfiguration
 * Alle Stammdaten, Preise und Schnittstellen an einem Ort.
 */

export const CONFIG = {
  // Grunddaten
  propertyName: "Ferienwohnung Schlossblick",
  tagline: "Ihre Auszeit im Herzen Thüringens – Gemütlichkeit, Ruhe & Panoramablick",
  address: {
    street: "Unterm Heinig 20",
    zip: "98673",
    city: "Eisfeld",
    state: "Thüringen",
    country: "Deutschland",
    googleMapsUrl: "https://maps.google.com/?q=Unterm+Heinig+20,+98673+Eisfeld"
  },

  // Kontaktdaten der Vermieter (Eltern)
  contact: {
    name: "Gerdrun & Wolfram Seeland", // Vermieter
    phone: "+49 (0) 3686 123456", // Platzhalter für Eltern
    phoneFormatted: "+493686123456",
    email: "kontakt@fewo-schlossblick.de",
    bookingEmail: "anfrage@fewo-schlossblick.de",
    whatsapp: "+49 170 1234567"
  },

  // Eckdaten der Ferienwohnung
  details: {
    size: "48 m²",
    maxGuests: 3,
    rooms: "2 Zimmer (1 Schlafzimmer, 1 Wohnzimmer)",
    beds: "1 Doppelbett (180x200cm), 1 bequeme Schlafcouch",
    bathroom: "Modernes Bad mit ebenerdiger Dusche & WC",
    floor: "Erdgeschoss mit separatem Eingang",
    outdoor: "Eigene Terrasse & sonniger Garten mit Grill",
    parking: "Kostenfreier Privatparkplatz direkt vor der Tür",
    wifi: "Kostenloses Highspeed-WLAN",
    checkIn: "ab 15:00 Uhr (oder nach Absprache)",
    checkOut: "bis 10:30 Uhr"
  },

  // Richtpreise für Direktbuchungen (oft 10-15% günstiger als Booking.com)
  pricing: {
    basePricePerNight: 65, // Richtwert pro Nacht für 2 Personen
    extraPersonPerNight: 15,
    finalCleaning: 0, // Inklusive
    minStayNights: 2,
    currency: "€",
    includes: [
      "Bettwäsche & Handtücher inklusive",
      "Kostenfreies Highspeed-WLAN",
      "Privatparkplatz direkt am Haus",
      "Endreinigung & Nebenkosten inklusive",
      "Keine Buchungsgebühren (Direktbucher-Vorteil)"
    ]
  },

  // Booking.com Synchronisation
  calendar: {
    // Hier wird der iCal-Export-Link aus dem Booking.com Extranet eingetragen:
    // Format: https://admin.booking.com/hotel/hoteladmin/ical.html?t=...
    bookingIcalUrl: "", 
    
    // Lokale / Cloudflare Proxy-Route (umgeht Browser-CORS-Blockaden)
    apiProxyEndpoint: "/api/calendar",

    // Vorbelegte Beispiel-Buchungen (damit der Kalender auch ohne Live-Token sofort lebendig ist)
    demoBlockedDates: [
      { start: "2026-10-02", end: "2026-10-06", summary: "Belegt (Herbstwoche)" },
      { start: "2026-10-16", end: "2026-10-18", summary: "Belegt (Wochenende)" },
      { start: "2026-11-05", end: "2026-11-09", summary: "Belegt" },
      { start: "2026-12-23", end: "2027-01-02", summary: "Belegt (Weihnachten & Silvester)" }
    ]
  },

  // Bewertungen aus Booking.com
  rating: {
    score: "9,8",
    maxScore: "10",
    badge: "Außergewöhnlich",
    reviewCount: 51,
    subscores: {
      cleanliness: "10.0",
      comfort: "9.8",
      location: "9.8",
      facilities: "9.7",
      staff: "10.0",
      valueForMoney: "9.8"
    }
  }
};

