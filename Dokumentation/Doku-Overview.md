# SIM Scouting System - Dokumentation Overview

**Status:** Live / Development
**Datum:** 07.02.2026
**Zusammenfassung:** Chronologische Übersicht aller durchgeführten Entwicklungsschritte.

---

## 01. Datenbank-Setup

**Ziel:** Initiale Struktur der Datenbank (Supabase).

- Erstellung der Tabellen: `tenants`, `campaigns`, `scouts`, `invites`.
- Einrichtung von Node.js Skripten (`setup_db.js`) zur Automatisierung.

## 02. Frontend Widget (Lead Capture)

**Ziel:** Einbettbares Formular für Leads (Freunde der Scouts).

- Web Component: `<sim-scouting-widget>` (`widget.js`).
- Sendet Daten (Name, Telefon) direkt an Supabase (`invites`).
- Funktioniert "standalone" auf Landingpages.

## 03. Scout App (Basis)

**Ziel:** Die mobile App für Scouts zum Teilen von Links.

- Datei: `scout_app.html`.
- Funktion: Generiert personalisierte Links (`?ref=UUID`).
- Features: WhatsApp-Share Button, Copy-to-Clipboard.

## 04. Tracking Integration (Closed Loop)

**Ziel:** Lückenlose Verknüpfung von Scout zu Lead.

- Übergabe der `Campaign-ID` und `Scout-ID` vom Widget an die Datenbank.
- Sicherstellung, dass jeder Lead einem Scout zugeordnet werden kann.

## 05. Design Polish (UI/UX)

**Ziel:** Professioneller Look & Feel.

- **Scout App:** Nutzung von Tailwind CSS, Card-Design, Animationen.
- **Widget:** Modernes, natives CSS (Shadow DOM) für neutrale Integration.

## 06. Dark Mode (Brand Identity)

**Ziel:** Anpassung an das "Studios in Motion" Branding.

- Farbschema: Dark (#111), Akzent (#00b4d8).
- Optimierung für mobile Nutzung (OLED-freundlich).

## 07. Automation Workflow (n8n)

**Ziel:** Backend-Prozesse und Kommunikation.

- **Webhook:** Empfängt neue Leads vom Widget.
- **Supabase:** Lädt Scout-Daten nach.
- **E-Mail:** Benachrichtigt Studio (neuer Lead) und Scout (Erfolg/Belohnung).

## 08. Scout Onboarding (Self-Service)

**Ziel:** Automatische Registrierung neuer Scouts über die App.

- **Logik:** App prüft URL auf ID.
  - _Keine ID:_ Zeige Registrierungs-Formular -> Erstelle Scout -> Redirect.
  - _Mit ID:_ Zeige Dashboard.
- Ermöglicht Nutzung von allgemeinen QR-Codes im Studio.

## 09. Dynamische Texte & Links

**Ziel:** Flexibilität ohne Code-Änderungen.

- Datenbank-Update: Neue Spalten `scouting_text` und `landingpage_url` in `campaigns`.
- App-Logik: Lädt Einladungstext und Ziel-URL live aus der DB.
- Fallback: Nutzt Standards, falls DB leer.

## 10. External Scout Registration Widget

**Ziel:** Scouts über die Website gewinnen ("Embed").

- Entwicklung eines einbettbaren Web Components (`<sim-scout-register>`).
- Ermöglicht die Registrierung von Scouts auf externen Webseiten.
- Isolierte Styles (Shadow DOM) und Weiterleitung zur Scout App.

## 11. Live-Statistiken & Link sichern

**Ziel:** Live-Statistiken und Gamification für Scouts.

- Einführung von Live-Statistiken (Anzahl Leads) im Dashboard.
- Gamification mit Rängen (Rookie, Influencer, Legende).
- "Link sichern"-Button, um das Dashboard per WhatsApp an sich selbst zu senden.
- Datenbank-Security (RLS) Updates für öffentlichen Lesezugriff.

## 12. Version 2.0 Upgrade & Admin Dashboard

**Ziel:** Verbesserte Datenqualität, Tracking und Auswertung für Inhaber.

- **Datenbank V2:** Trennung von Vor-/Nachname, neue `tracking_events` Tabelle.
- **Frontend V2:** Updates an Widget & App für neue Datenstruktur & Event-Tracking.
- **Admin Dashboard:** Neues Tool (`admin.html`) zur Auswertung von KPIs, Leaderboards und Live-Aktivitäten.

## 13. Universal Tracking SDK

**Ziel:** Standardisierung des Trackings für maximale Zuverlässigkeit.

- **Globales Objekt:** `window.SimScouting` als zentrale Schnittstelle.
- **Persistenz:** Automatische Speicherung der Scout-ID im `localStorage`.
- **Flexibilität:** Public API für manuelle Integrationen (`getScoutId`, `fillHiddenFields`).
- **Sichtbarkeit:** Korrektur der RLS-Policies, damit Tracking-Events im Dashboard sichtbar sind.

## 14. Lead Source Tracking & E-Mail Share

**Ziel:** Genauere Analyse der Werbekanäle.

- **Identifikation:** Unterscheidung zwischen Kampagne (`?campaign=...`) und Kanal (`source`).
- **Integration:** SDK speichert Quelle, Datenbank (`tracking_events`) empfängt beide Werte.
- **UI:** Anzeige passender Icons im Admin-Dashboard.
- **Feature:** E-Mail-Teilen-Button in der Scout App + Kampagnen-Tracking.
