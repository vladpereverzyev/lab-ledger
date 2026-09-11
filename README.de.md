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

**Kostenlose Offline-Desktop-App für Dentallabore**: erfasse, was den Tisch
verlässt, und sieh, was am Jahresende wirklich übrig bleibt.

<p align="center">
  <img src="src/assets/icon-256.png" alt="Lab Ledger" width="160" height="160">
</p>

### [**Live-Demo ausprobieren**](https://vladpereverzyev.github.io/lab-ledger/)

Beispieldaten, nichts zu installieren - alles bleibt im Browser. Lieber die
echte App? Hol sie aus der
[neuesten Version](https://github.com/vladpereverzyev/lab-ledger/releases/latest).

## Warum Lab Ledger?

- **Kostenlos und offline**: kein Konto, kein Server, kein Abo. Sie wird zu
  einer echten Desktop-Anwendung und läuft wie jedes normale Programm.
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
- Suche über Kunde, Patient, Arbeit, Bediener, Versanddienst und Sendungsnummer;
  filtere nach Jahr, Monat, Bediener, Versand und Nacharbeit.

### Wer damit arbeitet
- **Der erste Start** fragt die Daten des Labors ab und legt den Administrator
  an. Danach öffnet die App mit einer Anmeldung.
- **Bediener** legt der Administrator an und hakt ab, was jeder darf: Preise und
  Gewinn sehen, Arbeiten anlegen und ändern, löschen, den Katalog bearbeiten,
  exportieren und sichern. Wer das Geld nicht sehen darf, bekommt weder den
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
  Nacharbeit (gestapelte Balken) und wohin der Umsatz geht (gestapelter Balken:
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
- **Einstellungen**: Update-Prüfung an oder aus, Version, Pfad der Datendatei.

### Überall
- **Import / Export**: Excel-Export von Arbeiten, Zusammenfassung je Typ,
  Katalog und Fixkosten; Excel-Import von Arbeiten; vollständige
  JSON-Backups, die sich auf jedem Rechner zurückspielen lassen.
- **Heller und dunkler Modus**, pro Rechner gemerkt.
- **Fünf Sprachen**, und beim Sprachwechsel verrutscht die Leiste nicht: jedes
  Bedienelement hat eine feste Breite.
- **Passt sich dem Bildschirm an**: auf dem Handy wird jede Tabellenzeile zu
  einer Karte, in der jeder Wert den Namen seiner Spalte trägt.
- **Ein Dropdown fur jede Auswahl**, statt der Liste, die jedes Betriebssystem
  anders zeichnet.
- **Das Eurozeichen steht immer hinter der Zahl**, in jeder Sprache.
- **Hell als Standard**, dunkel auf einen Klick, pro Rechner gemerkt.

## Offline von Grund auf

Lab Ledger ist kein Cloud-Produkt mit Offline-Modus. Es ist ein Offline-Programm,
fertig. Die Daten liegen in einer JSON-Datei auf deinem Rechner: kein Konto, kein
Server, keine Telemetrie, und nichts von dem, was du eingibst, verlässt die
Maschine.

Es gibt genau eine Ausnahme, und sie lässt sich abschalten: **die
Update-Prüfung**. Einmal am Tag fragt die App, wenn du sie anlässt, die
öffentliche GitHub REST API nach der neuesten Version und vergleicht sie mit
deiner. Das ist der einzige Moment, in dem Lab Ledger das Internet benutzt. Es
sendet kein Konto, keine Kennungen und nichts über deine Arbeiten, Kunden oder
Patienten; und ein Installationsprogramm lädt es nur, wenn du auf den
entsprechenden Knopf drückst. Schalte sie unter
**Katalog > Einstellungen** ab, und die App macht überhaupt keinen
Netzwerkaufruf. Siehe [GitHub API](#github-api).

## Die begleitende Excel-Datei

Ein Labor hat längst einen Ordner, der synchronisiert, und jeder drumherum kann
eine Tabelle öffnen, ohne etwas zu installieren. Also schreibt Lab Ledger eine.

Zeig ihr unter **Katalog > Einstellungen** eine Datei, und die App schreibt sie
bei jedem Start und jedem Beenden neu. Leg sie in den Ordner, den deine Cloud
ohnehin synchronisiert, und die Zahlen des Labors reisen mit - teilbar von dir,
mit wem du willst, ohne dass jemand die App installiert. Lab Ledger lädt
weiterhin nichts hoch: es schreibt nur eine lokale Datei.

Acht Blätter, jedes für sich lesbar: Arbeiten, das Jahr Monat für Monat,
Materialien mit den Kosten einer Einheit, Arbeitstypen mit ihren Rezepturen und
Preisen, Fixkosten, Praxen, Bediener und ein Info-Blatt mit Version und
Copyright.

Es ist bewusst eine schlichte Datei: nur Werte, keine Makros, keine
Pivot-Tabellen, keine Formeln, die nur ein Programm versteht, Spaltenbreiten
gesetzt. Microsoft Excel, Google Sheets, LibreOffice und Numbers öffnen **und
bearbeiten** sie gleich. Standardmäßig aus.

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
| Was empfangen wird | das Tag der neuesten Version und die URL ihrer Seite |
| Und dann | das Tag wird mit der installierten Version verglichen; ist es neuer, erscheint ein Dialog. Auf **Herunterladen** holt die App das passende Installationsprogramm selbst in den Ordner Downloads und bietet an, es zu starten. Ohne diesen Klick lädt und installiert sie nichts |

Die Prüfung lässt sich unter **Katalog > Einstellungen** abschalten; abgeschaltet
macht die App überhaupt keine Netzwerkaufrufe. Dort stehen auch die installierte
Version und die verwendete GitHub-API-Version; die Version steht außerdem in der
oberen Leiste - anklicken, um von Hand nach Updates zu suchen.

GitHub und das GitHub-Logo sind Marken von GitHub, Inc. Lab Ledger ist ein
unabhängiges Projekt und steht in keiner Verbindung zu GitHub, wird
weder gesponsert noch unterstützt.

## Wo die Daten liegen

Deine Daten liegen in einer einzigen lokalen JSON-Datei im Datenordner der App -
der genaue Pfad steht unter **Katalog > Einstellungen**. Nichts wird irgendwohin
hochgeladen. Mit **Backup** legst du eine Kopie an, mit **Backup importieren**
spielst du sie zurück.

## Aus dem Quellcode starten

Benötigt [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm start
```

## Bauen

```bash
npm run dist
```

Die Installer landen im Ordner `release/`: NSIS-Installer und portable `.exe`
unter Windows, `.dmg` und `.zip` unter macOS, `AppImage` und `.deb` unter Linux.

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
- **Am 2030-09-11 wird diese Version automatisch Apache 2.0.** Jede
  Veröffentlichung hat ihr eigenes Datum, vier Jahre nach Erscheinen.
