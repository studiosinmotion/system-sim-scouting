# 13. Universal Tracking SDK Implementation

## Übersicht

Das Tracking-System wurde von einem reinen Widget-basierten Ansatz zu einem **Universal Tracking SDK** (`window.SimScouting`) erweitert.
Dies ermöglicht eine robustere Erfassung von Leads und Conversions, auch wenn das visuelle Widget nicht direkt verwendet wird.

## Kernfunktionen

### 1. Globales Objekt & Persistenz

Das SDK stellt das globale Objekt `window.SimScouting` zur Verfügung.
Beim Laden der Seite prüft das SDK automatisch die URL auf folgende Parameter:

- `ref`
- `scout_id`
- `referrer`

Wird eine ID gefunden, wird sie im `localStorage` unter dem Key `sim_scout_id` gespeichert. Zusätzlich wird ein Zeitstempel `sim_scout_ts` gesetzt.
Dies stellt sicher, dass die Zuordnung auch dann erhalten bleibt, wenn der Nutzer die Seite verlässt und später zurückkehrt.

### 2. Public API Methoden

#### `SimScouting.getScoutId()`

Gibt die aktuell gespeicherte Scout-ID zurück (oder `null`).

```javascript
const id = SimScouting.getScoutId();
```

#### `SimScouting.getSource()`

Gibt die gespeicherte Quelle zurück (z.B. `'wa'`, `'em'`, `'cp'`), sofern vorhanden.

```javascript
const source = SimScouting.getSource();
```

#### `SimScouting.fillHiddenFields(selector)`

Sucht nach Input-Feldern, die dem CSS-Selector entsprechen, und setzt deren Wert auf die Scout-ID.

```javascript
// Beispiel für ein verstecktes Feld in einem Kontaktformular
SimScouting.fillHiddenFields(".sim-ref-id");
```

#### `SimScouting.trackConversion(conversionName, metaData)`

Sendet ein Conversion-Event an die Datenbank.

- `conversionName`: Name des Events (z.B. 'lead_form_submit', 'checkout_success')
- `metaData`: Optionales Objekt mit zusätzlichen Daten.

```javascript
SimScouting.trackConversion("purchase", { value: 49.99 });
```

### 3. Datenbank & RLS Updates

Damit das Tracking ordnungsgemäß funktioniert und im Dashboard sichtbar ist, wurden die **Row Level Security (RLS)** Policies der Tabelle `tracking_events` angepasst.

- **Problem:** Zuvor konnten "anonyme" Besucher zwar Daten schreiben (`INSERT`), aber das Dashboard (welches ebenfalls als Client agiert) konnte diese Daten nicht lesen (`SELECT`), wodurch die Statistiken auf 0 blieben.
- **Lösung:** Eine neue Policy `Allow public select for tracking` wurde hinzugefügt, die `SELECT`-Zugriff für die Rollen `anon` und `authenticated` erlaubt.

Damit sind alle getrackten Events (Page Views und Conversions) für das Admin-Dashboard sichtbar.

## Migration

Das bestehende `<sim-scouting-widget>` wurde so umgebaut, dass es intern nun das SDK nutzt.
Es ist keine Änderung an bestehenden Integrationen notwendig. Das Widget profitiert automatisch von der verbesserten Persistenz.
