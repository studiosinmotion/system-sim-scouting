# 10. Externe Scout Registrierung (Embedded Widget)

**Datum:** 07.02.2026
**Autor:** Antigravity (AI)

## Übersicht

Um Scouts nicht nur direkt über die App, sondern auch über externe Webseiten (z.B. die Homepage des Fitnessstudios) zu gewinnen, wurde ein einbettbares Widget entwickelt. Dieses Widget ist als **Web Component** (`<sim-scout-register>`) realisiert und kann mittels einer JavaScript-Datei (`scout_reg.js`) auf beliebigen Seiten integriert werden.

## Dateien

- `/scout_reg.js`: Die Web Component Logik. Kapselt Styles (Shadow DOM) und Logik.
- `/embed_example.html`: Eine Beispiel-HTML-Datei, die zeigt, wie das Widget konfiguriert und eingebunden wird.

## Funktionsweise

1.  Das Widget wird per Script-Tag geladen.
2.  Es rendert ein isoliertes Formular (Shadow DOM), das keine Styles der Host-Seite überschreibt oder von ihr beeinflusst wird.
3.  Bei Absenden des Formulars:
    - Verbindet sich das Widget direkt mit Supabase via `supabase-js` (wird bei Bedarf dynamisch nachgeladen).
    - Erstellt einen neuen Eintrag in der Tabelle `scouts`.
    - **Redirect:** Leitet den Browser anschließend sofort zur Scout App weiter, wobei die neue Scout-ID als Parameter angehängt wird (z.B. `.../scout_app.html?id=NEW_UUID`).

## Integration

Um das Widget einzubinden, muss folgendes HTML-Snippet an der gewünschten Stelle eingefügt werden:

```html
<!-- 1. Script laden (als Modul) -->
<script src="https://deine-domain/scout_reg.js" type="module"></script>

<!-- 2. Komponente konfigurieren -->
<sim-scout-register
  supabase-url="[DEINE_SUPABASE_URL]"
  supabase-key="[DEIN_SUPABASE_ANON_KEY]"
  tenant-id="[DEINE_TENANT_ID]"
  target-url="https://simscouting.studios-in-motion.de/scout_app.html"
></sim-scout-register>
```

### Konfigurations-Parameter

| Attribut       | Beschreibung                                                                       |
| :------------- | :--------------------------------------------------------------------------------- |
| `supabase-url` | Die URL deines Supabase Projekts.                                                  |
| `supabase-key` | Der _öffentliche_ Anon-Key (publishable key).                                      |
| `tenant-id`    | Die UUID des Tenants (Fitnessstudios), dem die Scouts zugeordnet werden.           |
| `target-url`   | Die _vollständige_ URL zur Scout App (nicht lokal, sondern öffentlich erreichbar). |

## Styling

Das Widget nutzt natives CSS im Shadow DOM und ist bewusst neutral ("News Modern") gehalten, um sich gut in verschiedenste Webseiten einzufügen. Es benötigt kein Tailwind CSS auf der Host-Seite.
