// Default configuration for the app.
// Contains NO patient data and NO company or brand names: only generic
// materials, work types and indicative costs. All values are editable by the
// user in the "Catalog" tab and are stored in the local data file.
//
// How a work costs what it costs
// ------------------------------
// A material is bought in a pack: `packCost` buys `pieces` usable units.
//   unit cost of the material = packCost / pieces
// A work type lists the materials it consumes and how many units of each:
//   material cost of the work = sum(qty x unit cost)
// Nothing else is estimated here: labour, machines and waste are not included.

window.DEFAULT_CONFIG = {
  // An operator with no work types assigned can make anything, which is the
  // right default for a lab of one or two people.
  //   { id, name, works: [<work type id>] }
  operators: [
    { id: "op1", name: "Operator One", works: [] },
    { id: "op2", name: "Operator Two", works: [] }
  ],

  // Clients (dental practices / referrers). Empty by default: no personal or
  // company data ships in the code - you add your own, stored locally.
  //   { id, name, email, phone, vat, address, note }
  clients: [],

  // Material list (generic descriptions only, no brand or company names).
  //   packCost : what one pack / disc / box costs
  //   pieces   : how many usable units come out of that pack
  //   unit     : the name of one usable unit
  materials: [
    { id: "zirconia", name: "Zirconia disc", packCost: 130, pieces: 20, unit: "element", note: "Crowns and bridges" },
    { id: "pmma", name: "PMMA disc", packCost: 55, pieces: 22, unit: "element", note: "Provisional restorations" },
    { id: "composite", name: "Composite disc", packCost: 190, pieces: 22, unit: "element", note: "Inlays and restorations" },
    { id: "sheet05", name: "Thermoforming sheet 0.5 mm", packCost: 41.28, pieces: 20, unit: "sheet", note: "Whitening / remineralization trays" },
    { id: "sheet1", name: "Thermoforming sheet 1 mm", packCost: 44.5, pieces: 20, unit: "sheet", note: "Retainers" },
    { id: "sheet4", name: "Thermoforming sheet 4 mm", packCost: 77.28, pieces: 10, unit: "sheet", note: "Bruxism guards" },
    { id: "plate", name: "Curable plates", packCost: 50.88, pieces: 50, unit: "plate", note: "Custom trays" },
    { id: "tibase", name: "Ti-base (direct)", packCost: 37, pieces: 1, unit: "piece", note: "Crowns on implant" },
    { id: "tibasemu", name: "Ti-base (multi-unit)", packCost: 30, pieces: 1, unit: "piece", note: "Full-arch restorations" },
    { id: "resin3d", name: "3D printing resin (0.5 kg)", packCost: 89, pieces: 146, unit: "model", note: "Printed models" },
    { id: "wax", name: "Occlusal wax", packCost: 29.99, pieces: 100, unit: "piece", note: "Bite rims" },
    { id: "teethpremium", name: "Denture teeth - premium", packCost: 49, pieces: 14, unit: "tooth", note: "Full dentures" },
    { id: "teethstandard", name: "Denture teeth - standard", packCost: 29.7, pieces: 14, unit: "tooth", note: "Provisional dentures" },
    { id: "baseresin", name: "Denture base resin", packCost: 83.65, pieces: 23.24, unit: "denture", note: "Denture base" },
    { id: "bar", name: "Toronto bar (milling center)", packCost: 220, pieces: 1, unit: "bar", note: "Outsourced milling" },
    { id: "framework", name: "Metal framework (milling center)", packCost: 105, pieces: 1, unit: "framework", note: "Outsourced milling" },
    { id: "frameworkteeth", name: "Resin teeth for framework", packCost: 17, pieces: 1, unit: "framework", note: "Framework dentures" }
  ],

  // Work type catalog.
  //   bom       : bill of materials - [{ material: <material id>, qty }]
  //   listPrice : average price an external lab would charge
  // The material cost is NOT stored: it is computed from the bom, so changing a
  // pack price updates every work that uses that material.
  works: [
    { id: "toothadd", name: "Tooth Addition", listPrice: 45, bom: [{ material: "teethpremium", qty: 1 }] },
    { id: "claspadd", name: "Clasp Addition", listPrice: 45, bom: [] },
    { id: "bruxguard", name: "Bruxism Guard", listPrice: 90, bom: [{ material: "sheet4", qty: 1 }] },
    { id: "retainer", name: "Retainer", listPrice: 45, bom: [{ material: "sheet1", qty: 1 }] },
    { id: "remintray", name: "Remineralization Tray", listPrice: 35, bom: [{ material: "sheet05", qty: 1 }] },
    { id: "whitetray", name: "Whitening Tray", listPrice: 35, bom: [{ material: "sheet05", qty: 1 }] },
    { id: "teethrepl", name: "Denture Teeth Replacement", listPrice: 35, bom: [{ material: "teethpremium", qty: 1 }] },
    { id: "crownload", name: "Immediate-Load Crown", listPrice: 299, bom: [{ material: "pmma", qty: 1 }, { material: "tibase", qty: 1 }] },
    { id: "crownfinal", name: "Final Crown", listPrice: 165, bom: [{ material: "zirconia", qty: 1 }] },
    { id: "crownimpl", name: "Final Crown on Implant", listPrice: 299, bom: [{ material: "zirconia", qty: 1 }, { material: "tibase", qty: 1 }] },
    { id: "crownprep", name: "Pre-Prep Crown", listPrice: 80, bom: [{ material: "pmma", qty: 1 }] },
    { id: "crownprov", name: "Provisional Crown", listPrice: 80, bom: [{ material: "pmma", qty: 1 }] },
    { id: "crownprovimpl", name: "Provisional Crown on Implant", listPrice: 140, bom: [{ material: "pmma", qty: 1 }, { material: "tibase", qty: 1 }] },
    { id: "tray", name: "Custom Tray", listPrice: 25, bom: [{ material: "plate", qty: 1 }] },
    { id: "veneer", name: "Veneer", listPrice: 200, bom: [{ material: "zirconia", qty: 1 }] },
    { id: "inlay", name: "Inlay", listPrice: 128, bom: [{ material: "composite", qty: 1 }] },
    { id: "maryland", name: "Maryland Bridge", listPrice: 165, bom: [{ material: "composite", qty: 3 }] },
    { id: "mockup", name: "Mockup", listPrice: 23, bom: [{ material: "resin3d", qty: 1 }] },
    { id: "model", name: "Model", listPrice: 20, bom: [{ material: "resin3d", qty: 1 }] },
    { id: "dentureprov", name: "Provisional Denture", listPrice: 180, bom: [{ material: "teethstandard", qty: 14 }, { material: "baseresin", qty: 1 }] },
    { id: "denturefull", name: "Full Denture", listPrice: 300, bom: [{ material: "teethpremium", qty: 14 }, { material: "baseresin", qty: 1 }] },
    { id: "tryin", name: "Try-In", listPrice: 0, bom: [] },
    { id: "tryinbar", name: "Bar Try-In", listPrice: 0, bom: [] },
    { id: "tryinteeth", name: "Teeth Try-In", listPrice: 0, bom: [] },
    { id: "tryinrim", name: "Bite Rim Try-In", listPrice: 0, bom: [{ material: "wax", qty: 1 }, { material: "plate", qty: 1 }] },
    { id: "tryinframe", name: "Framework Try-In", listPrice: 0, bom: [] },
    { id: "tryintoronto", name: "Toronto Try-In", listPrice: 0, bom: [] },
    { id: "reline", name: "Reline", listPrice: 90, bom: [{ material: "baseresin", qty: 1 }] },
    { id: "repair", name: "Repair", listPrice: 60, bom: [{ material: "baseresin", qty: 1 }] },
    { id: "frameworkdent", name: "Metal Framework Denture", listPrice: 220, bom: [{ material: "framework", qty: 1 }, { material: "frameworkteeth", qty: 1 }] },
    { id: "torontoload", name: "Immediate-Load Toronto", listPrice: 1316, bom: [{ material: "pmma", qty: 9 }, { material: "tibasemu", qty: 4 }] },
    { id: "torontofinal", name: "Final Toronto", listPrice: 1316, bom: [{ material: "pmma", qty: 9 }, { material: "bar", qty: 1 }] },
    { id: "torontoprov", name: "Provisional Toronto", listPrice: 900, bom: [{ material: "pmma", qty: 9 }, { material: "tibasemu", qty: 4 }] }
  ],

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
