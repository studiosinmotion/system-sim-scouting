# 15. Admin Dashboard v2.1 Features

**Datum:** 07.02.2026
**Version:** 2.1

Das Admin Dashboard (`admin.html`) wurde umfassend erweitert, um Kampagnen besser analysieren und Leads effizienter verwalten zu können.

## 1. Neue Features im Überblick

### A. Kampagnen-Tracking & Filter

Das Dashboard erkennt nun automatisch alle **Kampagnen**, über die Leads generiert wurden (z.B. `newsletter_winter`, `qrcode_theke`).

- **Kampagnen-Filter:**
  - Oberhalb der Tabelle "Neueste Leads" befindet sich jetzt eine dynamische Filter-Leiste.
  - Klick auf eine Kampagne (z.B. `NEWSLETTER`) filtert die **gesamte Tabelle** auf Leads dieser Kampagne.
  - Klick auf `Alle` setzt den Filter zurück.
- **Kampagnen-Spalte:**
  - Die Tabelle hat eine neue Spalte **"Kampagne"**.
  - Jeder Lead hat einen farbigen Badge mit dem Namen der Kampagne.
  - **Klick-Interaktion:** Ein Klick auf den Badge öffnet die **Kampagnen-Detail-Ansicht**.

### B. Sortierbare Tabellen

Alle Spalten in der "Neueste Leads"-Tabelle sind nun **klickbar und sortierbar**.

- **Funktion:** Klick auf den Spalten-Titel (z.B. "Datum", "Name").
- **Logik:**
  - 1. Klick: Sortierung aufsteigend (A-Z, Älteste zuerst).
  - 2. Klick: Sortierung absteigend (Z-A, Neueste zuerst).
  - Das System merkt sich die Sortierung auch beim Filtern.

### C. Detail-Modals (Popups)

Es gibt nun zwei Arten von Detail-Fenstern, die sich über die Tabelle legen, ohne dass man die Seite verlassen muss.

1.  **Scout-Modal:**
    - Klick auf den **Scout-Namen** in der Tabelle / Rangliste.
    - Zeigt:
      - Alle geworbenen Leads dieses Scouts.
      - Statistiken dieses Scouts (Views, Klicks, Shares).
2.  **Kampagnen-Modal:**
    - Klick auf einen **Kampagnen-Badge**.
    - Zeigt:
      - Liste aller Leads dieser spezifischen Kampagne.
      - Total Leads Anzahl dieser Kampagne.

### D. Lead-Quellen (Source Icons)

Die Tabelle visualisiert nun direkt, _wie_ der Lead geworben wurde (Spalte "Quelle"):

- <i class="fa-brands fa-whatsapp text-green-500"></i> **WhatsApp Icon:** Lead kam über einen WhatsApp-Link.
- <i class="fa-solid fa-envelope text-blue-600"></i> **Brief Icon:** Lead kam per E-Mail-Einladung.
- <i class="fa-solid fa-copy text-blue-400"></i> **Copy Icon:** Link wurde kopiert und manuell weitergegeben.
- <i class="fa-solid fa-qrcode text-white"></i> **QR Icon:** Lead scannte einen QR-Code.
- <i class="fa-solid fa-link text-slate-600"></i> **Link Icon:** Direkter Aufruf / Unbekannt.

## 2. Datenschutz & Sicherheit

- **Passwort-Schutz:** Weiterhin geschützt durch einfaches Frontend-Passwort (`admin123`).
- **Datensparsamkeit:** Es werden nur die für die Zuordnung nötigen Daten geladen (Namen, Datum, IDs).
- **Sortierung:** Die Sortierung findet lokal im Browser statt (schnell, keine Server-Last).

## 3. Kurzanleitung für den Alltag

1.  **Morgens Checken:**
    - Blick auf **KPI-Karten** (Neue Leads heute?).
    - Blick auf **Live Activity** (Was passiert gerade?).
2.  **Kampagnen Auswerten:**
    - Du hast einen Newsletter verschickt?
    - Klicke im Filter auf `NEWSLETTER_KW5`.
    - Sieh sofort, wer sich daraufhin angemeldet hat.
    - Klicke auf den Badge für Details.
3.  **Top-Scouts Belohnen:**
    - Schau auf das **Leaderboard**.
    - Klicke auf den besten Scout, um zu prüfen, wen er alles geworben hat (Validierung).
