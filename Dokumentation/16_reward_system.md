# Belohnungssystem & Gewinnspiele

Das System bietet eine flexible Möglichkeit, Scouts für erfolgreiche Empfehlungen zu belohnen. Die Konfiguration erfolgt pro Kampagne über ein **JSON-Feld** (`reward_config`) in der Datenbank.

## Funktionsweise

1.  **Trigger:** Ein "Lead" (erfolgreiche Empfehlung) wird erstellt.
2.  **Prüfung:** Das System lädt die `reward_config` der aktuellen Kampagne.
3.  **Filterung:** Es wird geprüft, ob der Lead im **Aktionszeitraum** liegt (`valid_from` bis `valid_until`).
4.  **Anzeige:**
    - **Sofort-Prämie:** Wird als "Verdient" (grünes Häkchen) in der App angezeigt.
    - **Gewinnspiel:** Ein virtuelles Los wird dem "Lostopf" hinzugefügt.

---

## JSON-Konfiguration (`reward_config`)

Das JSON-Objekt steuert die Anzeige und Logik. Es besteht aus zwei Hauptbereichen: `lottery` (Gewinnspiel) und `instant_reward` (Sofort-Prämie).

### Beispiel-Konfiguration

```json
{
  "lottery": {
    "active": true,
    "title": "Gewinne ein iPhone 16",
    "description": "Jede Empfehlung = 1 Los im Topf.",
    "icon": "🎟️",
    "draw_date": "2026-04-01",
    "valid_from": "2026-01-01",
    "valid_until": "2026-03-31"
  },
  "instant_reward": {
    "active": true,
    "type": "voucher",
    "title": "Gratis Eiweiß-Shake",
    "description": "Für jeden Freund, der sich anmeldet.",
    "icon": "🥤",
    "valid_from": "2026-01-01",
    "valid_until": "2026-12-31",
    "mail_subject": "Dein gratis Shake ist da! 🥤",
    "mail_body": "Glückwunsch! Zeig diese Mail im Studio vor."
  }
}
```

### Felder-Erklärung

#### Allgemein (für beide Bereiche)

- **active** (`boolean`): Schaltet die Belohnung an (`true`) oder aus (`false`).
- **title** (`string`): Titel der Belohnung (z.B. "Gratis Shake").
- **description** (`string`): Kurzer Untertitel.
- **icon** (`string`): Emoji oder Icon-Code.
- **valid_from** (`YYYY-MM-DD`): _Optional_. Startdatum der Aktion. Leads davor zählen nicht.
- **valid_until** (`YYYY-MM-DD`): _Optional_. Enddatum der Aktion. Leads danach zählen nicht.

#### Spezifisch für `lottery`

- **draw_date** (`YYYY-MM-DD`): Das Datum der Auslosung (wird im Banner angezeigt).

#### Spezifisch für `instant_reward`

- **type**: Art der Belohnung (z.B. `"voucher"`).
- **mail_subject**: Betreff der automatischen E-Mail (Vorbereitung für Backend-Versand).
- **mail_body**: Inhalt der E-Mail.

---

## Implementierungs-Details

### Frontend (`scout_app.html`)

Die Funktion `renderAchievements(invites, config)` übernimmt die Logik:

- Sie filtert alle Invites, die keinen "echten" Lead-Status haben (ignoriert 'clicked').
- Sie prüft per `isDateInScope()`, ob das `created_at` Datum des Leads im konfigurierten Zeitraum liegt.
- **Anzeige:**
  - Leads **innerhalb** des Zeitraums erhalten ein ✅ Icon und den Status "Verdient".
  - Leads **außerhalb** des Zeitraums erhalten ein 🕰️ Icon und den Status "Abgelaufen" (werden also nicht gewertet).
