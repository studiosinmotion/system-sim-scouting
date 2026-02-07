# 12. Version 2.0 Upgrade & Admin Dashboard

Dieses Upgrade markiert den Übergang von einem reinen "MVP" (Minimum Viable Product) zu einem datengetriebenen System mit Fokus auf Datenqualität und Tracking.

## 1. Datenbank-Upgrade (V2 Schema)

Die Datenbankstruktur wurde grundlegend verbessert, um Leads sauberer zu erfassen und Nutzerinteraktionen zu tracken.

### Änderungen:

1.  **Split Name Fields:**
    - Die Tabelle `scouts` und `invites` speichert Namen nicht mehr als einen String (`name`), sondern getrennt in `first_name` und `last_name`.
    - **Grund:** Bessere Personalisierung (z.B. "Hallo Max") und sauberere Daten für Export/CRM.
2.  **Flattened Lead Data:**
    - Leads (Invites) speichern Telefonnummer und Namen jetzt in eigenen Spalten (`phone`, `first_name`, `last_name`) statt in einem JSON-Blob (`lead_data`).
    - **Grund:** Einfachere SQL-Abfragen und Filterung.
3.  **New Table: `tracking_events`:**
    - Eine neue Tabelle speichert alle Interaktionen.
    - **Spalten:** `id`, `created_at`, `scout_id`, `event_type` (z.B. 'page_view', 'share_whatsapp'), `meta_data` (JSON).
    - **RLS:** Öffentlicher Insert-Zugriff erlaubt (für anonymes Tracking).

## 2. Frontend Updates

### Scout App (`scout_app.html`)

- **Registrierung:** Formular fragt nun Vorname und Nachname getrennt ab.
- **Tracking:**
  - Klick auf "WhatsApp teilen" -> Event `share_whatsapp`
  - Klick auf "Link kopieren" -> Event `share_copy`
  - Klick auf "Link sichern" -> Event `save_link`

### Widget (`widget.js`)

- **Lead Formular:** Fragt Vorname und Nachname getrennt ab.
- **Submission:** Speichert Daten in die neuen, flachen Spalten (mit Fallback für Legacy-Constraints).
- **Page View Tracking:** Sendet beim Laden automatisch ein `page_view` Event, sofern eine `ref` ID (Scout ID) in der URL vorhanden ist.
- **Conversion Start:** Damit wird die Basis für die Berechnung der Conversion Rate (Leads / Views) gelegt.

## 3. Admin Dashboard (`admin.html`)

Ein neues, passwortgeschütztes Dashboard für den Studio-Inhaber.

- **URL:** `/admin.html`
- **Login:** Einfacher Browser-Prompt (Passwort: `admin123`).
- **Funktionen:**
  - **KPI Cards:**
    - **Total Scouts:** Anzahl registrierter Partner.
    - **Total Leads:** Anzahl generierter Kontakte.
    - **Traffic:** Anzahl der Seitenaufrufe (Page Views).
    - **Conversion Rate:** `(Leads / Traffic) * 100`. _Hinweis: Für Altdaten ohne Traffic-Tracking wird Traffic = Leads angenommen, um 100% statt 0% anzuzeigen._
  - **Leaderboard:** Top 5 Scouts basierend auf der Anzahl der Leads.
  - **Live Feed:** Chronologische Liste aller Ereignisse (Neue Leads + Tracking Events wie "Link geteilt").
- **Technik:**
  - Basiert auf `admin.html` (Single File).
  - Nutzt `Tailwind CSS` für Styling und `Supabase JS` für Datenabfragen (Client-Side Aggregation).
