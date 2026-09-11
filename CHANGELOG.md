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

### Changed
- **Licence: the Business Source License 1.1.** Nothing changes for
  a lab: any dental laboratory or practice may keep using Lab Ledger at work,
  free, on as many computers and sites as it likes, and may pay anyone it wants
  to install or customise it. What the new licence stops is someone taking the
  code and selling it on - as a product, a hosted service, bundled with
  hardware, or built into another program; that needs a commercial licence from
  info@vladpereverzyev.com. This is source-available, not open source, and the
  licence says so itself.
- **Change date: 2030-09-11.** On that day version 1.3.0 turns into Apache 2.0
  on its own. Each future release carries its own change date, four years after
  it is published, written in the LICENSE file that ships with it.
- Settings names the licence and links to its full text; the footer, the
  sign-in screen, the updates dialog and the companion workbook carry
  "Business Source License 1.1".

## [1.2.0] - 2026-09-11

### Added
- **Users, roles and permissions.** First run asks for the lab's details and
  creates the administrator; after that the app opens on a sign-in screen. The
  administrator adds operators and ticks what each may do: see prices and
  profit, add and edit works, delete them, edit the catalog, export and back
  up. Passwords are never stored - only PBKDF2-SHA256 over a random per-user
  salt, 150000 rounds. The corner of the toolbar shows who is signed in, with a
  menu to switch user or sign out.
- **History**: every change with who made it and when - sign in and out, works
  added, edited, deleted, shipped or moved to outgoing, catalog and user
  changes. Newest first, capped at 2000 entries.
- **Incoming and Outgoing** on the works page. Incoming is work still on the
  bench: no courier, no shipping column, and no money counted until it is done.
  Tick it and it crosses to Outgoing, where the courier goes on.
- **Ship several works under one tracking number**: tick the rows, and one
  date, one courier and one tracking number land on all of them.
- **Companion Excel file**, written every time the app opens and closes to
  wherever you point it - typically a folder the lab's cloud drive already
  syncs. Eight sheets, values only, no macros or Excel-only formulas, so Excel,
  Google Sheets, LibreOffice and Numbers all open and edit it. Off by default.
- **Operators carry the work types they are set up to make**, which drives who
  is offered first on a new job and a new chart of what each one made.
- **Fits the screen it is on**: below a phone's width every table row becomes a
  card with each value labelled by its column. Checked at 1440, 1024, 820, 390
  and 360 pixels.
- Couriers moved into a catalog section of their own.
- README sections on being offline except the optional update check, and on how
  the companion workbook is meant to be used; screenshots at 1920x1080 in both
  light and dark; and docs/IDEAS.md, ten things a dental technician would ask
  for next.

### Changed
- **One dropdown for every choice.** The native select is kept only as the
  value holder; what you see and click is the same rounded panel everywhere,
  instead of whatever list each operating system draws.
- **The euro sign always follows the number**, in every language. The thousands
  and decimal separators still follow the language.
- **Light is the default theme**, in the app and in the browser demo.
- **Nothing moves when the language changes.** Grids have a fixed layout with
  widths in percent, and every translated control is pinned to its widest
  translation across all five languages. Verified on works, summary and catalog.
- The works view fills the window: the table scrolls inside its own box and the
  totals sit in a row at its foot, each under the column it totals.
- The selection bar no longer covers the header row.
- The sign-in screen dropped the logo and the slab of background colour: a card
  centred over the app, which stays visible and out of focus behind it.
- The version moved from the top bar to the footer; the author's name there
  opens vladpereverzyev.com. Neither is underlined.
- Doughnut slices and stacked bars lost the stripe between them, and the
  palette dropped a step in saturation.
- The catalog sections are rectangles like every other control.
- The demo seeds a fresh sample when the shipped one changes, signs itself in as
  the sample administrator, and its two accounts really work (password "demo").

### Removed
- Eight translation keys nothing referenced any more, and two icon sizes
  nothing linked.

## [1.1.0] - 2026-09-11

### Added
- **Patient** on every work - a full name or an internal case code -
  searchable along with client, work, operator, courier and tracking.
- **Shipping**: shipped flag, ship date, courier and tracking number, with a
  shipped / to ship filter and a courier list in the catalog.
- **Materials drive costs**: a work type now lists the materials it consumes and
  how many of each. The material cost is computed from pack cost divided by
  units per pack, so changing one pack price updates every work that uses it.
  Existing data is migrated; a work type without a recipe keeps its old cost.
- **Running costs** in the catalog: property (rent, mortgage, service charges),
  energy (electricity, gas, water), insurance, accountant, staff and other,
  monthly or yearly.
- **Tax regime** (flat rate or standard) and a **working calendar** (days per
  week, weeks per year, hours per day).
- **Profitability**: running costs, taxes and contributions, net profit, profit
  per working day / week / month, average per work, break-even revenue, and a
  profit and loss table per year, month, working day and % of revenue.
- Three new charts and two new chart types: revenue vs material cost by month
  (area), cumulative profit against the running-cost line, works per operator
  split billable / redo (stacked), where the revenue goes (stacked), plus
  horizontal bars for the top work types.
- Update check through the public GitHub REST API (`2022-11-28`), off-switchable
  in Catalog > Settings, with the installed version in the toolbar.
- Copyright notice in the footer and in the update dialog; the year range
  extends itself from 2026 to the current year.
- Catalog screenshot in the README, and a README section documenting exactly
  what the GitHub API is used for and what is sent.

### Changed
- **New app icon** at every size, traced from the master artwork at its own
  proportions - four strokes and one weight, so it survives 16x16 - with rounded
  corners on the black tile. Favicons now ship inside the app (`src/assets`) and
  are shared with the browser demo; the icon also heads every README.
- **Redos are accounted as a loss**: no revenue, and the price column shows
  minus the material cost. The redo control is a single switch in the work
  dialog, with a line explaining the arithmetic, and the redo filter is an
  ordinary dropdown like every other filter.
- The catalog is split into sections (Clients, Work types, Materials,
  Operators, Running costs, Taxes and calendar, Settings) instead of one wall of
  panels.
- Charts restyled: one minimal system, theme-aware, no chart-library defaults.
- **Switching language no longer moves the toolbar**: every top-bar control has
  a fixed width.
- The logo and app name were removed from the in-app top bar.
- Excel export now includes patient, shipping, margin, the catalog and the
  running costs.

## [1.0.3] - 2026-09-09

### Added
- macOS and Linux builds (.dmg/.zip and .AppImage/.deb) alongside the Windows
  installer.

## [1.0.2] - 2026-09-09

### Added
- App UI in Spanish, French and German (five languages in total).
- CONTRIBUTING guide and issue templates for bug reports and translations.

## [1.0.1] - 2026-09-09

### Added
- Clients catalog with email, phone, VAT number and address.
- In-app language toggle (English and Italian).

### Changed
- The Summary now charts works by client.

### Removed
- The Location field and catalog; the Client replaces it.

## [1.0.0] - 2026-09-09

### Added
- Initial release: works recording, automatic material cost and list price,
  yearly summary with charts, catalog, Excel and JSON import/export, light and
  dark theme, and an offline Windows installer.
