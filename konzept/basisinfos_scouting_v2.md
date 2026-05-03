

# SIM-Scouting-System – Konzept & Technik (V2.0)

**Stand:** Aktuelle Arbeitsgrundlage für Vibe-Coding (AntiGravity + Gemini)
**Fokus:** Fitness-Pilot (skalierbar als SaaS für alle Branchen)

---

## 1. Ziel & Kernidee

SIM-Scouting ist ein **SaaS-Empfehlungssystem**, das Bestandskunden (Scouts) aktiviert, um Freunde zu einem **niedrigschwelligen Einstiegsangebot** einzuladen.

**Die Besonderheit (V2):**
Wir agieren nicht nur als Link-Verteiler, sondern liefern über **einbettbare Web-Komponenten** (Formulare) auch die Conversion-Technik. Das macht uns unabhängig von der Webseiten-Technik des Kunden und garantiert sauberes Tracking.

**Ziele:**

* Maximale Unabhängigkeit von Kunden-IT (durch Embed-Code).
* 100% messbare Conversions (Lead geht erst in unser System, dann zum Kunden).
* Automatisierung via n8n & KI.
* Vibe-Coding-Ansatz (AntiGravity + Supabase).

---

## 2. Der Prozess (Der "Closed Loop")

### 2.1 Der Scout (Bestandskunde)

1. Erhält Impuls (Mail/QR-Code im Studio): "Trainiere nicht allein – schenk deinem Freund 7 Tage."
2. Landet im **Scouting-Tool** (Mobile Web App).
3. Generiert persönlichen Link (z.B. via WhatsApp).
* *Psychologie:* "Schenken" & "Partner finden" statt "Verkaufen".



### 2.2 Der Freund (Der Lead)

1. Klickt auf den Link des Scouts (`sim-scouting.de/...`).
2. Wird weitergeleitet auf die **normale Webseite des Studios**.
* URL enthält Tracking-Parameter: `studio-mueller.de/gratis?ref=SCOUT_ID`


3. Sieht dort das **SIM-Scouting Formular (Widget)**.
* Das Formular weiß durch den Link automatisch, wer eingeladen hat.


4. Trägt Daten ein (Name, Tel).

### 2.3 Die Datenverarbeitung

1. Formular sendet Daten an **unser Supabase-Backend**.
2. System ordnet Conversion dem Scout zu.
3. System leitet Lead an das Studio weiter (Mail/CRM via n8n).
4. Scout erhält Belohnung (automatisierte Mail/Gutschrift).

---

## 3. Technische Architektur (Vibe Coding Stack)

Wir nutzen moderne, skalierbare Tools, die sich gut per KI steuern lassen.

* **Datenbank:** **Supabase** (PostgreSQL). Zentraler Speicher für Mandanten, Scouts, Leads.
* **Frontend (Scout):** Mobile-first Web App (React/Next.js oder simpler HTML/JS Build).
* **Frontend (Widget):** Einbettbare Web Component (JS-Schnipsel für Kunden-Webseite).
* **Automation:** **n8n**. Verbindet alles (Mails versenden, Status-Updates, Lead-Weiterleitung).
* **Entwicklung:** **AntiGravity + Gemini 3** (AI-driven Development).

---

## 4. Datenmodell (Supabase Struktur)

Das System ist mandantenfähig (Multi-Tenant).

### A. Tenants (Mandanten)

* `id`: UUID
* `name`: Name des Unternehmens (z.B. "FitBase Berlin")
* `settings`: JSON (Logo, Farben, Absender-Adressen)

### B. Campaigns (Angebote)

* `id`: UUID
* `tenant_id`: FK zu Tenants
* `name`: z.B. "7 Tage Friends Pass"
* `landingpage_url`: Wo liegt das Formular?
* `form_config`: JSON (Welche Felder? Welche Headline im Widget?)
* `status`: active / archived

### C. Scouts (Bestandskunden)

* `id`: UUID
* `tenant_id`: FK zu Tenants
* `email`: Eindeutige ID des Scouts
* `name`: Anzeigename
* `stats`: Anzahl Einladungen / Conversions

### D. Invites (Tracking & Conversions)

* `id`: UUID
* `scout_id`: Wer hat eingeladen?
* `campaign_id`: Wozu wurde eingeladen?
* `lead_data`: JSON (Name, Tel des Freundes – *verschlüsselt/geschützt*)
* `status`: `clicked` -> `lead_captured` -> `rewarded`
* `created_at`: Timestamp

---

## 5. Wording & Psychologie

### ❌ Verboten:

* "Nominieren"
* "Werben"
* "Kopfgeld"

### ✅ Gebote:

* "Einladen"
* "Schenken" (Guthaben, Zeit, Mehrwert)
* "Partner" (Trainingspartner)
* "Vorteil teilen"

Das **Widget** auf der Kunden-Seite passt sich diesem Wording an (konfigurierbar pro Kampagne).

---

## 6. Pilot-Projekt: Fitness ("7 Tage Pass")

Unser erster Proof-of-Concept (PoC).

* **Offer:** 7 Tage kostenloses Training.
* **Target:** Webseite des Studios (oder dedizierte LP).
* **Integration:** Studio baut unser `script`-Tag an der Stelle ein, wo das Formular erscheinen soll.
* **Belohnung:** Wenn der Freund sich einträgt, kriegt der Scout z.B. einen Shake-Gutschein oder nimmt an Verlosung teil.

---

## 7. KI-Integration (Zukunftsmusik & Skalierung)

* **Prompt-Injection:** Das System nutzt KI, um Einladungstexte für Scouts vorzuschlagen.
* `custom_text_prompt_addon`: Pro Mandant hinterlegbar (z.B. "Duze alle, sei sehr sportlich").
* **Analytik:** KI wertet aus, welche Scouts am besten performen.

---

## 8. Status Quo & Nächste Schritte (Roadmap)

**Erledigt (Stand Mai 2026):**
* **Datenbank:** Supabase Tabellen (`tenants`, `campaigns`, `scouts`, `invites`) angelegt und konfiguriert.
* **Widget-Bau:** Einbettbares Formular (`scout_reg.js`) als Web Component entwickelt. Unterstützt Theme-Anpassungen (Dark Mode, Transparent) und zwingende DSGVO-Checkbox.
* **Third-Party Integration:** Universal Tracking SDK (`widget.js`) fertiggestellt. Unterstützt das Befüllen von Hidden-Fields (`scout_id`, `campaign_id`) in bestehenden Kundenformularen (HubSpot, WordPress, etc.).
* **Dynamic Branding:** Scout App (`scout_app.html`) unterstützt nun dynamische Hintergrund-Medien (Videos/Bilder) sowie Farben und Logos pro Mandant (gespeichert in `tenants.settings`).
* **Dokumentation:** `integration_guide_formulare.md` für Endkunden/Studios erstellt.

**Als Nächstes (To-Dos):**
1. **Admin-Bereich (Dashboard):** Entwicklung einer Benutzeroberfläche für Mandanten (Studios), um ihre Branding-Einstellungen (Logo, Farben, Hintergrundvideo) ohne Datenbankzugriff bequem zu verwalten.
2. **Kampagnen-Management:** UI zum Anlegen und Verwalten von `campaigns` im Admin-Bereich.
3. **n8n Automationen:** Finales Setup der n8n-Workflows für Benachrichtigungen (Scout-Belohnung, Studio-Lead-Benachrichtigung).
4. **End-to-End Test:** Kompletten Kreis mit echten Live-Daten auf einem Produktivsystem durchspielen.