# Lab Ledger

[![Version](https://img.shields.io/github/v/release/vladpereverzyev/lab-ledger)](https://github.com/vladpereverzyev/lab-ledger/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/vladpereverzyev/lab-ledger/total)](https://github.com/vladpereverzyev/lab-ledger/releases)
[![Lizenz](https://img.shields.io/badge/lizenz-BUSL--1.1-blue)](LICENSE)
![Plattform](https://img.shields.io/badge/Plattform-Windows%20%7C%20macOS%20%7C%20Linux-0078D6)
[![GitHub REST API](https://img.shields.io/badge/GitHub%20REST%20API-2022--11--28-181717?logo=github&logoColor=white)](#github-api)

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![it](https://img.shields.io/badge/lang-it-green.svg)](./README.it.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.fr.md)
[![de](https://img.shields.io/badge/lang-de-lightgrey.svg)](./README.de.md)

**Lab Ledger zeigt einem Dentallabor, was es wirklich verdient.**

Erfasse jede Arbeit, wenn sie kommt und wenn sie geht. Lab Ledger rechnet aus,
was sie an Material gekostet hat, zieht Miete, Personal und Steuern ab und
zeigt dir den Gewinn pro Jahr, pro Monat und pro Arbeitstag.

Kostenlos für Windows, macOS und Linux. Kein Konto, kein Abo, und zum Arbeiten
braucht es kein Internet: jede Zahl bleibt auf deinem Computer.

**[App herunterladen](https://github.com/vladpereverzyev/lab-ledger/releases/latest)** · **[Im Browser ausprobieren](https://vladpereverzyev.github.io/lab-ledger/)**

## Warum Lab Ledger?

- **Ein echtes Desktop-Programm**: wird installiert wie jedes andere, läuft
  ohne Internetverbindung, und man muss sich nirgends anmelden.
- **Privat by design**: alle Daten bleiben auf deinem Rechner. Im Code stecken
  keine Patienten- oder Kundendaten - deine tippst du lokal ein und sicherst sie
  in Dateien, wann du willst.
- **Echte Kosten**: ein Material wird als Packung gekauft und ergibt eine
  bestimmte Zahl nutzbarer Einheiten. Die Division ergibt die Kosten einer
  Einheit. Jeder Arbeitstyp nennt, was er verbraucht - ändere einen
  Packungspreis, und jede Arbeit damit zieht nach.
- **Das ganze Bild**: nicht nur der Rohertrag. Miete, Energie, Versicherung,
  Steuerberater, Personal und Steuern kommen dazu, damit die App die einzige
  Frage beantworten kann, die zählt: was bleibt, im Jahr, im Monat, pro
  Arbeitstag.

## Screenshots

Arbeiten: jede Arbeit mit Patient, Versand, Materialkosten, Preis und Marge.

![Ansicht Arbeiten](docs/screenshot-works.png)

Derselbe Bildschirm im hellen Modus, mit dem die App startet:

![Ansicht Arbeiten, hell](docs/screenshot-works-light.png)

Ubersicht: das Jahr in Kacheln, Diagrammen und einer Ergebnisrechnung.

![Ansicht Ubersicht](docs/screenshot-summary.png)

![Ansicht Ubersicht, hell](docs/screenshot-summary-light.png)

Katalog: jeder Arbeitstyp mit den Materialien verdrahtet, die er verbraucht.

![Ansicht Katalog](docs/screenshot-catalog.png)

![Ansicht Katalog, hell](docs/screenshot-catalog-light.png)

## Funktionen

### Arbeiten
- Erfasse jede Arbeit: Datum, Kunde, **Patient** (vollständiger Name oder eine Fallnummer), Arbeitstyp,
  Einheiten, wer sie gemacht hat, und ob sie abrechenbar oder eine
  **Nacharbeit** ist.
- **Eine Nacharbeit ist ein Verlust und wird auch so gezählt.** Sie wird nie
  berechnet: sie verbraucht Material und bringt nichts ein, deshalb zeigt die
  Preisspalte die Materialkosten mit Minus, und die Marge sinkt genau darum.
- **Versand**: markiere eine Arbeit als versendet, mit Datum, Versanddienst und
  Sendungsnummer. Filtere nach versendet / noch zu versenden.
- **Eingang und Ausgang**: Arbeit, die noch auf dem Tisch liegt, wartet im
  Eingang und zählt noch nicht; als fertig markiert wandert sie in den Ausgang,
  wo sie Umsatz bringt und versendet wird.
- **Ein Paket, viele Arbeiten**: hake mehrere Arbeiten ab und versende sie
  zusammen mit einem Datum, einem Versanddienst und einer Sendungsnummer.
- **Löschen ist nicht vernichten**: eine gelöschte Arbeit verschwindet aus
  Listen und Summen, bleibt aber in einem Archiv in der Datendatei - und damit
  auch im Backup.
- Suche über Kunde, Patient, Arbeit, Bediener, Versanddienst und Sendungsnummer;
  filtere nach Jahr, Monat, Bediener, Versand und Nacharbeit.

### Wer damit arbeitet
- **Der erste Start** fragt die Daten des Labors ab und legt den Administrator
  an. Danach öffnet die App mit einer Anmeldung.
- **Bediener** legt der Administrator an und hakt ab, was jeder darf - jederzeit
  änderbar: Preise und Gewinn sehen, neue Arbeiten anlegen, bereits erfasste
  ändern, löschen, den Katalog bearbeiten, exportieren und sichern. Wer das Geld nicht sehen darf, bekommt weder den
  Reiter Übersicht noch die Spalten Preis und Marge noch die Preise im Katalog.
- **Passwörter werden nie gespeichert**: nur PBKDF2-SHA256 über ein zufälliges
  Salt je Benutzer, 150000 Runden. Ein vergessenes Passwort wird zurückgesetzt,
  nicht wiederhergestellt.
- **Ein vergessenes Administrator-Passwort sperrt niemanden aus dem Archiv
  aus.** Bei der Einrichtung entsteht ein **Wiederherstellungscode**, einmal
  angezeigt zum Aufschreiben, der das Administrator-Passwort vom
  Anmeldebildschirm aus zurücksetzt. Eine Kopie bleibt im Datenordner der App
  auf diesem Rechner, damit sie am Telefon vorgelesen werden kann, und der
  Administrator findet sie jederzeit unter **Katalog > Einstellungen**. Die
  Datendatei daneben ist reines JSON: der Code liegt nicht offener als das
  Archiv, in das er zurückführt, und beide schützt, wer diesen Rechner benutzen
  darf.
- **Der Verlauf** hält jede Änderung fest, mit wem und wann. Der Administrator
  liest ihn unter Katalog > Verlauf.

### Übersicht
- Aktivitätskacheln: Arbeiten, Einheiten, Umsatz, Materialkosten, Rohertrag,
  Nacharbeiten und was sie gekostet haben.
- Diagramme, alle aus deinen echten Zeilen: Umsatz und Materialkosten pro Monat
  (Fläche), Marge pro Monat (Balken, rot wenn der Monat verliert), kumulierter
  Gewinn gegen die Fixkostenlinie, ertragreichste Arbeiten (waagrechte Balken),
  Umsatzanteil je Kunde (Ring), Arbeiten je Bediener nach abrechenbar /
  Nacharbeit (gestapelte Balken), die Arbeitstypen je Bediener (gestapelte
  Balken) und wohin der Umsatz geht (gestapelter Balken:
  Material, Fixkosten, Steuern, was bleibt).
- Rentabilitätskacheln: Fixkosten, Steuern und Beiträge, Reingewinn und der
  Gewinn **pro Arbeitstag, pro Woche, pro Monat**, der Durchschnitt je Arbeit
  und der Umsatz, der allein zum Break-even nötig ist.
- Eine **Ergebnisrechnung** mit jeder Position pro Jahr, pro Monat, pro
  Arbeitstag und in Prozent vom Umsatz.

### Katalog
- **Kunden**: Name, E-Mail, Telefon, USt-IdNr., Adresse, Notizen.
- **Materialien**: Packungskosten, Einheiten je Packung, Einheit, Notiz. Die
  Kosten je Einheit sind die Division und stehen in der Zeile.
- **Arbeitstypen**: jeder nennt die verwendeten Materialien und deren Menge. Die
  Materialkosten werden berechnet, nie getippt - Marge und Marge % kommen mit.
- **Bediener** und **Versanddienste**: kurze Listen zum Auswählen.
- **Fixkosten**: Immobilie (Miete, Kredit, Nebenkosten), Energie (Strom, Gas,
  Wasser), Versicherung, Steuerberater, Personal und alles Weitere, monatlich
  oder jährlich, mit Jahres- und Monatsbetrag in jeder Zeile.
- **Steuern und Kalender**: Pauschal- oder Regelbesteuerung mit einfachen
  Prozentsätzen, dazu wie viele Tage pro Woche und Wochen pro Jahr das Labor
  tatsächlich arbeitet - das macht aus einem Jahresgewinn einen Tagesgewinn.
- **Einstellungen**: Update-Prüfung an oder aus, die automatische Excel-Kopie,
  der Wiederherstellungscode (nur Administrator), Version, Lizenz und Pfad der
  Datendatei.
- **Benutzer** und **Verlauf**: Konten und Rechte, und jede Änderung mit ihrem
  Urheber; nur für den Administrator.

### Überall
- **Import / Export**: Excel-Export von Arbeiten, Zusammenfassung je Typ,
  Katalog und Fixkosten; Excel-Import von Arbeiten, aus einer eigenen Tabelle
  oder einer Datei, die Lab Ledger geschrieben hat; vollständige Backups,
  unverschlüsselt oder **mit Passwort verschlüsselt** (AES-256-GCM), die sich auf
  jedem Rechner zurückspielen lassen. Ein Backup zurückzuspielen ersetzt auch
  die Konten, deshalb darf das nur der Administrator.
- **Fünf Sprachen**, und beim Sprachwechsel verrutscht die Leiste nicht: jedes
  Bedienelement hat eine feste Breite.
- **Passt sich dem Bildschirm an**: auf dem Handy wird jede Tabellenzeile zu
  einer Karte, in der jeder Wert den Namen seiner Spalte trägt.
- **Ein Dropdown für jede Auswahl**, statt der Liste, die jedes Betriebssystem
  anders zeichnet.
- **Das Eurozeichen steht immer hinter der Zahl**, in jeder Sprache.
- **Hell als Standard**, dunkel auf einen Klick, pro Rechner gemerkt.

## Offline von Grund auf

Lab Ledger braucht zum Arbeiten kein Internet. Die Daten liegen in einer
JSON-Datei auf deinem Rechner: kein Konto, kein Server, keine Telemetrie, und
nichts von dem, was du eingibst, wird je irgendwohin gesendet. Eine Kopie
verlässt den Rechner nur, wenn du es selbst so willst - indem du die
automatische Excel-Kopie in einen Ordner legst, den deine Cloud synchronisiert;
darauf weist die App hin, bevor sie sie schreibt.

Die App geht aus genau einem Grund online: **Updates**. Dann spricht sie mit der
öffentlichen GitHub REST API, und nur in diesen drei Fällen:

- **die automatische Prüfung**: höchstens einmal am Tag beim Start, wenn sie
  eingeschaltet ist. Standardmäßig ist sie das; abschalten unter
  **Katalog > Einstellungen**;
- **die Prüfung von Hand**: wenn du unten rechts im Fenster auf die
  Versionsnummer klickst;
- **der Download**: wenn du im Update-Dialog auf **Herunterladen** drückst.

Keiner der drei sendet ein Konto, Kennungen oder etwas über deine Arbeiten,
Kunden oder Patienten. Ohne Verbindung sieht die App schlicht keine neuen
Versionen; alles andere funktioniert gleich. Details unter
[GitHub API](#github-api).

## Die automatische Excel-Kopie

**Was sie ist.** Eine ganz normale Excel-Datei (.xlsx) mit allen Zahlen des
Labors, die Lab Ledger bei jedem Start und jedem Beenden der App von selbst neu
schreibt. Sie bleibt aus, bis du sie unter **Katalog > Einstellungen**
einschaltest und wählst, wo die Datei liegen soll.

**Wofür sie da ist.** Um die Zahlen ohne die App zu sehen. Jeder kann die Datei
öffnen - mit Excel, Google Sheets, LibreOffice oder Numbers, am Rechner oder am
Handy - ohne etwas zu installieren.

**Über die Cloud teilen.** Speichere die Datei in einem Ordner, den OneDrive,
Google Drive oder Dropbox ohnehin synchronisiert, und dieser Dienst lädt jede
neue Fassung von selbst hoch: wer Zugriff auf den Ordner hat - dein
Steuerberater, ein Partner - findet die Zahlen immer aktuell. Lab Ledger selbst
lädt nichts hoch; es schreibt nur die Datei auf deinem Rechner, das Hochladen
übernimmt dein Cloud-Dienst. Weil die Datei alle Daten enthält, fragt die App
nach, bevor sie sie zum ersten Mal schreibt.

**Sie geht nur in eine Richtung.** Die Datei ist eine Kopie zum Lesen.
Änderungen darin kommen nicht in Lab Ledger zurück und werden beim nächsten
Schreiben überschrieben. Um Zeilen aus einer Tabelle in die App zu holen, nimm
**Excel importieren** - sie werden als neue Arbeiten angelegt.

**Was drin ist.** Acht Blätter: Arbeiten, das Jahr Monat für Monat, Materialien
mit den Kosten einer Einheit, Arbeitstypen mit Materialien und Preisen,
Fixkosten, Praxen, Bediener und ein Info-Blatt mit der Version. Nur Werte -
keine Makros, keine Formeln - und Spaltenbreiten schon gesetzt, damit sie in
jedem Programm gleich aussieht. Die Spaltenköpfe sind auf Italienisch, wenn die
App auf Italienisch steht, sonst auf Englisch.

## Sprachen

Die Oberfläche gibt es auf **Englisch, Italienisch, Spanisch, Französisch und
Deutsch** - umschalten über die Sprachschaltfläche in der Leiste. Eine Sprache
hinzuzufügen ist ein reiner Übersetzungsbeitrag: siehe
[CONTRIBUTING.md](CONTRIBUTING.md).

## GitHub API

[![GitHub REST API](https://img.shields.io/badge/Powered%20by%20the-GitHub%20REST%20API-181717?logo=github&logoColor=white)](https://docs.github.com/rest)

Lab Ledger nutzt die **GitHub REST API** für genau eine Sache: dir zu sagen,
dass es eine neuere Version gibt.

| | |
|---|---|
| Endpunkt | `GET /repos/vladpereverzyev/lab-ledger/releases/latest` |
| API-Version | `X-GitHub-Api-Version: 2022-11-28` |
| Authentifizierung | keine - die öffentliche, nicht authentifizierte API |
| Ratenlimit | die öffentlichen 60 Anfragen pro Stunde und IP; die App fragt höchstens einmal am Tag |
| Was gesendet wird | die Anfrage selbst und ein `User-Agent` `LabLedger/<Version>`. Kein Konto, keine Kennungen, nichts über deine Arbeiten, Kunden oder Patienten |
| Was empfangen wird | das Tag der neuesten Version, die URL ihrer Seite und die Namen ihrer Dateien |
| Und dann | das Tag wird mit der installierten Version verglichen; ist es neuer, erscheint ein Dialog. Auf **Herunterladen** holt die App das passende Installationsprogramm selbst in den Ordner Downloads, prüft es gegen die mit der Version veröffentlichten SHA-256-Summen (eine Datei, die nicht passt, wird gelöscht) und bietet an, es zu starten. Ohne diesen Klick lädt und installiert sie nichts |

Die automatische Prüfung lässt sich unter **Katalog > Einstellungen**
abschalten. Dann geht die App nur noch online, wenn du unten rechts im Fenster
auf die Versionsnummer klickst, um von Hand zu prüfen, oder auf
**Herunterladen** drückst. In den Einstellungen stehen auch die installierte
Version und die verwendete GitHub-API-Version.

GitHub und das GitHub-Logo sind Marken von GitHub, Inc. Lab Ledger ist ein
unabhängiges Projekt und steht in keiner Verbindung zu GitHub, wird
weder gesponsert noch unterstützt.

## Wo die Daten liegen

Deine Daten liegen in einer einzigen lokalen JSON-Datei im Datenordner der App -
der genaue Pfad steht unter **Katalog > Einstellungen**. Nichts wird irgendwohin
hochgeladen. Mit **Backup** oder **Verschlüsseltes Backup** legst du eine Kopie
an, mit **Backup importieren** spielst du sie zurück.

Jedes Speichern geht zuerst in eine temporäre Datei, die dann die alte ersetzt:
ein Absturz oder Stromausfall mittendrin lässt das bisherige Archiv ganz. Ist
die Datei einmal nicht lesbar, legt die App sie unverändert beiseite - samt
Wiederherstellungscode - und sagt dir, wo, statt darüber neu anzufangen.

## Aus dem Quellcode starten

Benötigt [Node.js](https://nodejs.org/) 22.12 oder neuer.

```bash
npm install
npm start
```

## Bauen

```bash
npm run dist
```

Die Installer landen im Ordner `release/`: NSIS-Installer und portable `.exe`
unter Windows, universelle `.dmg` und `.zip` unter macOS (Intel und Apple Silicon), `AppImage` und `.deb` unter Linux.

Die Icons werden aus `build/icon.svg` mit
[Pillow](https://pillow.readthedocs.io/) neu erzeugt:

```bash
python -m pip install pillow
python build/make-icons.py
```

## Technik

- [Electron](https://www.electronjs.org/) - Desktop-Hülle
- [Chart.js](https://www.chartjs.org/) - Diagramme (mitgeliefert, kein CDN)
- [SheetJS](https://sheetjs.com/) - Excel-Import/-Export
- [GitHub REST API](https://docs.github.com/rest) - Update-Prüfung

## Mitmachen

Beiträge sind willkommen, besonders Übersetzungen. Siehe
[CONTRIBUTING.md](CONTRIBUTING.md).

## Lizenz

Lab Ledger ist **source-available**, nicht Open Source: frei zu nutzen im
eigenen Labor, nicht frei zum Weiterverkauf. Es gilt die
[Business Source License 1.1](LICENSE).

- **Jedes Dentallabor und jede Zahnarztpraxis darf es im Betrieb kostenlos
  einsetzen** - auf beliebig vielen Rechnern und Standorten.
- **Eine kommerzielle Lizenz braucht**, wer Lab Ledger oder eine geänderte
  Fassung davon Dritten gegen Geld anbietet: als Produkt, als gehosteten
  Dienst, mit Hardware gebündelt oder in ein anderes Produkt eingebaut.
  Schreiben Sie an <info@vladpereverzyev.com>.
- **Am 2030-09-14 wird diese Version automatisch Apache 2.0.** Jede
  Veröffentlichung hat ihr eigenes Datum, vier Jahre nach Erscheinen.
