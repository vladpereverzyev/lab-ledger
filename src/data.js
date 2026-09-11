// Default configuration for a brand new installation.
//
// Every catalog starts EMPTY. A lab that installs Lab Ledger finds no
// materials, no work types and no operators waiting for it: it types its own,
// in the "Catalog" tab, and they are stored in the local data file. Nothing
// here is someone else's lab.
//
// This file is only ever read when there is no data file yet. Updating the app
// never touches an existing one.
//
// How a work costs what it costs
// ------------------------------
// A material is bought in a pack: `packCost` buys `pieces` usable units.
//   unit cost of the material = packCost / pieces
// A work type lists the materials it consumes and how many units of each:
//   material cost of the work = sum(qty x unit cost)
// Nothing else is estimated here: labour, machines and waste are not included.

window.DEFAULT_CONFIG = {
  // The people at the bench. Added in the catalog; an operator with no work
  // types assigned can make anything.
  //   { id, name, works: [<work type id>] }
  operators: [],

  // Clients (dental practices / referrers). Empty by default: no personal or
  // company data ships in the code - you add your own, stored locally.
  //   { id, name, email, phone, vat, address, note }
  clients: [],

  // Material list (generic descriptions only, no brand or company names).
  //   packCost : what one pack / disc / box costs
  //   pieces   : how many usable units come out of that pack
  //   unit     : the name of one usable unit
  materials: [],

  // Work type catalog.
  //   bom       : bill of materials - [{ material: <material id>, qty }]
  //   listPrice : average price an external lab would charge
  // The material cost is NOT stored: it is computed from the bom, so changing a
  // pack price updates every work that uses that material.
  works: [],

  // Running costs of the lab - everything that is paid whether or not a single
  // work goes out of the door. Empty by default: these numbers are personal.
  //   { id, category, name, amount, period }   period: "month" | "year"
  // Categories: property, energy, insurance, accounting, staff, other.
  overheads: [],

  // Tax regime. Indicative only - it models the two Italian regimes with plain
  // percentages so any country can be approximated by editing the rates.
  //   flat     : taxable = revenue x coefficient, then a single substitute tax
  //   standard : taxable = revenue - materials - overheads, then income tax
  // `social` is the pension / social-security contribution rate.
  tax: {
    regime: "flat",
    coefficient: 67,      // % of revenue treated as income under the flat regime
    flatRate: 5,          // % substitute tax (5% for the first years, then 15%)
    incomeRate: 23,       // % income tax under the standard regime
    socialRate: 24,       // % social contributions
    vatRate: 0            // % VAT, 0 under the Italian flat regime
  },

  // How much the lab actually works. Drives the daily / weekly / monthly
  // profit figures and the break-even line in the charts.
  calendar: { daysPerWeek: 5, weeksPerYear: 47, hoursPerDay: 8 },

  // Couriers offered in the shipping fields. Free text is always allowed.
  couriers: [],

  // The companion workbook: where it lives, and whether to keep it in step.
  excel: { enabled: false, path: "" },

  // Check GitHub for a newer release on startup (public API, no account, no
  // data sent). Switch off in Catalog > Settings.
  autoUpdateCheck: true
};
