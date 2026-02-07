# 09. Flexibilisierung Einladungstexte (Dynamic Text Feature)

**Datum:** 06.02.2026
**Autor:** Antigravity (AI)

## Übersicht

Um das System flexibler zu gestalten, wurde der Einladungstext für WhatsApp aus dem Hardcode der `scout_app.html` in die Datenbank verlagert. Dies ermöglicht es Administratoren oder Studiobetreibern, die Texte zentral über die Datenbank zu ändern, ohne den Source Code der App anzufassen.

## Implementation Details

### 1. Datenbank-Erweiterung (`update_text_feature.js`)

Ein Node.js Skript wurde erstellt, um die Datenbank-Schema-Änderungen durchzuführen und initiale Daten zu setzen.

- **Tabelle:** `campaigns`
- **Änderung:** Neue Spalte `scouting_text` (Type: `TEXT`, Nullable) wurde hinzugefügt.
- **Daten:** Für den existierenden Tenant ('Power Gym') wurde ein Standardtext gesetzt.

**SQL-Logik:**

```sql
ALTER TABLE campaigns ADD COLUMN scouting_text TEXT;
UPDATE campaigns
SET scouting_text = 'Hey! Ich schenke dir 7 Tage Training im Power Gym. Mach mit: {{link}}'
WHERE tenant_id = '79a37c78-7bdf-45e4-a631-fb47926d054d';
```

### 2. Frontend-Logik (`scout_app.html`)

Die Logik der Scout App wurde angepasst, um diesen dynamischen Text zu verarbeiten.

- **Abruf:** Beim Laden des Dashboards (`initDashboard`) wird nun asynchron die aktive Kampagne des Tenants abgefragt.
- **Platzhalter:** Der Platzhalter `{{link}}` im Text wird client-seitig durch den generierten Referral-Link ersetzt.
- **Fallback:** Sollte kein Text in der Datenbank gefunden werden oder der Abruf fehlschlagen, wird der bisherige Standardtext ("Hey, ich lade dich zu 7 Tagen Training ein...") verwendet.
- **WhatsApp:** Der generierte, dynamische Text wird direkt in den `href` des WhatsApp-Buttons injiziert.

## Testen

Der Text kann nun direkt in der `campaigns` Tabelle in der Spalte `scouting_text` geändert werden. Beim Neuladen der App wird sofort der neue Text angezeigt.

- **Skript zur Ausführung:** `node update_text_feature.js` (wurde bereits initial ausgeführt).
