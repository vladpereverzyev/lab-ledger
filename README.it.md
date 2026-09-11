# Lab Ledger

[![Release](https://img.shields.io/github/v/release/vladpereverzyev/lab-ledger)](https://github.com/vladpereverzyev/lab-ledger/releases/latest)
[![Download](https://img.shields.io/github/downloads/vladpereverzyev/lab-ledger/total)](https://github.com/vladpereverzyev/lab-ledger/releases)
[![Licenza](https://img.shields.io/badge/licenza-BUSL--1.1-blue)](LICENSE)
![Piattaforma](https://img.shields.io/badge/piattaforma-Windows%20%7C%20macOS%20%7C%20Linux-0078D6)
[![GitHub REST API](https://img.shields.io/badge/GitHub%20REST%20API-2022--11--28-181717?logo=github&logoColor=white)](#github-api)

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![it](https://img.shields.io/badge/lang-it-green.svg)](./README.it.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.fr.md)
[![de](https://img.shields.io/badge/lang-de-lightgrey.svg)](./README.de.md)

**App desktop gratuita e offline per laboratori odontotecnici**: registra quello
che esce dal banco e scopri quanto resta davvero a fine anno.

<p align="center">
  <img src="src/assets/icon-256.png" alt="Lab Ledger" width="160" height="160">
</p>

### [**Prova la demo live**](https://vladpereverzyev.github.io/lab-ledger/)

Dati di esempio, niente da installare: tutto resta nel tuo browser. Preferisci
l'app vera? Scaricala dall'
[ultima release](https://github.com/vladpereverzyev/lab-ledger/releases/latest).

## Perché Lab Ledger?

- **Gratuita e offline**: nessun account, nessun server, nessun abbonamento.
  Diventa un'applicazione desktop vera e si usa come un programma normale.
- **Privata per costruzione**: i dati restano sul tuo computer. Nel codice non
  c'è nessun dato di pazienti o clienti: i tuoi li scrivi in locale e li salvi
  su file quando vuoi.
- **Costi veri**: un materiale si compra a confezione e da quella confezione
  escono un certo numero di unità. La divisione dà il costo di un'unità. Ogni
  tipo di lavoro dichiara cosa consuma, quindi basta cambiare il prezzo di una
  confezione e tutti i lavori che la usano si aggiornano.
- **Il quadro completo**: non solo il margine lordo. Entrano anche affitto,
  energia, assicurazione, commercialista, dipendenti e tasse, così l'app può
  rispondere all'unica domanda che conta: quanto resta, all'anno, al mese, al
  giorno lavorativo.

## Schermate

Lavori: ogni lavoro con paziente, spedizione, costo materiale, prezzo e margine.

![Vista Lavori](docs/screenshot-works.png)

La stessa schermata in chiaro: il pulsante del tema nella barra cambia, e il
programma si apre in chiaro di default.

![Vista Lavori, chiaro](docs/screenshot-works-light.png)

Riepilogo: l'anno in schede, grafici e conto economico.

![Vista Riepilogo](docs/screenshot-summary.png)

![Vista Riepilogo, chiaro](docs/screenshot-summary-light.png)

Catalogo: ogni tipo di lavoro collegato ai materiali che consuma.

![Vista Catalogo](docs/screenshot-catalog.png)

![Vista Catalogo, chiaro](docs/screenshot-catalog-light.png)

## Funzioni

### Lavori
- Registra ogni lavoro: data, cliente, **paziente** (nome e cognome o un codice caso), tipo di
  lavoro, unità, chi l'ha fatto e se è fatturabile o un **rifacimento**.
- **Il rifacimento è una perdita, ed è contato come tale.** Un rifacimento non
  si fattura: brucia il materiale e non porta ricavo, quindi nella colonna del
  prezzo compare il costo del materiale col segno meno e il margine scende
  esattamente di quello.
- **Spedizione**: segna un lavoro come spedito con data, corriere e numero di
  tracking. Filtra per spediti / da spedire.
- Cerca su cliente, paziente, lavoro, operatore, corriere e tracking; filtra per
  anno, mese, operatore, spedizione e rifacimento.

### Chi lo usa
- **Al primo avvio** il programma chiede i dati del laboratorio e crea
  l'amministratore. Da lì in poi si apre su una schermata di accesso, e dietro
  non c'è niente finché non entri.
- **Gli operatori** li aggiunge l'amministratore, spuntando cosa ciascuno può
  fare: vedere prezzi e utili, aggiungere e modificare lavori, eliminarli,
  modificare il catalogo, esportare e fare backup. Un operatore che non può
  vedere i soldi non vede la scheda Riepilogo, né le colonne prezzo e margine,
  né i prezzi nel catalogo.
- **Le password non vengono mai salvate**: si salva solo PBKDF2-SHA256 su un
  sale casuale per utente, 150000 giri. Una password dimenticata si azzera, non
  si recupera.
- **Una password dell'amministratore dimenticata non ti chiude fuori
  dall'archivio.** Alla configurazione il programma genera un **codice di
  recupero**, mostrato una volta perché lo scrivi e lo tenga, che reimposta la
  password dell'amministratore dalla schermata di accesso. Una copia resta
  nella cartella dati del programma su quel computer, così chi assiste il
  laboratorio può leggerla al telefono, e l'amministratore la ritrova in
  **Catalogo > Impostazioni** quando vuole. Il file dei dati lì accanto è JSON
  in chiaro: il codice non è più esposto dell'archivio in cui ti fa rientrare,
  e tutti e due sono protetti da chi può usare quel computer.
- **La cronologia** registra ogni modifica con chi l'ha fatta e quando: accessi
  e uscite, lavori aggiunti, modificati, eliminati, spediti o passati in uscita,
  modifiche al catalogo e agli utenti. L'amministratore la legge in
  Catalogo > Cronologia.

### Riepilogo
- Schede di attività: lavori, unità, ricavo, costo materiali, margine lordo,
  rifacimenti e quanto sono costati.
- Grafici, tutti costruiti sulle righe vere: ricavo e costo materiali per mese
  (area), margine per mese (barre, rosse quando il mese perde), utile cumulato
  contro la linea dei costi fissi, lavori più redditizi (barre orizzontali),
  quota di ricavo per cliente (ciambella), lavori per operatore divisi
  fatturabili / rifacimenti (barre impilate) e dove finisce il ricavo (barra
  impilata: materiali, costi fissi, tasse, quello che resta).
- Schede di redditività: costi fissi, tasse e contributi, utile netto e l'utile
  **al giorno lavorativo, alla settimana, al mese**, la media per lavoro e il
  ricavo che serve solo per andare in pari.
- Una tabella di **conto economico** con ogni voce all'anno, al mese, al giorno
  lavorativo e in percentuale sul ricavo.

### Catalogo
- **Clienti**: nome, email, telefono, partita IVA, indirizzo, note.
- **Materiali**: costo della confezione, unità per confezione, unità di misura,
  nota. Il costo unitario è la divisione, ed è scritto sulla riga.
- **Tipi di lavoro**: ognuno elenca i materiali che usa e in che quantità. Il
  costo materiale si calcola, non si scrive, e con lui arrivano margine e
  margine %.
- **Operatori** e **corrieri**: elenchi brevi da cui scegliere.
- **Costi fissi**: immobile (affitto, mutuo, condominio), energia (luce, gas,
  acqua), assicurazione, commercialista, dipendenti e qualsiasi altra voce,
  mensile o annuale, con l'importo annuo e mensile su ogni riga.
- **Tasse e calendario**: regime forfettario oppure ordinario con percentuali
  semplici, più quanti giorni a settimana e settimane all'anno lavora davvero il
  laboratorio: è quello che trasforma un utile annuo in un utile giornaliero.
- **Impostazioni**: controllo aggiornamenti sì o no, versione, percorso del file
  dati.

### Dappertutto
- **Importa / Esporta**: esportazione Excel di lavori, riepilogo per tipo,
  catalogo e costi fissi; importazione Excel dei lavori; backup JSON completi da
  ripristinare su qualsiasi computer.
- **Tema chiaro e scuro**, ricordato sul computer.
- **Cinque lingue**, e cambiando lingua la barra non si muove: ogni comando ha
  una larghezza fissa.
- **Si adatta allo schermo su cui sta**: sul telefono ogni riga della tabella
  diventa una scheda con ogni valore etichettato dalla sua colonna, cosi' una
  lista da dodici colonne resta leggibile senza pizzicare e trascinare.
- **Una sola tendina** - ogni scelta apre lo stesso pannello arrotondato, invece
  dell'elenco che ciascun sistema operativo disegna a modo suo.
- **Il simbolo dell'euro sta sempre dopo il numero**, in ogni lingua; i
  separatori delle migliaia e dei decimali continuano a seguire la lingua.
- **Chiaro di default**, scuro a un clic, ricordato sul computer.

## Offline per costruzione

Lab Ledger non è un prodotto cloud con una modalità offline. È un programma
offline, punto. I dati stanno in un file JSON sul tuo computer: nessun account,
nessun server, nessuna telemetria, e niente di quello che scrivi esce dalla
macchina.

C'è un'unica eccezione, e si può spegnere: **il controllo aggiornamenti**. Una
volta al giorno, se lo lasci attivo, il programma chiede alla GitHub REST API
pubblica qual è l'ultima release e la confronta con quella che stai usando. È
l'unico momento in cui Lab Ledger usa internet. Non manda nessun account,
nessun identificativo e niente dei tuoi lavori, clienti o pazienti; e scarica
un installer solo quando sei tu a chiederglielo col pulsante. Spegnilo in **Catalogo > Impostazioni** e il
programma non fa nessuna chiamata di rete. I dettagli sono in
[GitHub API](#github-api).

## Il file Excel abbinato

Un laboratorio ha già una cartella che si sincronizza, e chiunque gli sta
attorno sa aprire un foglio di calcolo senza installare niente. Quindi Lab
Ledger lo scrive.

Indicagli un file in **Catalogo > Impostazioni** e il programma lo riscrive ogni
volta che si apre e ogni volta che si chiude. Mettilo nella cartella che il tuo
cloud già sincronizza e i numeri del laboratorio viaggiano con lui:
condivisibili da te, con chi vuoi tu, senza che nessuno installi l'app. Lab
Ledger continua a non caricare niente: scrive solo un file locale, e se vuoi è
il tuo drive a fare il resto.

Otto fogli, leggibili anche da soli: lavori, l'anno mese per mese, materiali col
costo di un'unità, tipi di lavoro con le loro ricette e i prezzi, costi fissi,
studi, operatori, e un foglio Info con versione e copyright. Le intestazioni
seguono la lingua impostata nel programma.

È un file volutamente semplice: solo valori, niente macro, niente tabelle pivot,
nessuna formula che capisce un programma solo, larghezze delle colonne già
impostate perché non compaia ####. Microsoft Excel, Google Fogli, LibreOffice e
Numbers lo aprono **e lo modificano** allo stesso modo. Spento di default.

## Lingue

L'interfaccia è disponibile in **inglese, italiano, spagnolo, francese e
tedesco**: si cambia con il pulsante della lingua nella barra. Aggiungere una
lingua è un contributo di sola traduzione: vedi
[CONTRIBUTING.md](CONTRIBUTING.md).

## GitHub API

[![GitHub REST API](https://img.shields.io/badge/Powered%20by%20the-GitHub%20REST%20API-181717?logo=github&logoColor=white)](https://docs.github.com/rest)

Lab Ledger usa la **GitHub REST API** per una cosa sola: dirti che esiste una
versione più recente.

| | |
|---|---|
| Endpoint | `GET /repos/vladpereverzyev/lab-ledger/releases/latest` |
| Versione API | `X-GitHub-Api-Version: 2022-11-28` |
| Autenticazione | nessuna: API pubblica non autenticata |
| Limite di chiamate | i 60 all'ora per IP dell'API pubblica; l'app chiede al massimo una volta al giorno |
| Cosa viene inviato | la richiesta e uno `User-Agent` `LabLedger/<versione>`. Nessun account, nessun identificativo, niente dei tuoi lavori, clienti o pazienti |
| Cosa viene ricevuto | il tag dell'ultima release e l'URL della sua pagina |
| E poi | il tag viene confrontato con la versione installata; se è più recente compare una finestra. Premi **Scarica** e l'app tira giù da sola l'installer adatto al tuo sistema nella cartella Download, poi ti propone di avviarlo. Senza quel pulsante non scarica e non installa niente |

Il controllo si disattiva in **Catalogo > Impostazioni**; disattivato, l'app non
fa nessuna chiamata di rete. Lì sono indicate anche la versione installata e la
versione della GitHub API usata; la versione è pure nella barra in alto: cliccala
per controllare gli aggiornamenti a mano.

GitHub e il logo GitHub sono marchi di GitHub, Inc. Lab Ledger è un progetto
indipendente, non affiliato né sponsorizzato né approvato da GitHub.

## Dove finiscono i dati

I dati stanno in un unico file JSON locale nella cartella dati dell'app: il
percorso esatto è scritto in **Catalogo > Impostazioni**. Non viene caricato
niente da nessuna parte. Usa **Backup** per salvarne una copia e **Importa
backup** per ripristinarla.

## Eseguire dal codice

Serve [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm start
```

## Compilare

```bash
npm run dist
```

Gli installer finiscono nella cartella `release/`: installer NSIS ed eseguibile
portable su Windows, `.dmg` e `.zip` su macOS, `AppImage` e `.deb` su Linux.

Le icone si rigenerano da `build/icon.svg` con
[Pillow](https://pillow.readthedocs.io/):

```bash
python -m pip install pillow
python build/make-icons.py
```

## Tecnologie

- [Electron](https://www.electronjs.org/) - guscio desktop
- [Chart.js](https://www.chartjs.org/) - grafici (inclusi nel pacchetto, nessun CDN)
- [SheetJS](https://sheetjs.com/) - import/export Excel
- [GitHub REST API](https://docs.github.com/rest) - controllo aggiornamenti

## Come è stato scritto

Lab Ledger è il lavoro di un odontotecnico, non di una software house. Una
parte del codice è stata scritta con l'aiuto di Claude, l'assistente AI di
Anthropic. Le decisioni su cosa il programma debba fare, la revisione di quello
che ne è uscito e le prove al banco sono dell'autore, e così la responsabilità
del risultato.

## Contribuire

I contributi sono benvenuti, soprattutto le traduzioni. Vedi
[CONTRIBUTING.md](CONTRIBUTING.md). Dove potrebbe andare il programma, scritto
dal banco e non dal codice: [docs/IDEAS.md](docs/IDEAS.md).

## Licenza

Lab Ledger è **source-available**, non open source: libero da usare nel tuo
laboratorio, non libero da rivendere. Dalla versione 1.3.0 vale la
[Business Source License 1.1](LICENSE).

- **Qualsiasi laboratorio odontotecnico o studio dentistico può usarlo al
  lavoro, gratis** - su quanti computer e quante sedi vuole - e può pagare
  qualcuno perché glielo installi, ospiti, mantenga o personalizzi.
- **Serve una licenza commerciale** per fornire Lab Ledger, o una sua versione
  modificata, a terzi a pagamento: come prodotto, come servizio ospitato,
  abbinato a hardware o integrato in un altro programma. Scrivi a
  <info@vladpereverzyev.com>.
- **Il 2030-09-11 questa versione diventa Apache 2.0** in automatico. Ogni
  release ha la propria data, quattro anni dopo la sua pubblicazione.
