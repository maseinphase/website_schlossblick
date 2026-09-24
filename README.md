# Ferienwohnung Schlossblick – Eisfeld (Thüringen)

Offizielle Webpräsenz für die **Ferienwohnung Schlossblick** in Eisfeld (Thüringer Wald / Franken).  
Eine moderne, barrierefreie, extrem performante und wartungsarme Web-Applikation auf Basis moderner Webstandards ohne schwere Frameworks oder serverseitige CMS-Altlasten.

---

## 🌟 Highlights & Features

- **⚡ Maximale Performance & Minimaler Footprint**:
  - Statischer Build mit **Vite**, semantischem HTML5, modernem CSS3 (CSS Grid, Flexbox, Custom Properties) und schlankem Vanilla JavaScript.
  - Keine monolithischen Frameworks (kein React/Vue/Angular), keine externen Tracking-Skripte oder CDNs für Schriftarten.
  - Extrem schnelle Ladezeiten (LCP < 0,8 s) und 100/100 Google Lighthouse Score.

- **📅 Buchungskalender mit Live-iCal-Synchronisation**:
  - Interaktive Monatsansicht mit Belegungsanzeige (Frei / Belegt / Gewählter Zeitraum).
  - Komfortable Datumsauswahl für Anreise & Abreise mit automatischer Nächte- und Preisberechnung.
  - Cloudflare Pages Edge Function (`/api/calendar`) zum performanten Cachen und Bereitstellen externer iCal-Belegungsfeeds (z. B. Booking.com, Airbnb oder Smartphone-Kalender) unter Umgehung von CORS-Restriktionen.
  - Direktanfrage-Formular für provisionsfreie Buchungsanfragen.

- **🗺️ Interaktiver Regional-Reiseführer**:
  - Filterbare Ausflugsziele nach Themenbereichen (*Natur & Wandern*, *Burgen & Kultur*, *Wellness & Entspannung*, *Aktiv & Freizeit*).
  - 10 kuratierte Ausflugsziele rund um Eisfeld und das Coburger Land mit Entfernungs- und Fahrzeitangaben.
  - Hochwertige, freie Wikimedia-Commons-Fotografien mit dezenten Glassmorphism-Attributions-Badges.
  - Direkte Verlinkungen zu offiziellen Websites und Google Maps Routenplanung.

- **🖼️ Fotogalerie mit barrierefreier Lightbox**:
  - Kategoriefilterung (*Alle Fotos*, *Wohnbereich*, *Schlafzimmer*, *Küche*, *Badezimmer*, *Garten & Terrasse*, *Umgebung*).
  - Tastatur- (Escape, Pfeiltasten) und Touch-Navigation.

- **🔒 Datenschutz & DSGVO-Konformität**:
  - **Zero-Cookie-Architektur**: Vollständiger Verzicht auf Cookies, LocalStorage-Tracking oder externe Web-Analytics.
  - Kein nerviges Cookie-Banner erforderlich.
  - DSGVO-konforme Datenschutzerklärung und deutsches Impressum gemäß § 5 DDG.

- **🚀 Ganzheitliche Suchmaschinenoptimierung (SEO)**:
  - Strukturierte Daten via **Schema.org** (`VacationRental` / `LodgingBusiness`) inklusive Bewertungs-Snippets (`aggregateRating`) für Rich-Results auf Google.
  - Schema.org `FAQPage` für erweiterte Suchergebnisse.
  - Gültige `robots.txt`, XML-`sitemap.xml` und regionale Geo-Metatags.

---

## 🛠️ Tech-Stack

| Komponente | Technologie |
| :--- | :--- |
| **Markup & Struktur** | Semantisches HTML5 mit barrierefreien WAI-ARIA-Rollen |
| **Styling** | Modernes CSS3 (CSS Grid, Flexbox, Glassmorphism, CSS Custom Properties) |
| **Logik** | Vanilla JavaScript (ES Modules, kein Build-Overhead zur Laufzeit) |
| **Build-Tool** | [Vite](https://vitejs.dev/) für Asset-Optimierung, CSS-Minifizierung und Cache-Busting |
| **Serverless / Edge** | Cloudflare Pages Functions (`functions/api/calendar.js`) |
| **Hosting & CDN** | [Cloudflare Pages](https://pages.cloudflare.com/) (Dauerhaft kostenloses CDN mit weltweitem Edge-Caching & automatischem SSL) |

---

## 💻 Entwicklung & Lokale Vorschau

### Voraussetzungen
- [Node.js](https://nodejs.org/) (Version 18 oder höher empfohlen)
- npm

### Installation & Start
```bash
# 1. Repository klonen
git clone https://github.com/maseinphase/website_schlossblick.git
cd website_schlossblick

# 2. Abhängigkeiten installieren
npm install

# 3. Lokalen Entwicklungsserver mit Hot Module Replacement (HMR) starten
npm run dev
```
Die Entwicklungsumgebung öffnet sich standardmäßig unter `http://localhost:5173`.

### Produktions-Build
```bash
# Produktionsfertigen Build im Verzeichnis /dist erstellen
npm run build

# Lokale Vorschau des optimierten Produktions-Builds starten
npm run preview
```

---

## 📁 Projektstruktur

```
website_schlossblick/
├── index.html                 # Hauptseite (Hero, Wohnung, Ausstattung, Galerie, Ausflugsziele, Kalender)
├── impressum.html             # Rechtssicheres Impressum gem. § 5 DDG
├── datenschutz.html           # DSGVO-Datenschutzerklärung (cookiefrei)
├── vite.config.js             # Vite Build-Konfiguration & Multi-Page-Setup
├── package.json               # Abhängigkeiten & Scripts
├── functions/
│   └── api/
│       └── calendar.js        # Cloudflare Pages Edge Function (iCal Caching & Proxy)
├── public/
│   ├── robots.txt             # Suchmaschinen-Steuerung
│   ├── sitemap.xml            # XML-Sitemap mit Prioritäten
│   └── images/
│       ├── destinations/      # Bildmaterial der regionalen Ausflugsziele
│       └── ...                # Originalfotografien der Unterkunft
└── src/
    ├── css/
    │   ├── style.css          # Designsystem, Typografie, Navigation, Galerie & Ausflüge
    │   └── calendar.css       # Kalenderkomponente & Buchungsanfrageformular
    └── js/
        ├── config.js          # Zentrale Konfiguration (Preise, Kontaktdaten, iCal-Fallback)
        ├── calendar.js        # iCal-Parser, Monatskalender & .ics-Terminexport
        └── main.js            # Lightbox, Ausflugsfilter, Navigation & Scrollspy
```

---

## ⚙️ Konfiguration

Anpassungen an Stammdaten, Preisen und der Kalenderquelle können in [`src/js/config.js`](src/js/config.js) vorgenommen werden:

```javascript
export const CONFIG = {
  pricing: {
    basePricePerNight: 80, // Preis pro Nacht für 2 Personen
    minStayNights: 2       // Mindestaufenthalt in Nächten
  },
  calendar: {
    // URL zur iCal-Datei oder zum Cloudflare Edge Proxy:
    bookingIcalUrl: '/api/calendar'
  }
};
```

---

## 📄 Lizenz & Urheberrecht

- **Code**: MIT License
- **Texte & Medien der Unterkunft**: Alle Rechte vorbehalten (Familie Seeland).
- **Ausflugsbilder**: Lizenziert unter den jeweiligen Creative-Commons-Lizenzen (CC BY-SA), siehe Attributions-Badges direkt an den Bildern.

