# Changelog

All notable changes to Lab Ledger are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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
- **Says where the code comes from.** Part of Lab Ledger was written with the
  help of Claude, Anthropic's AI assistant. All five READMEs now say so plainly,
  along with what stays human: the decisions, the review and the testing at the
  bench.

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
  Ledger at work, free, on as many computers and sites as it likes, and may pay
  anyone it wants to install or customise it. What the licence stops is someone
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
