# SIM-Scouting: Integration in bestehende Formulare

Dieses Dokument beschreibt, wie du das SIM-Scouting-System in **bereits bestehende Formulare** (z. B. auf deiner WordPress-Website, in Typo3, in Hubspot-Formularen oder anderen CRM-Systemen) integrieren kannst.

Dadurch wird sichergestellt, dass Empfehlungen (Scouts) auch dann korrekt erfasst werden, wenn der geworbene Kunde nicht unser Standard-Formular, sondern dein eigenes Anfrageformular nutzt.

---

## Funktionsweise (Das "Universal Tracking SDK")

Das SIM-Scouting-System arbeitet mit einem unsichtbaren Tracking-Skript (SDK), welches im Hintergrund der Website läuft. 
Wenn ein Interessent über einen Empfehlungs-Link (z. B. per WhatsApp) auf deine Website kommt, sieht die URL etwa so aus:
`https://deine-website.de/angebot/?ref=12345-abcde`

Das Tracking-Skript erkennt die ID (`ref=12345-abcde`), speichert sie lokal im Browser des Nutzers zwischen und fügt diese ID beim Ausfüllen deines Formulars automatisch als unsichtbares Datenfeld hinzu. 

So weiß dein System am Ende genau, welchem Mitglied (Scout) die Prämie für den erfolgreichen Abschluss zusteht.

---

## Schritt-für-Schritt Anleitung zur Einbindung

### Schritt 1: Das Tracking-Skript einbinden
Binde das Skript auf der Zielseite (Landingpage) oder global in den Kopf- (`<head>`) oder Fußbereich (`vor dem schließenden </body>-Tag`) deiner Website ein. 

```html
<!-- SIM Scouting SDK -->
<script type="module" src="https://simscouting.studios-in-motion.de/widget.js"></script>
```

### Schritt 2: Verstecktes Feld in deinem Formular anlegen
Gehe in den Editor, in dem du dein Formular baust (z. B. Contact Form 7, Elementor Forms, Hubspot etc.) und füge ein **verstecktes Textfeld** ("Hidden Input Field") hinzu.

Gib diesem Feld einen eindeutigen Namen (z. B. `scout_id`) und weise ihm eine spezifische CSS-Klasse zu, z.B. `sim-ref-id`.

**Beispiel in HTML:**
```html
<input type="hidden" name="scout_id" class="sim-ref-id" value="">
```

### Schritt 3: Automatisches Befüllen aktivieren
Damit das Skript weiß, in welches Feld es die gespeicherte Scout-ID schreiben soll, setze den folgenden kleinen Code-Schnipsel direkt unter dein Formular (oder in die Footer-Skripte deiner Seite):

```html
<script>
  // Warten, bis die Seite und das SDK vollständig geladen sind
  window.addEventListener('load', () => {
    // Prüfen, ob das SIM-Scouting SDK aktiv ist
    if (window.SimScouting) {
       // Das SDK sucht alle Felder mit der Klasse '.sim-ref-id' 
       // und trägt dort automatisch die ID des empfehlenden Mitglieds ein.
       window.SimScouting.fillHiddenFields('.sim-ref-id');
    }
  });
</script>
```

---

## Häufig gestellte Fragen (FAQ)

**Was passiert, wenn der Nutzer erst 3 Tage später das Formular ausfüllt?**
Kein Problem! Das SDK speichert die Scout-ID im lokalen Speicher des Browsers (`localStorage`). Solange der Nutzer seine Browserdaten in der Zwischenzeit nicht löscht, wird die Empfehlung auch Tage später noch korrekt zugeordnet.

**Kann ich auch eine ID statt einer CSS-Klasse für das Feld verwenden?**
Ja. Ändere dafür im Skript einfach den Selektor von `.sim-ref-id` in `#deine-id`:
`window.SimScouting.fillHiddenFields('#deine-id');`

**Wie erfahre ich von der Empfehlung?**
Wenn der Interessent dein Formular absendet, erhältst du (wie gewohnt) eine E-Mail oder einen Eintrag in deinem CRM. Dort findest du nun zusätzlich das Feld `scout_id` mit der ID des Werbers. Anhand dieser ID kannst du dem Scout später seinen Bonus gutschreiben.
