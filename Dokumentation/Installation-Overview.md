# Anleitung: Neuen Kunden anlegen (Installation Overview)

**Ziel:** Schritt-für-Schritt-Prozess, um ein einfaches Fitnessstudio (Tenant) an das SIM-Scouting System anzubinden.

---

## 1. Informationen vom Kunden einholen

Bevor wir starten, benötigen wir folgende Daten vom Studiobetreiber:

1.  **Name des Studios** (für die Anzeige, z.B. "Power Gym Berlin").
2.  **Ziel-URL für Leads** (Landingpage):
    - Wohin sollen die Freunde der Scouts geleitet werden?
    - Dies ist meist eine Seite auf der Studio-Webseite mit einem Formular (oder wir bauen/hosten diese).
    - _Wichtig:_ Auf dieser Seite muss später unser [Frontend Widget](02_frontend_widget.md) eingebunden werden, oder sie muss Parameter verarbeiten können.
3.  **Einladungstext für WhatsApp:**
    - Was soll der Scout an seine Freunde senden?
    - Beispiel: _"Hey! Ich trainiere im Power Gym und habe hier einen 7-Tage-Pass für dich: {{link}}"_
4.  **Webseite für Registrierung:**
    - Auf welcher URL wird das "Scout werden"-Widget eingebunden? (z.B. `studio-name.de/scout-werden`).

---

## 2. Datenbank einrichten (Supabase)

Aktuell erfolgt dies manuell im Supabase Dashboard oder per SQL-Befehl.

### Schritt A: Tenant (Mandant) anlegen

Erstelle einen Eintrag in der Tabelle `tenants`.

```sql
INSERT INTO tenants (name, settings)
VALUES ('[STUDIO_NAME]', '{}')
RETURNING id;
```

> **Notiere die generierte UUID!** (z.B. `12345678-abcd-1234-...`) -> Das ist die `TENANT_ID`.

### Schritt B: Kampagne anlegen

Erstelle die Standard-Kampagne für diesen Tenant in der Tabelle `campaigns`.

```sql
INSERT INTO campaigns (tenant_id, name, landingpage_url, scouting_text, status)
VALUES (
  '[TENANT_ID]',
  'Freunde werben Freunde',
  '[ZIEL_URL_LANDINGPAGE]',
  '[WHATSAPP_TEXT_INKL_PLATZHALTER]',
  'active'
);
```

_Hinweis:_ Der `scouting_text` muss den Platzhalter `{{link}}` enthalten.

---

## 3. Widget beim Kunden einbinden (Scout Registrierung)

Der Kunde (oder wir) muss das Registrierungs-Widget auf seiner Webseite einbinden (z.B. unter `/scout-werden`).

**Code-Snippet für den Kunden:**

```html
<!-- SIM Scouting Widget -->
<script
  src="https://simscouting.studios-in-motion.de/scout_reg.js"
  type="module"
></script>

<sim-scout-register
  supabase-url="https://rmtyebyzitzgkplxvzxg.supabase.co"
  supabase-key="sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i"
  tenant-id="[HIER_DIE_TENANT_ID_EINFÜGEN]"
  target-url="https://simscouting.studios-in-motion.de/scout_app.html"
></sim-scout-register>
```

_Ersetze `[HIER_DIE_TENANT_ID_EINFÜGEN]` mit der UUID aus Schritt 2A._

---

## 4. Landingpage prüfen (Lead Erfassung)

Stelle sicher, dass auf der Ziel-URL (`landingpage_url`) das **Lead-Capture-Widget** läuft, um die Leads den Scouts zuzuordnen.

Wenn das Studio unsere Standard-Landingpage nutzt (`test_page.html`), ist alles bereit. Nutzt das Studio eine eigene Seite, muss dort unser Lead-Widget (`widget.js`) eingebaut sein mit der korrekten `campaign-id` (die UUID aus Schritt 2B), oder die Logik muss angepasst werden.

---

## 5. Testen & Go-Live

1.  Gehe auf die Kunden-Webseite mit dem Registrierungs-Widget.
2.  Melde dich als Test-Scout an.
3.  Prüfe den Redirect zur Scout App.
4.  Prüfe, ob der WhatsApp-Text korrekt geladen wird (Datenbank-Text).
5.  Sende einen Test-Link an dich selbst.
6.  Klicke den Link und prüfe, ob du auf der korrekten Landingpage landest.
