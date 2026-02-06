# 01. Datenbank-Setup

**Datum:** 06.02.2026
**Autor:** Antigravity (AI)

## Übersicht

Einrichtung der initialen Datenbankstruktur in Supabase für das SIM-Scouting Projekt.

## Durchgeführte Schritte

1.  **Abhängigkeiten installiert:**
    - `pg` (Node-Postgres) für die Datenbankverbindung.
    - `dotenv` zum Laden der Umgebungsvariablen (`DATABASE_URL`).

2.  **Setup-Skript erstellt (`setup_db.js`):**
    - Skript verbindet sich mit der Supabase-Datenbank.
    - Erstellt (falls nicht vorhanden) die folgenden Tabellen gemäß Konzept V2:
      - `tenants`: Mandanten/Kunden (UUID, Name, Settings).
      - `campaigns`: Kampagnen (UUID, Tenant-FK, Name, URL, Form-Config, Status).
      - `scouts`: Empfehler (UUID, Tenant-FK, Email, Name, Stats).
      - `invites`: Einladungen (UUID, Scout-FK, Campaign-FK, Lead-Data, Status).

3.  **Skript ausgeführt:**
    - Befehl: `node setup_db.js`.
    - Ergebnis: Erfolgreiche Erstellung/Verifizierung aller Tabellen.

## Dateien

- `/setup_db.js`
- `/package.json` (Dependencies hinzugefügt)
