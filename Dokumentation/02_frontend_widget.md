# 02. Frontend Widget

**Datum:** 06.02.2026
**Autor:** Antigravity (AI)

## Übersicht

Erstellung eines Web Components (`<sim-scouting-widget>`), das ein Lead-Formular bereitstellt und Daten direkt an Supabase sendet.

## Dateien

- `/widget.js`: Das Web Component.
- `/test_page.html`: Einfache Test-Seite zum Einbinden.

## Implementation Details

### 1. Web Component (`widget.js`)

- **Technologie:** Native Web Component (Custom Elements V1) mit Shadow DOM.
- **Abhängigkeiten:** `@supabase/supabase-js` (via ESM CDN eingebunden).
- **Funktion:**
  - Rendert ein Formular (Name, Telefon).
  - Sendet Daten an die Tabelle `invites`.
  - Nutzt `null` für `campaign_id` und `scout_id` (Dummy-Werte), um FK-Constraints nicht zu verletzen (solange keine echten IDs vorliegen).
  - Zeigt Erfolgsmeldung oder Fehler nach dem Senden.

### 2. Test-Seite (`test_page.html`)

- Minimales HTML-Gerüst.
- Bindet `widget.js` als Modul ein.
- Platziert `<sim-scouting-widget></sim-scouting-widget>`.

## Anleitung: Lokal Testen

Da das Widget als ES-Modul (`type="module"`) eingebunden ist, kann es bei direktem Öffnen via Doppelklick (`file://` Protokoll) zu CORS-Fehlern im Browser kommen.

**Empfohlene Methode:**

1.  Nutze `npx serve` im Projektordner:
    ```bash
    npx serve
    ```
2.  Öffne die angezeigte Localhost-URL (z.B. `http://localhost:3000/test_page.html`).

Alternativ: VS Code "Live Server" Extension nutzen.
