# Integrations-Anleitung: SimScouting Tracking

**Version:** 1.0  
**Zweck:** Tracking von Empfehlungen auf externen Webseiten (Fitnessstudios, Shops, Landingpages).

Damit das System funktioniert, muss auf der Webseite des Kunden (z.B. auf der "Danke"-Seite oder im Bestellformular) das Skript eingebunden sein:

```html
<script type="module" src="https://[DEINE-DOMAIN]/widget.js"></script>
```

Sobald dieses Skript geladen ist, steht das globale Objekt `SimScouting` zur Verfügung. Es erkennt automatisch Besucher, die über einen Scout-Link kommen, und speichert die Zuordnung.

## Methode A: Die "Danke-Seite" (Conversion Pixel)

Nutzen Sie dies, wenn Sie Nutzer nach dem Kauf auf eine Bestätigungsseite leiten.

Fügen Sie diesen Code auf Ihrer "Vielen Dank für Ihre Anmeldung"-Seite ein:

```html
<script>
  // Warten bis das Skript geladen ist
  window.addEventListener("load", function () {
    if (window.SimScouting) {
      // Meldet den Erfolg an das System
      SimScouting.trackConversion("Mitgliedschaft abgeschlossen");
    }
  });
</script>
```

## Methode B: Formular-Integration (Hidden Fields)

Nutzen Sie dies, wenn Sie ein bestehendes Kontaktformular (WordPress, Typeform, etc.) nutzen.

1. Erstellen Sie in Ihrem Formular ein verstecktes Feld (Hidden Input).
2. Geben Sie diesem Feld die CSS-Klasse `sim-ref-id`.

Das Skript füllt dieses Feld automatisch mit der ID des Scouts.

**Manuelle Auslösung (falls nötig):**

```html
<script>
  // Füllt alle Felder mit der Klasse 'mein-hidden-feld'
  SimScouting.fillHiddenFields(".mein-hidden-feld");
</script>
```

## Methode C: Webhook / Backend (für Entwickler)

Nutzen Sie dies, wenn Sie die Scout-ID an Ihr CRM oder Ihre Verwaltungssoftware (z.B. Magicline) übergeben wollen.

Sie können die ID des werbenden Scouts jederzeit per JavaScript abrufen:

```javascript
const scoutId = SimScouting.getScoutId();
if (scoutId) {
  console.log("Kunde wurde geworben von Scout:", scoutId);
  // Hier können Sie die ID an Ihren Checkout-Prozess übergeben
}
```
