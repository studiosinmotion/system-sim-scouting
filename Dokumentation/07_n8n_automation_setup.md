# 05. Automation Workflow (n8n)

**Datum:** 06.02.2026
**Autor:** AntiGravity (AI) & SIMscouting Team
**Status:** Live (Hostinger self-hosted)

## Übersicht

Einrichtung des Automatisierungs-Backends in n8n. Dieser Workflow verbindet die Dateneingabe (Frontend Widget) mit der Datenbank (Supabase) und der Kommunikation (E-Mail). Er schließt den "Closed Loop", indem er Leads verarbeitet und Belohnungs-Mechanismen vorbereitet.

## Workflow Architektur

`Webhook (Lead)` -> `Supabase (Scout Data)` -> `Email (Studio Alert)` -> `Email (Scout Reward)`

---

## Detaillierte Einrichtung

### 1. Trigger: Webhook (Empfang der Daten)

Der Einstiegspunkt für das System. Das Frontend-Widget sendet die Formulardaten per POST-Request hierher.

- **Node Type:** Webhook
- **HTTP Method:** `POST`
- **Path:** `lead-in`
- **Authentication:** `None` (für MVP / Public Access)
- **URL:** `https://[DEINE-N8N-DOMAIN]/webhook/lead-in` (Production)
- **Empfangene Daten (JSON):**
  ```json
  {
    "type": "INSERT",
    "table": "invites",
    "record": {
      "id": "...",
      "lead_data": { "name": "Lead Name", "phone": "12345" },
      "scout_id": "UUID-DES-SCOUTS",
      "campaign_id": "UUID-DER-KAMPAGNE"
    }
  }
  ```

### 2. Action: Supabase (Datenanreicherung)

Da der Webhook nur die `scout_id` liefert, müssen wir die Kontaktdaten des Scouts (Name, E-Mail) aktiv aus der Datenbank nachladen.

- **Node Type:** Supabase
- **Credential:** `Supabase Service Role` (Benötigt `service_role` Key statt `anon` Key, um User-Daten zu lesen!)
- **Resource:** `Record` -> `Get`
- **Table:** `scouts`
- **Record ID:** Gemappt von Webhook (`{{ $json.body.record.scout_id }}`)
- **Output:** Liefert `name` und `email` des Scouts.

### 3. Action: Email an Studio (Alert)

Benachrichtigung an den Betreiber, dass ein neuer Lead generiert wurde.

- **Node Type:** Email (SMTP via Hostinger)
- **Settings:**
  - **To:** Studio-Inhaber (z.B. `info@powergym-berlin.de`)
  - **Subject:** `Neuer Lead von: {{ $node["Supabase"].json["name"] }}`
  - **Body:** Enthält Name und Telefonnummer des Freundes (aus Webhook-Daten).

### 4. Action: Email an Scout (Gamification Loop)

Bestätigung an den Werber, um Motivation zu steigern ("High Five").

- **Node Type:** Email (SMTP via Hostinger)
- **Settings:**
  - **To:** Scout E-Mail (`{{ $node["Supabase"].json["email"] }}`)
  - **Subject:** `High Five, {{ $node["Supabase"].json["name"] }}! ✋`
  - **Body:** Bestätigung, dass der Freund sich angemeldet hat und Hinweis auf die Belohnung.

---

## Credentials & Sicherheit

- **Supabase API:**
  - Der n8n-Workflow nutzt den **Service Role Key** (Secret), da er Leserechte auf die `scouts`-Tabelle benötigt, die öffentlich (via Anon-Key) eingeschränkt sein könnte.
- **SMTP:**
  - Host: `smtp.hostinger.com`
  - Port: `465` (SSL) oder `587` (TLS)

## Testing (End-to-End)

1.  Öffnen der Scout App (`scout_app.html?id=...`).
2.  Generieren eines Links.
3.  Ausfüllen des Formulars auf der Zielseite (`test_page.html`).
4.  **Erwartetes Ergebnis:**
    - Datenbank: Neuer Eintrag in `invites` mit korrekter `scout_id`.
    - Inbox Studio: E-Mail mit Lead-Daten erhalten.
    - Inbox Scout: E-Mail mit Erfolgsbestätigung erhalten.
