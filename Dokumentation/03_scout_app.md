# 03. Scout App

**Datum:** 06.02.2026
**Autor:** Antigravity (AI)

## Übersicht

Erstellung der mobilen Web-App (`scout_app.html`) für Scouts, um Freunde via WhatsApp oder Link einzuladen.

## Dateien

- `/seed_data.js`: Skript zum Anlegen von Dummy-Daten.
- `/scout_app.html`: Die Frontend-Datei.

## Implementation Details

### 1. Seeding (`seed_data.js`)

- Legt einen Tenant "Power Gym Berlin" an.
- Legt eine Kampagne "7 Tage Friends Pass" an (Ziel-URL: `http://localhost:3000/test_page.html`).
- Legt einen Scout "Max Mustermann" an.
- Gibt die UUIDs auf der Konsole aus.

### 2. Scout App (`scout_app.html`)

- **Design:** Mobile-First, Tailwind CSS (CDN).
- **URL-Parameter:** Erwartet `?id=[SCOUT_UUID]`.
- **Funktion:**
  - Generiert personalisierten Referral-Link: `[LANDINGPAGE_URL]?ref=[SCOUT_UUID]`.
  - **WhatsApp Button:** Öffnet WhatsApp mit vorausgefülltem Text und Link.
  - **Copy Button:** Kopiert Link in die Zwischenablage und zeigt Toast-Nachricht.

## Test-Daten

Für den ersten Test wurde folgender Scout angelegt:

- **Name:** Max Mustermann
- **UUID:** `92c31c93-0cfc-4282-864e-42a03e153f8b`

> **Hinweis:** Wenn die App lokal (`localhost`) ohne `?id` Parameter aufgerufen wird, nutzt sie automatisch diese Test-UUID als Fallback.

## Nutzung

Aufruf im Browser mit der generierten Scout-UUID:
`http://localhost:3000/scout_app.html?id=92c31c93-0cfc-4282-864e-42a03e153f8b`
