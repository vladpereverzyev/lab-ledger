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

**Lab Ledger mostra a un laboratorio odontotecnico quanto guadagna davvero.**

Registra ogni lavoro quando entra e quando esce. Lab Ledger calcola quanto è
costato di materiali, aggiunge affitto, personale e tasse, e ti dice l'utile
all'anno, al mese e per giorno lavorativo.

Gratis per Windows, macOS e Linux. Nessun account, nessun abbonamento, e per
usarlo non serve internet: ogni numero resta sul tuo computer.

**[Scarica l'app](https://github.com/vladpereverzyev/lab-ledger/releases/latest)** · **[Provala nel browser](https://vladpereverzyev.github.io/lab-ledger/)**

## Perché Lab Ledger?

- **Un programma desktop vero**: si installa come gli altri, funziona senza
  connessione e non c'è niente a cui iscriversi.
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

Primo avvio: i dati del laboratorio e l'account dell'amministratore, e nient'altro da configurare.

![Configurazione del laboratorio](docs/screenshot-setup.png)

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

In entrata: il lavoro ancora sul banco, che non conta niente finché non è segnato come fatto.

![Lavori in entrata](docs/screenshot-incoming.png)

Utenti: cosa può fare ogni operatore, modificabile quando vuoi.

![Modifica di un operatore](docs/screenshot-users.png)

Impostazioni: aggiornamenti, copia Excel automatica e codice di recupero.

![Impostazioni](docs/screenshot-settings.png)

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
- **In entrata e In uscita**: il lavoro ancora sul banco aspetta In entrata e
  non conta ancora niente; segnalo come finito e passa In uscita, dove porta
  ricavo e si spedisce.
- **Un pacco, tanti lavori**: spunta più lavori e spediscili insieme con una
  sola data, un corriere e un numero di tracking.
- **Eliminare non è distruggere**: un lavoro eliminato sparisce da elenchi e
  totali ma resta in un archivio dentro il file dei dati, quindi anche nei
  backup.
- Cerca su cliente, paziente, lavoro, operatore, corriere e tracking; filtra per
  anno, mese, operatore, spedizione e rifacimento.

### Chi lo usa
- **Al primo avvio** il programma chiede i dati del laboratorio e crea
  l'amministratore. Da lì in poi si apre su una schermata di accesso, e dietro
  non c'è niente finché non entri.
- **Gli operatori** li aggiunge l'amministratore, spuntando cosa ciascuno può
  fare, e può cambiarlo quando vuole: vedere prezzi e utili, aggiungere lavori
  nuovi, modificare quelli già registrati, eliminarli, modificare il catalogo,
  esportare e fare backup. Un operatore che non può
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
  fatturabili / rifacimenti (barre impilate), i tipi di lavoro che fa ciascun
  operatore (barre impilate) e dove finisce il ricavo (barra
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
- **Impostazioni**: controllo aggiornamenti sì o no, la copia Excel automatica, il
  codice di recupero (solo amministratore), versione, licenza e percorso del
  file dati.
- **Utenti** e **Cronologia**: account e permessi, e ogni modifica con chi l'ha
  fatta; solo per l'amministratore.

### Dappertutto
- **Importa / Esporta**: esportazione Excel di lavori, riepilogo per tipo,
  catalogo e costi fissi; importazione Excel dei lavori, da un foglio tuo o da un
  file scritto da Lab Ledger; backup completi, in chiaro o **cifrati con una
  password** (AES-256-GCM), da ripristinare su qualsiasi computer. Ripristinare
  un backup sostituisce anche gli account, quindi può farlo solo
  l'amministratore.
- **Cinque lingue**, e cambiando lingua la barra non si muove: ogni comando ha
  una larghezza fissa.
- **Si adatta allo schermo su cui sta**: sul telefono ogni riga della tabella
  diventa una scheda con ogni valore etichettato dalla sua colonna, così una
  lista da dodici colonne resta leggibile senza pizzicare e trascinare.
- **Una sola tendina** - ogni scelta apre lo stesso pannello arrotondato, invece
  dell'elenco che ciascun sistema operativo disegna a modo suo.
- **Il simbolo dell'euro sta sempre dopo il numero**, in ogni lingua; i
  separatori delle migliaia e dei decimali continuano a seguire la lingua.
- **Chiaro di default**, scuro a un clic, ricordato sul computer.

## Offline per costruzione

Lab Ledger non ha bisogno di internet per funzionare. I dati stanno in un file
JSON sul tuo computer: nessun account, nessun server, nessuna telemetria, e
niente di quello che scrivi viene mai inviato da qualche parte. L'unico modo in
cui una copia esce dal computer è una scelta tua: mettere la copia Excel automatica
in una cartella sincronizzata col cloud, e il programma te lo ricorda prima di
scriverla.

Il programma va online per un solo motivo: **gli aggiornamenti**. In quel caso
parla con la GitHub REST API pubblica, e solo in questi tre casi:

- **il controllo automatico**: al massimo una volta al giorno, all'avvio, se il
  controllo è attivo. Di default lo è; lo spegni in **Catalogo > Impostazioni**;
- **il controllo a mano**: quando clicchi il numero di versione in basso a destra
  nella finestra;
- **il download**: quando premi **Scarica** nella finestra degli aggiornamenti.

Nessuno dei tre invia account, identificativi o dati dei tuoi lavori, clienti o
pazienti. Senza connessione il programma semplicemente non vede le nuove
versioni; tutto il resto funziona uguale. I dettagli sono in
[GitHub API](#github-api).

## La copia Excel automatica

**Cos'è.** Un normale file Excel (.xlsx) con tutti i numeri del laboratorio, che
Lab Ledger riscrive da solo ogni volta che il programma si apre e ogni volta che
si chiude. Resta spenta finché non la attivi in **Catalogo > Impostazioni** e
scegli dove salvare il file.

**A cosa serve.** A vedere i numeri senza il programma. Chiunque può aprire il
file - con Excel, Google Fogli, LibreOffice o Numbers, dal computer o dal
telefono - senza installare niente.

**Condividerla col cloud.** Salva il file in una cartella che OneDrive, Google
Drive o Dropbox sincronizzano già, e sarà quel servizio a caricare da solo ogni
nuova versione: chi ha accesso a quella cartella - il commercialista, un socio -
trova sempre i numeri aggiornati. Lab Ledger non carica niente: scrive solo il
file sul tuo computer, e il caricamento lo fa il tuo servizio cloud. Siccome il
file contiene tutti i dati, il programma ti chiede conferma prima di iniziare a
scriverlo.

**Va in una sola direzione.** Il file è una copia da leggere. Le modifiche fatte
lì dentro non tornano in Lab Ledger e vengono sovrascritte la volta successiva
che il programma scrive il file. Per portare nel programma delle righe da un
foglio di calcolo usa **Importa Excel**, che le aggiunge come lavori nuovi.

**Cosa c'è dentro.** Otto fogli: lavori, l'anno mese per mese, materiali col
costo di un'unità, tipi di lavoro con materiali e prezzi, costi fissi, studi,
operatori, e un foglio Info con la versione. Solo valori - niente macro, niente
formule - e larghezze delle colonne già impostate, così si legge uguale in ogni
programma. Le intestazioni sono in italiano se il programma è in italiano,
altrimenti in inglese.

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
| Cosa viene ricevuto | il tag dell'ultima release, l'URL della sua pagina e i nomi dei suoi file |
| E poi | il tag viene confrontato con la versione installata; se è più recente compare una finestra. Premi **Scarica** e l'app tira giù da sola l'installer adatto al tuo sistema nella cartella Download, lo confronta con le somme SHA-256 pubblicate con la release (un file che non corrisponde viene cancellato) e poi ti propone di avviarlo. Senza quel pulsante non scarica e non installa niente |

Il controllo automatico si disattiva in **Catalogo > Impostazioni**.
Disattivato, l'app va online solo quando clicchi il numero di versione in basso a
destra nella finestra per controllare a mano, o quando premi **Scarica**. Nelle
Impostazioni sono indicate anche la versione installata e la versione della
GitHub API usata.

GitHub e il logo GitHub sono marchi di GitHub, Inc. Lab Ledger è un progetto
indipendente, non affiliato né sponsorizzato né approvato da GitHub.

## Dove finiscono i dati

I dati stanno in un unico file JSON locale nella cartella dati dell'app: il
percorso esatto è scritto in **Catalogo > Impostazioni**. Non viene caricato
niente da nessuna parte. Usa **Backup** o **Backup cifrato** per salvarne una
copia e **Importa backup** per ripristinarla.

Ogni salvataggio va prima in un file temporaneo e poi sostituisce il vecchio,
così un crash o un blackout a metà lasciano intero l'archivio precedente. Se un
giorno il file non si può leggere, il programma lo sposta da parte intatto,
insieme al suo codice di recupero, e ti dice dove, invece di ripartire da zero
sopra di lui.

## Eseguire dal codice

Serve [Node.js](https://nodejs.org/) 22.12 o più recente.

```bash
npm install
npm start
```

## Compilare

```bash
npm run dist
```

Gli installer finiscono nella cartella `release/`: installer NSIS ed eseguibile
portable su Windows, `.dmg` e `.zip` universali su macOS (Intel e Apple Silicon), `AppImage` e `.deb` su Linux.

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

## Contribuire

I contributi sono benvenuti, soprattutto le traduzioni. Vedi
[CONTRIBUTING.md](CONTRIBUTING.md). Dove potrebbe andare il programma, scritto
dal banco e non dal codice: [docs/IDEAS.md](docs/IDEAS.md).

## Licenza

Lab Ledger è **source-available**, non open source: libero da usare nel tuo
laboratorio, non libero da rivendere. Vale la
[Business Source License 1.1](LICENSE).

- **Qualsiasi laboratorio odontotecnico o studio dentistico può usarlo al
  lavoro, gratis** - su quanti computer e quante sedi vuole.
- **Serve una licenza commerciale** per fornire Lab Ledger, o una sua versione
  modificata, a terzi a pagamento: come prodotto, come servizio ospitato,
  abbinato a hardware o integrato in un altro programma. Scrivi a
  <info@vladpereverzyev.com>.
- **Il 2030-09-14 questa versione diventa Apache 2.0** in automatico. Ogni
  release ha la propria data, quattro anni dopo la sua pubblicazione.
