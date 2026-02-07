# Anleitung: URL-Aufbau & Tracking

Diese Anleitung erklärt, wie Links für das Empfehlungsprogramm (Scouting App) und Landingpages aufgebaut werden müssen, damit das Tracking korrekt funktioniert und wir wissen:

1.  **WER** hat empfohlen? (Scout)
2.  **WO** wurde der Link geklickt? (Kampagne/Herkunft)
3.  **WIE** wurde geteilt? (Kanal/Quelle)

---

## 1. Die Grundregel

Ein Link besteht immer aus der **Basis-Adresse** (wohin der Nutzer soll) und **Parametern** (Zusatzinfos für das System).

`[Basis-Adresse] ? [Parameter 1] & [Parameter 2] & [Parameter 3]`

- Das Fragezeichen `?` leitet die Parameter ein.
- Das Und-Zeichen `&` trennt mehrere Parameter voneinander.

---

## 2. Die wichtigsten Parameter

### `id` oder `ref` (Der Scout)

**Sinn:** Identifiziert die Person, die empfiehlt. Ohne diesen Wert können wir keine Belohnung zuordnen.

- **Verwendung:**
  - `id=...` wird meist für die **Scout App** selbst genutzt (Login).
  - `ref=...` wird meist für **Landingpages** genutzt (Empfehlungslink für Freunde).

_Beispiel:_ `?id=123e4567-e89b...`

### `campaign` (Die Herkunft / Kampagne)

**Sinn:** Sagt uns, woher der Scout (oder der Interessent) ursprünglich kam. Dies nutzen wir für Marketing-Analysen.

- **Wann nutzen?** Immer, wenn du einen Link veröffentlichst (Newsletter, Social Media Post, QR-Code im Studio).
- **Beispiele für Werte:**
  - `newsletter_winter`
  - `qrcode_theke`
  - `instagram_bio`
  - `mitglieder_mail_mai`

_Hinweis:_ Das System versteht auch `utm_campaign` (Standard im Online-Marketing).

### `source` (Der Kanal / Medium)

**Sinn:** Unterscheidet das genutzte Medium _innerhalb_ einer Kampagne.

- **Automatisch:** Die Scout App setzt diesen Wert automatisch, wenn ein Scout teilt (z.B. auf `wa` für WhatsApp oder `em`für E-Mail).
- **Manuell:** Wenn du selbst Links baust, kannst du ihn nutzen, z.B. `source=facebook` vs. `source=instagram`.

---

## 3. Praxis-Beispiele

### Szenario A: Newsletter an bestehende Mitglieder

Du möchtest deinen Mitgliedern den Link zu ihrer persönlichen Scout-App schicken.

**Ziel:** `https://dein-studio.de/scout_app.html`
**Parameter:**

1.  `id`: Die ID des Mitglieds (wird meist vom Newslettersystem dynamisch eingesetzt).
2.  `campaign`: `newsletter_kw42`

**Ergebnis:**
`https://dein-studio.de/scout_app.html?id={{member_id}}&campaign=newsletter_kw42`

### Szenario B: QR-Code Aufsteller im Studio

Du stellst einen Aufsteller an die Theke ("Scanne hier und werde Scout"). Da wir hier noch keine ID haben, ist der Link für alle gleich.

**Ziel:** `https://dein-studio.de/scout_app.html`
**Parameter:**

1.  `campaign`: `qrcode_theke`

**Ergebnis:**
`https://dein-studio.de/scout_app.html?campaign=qrcode_theke`

_(Wenn ein Nutzer diesen Link scannt, sieht er das Registrierungs-Formular. Das System merkt sich "Aha, dieser neue Scout kam über den Theken-Aufsteller".)_

### Szenario C: Instagram Story

Du postest einen Link in deiner Story.

**Ziel:** `https://dein-studio.de/scout_app.html`
**Parameter:**

1.  `campaign`: `social_media`
2.  `source`: `ig_story`

**Ergebnis:**
`https://dein-studio.de/scout_app.html?campaign=social_media&source=ig_story`

---

## 4. Häufige Fehler & Tipps

- **Keine Leerzeichen!**
  URLs dürfen keine Leerzeichen enthalten.
  ❌ `campaign=Newsletter Mai`
  ✅ `campaign=Newsletter_Mai` oder `campaign=newsletter-mai`

- **Kleinschreibung:**
  Am besten immer Kleinschreibung verwenden. Das vermeidet Verwirrung (`Email` vs. `email`).

- **Testen:**
  Klicke den Link immer einmal selbst an, bevor du ihn versendest. Prüfe, ob die Seite lädt.

---

## 5. Das "Doppelte Lottchen" (Eingehend vs. Ausgehend)

Unser neues System unterscheidet zwei Richtungen:

1.  **INCOMING (Woher kommt der Scout?):**
    Das ist dein Job. Du setzt den `campaign` Parameter in den Link zur App.
    _Beispiel:_ Du schickst den Scout über den Newsletter (`?campaign=newsletter`) in die App.

2.  **OUTGOING (Wie empfiehlt der Scout weiter?):**
    Das macht die App automatisch. Sie hängt an den Link für den Freund (`?source=...`) an.
    _Beispiel:_ Der Scout klickt in der App auf "WhatsApp". Der Link für den Freund erhält `&source=wa`.

**Zusammenfassung in der Datenbank:**
Wir sehen dann: "User X kam über **Newsletter** (Campaign) und hat per **WhatsApp** (Source) weiterempfohlen."
