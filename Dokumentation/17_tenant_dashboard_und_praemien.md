# 17. Tenant Dashboard & Prämien-Einlösung

**Datum:** 05.05.2026
**Version:** 1.0

## 1. Tenant Dashboard (`server/tenant_dashboard.html`)

### Zweck

Eigenes Dashboard für jeden Kunden (Tenant/Studio). Der Tenant loggt sich mit seinen Zugangsdaten ein und sieht **nur seine eigenen Daten** – keine anderen Tenants, kein Tenant-Selector.

### Login

- **E-Mail** + **Zugangs-Code** (Format: `SC-XXXXXXXX`)
- Zugangsdaten werden in der Betreiber-Verwaltung (`management.html`) vergeben
- Session-basiert (bleibt aktiv bis Tab geschlossen wird)
- Access-Code wird in der `tenants`-Tabelle gespeichert (Spalte `access_code`)

### Aktuelle Zugangsdaten

| Tenant | E-Mail | Zugangs-Code |
|---|---|---|
| studios in motion | service@studios-in-motion.de | SC-7CCDA3BE |
| Power Gym Berlin | powergym@studios-in-motion.de | SC-9649A61A |

> **Hinweis:** Access-Codes können jederzeit in der Betreiber-Verwaltung regeneriert werden (🔄-Button).

### Dashboard-Inhalt

1. **Header** – Dynamisch mit Tenant-Logo, Name und Primärfarbe
2. **KPI-Karten** – Scouts, Leads, Traffic (Views), Conversion Rate
3. **🎁 Prämien-Übersicht** (NEU) – Offene/eingelöste Prämien mit Einlöse-Funktion
4. **Lead-Tabelle** – Neueste Leads mit Quell-Icons, Suche
5. **Scout-Leaderboard** – Rangliste aller Scouts
6. **Live Activity** – Echtzeit-Feed (Page Views, Shares, Leads)

### Dynamisches Branding

Nach dem Login wird die Primärfarbe des Tenants als CSS Custom Property (`--tenant-color`) gesetzt. Diese wird für Akzente, Buttons und Badges verwendet.

---

## 2. Prämien-Einlösung (Reward Redemption)

### Datenbank

#### Neue Tabelle: `reward_redemptions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID (PK) | Automatisch generiert |
| `tenant_id` | UUID (FK → tenants) | Mandant |
| `reward_id` | UUID (FK → rewards) | Welche Prämie |
| `scout_id` | UUID (FK → scouts) | Welcher Scout |
| `invite_id` | UUID (FK → invites) | Welcher Lead hat die Prämie ausgelöst |
| `status` | TEXT | `pending` oder `redeemed` |
| `redeemed_at` | TIMESTAMPTZ | Wann eingelöst (null wenn offen) |
| `redeemed_by` | TEXT | Wer hat es markiert (Mitarbeiter-Name, optional) |
| `notes` | TEXT | Optionale Notiz |
| `created_at` | TIMESTAMPTZ | Erstellungszeitpunkt |

#### DB-Trigger: Automatische Prämien-Erstellung

Ein PostgreSQL-Trigger auf der `invites`-Tabelle erzeugt **automatisch** einen `reward_redemption`-Eintrag für jeden aktiven Reward des Tenants, sobald ein neuer Lead eingeht.

```
Neuer Lead (INSERT INTO invites)
  → Trigger: create_reward_redemptions_for_invite()
    → Für jeden aktiven Reward des Tenants:
      → INSERT INTO reward_redemptions (status = 'pending')
```

### Einlöse-Flow (UX)

1. Scout kommt ins Studio: _"Ich hab meinen Shake verdient!"_
2. Mitarbeiter öffnet Tenant Dashboard → **Prämien-Übersicht**
3. Sucht nach dem Scout-Namen (Suchfeld oben rechts)
4. Sieht: `🟡 Hans-Peter M. – Eiweiß-Shake – Offen`
5. Klickt **"✓ Einlösen"**
6. Bestätigungs-Modal zeigt Prämie + Scout-Name
7. Optional: Mitarbeiter-Name eingeben
8. Klick auf **"Jetzt einlösen"**
9. ✅ Status wechselt zu `redeemed`, Zeitstempel wird gesetzt

### Prämien-KPIs

- **Offen** – Anzahl noch nicht eingelöster Prämien
- **Eingelöst** – Anzahl bereits eingelöster Prämien
- **Gesamtwert** – Summe aller Prämien-Werte in EUR

### Filter & Suche

- **Filter-Buttons:** Alle | 🟡 Offen | ✅ Eingelöst
- **Suche:** Nach Scout-Name oder Prämien-Titel

---

## 3. Betreiber-Verwaltung (Updates)

### Neues Feld: Zugangs-Code

Im Tenant-Modal der Betreiber-Verwaltung (`management.html`) gibt es jetzt:

- **Zugangs-Code** Feld (readonly, automatisch generiert)
- **🔄 Regenerieren** – Erzeugt einen neuen Code und speichert sofort
- **📋 Kopieren** – Kopiert den Code in die Zwischenablage
- **Link** zum Tenant Dashboard direkt im Formular

---

## 4. Technische Details

### Dateistruktur

Die Logik ist komplett **inline** in der HTML-Datei (wie `admin.html`), da `file://` keine ES-Module aus separaten Dateien laden kann. Der Supabase-Client wird über CDN importiert.

### RLS-Policies

Die `reward_redemptions`-Tabelle hat volle RLS-Policies für die `anon`-Rolle (SELECT, INSERT, UPDATE, DELETE) – konsistent mit allen anderen Tabellen im System.

### Indexes

- `idx_reward_redemptions_tenant` – Schnelle Abfrage pro Tenant
- `idx_reward_redemptions_scout` – Suche nach Scout
- `idx_reward_redemptions_status` – Filter nach Status
- `idx_reward_redemptions_invite_reward` – Duplikat-Vermeidung beim Backfill
