# Changelog

All notable changes to Lab Ledger are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/).

## [1.4.5] - 2026-09-14

### Changed
- **One number format in every language:** a dot for thousands and a comma for
  decimals - 1.234,56 € - in every table, card, total, chart axis and
  percentage. Before, the separators followed the language, so English, for
  one, showed 1,234.56 €, and chart axes always used a comma for thousands.
- A shorter, classic README introduction in every language.

## [1.4.4] - 2026-09-14

### Fixed
- The browser demo showed "vdemo" as its version when it could not reach GitHub;
  it now shows "demo".
- The works count under the list says "1 work", not "1 works", in every language.
- The button that writes the Excel copy now agrees with "copy" in Italian and
  Spanish ("Scrivila adesso", "Escribirla ahora").

### Changed
- The README has a Roles and permissions section: what the administrator and an
  operator can do, what each permission opens, typical setups, and a screenshot
  of what an operator sees.

## [1.4.3] - 2026-09-14

### Changed
- **Someone who only works at the bench sees only the work.** An operator
  without the permission to see prices and profit now sees no amount anywhere:
  no prices, costs or margins in the works list and none in its totals, no
  Summary, no material costs, running costs or taxes, and no export or backup,
  since every one of them is full of prices. Before, the totals under the works
  list and the costs in the Catalog were still visible.
- **The Catalog is for whoever may change it.** An operator without the
  permission to edit the catalog no longer sees the Catalog tab at all, so
  clients, materials and work types cannot be opened or changed; what the work
  form needs is still offered there. Settings are for the administrator only.
- Every dialog sits on the same frosted background as the sign-in screen, and
  settings values share one size, weight and typeface.
- The copyright line on the sign-in screen links to the author, as the footer does.
- A new README introduction, and screenshots retaken from this version.

### Fixed
- In Outgoing, the totals sat a scrollbar's width to the right of their
  columns once the list was long enough to scroll.
- For an operator who cannot edit works, the hidden tick column cut the dates
  short and shifted the columns after it.

## [1.4.2] - 2026-09-14

### Changed
- The "companion Excel file" is now called the **automatic Excel copy**, and its
  explanation says plainly what it does: a copy of all the data, rewritten when
  the app opens and closes, for reading - changes made in the file are not read
  back and are overwritten. Before, it said Excel could "open and edit" it.
- Accents and wording fixed across the Italian, Spanish, French and German
  texts (the German ones also no longer switch between "Sie" and "du").
- The Excel import error names the Italian "Lavoro" column as well as "Work".
- The footer, the sign-in screen and the update dialog show only the copyright;
  the licence stays in **Catalog > Settings**.
- New README screenshots of the lab setup, Incoming, editing an operator and
  Settings; the existing ones are retaken from this version.

### Fixed
- In Incoming, the totals under the works list sat one column to the right:
  hiding the shipping column shifted every later cell. The column now closes
  up in place, in the list and in the totals.
- Catalog changes and imports (Excel and backup) are now recorded in History,
  as the documentation already said they were.
- A backup that cannot be written - a full disk, a read-only folder - now says
  so, instead of failing without a word.
- Long messages, such as where an unreadable data file was moved, stay on
  screen long enough to be read.

## [1.4.1] - 2026-09-14

### Fixed
- Two work types, or two operators, can no longer share a name. Works point at
  them by name, so renaming one onto another silently moved its works; that is
  now refused, and new ones are numbered ("New work type 2").
- Dates, units, quantities and prices from a restored backup are escaped before
  they are shown, so a tampered backup cannot put markup into the page.
- A malformed History entry in a restored backup no longer stops the Catalog
  from drawing.

### Added
- Marking incoming work as done records the day (`doneAt`), the first step
  towards measured lead times.

## [1.4.0] - 2026-09-14

### Added
- **macOS on Intel.** The Mac download is now a universal build that runs
  natively on both Intel and Apple Silicon.
- An operator's name, username, password and permissions can be changed after
  the account is created, from **Catalog > Users**.

### Changed
- **Adding a work and editing one are separate permissions.** An operator can
  be allowed to record new jobs without being able to change the ones already
  there - or to mark them done and shipped, which is editing too. Operators who
  could "add and edit" before keep both.
- Built on Electron 44 (from 34, which no longer receives security fixes). The
  window content now runs sandboxed, under a Content Security Policy.

### Fixed
- A change made less than a quarter of a second before closing the window is
  no longer lost, and the companion workbook written on quit includes it.
- The data file is saved to a temporary file and renamed into place, so a crash
  or power cut during a save leaves the previous archive intact.
- A data file that cannot be read is moved aside, untouched, instead of being
  overwritten by the empty archive the app starts with.
- Editing a work whose work type or operator has since been deleted no longer
  blanks those fields on save.
- Changing the work type in the work form refreshes the operators able to make it.
- Importing from Excel reads "No", "0" or "false" in the Redo and Shipped
  columns as no; before, anything written there counted as yes, and a redo
  earns nothing. The companion workbook the app writes - including its Italian
  headers - can now be imported back, incoming work included.
- When an unreadable data file is moved aside, its recovery code file is moved
  with it instead of being replaced by the code of the new archive.
- Importing from Excel needs the permission to add works.
- Importing a backup from before accounts existed no longer breaks the screen,
  and a backup written by a newer version is refused rather than trimmed.
- Update downloads are now actually checked against the published SHA-256 sums:
  GitHub renames uploaded files (spaces become dots), so the names never matched
  and every download was reported as unverified. A download that fails halfway
  no longer leaves a partial installer in Downloads.

### Security
- Updated the spreadsheet library (SheetJS) to 0.20.3, which fixes a prototype
  pollution and a denial-of-service issue when reading an untrusted Excel file.
- The encrypted backup is hidden from operators without the export permission,
  and restoring a backup - which replaces the accounts too - is for the
  administrator only.
- The app window can no longer be navigated away from the app, for example by
  dropping a file on it, and only https links are opened in the browser.

## [1.3.4] - 2026-09-11

### Added
- Published SHA-256 checksums alongside every release, so a downloaded file can
  be checked before it is run.
- Dependabot and CodeQL watch the dependencies and the code for known problems.

### Changed
- The security policy now states plainly what the password protects - the app's
  screens and actions - and what protects the data itself: who is allowed to use
  the computer, with a separate account per person and full-disk encryption.

## [1.3.3] - 2026-09-11

### Added
- **A way back in when the administrator password is gone.** Setting the lab up
  now produces a recovery code - six groups of four, from an alphabet with no
  I, O, 0 or 1 in it, because it gets read back over the phone. It is shown
  once to be written down, and **Forgotten password?** on the sign-in screen
  takes it and sets a new administrator password. A lab set up before this
  version gets its code the first time the administrator signs in.
- A copy of the code is kept in the app's data folder on that computer, so
  whoever supports the lab can read it back when connected to the machine, and
  an administrator can read it in **Catalog > Settings** at any time. It is
  deliberately readable rather than secret: the data file beside it is plain
  JSON, so hiding the code would protect nothing that is not already open -
  what protects both is who is allowed to use that computer.
- `npm test` - the first tests in the project, over the part that can lock a
  lab out of its own archive: the shape of the code, that two are never alike,
  that it verifies however it is typed back, that the clear text never reaches
  the data file, that a wrong or empty code opens nothing, and that a reset
  password really replaces the old one.

## [1.3.2] - 2026-09-11

### Changed
- **A new installation starts empty.** Until now the app arrived with a catalog
  already inside it - seventeen materials, thirty-three work types and two
  operators - which is somebody else's lab, not yours. A fresh install now
  opens on an empty Catalog: you enter the materials you actually buy, at the
  prices you actually pay, and the work you actually make. The browser demo
  keeps its sample lab, which is what a demo is for.
- **An update never touches data that is already there.** The defaults are read
  only when no data file exists, and the installer does not go near the folder
  the data lives in. A lab that updates keeps every work, client, patient,
  material, price and history entry it had.

## [1.3.1] - 2026-09-11

### Added
- **The update downloads itself.** Until now the dialog handed you a link and
  the browser did the rest. Press **Download** and the app fetches the right
  file for the computer it is running on - the installer on Windows, the disk
  image on macOS, the AppImage on Linux - straight into the Downloads folder,
  with the percentage counting up in the dialog while it comes. Then the button
  turns into **Install now**: on Windows it starts the installer and steps out
  of its way, on macOS it opens the image, on Linux it shows the file, because
  an AppImage needs its execute bit set by hand. Nothing is fetched and nothing
  is installed unless that button is pressed.
### Changed
- The copyright notice in the workbook header and in `docs/IDEAS.md` uses the
  real © symbol, as the footer already did.

## [1.3.0] - 2026-09-11

### Added
- **Works, in and out.** Incoming is work still on the bench: no courier, no
  shipping column, and no money counted until it is done. Tick it and it
  crosses to Outgoing, where the courier and the tracking number go on. Several
  works can be shipped under one tracking number at once.
- **Who is at the bench.** First run asks for the lab's details and creates the
  administrator; after that the app opens on a sign-in screen. The
  administrator adds operators and ticks what each may do: see prices and
  profit, add and edit works, delete them, edit the catalog, export and back
  up. Passwords are never stored - only PBKDF2-SHA256 over a random per-user
  salt, 150000 rounds. History records every change with who made it and when.
- **Costs that are real.** A material is bought in a pack and yields a number of
  units; a work type lists what it consumes, so changing one pack price updates
  every job that uses it. Running costs, tax regime and a working calendar turn
  a gross margin into the profit actually left - per year, per month, per
  working day - with a profit and loss table and charts built on real rows.
- **Companion Excel file**, written every time the app opens and closes to
  wherever you point it, typically a folder the lab's cloud drive already
  syncs. Eight sheets, values only, no macros, so Excel, Google Sheets,
  LibreOffice and Numbers all open and edit it. Off by default.
- **Five languages**, light and dark, and a layout that holds: grids keep their
  columns in every language, and below a phone's width each row becomes a card
  with every value labelled by its column.
- **Offline by design.** The data lives in one JSON file on the computer it was
  typed on. The only network call is the optional update check against the
  public GitHub REST API, which can be switched off in Catalog > Settings.

### Licence
- **Business Source License 1.1.** Any dental laboratory or practice may use Lab
  Ledger at work, free, on as many computers and sites as it likes. What the
  licence stops is someone
  taking the code and selling it on - as a product, a hosted service, bundled
  with hardware, or built into another program; that needs a commercial licence
  from info@vladpereverzyev.com. This is source-available, not open source, and
  the licence says so itself.
- **Change date: 2030-09-11.** On that day version 1.3.0 turns into Apache 2.0
  on its own. Each future release carries its own change date, four years after
  it is published, written in the LICENSE file that ships with it.
- Settings names the licence and links to its full text; the footer, the
  sign-in screen, the updates dialog and the companion workbook carry
  "Business Source License 1.1".
