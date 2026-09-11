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
