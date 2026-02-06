# 04. Tracking Integration (Closed Loop)

**Datum:** 06.02.2026
**Autor:** Antigravity (AI)

## Übersicht

Implementierung der ID-Übergabe für einen geschlossenen Tracking-Kreislauf (Scout -> Invite -> Lead).

## Funktionsweise

### 1. IDs auslesen

Das Widget (`widget.js`) sammelt nun beim Absenden zwei wichtige IDs:

1.  **Campaign ID:**
    - Wird als HTML-Attribut am Widget-Tag definiert.
    - Beispiel: `<sim-scouting-widget campaign-id="c075..."></sim-scouting-widget>`
    - Im Code: `this.getAttribute('campaign-id')`

2.  **Scout ID:**
    - Wird aus der URL des Browsers (`window.location.search`) gelesen.
    - Parameter: `?ref=...`
    - Im Code: `new URLSearchParams(...).get('ref')`
    - _Fallback:_ Auf `localhost` wird automatisch eine Test-ID genutzt, falls kein `ref`-Parameter erkannt wird.

### 2. Speicherung in Supabase

Beim `INSERT` in die Tabelle `invites` werden diese IDs nun gesetzt (statt `null`).

- `campaign_id`: Die ID aus dem Attribut.
- `scout_id`: Die ID aus dem URL-Parameter `ref`.

Das ermöglicht später die Zuordnung: Welcher Lead wurde über welche Kampagne von welchem Scout geworben.

## Testen

1.  Öffne die Scout App mit einer (validen) Scout-ID.
2.  Klicke "Link kopieren".
3.  Öffne den kopierten Link im Browser (das ist die `test_page.html` mit angehängtem `?ref=...`).
4.  Fülle das Formular aus und sende es ab.
5.  Prüfe in Supabase (Invites Tabelle), ob `scout_id` und `campaign_id` korrekt gefüllt sind.
