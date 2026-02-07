# 14. Lead Source Tracking & E-Mail Share

## Übersicht

Um den Erfolg verschiedener Kanäle besser messen zu können, wurde ein **Lead Source Tracking** implementiert.
Das System erkennt nun, ob ein Lead über WhatsApp, E-Mail oder durch Kopieren des Links generiert wurde.

Zusätzlich wurde die `scout_app.html` um eine **E-Mail-Teilen-Funktion** erweitert.

## Technische Umsetzung

### 1. URL-Parameter & SDK (`widget.js`)

Das Universal Tracking SDK (`widget.js`) wurde erweitert, um den URL-Parameter `source` auszulesen.

- **Logik:**
  1. Beim Laden der Seite prüft `init()` auf `?source=...` (z.B. `wa`, `em`, `cp`).
  2. Der Wert wird im `localStorage` unter `sim_scout_source` gespeichert.
  3. Beim Absenden des Formulars wird dieser Wert ausgelesen (`getSource()`) und in das JSON-Feld `lead_data` geschrieben.

- **Neue Methode:**

  ```javascript
  // Gibt z.B. 'wa' zurück
  const source = SimScouting.getSource();
  ```

- **Datenbank-Payload (`invites`):**
  ```json
  {
    "lead_data": {
      "first_name": "Max",
      "last_name": "Mustermann",
      "phone": "12345",
      "source": "wa" // 'wa' = WhatsApp, 'em' = Email, 'cp' = Copy, 'direct' = Unbekannt
    }
  }
  ```

### 2. Frontend (`scout_app.html`)

Die Scout App hängt nun automatisch den passenden Parameter an die generierten Links an:

- **WhatsApp Share:** `?ref=UUID&source=wa`
- **E-Mail Share (NEU):** `?ref=UUID&source=em`
  - Öffnet den Standard-Mail-Client (`mailto:`) mit vorbereitetem Betreff und Text.
- **Link kopieren:** `?ref=UUID&source=cp`

### 3. Admin Dashboard (`admin.html`)

Das Dashboard wurde aktualisiert, um die Quelle visualisiert darzustellen:

- **Leads-Tabelle:** Neue Spalte "Quelle" zeigt Icons an:
  - WhatsApp: Grünes WhatsApp-Icon
  - E-Mail: Blaues Brief-Icon
  - Copy: Link-Icon
  - QR-Code: QR-Icon (vorbereitet)
- **Live-Feed:** Zeigt im Text "Neuer Lead: [Name] **via WhatsApp**".

## Verwendete Codes

| `qr` | QR-Code (Scan) |
| `direct` | Kein Parameter (Direktaufruf) |

## 4. Kampagnen-Tracking (Neu)

Zusätzlich zur _Quelle_ (Source) kann nun auch eine _Kampagne_ (Campaign) getrackt werden. Dies ermöglicht die Analyse, woher der Scout ursprünglich kam (z.B. Newsletter, QR-Code im Studio).

### Funktionsweise (`scout_app.html`)

1.  **Erkennung:**
    Die App prüft beim Start auf folgende URL-Parameter:
    - `campaign`
    - `source` (Fallback, falls als Kampagne genutzt)
    - `utm_campaign`

2.  **Tracking:**
    Der gefundene Wert (z.B. `newsletter_winter`) wird **jedem** Event (Teilen, Kopieren, Speichern) als Metadaten hinzugefügt.

### Daten-Struktur in `tracking_events`

Das System speichert nun **zwei** Werte parallel:

```json
meta_data: {
  "campaign": "newsletter_winter",  // Eingehend: Woher kommt der Scout?
  "source": "wa"                    // Ausgehend: Womit teilt der Scout?
}
```

Dies ermöglicht eine detaillierte Auswertung:
_"Scout kam über den Winter-Newsletter (Campaign) und hat dann per WhatsApp (Source) geteilt."_
