/**
 * Cloudflare Pages Function: /api/calendar
 * Dient als performanter Edge-Proxy und Cache für den Booking.com iCal-Feed.
 * 
 * Vorteile:
 * 1. Umgeht Browser-CORS-Restriktionen von Booking.com
 * 2. Cacht den Feed für 60 Minuten am Edge (schützt vor Rate-Limits und sorgt für Ladezeiten < 50ms)
 * 3. 100 % kostenlos auf Cloudflare Pages
 */

export async function onRequestGet(context) {
  // 1. Booking.com iCal URL aus Umgebungsvariablen oder Fallback
  const bookingIcalUrl = context.env.BOOKING_ICAL_URL || "";

  // Falls noch keine Live-URL hinterlegt wurde
  if (!bookingIcalUrl) {
    return new Response(
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Fewo Schlossblick//Placeholder//DE\r\nEND:VCALENDAR",
      {
        status: 200,
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  }

  try {
    const response = await fetch(bookingIcalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Fewo-Schlossblick-Sync-Bot/1.0)"
      },
      cf: {
        // Cloudflare Edge Cache für 1 Stunde
        cacheTtl: 3600,
        cacheEverything: true
      }
    });

    if (!response.ok) {
      throw new Error(`Booking.com antwortete mit Status ${response.status}`);
    }

    const icsData = await response.text();

    return new Response(icsData, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Fehler beim Abrufen des Booking.com Kalenders", details: error.message }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
