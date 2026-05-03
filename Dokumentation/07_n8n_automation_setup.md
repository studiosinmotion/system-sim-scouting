# 07. Automation Workflow (n8n)

**Datum:** 06.02.2026
**Zuletzt aktualisiert:** 03.05.2026
**Autor:** AntiGravity (AI) & SIMscouting Team
**Status:** Live (Hostinger self-hosted)

## Übersicht

Einrichtung des Automatisierungs-Backends in n8n. Dieser Workflow verbindet die Dateneingabe (Frontend Widget) mit der Datenbank (Supabase) und der Kommunikation (E-Mail). Er schließt den "Closed Loop", indem er Leads verarbeitet und Belohnungs-Mechanismen auslöst.

## Architektur (End-to-End)

```
[Frontend Widget] → INSERT in "invites" → [DB Trigger: notify_n8n_lead_in()] → [pg_net HTTP POST] → [N8N Webhook] → [Supabase Enrichment] → [E-Mail]
```

### Wichtig: Es gibt zwei getrennte Bestandteile!

1. **Supabase (Datenbank-Trigger):** Feuert automatisch bei INSERT und sendet Daten per HTTP an N8N.
2. **N8N (Workflow):** Empfängt die Daten, reichert sie an, sendet E-Mails.

Beide müssen korrekt konfiguriert sein, damit das System funktioniert.

---

## Teil 1: Datenbank-Trigger (Supabase)

### Technologie

Die Trigger nutzen die PostgreSQL-Extension **`pg_net`** (Version 0.19.5+), um HTTP-Requests direkt aus der Datenbank zu senden. Dies geschieht über die Funktion `net.http_post()`.

> **WARNUNG:** Die Trigger dürfen NICHT über das Supabase Dashboard ("Database Webhooks") erstellt werden, da diese nur einen statischen, leeren Body senden können. Die Trigger müssen als SQL-Migration mit einer eigenen Wrapper-Funktion erstellt werden, die `row_to_json(NEW)` nutzt.

### Trigger 1: Lead-In (Tabelle `invites`)

```sql
-- Funktion: Sendet den kompletten Invite-Record an N8N
CREATE OR REPLACE FUNCTION public.notify_n8n_lead_in()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://n8n.simki.cloud/webhook/lead-in'::text,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)::jsonb
    ),
    params := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Feuert bei jedem neuen Invite
CREATE TRIGGER lead_in_webhook
  AFTER INSERT ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_n8n_lead_in();
```

### Trigger 2: Scout-Registrierung (Tabelle `scouts`)

```sql
-- Funktion: Sendet den kompletten Scout-Record an N8N
CREATE OR REPLACE FUNCTION public.notify_n8n_scout_registered()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://n8n.simki.cloud/webhook/scout-registered'::text,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)::jsonb
    ),
    params := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Feuert bei jedem neuen Scout
CREATE TRIGGER scout_registered_webhook
  AFTER INSERT ON public.scouts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_n8n_scout_registered();
```

### Payload-Format (Was N8N empfängt)

```json
{
  "type": "INSERT",
  "table": "invites",
  "schema": "public",
  "record": {
    "id": "d20d5940-89c7-4550-91b7-460ecb982e92",
    "scout_id": "UUID-DES-SCOUTS",
    "campaign_id": "UUID-DER-KAMPAGNE",
    "first_name": "Max",
    "last_name": "Mustermann",
    "phone": "0170 1234567",
    "lead_data": { "source": "wa" },
    "status": "pending",
    "created_at": "2026-05-03T07:35:09.579Z"
  }
}
```

### Verifizierung / Debugging

Die Antworten der HTTP-Requests können geprüft werden mit:

```sql
SELECT id, status_code, timed_out, error_msg, created
FROM net._http_response 
ORDER BY created DESC 
LIMIT 5;
```

Erwartetes Ergebnis bei Erfolg: `status_code: 200`, `timed_out: false`, `error_msg: null`.

---

## Teil 2: N8N Workflow ("SIMscouting base")

### Workflow-Name in N8N: `SIMscouting base`
### Ordner: `SIM scouting`

### Node-Kette:

`Webhook` → `Kampagne auslesen` → `Scout auslesen` → `Belohnungs-Logik` → `E-Mail 2 Company` → `E-Mail 2 Scout`

### Node 1: Webhook (Trigger)

| Einstellung | Wert |
|:--|:--|
| HTTP Method | `POST` |
| Path | `lead-in` |
| Authentication | None |
| **Production-URL** | `https://n8n.simki.cloud/webhook/lead-in` |
| Test-URL | `https://n8n.simki.cloud/webhook-test/lead-in` |

> **WICHTIG:** Der Workflow muss in N8N **"Published"** (aktiviert) sein, damit die Production-URL funktioniert! Die Test-URL funktioniert nur bei geöffnetem Editor.

### Node 2: Kampagne auslesen (Supabase)

- **Table:** `campaigns`
- **Record ID:** `{{ $json.body.record.campaign_id }}`
- **Credential:** Supabase **Service Role Key**

### Node 3: Scout auslesen (Supabase)

- **Table:** `scouts`
- **Record ID:** `{{ $json.body.record.scout_id }}`
- **Credential:** Supabase **Service Role Key**
- **Output:** Liefert `first_name`, `last_name`, `email` des Scouts.

### Node 4: Belohnungs-Logik (Code/Function)

- Prüft die `reward_config` der Kampagne
- Bereitet Daten für die E-Mails auf

### Node 5: E-Mail an Studio (Alert)

| Einstellung | Wert |
|:--|:--|
| Node Type | Email (SMTP) |
| To | Studio-Inhaber (z.B. `info@powergym-berlin.de`) |
| Subject | `Neuer Lead von: {{ Scout-Name }}` |
| Body | Enthält Name und Telefonnummer des Leads |

### Node 6: E-Mail an Scout (Reward/High Five)

| Einstellung | Wert |
|:--|:--|
| Node Type | Email (SMTP) |
| To | Scout E-Mail (`{{ Scout.email }}`) |
| Subject | `High Five, {{ Scout.first_name }}! ✋` |
| Body | Bestätigung mit Belohnungshinweis |

---

## Credentials & Sicherheit

- **Supabase API:**
  - Der N8N-Workflow nutzt den **Service Role Key** (Secret), da er Leserechte auf `scouts` (inkl. E-Mail) und `campaigns` (inkl. `reward_config`) benötigt.
  - Den Service Role Key findet man unter: Supabase Dashboard → Settings → API.
- **SMTP:**
  - Host: `smtp.hostinger.com`
  - Port: `465` (SSL) oder `587` (TLS)

---

## Häufige Fehlerquellen & Troubleshooting

| Symptom | Ursache | Lösung |
|:--|:--|:--|
| N8N empfängt leeren Body `{}` | Trigger nutzt `supabase_functions.http_request()` statt `net.http_post()` | Trigger mit `row_to_json(NEW)` neu erstellen (siehe SQL oben) |
| N8N empfängt gar nichts | Workflow nicht Published | In N8N auf "Publish" klicken |
| N8N empfängt gar nichts | Trigger sendet an Test-URL statt Production-URL | URL im Trigger prüfen: muss `/webhook/` sein, NICHT `/webhook-test/` |
| `net.http_post()` Fehler: function does not exist | `pg_net` Extension nicht aktiviert | `CREATE EXTENSION IF NOT EXISTS pg_net;` ausführen |
| `net.http_post()` Signatur-Fehler | `body` als `text` statt `jsonb` übergeben | `body` muss `jsonb` sein, NICHT `::text` |
| E-Mail kommt nicht an | Scout hat keine E-Mail-Adresse | In Supabase prüfen ob `email`-Feld gefüllt ist |

### Trigger prüfen (SQL)

```sql
-- Alle Custom-Trigger auf invites und scouts anzeigen
SELECT tgname, tgrelid::regclass as on_table, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid IN ('invites'::regclass, 'scouts'::regclass)
AND tgname NOT LIKE 'RI_%';
```

---

## Testing (End-to-End)

1. Öffne die Scout App (`scout_app.html?id=...`).
2. Generiere einen Link und teile ihn.
3. Fülle das Formular auf der Zielseite aus.
4. **Erwartetes Ergebnis:**
   - Supabase: Neuer Eintrag in `invites` mit korrekter `scout_id` und `campaign_id`.
   - `net._http_response`: Eintrag mit `status_code: 200`.
   - N8N Executions: Neue Ausführung, alle 6 Nodes grün.
   - Inbox Studio: E-Mail mit Lead-Daten erhalten.
   - Inbox Scout: E-Mail mit Erfolgsbestätigung erhalten.
