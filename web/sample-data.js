"use strict";

// ===========================================================================
// Sample lab used by the browser demo and by the README screenshots.
//
// Generic references only: no real practices, no real patients. Patient fields
// hold either an invented name or an internal case code, depending on the
// practice - which is how a lab actually receives them.
//
// The year is generated from a fixed seed, so the demo and every screenshot
// show exactly the same lab, and the charts have enough data to mean
// something: roughly 20 jobs a month, a realistic work mix, a few redos, and
// running costs a small lab would actually pay.
//
// Loaded both as a browser script (window.SAMPLE_DATA) and as a CommonJS
// module (build/screenshot.js) - see the footer.
// ===========================================================================

(function (root) {
  const YEAR = 2026;

  // Deterministic pseudo-random: same lab every run.
  let seed = 20260101;
  function rnd() {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  }
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const CLIENTS = [
    { id: "c1", name: "Bright Smile Clinic", email: "info@brightsmile.example", phone: "+39 000 000 0001", vat: "IT01234567890", address: "12 Sample Street", note: "" },
    { id: "c2", name: "Nova Dental Studio", email: "info@novadental.example", phone: "+39 000 000 0002", vat: "IT02345678901", address: "34 Sample Street", note: "" },
    { id: "c3", name: "Aurora Dental Care", email: "info@auroradental.example", phone: "+39 000 000 0003", vat: "IT03456789012", address: "8 Sample Street", note: "" },
    { id: "c4", name: "Perla Dental", email: "info@perladental.example", phone: "+39 000 000 0004", vat: "IT04567890123", address: "5 Sample Street", note: "" },
    { id: "c5", name: "Medena Dental", email: "info@medenadental.example", phone: "+39 000 000 0005", vat: "IT05678901234", address: "21 Sample Street", note: "" }
  ];
  // Some practices send more work than others.
  const CLIENT_WEIGHTS = [5, 4, 3, 2, 2];

  // How each practice identifies a case. Real labs are split: some write the
  // patient's name on the job sheet, others only an internal code, and the lab
  // has to live with both. The invented names follow the language the practice
  // name suggests, so the demo does not read as one country.
  const PATIENT_STYLE = { c1: "en", c2: "it", c3: "code", c4: "es", c5: "code" };

  // Invented names. Any resemblance to a real person is coincidence.
  const NAMES = {
    en: ["John Steen", "Emily Carter", "Mark Halloway", "Sarah Benton",
      "Peter Wills", "Claire Dunmore", "Owen Blake", "Ruth Ellery",
      "Daniel Vance", "Megan Ford", "Alan Prescott", "Helen Thwaite"],
    it: ["Marco Bianchi", "Giulia Ferri", "Luca Rinaldi", "Sara Conti",
      "Paolo Marchetti", "Elena Vitali", "Davide Sartori", "Chiara Bellini",
      "Andrea Moretti", "Federica Longo", "Stefano Gatti", "Ilaria Rossetti"],
    es: ["Javier Soler", "Lucía Ferrer", "Andrés Molina", "Carmen Ruiz",
      "Pablo Serrano", "Marta Ibáñez", "Sergio Vidal", "Rocío Navarro",
      "Álvaro Cano", "Nuria Peña", "Ignacio Bravo", "Silvia Arroyo"]
  };

  function patientFor(client) {
    const style = PATIENT_STYLE[client.id];
    if (style === "code") return `${pick(CASE_PREFIX)}-${between(1000, 3999)}`;
    return pick(NAMES[style]);
  }

  // [work type, min units, max units, weight]
  const MIX = [
    ["Final Crown", 1, 4, 10],
    ["Provisional Crown", 1, 3, 7],
    ["Model", 2, 8, 9],
    ["Custom Tray", 1, 4, 5],
    ["Mockup", 1, 2, 3],
    ["Veneer", 2, 6, 4],
    ["Retainer", 1, 2, 4],
    ["Bruxism Guard", 1, 2, 5],
    ["Whitening Tray", 1, 2, 3],
    ["Inlay", 1, 3, 3],
    ["Final Crown on Implant", 1, 3, 4],
    ["Immediate-Load Crown", 1, 2, 2],
    ["Pre-Prep Crown", 1, 3, 3],
    ["Reline", 1, 2, 3],
    ["Repair", 1, 1, 3],
    ["Full Denture", 1, 1, 2],
    ["Provisional Denture", 1, 1, 2],
    ["Try-In", 1, 1, 4],
    ["Bite Rim Try-In", 1, 1, 2],
    ["Metal Framework Denture", 1, 1, 1],
    ["Final Toronto", 1, 1, 1],
    ["Immediate-Load Toronto", 1, 1, 1]
  ];

  const OPERATORS = ["Operator One", "Operator Two"];
  const OPERATOR_RECORDS = OPERATORS.map((n, i) => ({ id: "op" + (i + 1), name: n, works: [] }));
  const COURIERS = ["DHL", "UPS", "GLS"];
  const CASE_PREFIX = ["AB", "CM", "RP", "TL", "SF", "GN", "DV"];

  function weighted(items, weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rnd() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  const pad = (n) => String(n).padStart(2, "0");
  const iso = (m, d) => `${YEAR}-${pad(m + 1)}-${pad(d)}`;
  function plusDays(isoDate, days) {
    const d = new Date(isoDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // August is quiet, autumn is busy: a year that looks like a year.
  const MONTH_LOAD = [19, 21, 23, 20, 22, 21, 18, 7, 20, 24, 23, 16];

  function buildWorks() {
    const out = [];
    let n = 0;
    MONTH_LOAD.forEach((count, month) => {
      for (let i = 0; i < count; i++) {
        n++;
        const entry = weighted(MIX, MIX.map((x) => x[3]));
        const date = iso(month, between(1, 27));
        const redo = rnd() < 0.05;
        const isShipped = !redo && rnd() < 0.82;
        const client = weighted(CLIENTS, CLIENT_WEIGHTS);
        const w = {
          id: "s" + n,
          date,
          client: client.name,
          patient: patientFor(client),
          work: entry[0],
          units: between(entry[1], entry[2]),
          doneBy: rnd() < 0.55 ? OPERATORS[0] : OPERATORS[1],
          redo,
          status: "out",
          shipped: isShipped,
          shipDate: isShipped ? plusDays(date, between(1, 3)) : "",
          courier: isShipped ? pick(COURIERS) : "",
          tracking: isShipped ? `${pick(["JD", "1Z", "GL"])}${between(1000000, 9999999)}` : "",
          note: ""
        };
        out.push(w);
      }
    });
    return out;
  }

  // A handful of jobs still on the bench, so the Incoming section is not an
  // empty screen in the demo.
  function buildIncoming(start) {
    const out = [];
    for (let i = 0; i < 11; i++) {
      const entry = weighted(MIX, MIX.map((x) => x[3]));
      const client = weighted(CLIENTS, CLIENT_WEIGHTS);
      out.push({
        id: "i" + (start + i),
        date: iso(11, between(14, 27)),
        client: client.name,
        patient: patientFor(client),
        work: entry[0],
        units: between(entry[1], entry[2]),
        doneBy: rnd() < 0.55 ? OPERATORS[0] : OPERATORS[1],
        redo: false,
        status: "in",
        shipped: false, shipDate: "", courier: "", tracking: "", note: ""
      });
    }
    return out;
  }

  const CONFIG = {
    operators: OPERATOR_RECORDS,
    couriers: COURIERS.slice(),
    clients: CLIENTS,
    // The catalog the demo lab works with. It lives here rather than in the
    // app's defaults, because a lab that installs Lab Ledger starts with an
    // empty catalog and types its own materials and prices.
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
    // What a one-room lab pays whether or not a case goes out of the door.
    overheads: [
      { id: "o1", category: "property", name: "Workshop rent", amount: 850, period: "month" },
      { id: "o2", category: "property", name: "Service charges", amount: 90, period: "month" },
      { id: "o3", category: "energy", name: "Electricity", amount: 210, period: "month" },
      { id: "o4", category: "energy", name: "Gas and water", amount: 70, period: "month" },
      { id: "o5", category: "insurance", name: "Liability insurance", amount: 900, period: "year" },
      { id: "o6", category: "accounting", name: "Accountant", amount: 1500, period: "year" },
      { id: "o7", category: "staff", name: "Part-time assistant", amount: 1100, period: "month" },
      { id: "o8", category: "other", name: "Software and tools", amount: 60, period: "month" }
    ]
  };

  // The demo signs itself in as the administrator, so the corner says who is at
  // the bench like it does in the app. Sign out and both accounts really work,
  // password "demo" - the hashes below are genuine PBKDF2-SHA256, 150000
  // rounds, the same the desktop app computes. Two people, two sets of rights:
  // the operator cannot see the money, and the demo shows exactly that.
  const USERS = {
    business: {
      name: "Sample Dental Lab", vat: "IT00000000000",
      phone: "+39 000 000 0000", address: "1 Sample Street", email: "lab@example.com"
    },
    list: [
      { id: "u1", role: "admin", firstName: "Operator", lastName: "One",
        username: "admin", salt: "demoadmin",
        hash: "6e20bd64876aa1cfc1c2a576cbdf2d83938e442746908242fd53fcf1d131e044",
        can: { viewMoney: true, editWorks: true, delWorks: true, editCatalog: true, export: true },
        createdAt: YEAR + "-01-02T08:00:00.000Z" },
      { id: "u2", role: "operator", firstName: "Operator", lastName: "Two",
        username: "operator", salt: "demooper",
        hash: "cefe2ec2be9c8e51442509d38603347db89c32a2a878bdb50f5f4310b9a5ef64",
        can: { viewMoney: false, editWorks: true, delWorks: false, editCatalog: false, export: false },
        createdAt: YEAR + "-01-03T08:00:00.000Z" }
    ]
  };

  const HISTORY = [
    { at: YEAR + "-12-21T16:40:00.000Z", who: "Operator One", action: "act_ship", detail: "4 - DHL JD0140381994" },
    { at: YEAR + "-12-21T16:12:00.000Z", who: "Operator Two", action: "act_done", detail: "3" },
    { at: YEAR + "-12-21T09:05:00.000Z", who: "Operator Two", action: "act_work_add", detail: "Perla Dental - Final Crown" },
    { at: YEAR + "-12-21T08:58:00.000Z", who: "Operator Two", action: "act_login", detail: "" },
    { at: YEAR + "-12-20T17:30:00.000Z", who: "Operator One", action: "act_catalog", detail: "Zirconia disc" },
    { at: YEAR + "-12-20T08:40:00.000Z", who: "Operator One", action: "act_login", detail: "" }
  ];

  const works = buildWorks();
  const api = {
    year: YEAR,
    works: works.concat(buildIncoming(works.length + 1)),
    config: CONFIG,
    users: USERS,
    history: HISTORY
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SAMPLE_DATA = api;
})(typeof window !== "undefined" ? window : globalThis);
