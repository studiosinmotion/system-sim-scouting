# SIM-Scouting – Projektstruktur

## Ordner-Übersicht

```
system-sim-scouting/
│
├── server/                    ← 🚀 MUSS AUF DEN SERVER
│   ├── admin.html             Super-Admin Dashboard (alle Tenants, intern)
│   ├── tenant_dashboard.html  Kunden-Dashboard (pro Tenant, mit Login)
│   ├── management.html        Betreiber-Verwaltung (Tenant CRUD, Rewards)
│   ├── management.js          JS-Logik für management.html
│   ├── scout_app.html         Scout-App (Mobile, Link-Generierung)
│   ├── scout_reg.js           Scout-Registrierungs-Logik
│   ├── widget.js              Embeddable Widget (Lead-Erfassung)
│   └── embed_example.html     Beispiel-Seite für Widget-Einbettung
│
├── Dokumentation/             ← 📚 Gesamte Doku (Phasen 01-17)
│   ├── 01_setup_database.md
│   ├── ...
│   ├── 17_tenant_dashboard_und_praemien.md
│   ├── Doku-Overview.md
│   ├── Installation-Overview.md
│   └── E-Mail-Templates/
│
├── test/                      ← 🧪 Test-Dateien
│   ├── empfehlung.html
│   ├── probetraining.html
│   ├── test_page.html
│   └── test_sdk.html
│
├── konzept/                   ← 💡 Konzept-Dokumente
│   └── basisinfos_scouting_v2.md
│
├── _scripts/                  ← 🗄️ Archiv: Einmal-Skripte (nicht für Server)
│   ├── sql/                   SQL-Skripte (RLS Checks, Fixes, Upgrades)
│   ├── debug/                 Debug-/Check-Skripte (Node.js)
│   ├── migration/             DB-Setup & Migrations-Skripte
│   └── simulation/            Simulationen & deren Ergebnisse
│
├── .env                       ← 🔐 Umgebungsvariablen (DATABASE_URL)
├── .gitignore
├── package.json
└── package-lock.json
```

## Was muss auf den Server?

**Nur der Inhalt von `server/`** muss auf den Produktivserver hochgeladen werden.

| Datei | URL-Pfad | Zweck |
|---|---|---|
| `admin.html` | `/admin.html` | Internes Super-Admin Dashboard |
| `tenant_dashboard.html` | `/tenant_dashboard.html` | Kunden-Dashboard (Login) |
| `management.html` | `/management.html` | Betreiber-Verwaltung |
| `management.js` | `/management.js` | JS für Betreiber-Verwaltung |
| `scout_app.html` | `/scout_app.html` | Scout-App |
| `scout_reg.js` | `/scout_reg.js` | Scout-Registrierung |
| `widget.js` | `/widget.js` | Embeddable Widget |
| `embed_example.html` | `/embed_example.html` | Widget-Beispiel |

## Was bleibt lokal?

- `_scripts/` – Einmalig verwendete Debug- und Migrations-Skripte
- `test/` – Testseiten für Widget-Integration
- `konzept/` – Ursprüngliche Konzept-Dokumente
- `Dokumentation/` – Interne Doku (muss nicht auf den Server)
- `node_modules/`, `package.json` – Nur für lokale Skript-Ausführung
