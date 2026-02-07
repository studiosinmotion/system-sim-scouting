# 08. Scout Onboarding (Self-Registration)

**Datum:** 06.02.2026
**Autor:** Antigravity (AI)
**Status:** Live (Production)

## Übersicht

Implementierung des Registrierungs-Flows in der `scout_app.html`. Das System erkennt nun automatisch, ob ein Besucher bereits ein registrierter Scout ist (via URL-ID) oder ein neuer Interessent (keine ID).

Dies ermöglicht das Verteilen von allgemeinen QR-Codes im Studio (z.B. am Tresen), über die sich Mitglieder selbstständig als Scout anmelden können.

## Funktionsweise ("Der intelligente Türsteher")

Die App prüft beim Laden die Browser-URL auf den Parameter `?id=`.

### Szenario A: Unbekannter Besucher (Keine ID)

- **View:** Das Dashboard mit den Teilen-Buttons wird ausgeblendet (`hidden`).
- **Action:** Ein Registrierungs-Formular ("Werde Scout") wird angezeigt.
- **Prozess:**
  1. User gibt Name und E-Mail ein.
  2. App sendet `INSERT` an Supabase Tabelle `scouts`.
  3. Die feste **Tenant-ID** (`79a3...`) wird automatisch hinterlegt.
  4. App empfängt die neu generierte UUID.
  5. Seite lädt neu (Redirect auf sich selbst) mit `?id=[NEUE_UUID]`.

### Szenario B: Bekannter Scout (Mit ID)

- **View:** Das Registrierungs-Formular wird ausgeblendet.
- **Action:** Das Dashboard (WhatsApp / Copy Link) wird angezeigt.
- **Personalisierung:** Die ID wird genutzt, um die Referral-Links (`?ref=...`) zu generieren.

## Technische Details

### Supabase Client

In der `scout_app.html` wurde die `supabase-js` Bibliothek via CDN eingebunden, um Schreibzugriffe (INSERT) direkt vom Frontend zu ermöglichen.

- **Tabelle:** `public.scouts`
- **Tenant ID (Hardcoded):** `79a37c78-7bdf-45e4-a631-fb47926d054d` (Power Gym Berlin)
- **RLS (Security):** Aktuell deaktiviert (oder offen für Anon-Key), um Registrierung zu erlauben.

### Code-Struktur (Auszug)

```javascript
// Logik-Weiche
const urlParams = new URLSearchParams(window.location.search);
let scoutId = urlParams.get("id");

if (!scoutId) {
  // Zeige Registrierung
  document.getElementById("view-register").classList.remove("hidden");
} else {
  // Zeige Dashboard
  document.getElementById("view-dashboard").classList.remove("hidden");
  // ... Generiere Links ...
}
```
