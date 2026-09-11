"use strict";

// ===========================================================================
// The workbook Lab Ledger keeps in step with its own data file.
//
// Why it exists: a lab already has a cloud drive, and a spreadsheet in it can
// be opened and shared by anyone without installing anything. So the app
// writes a plain .xlsx every time it opens and every time it closes. Put that
// file in the synced folder and the lab's numbers travel with it - the app
// itself still never touches the network.
//
// Rules the file follows, because it has to survive being opened elsewhere:
//   - no macros, no pivot tables, no conditional formatting, no formulas that
//     only Excel understands. Values only, so Google Sheets, LibreOffice and
//     Numbers all read it the same;
//   - every sheet starts with a title, a one-line explanation and the
//     copyright, then a blank row, then the header row;
//   - column widths are set, so nothing shows as ####.
// ===========================================================================

const XLSX = require("xlsx");

const COPYRIGHT = "Lab Ledger - Copyright © 2026 Vladyslav Pereverzyev - Business Source License 1.1";

// Sheet names and column headers, in the language the app is set to. Kept
// here rather than in the renderer because the workbook is also written on
// quit, when the window may already be gone.
const L = {
  en: {
    works: "Works", summary: "Summary", materials: "Materials", catalog: "Work types",
    costs: "Running costs", clients: "Clients", operators: "Operators", about: "About",
    t_works: "EVERY JOB, ONE PER ROW",
    n_works: "One row per job. Incoming is work still on the bench; Outgoing has left or is ready to leave.",
    t_summary: "THE YEAR, MONTH BY MONTH",
    n_summary: "Only finished work counts. Material costs are the sum of the materials each work type uses.",
    t_materials: "MATERIALS AND WHAT ONE UNIT COSTS",
    n_materials: "Cost per unit is the pack cost divided by the units that come out of the pack.",
    t_catalog: "WORK TYPES, THEIR MATERIALS AND THEIR PRICE",
    n_catalog: "The material cost is computed from the materials, never typed in.",
    t_costs: "WHAT THE LAB PAYS EVEN WITH THE BENCH EMPTY",
    n_costs: "Rent, energy, insurance, accountant, staff. The lab must earn this before it earns anything.",
    t_clients: "PRACTICES", n_clients: "The practices that send work.",
    t_operators: "WHO WORKS HERE", n_operators: "And the work types each one is set up to make.",
    t_about: "LAB LEDGER", n_about: "This workbook is written by Lab Ledger every time the app opens and closes.",
    date: "Date", status: "Status", client: "Client", patient: "Patient", work: "Work",
    units: "Units", doneby: "Done by", redo: "Redo", shipped: "Shipped", shipdate: "Ship date",
    courier: "Courier", tracking: "Tracking", matcost: "Material cost", price: "Price",
    margin: "Margin", note: "Note", incoming: "Incoming", outgoing: "Outgoing", yes: "Yes",
    month: "Month", nworks: "Works", revenue: "Revenue", year: "Year", total: "TOTAL",
    material: "Material", packcost: "Pack cost", pieces: "Units per pack", unitcost: "Cost per unit",
    unit: "Unit", usedmat: "Materials used", marginpct: "Margin %",
    category: "Category", name: "Name", amount: "Amount", period: "Period",
    peryear: "Per year", permonth: "Per month", monthly: "Monthly", yearly: "Yearly",
    email: "Email", phone: "Phone", vat: "VAT", address: "Address",
    worktypes: "Work types handled", everything: "Everything",
    item: "Item", value: "Value", generated: "Written on", version: "Version",
    pl_revenue: "Revenue", pl_materials: "Materials", pl_gross: "Gross margin",
    pl_overheads: "Running costs", pl_operating: "Operating profit", pl_net: "Net profit",
    months: ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"]
  },
  it: {
    works: "Lavori", summary: "Riepilogo", materials: "Materiali", catalog: "Tipi di lavoro",
    costs: "Costi fissi", clients: "Clienti", operators: "Operatori", about: "Info",
    t_works: "OGNI LAVORO, UNO PER RIGA",
    n_works: "Una riga per lavoro. In entrata e' quello ancora sul banco, in uscita quello finito o gia' partito.",
    t_summary: "L'ANNO, MESE PER MESE",
    n_summary: "Conta solo il lavoro finito. Il costo materiali e' la somma dei materiali che ogni tipo di lavoro usa.",
    t_materials: "MATERIALI E QUANTO COSTA UN'UNITA'",
    n_materials: "Il costo unitario e' il costo della confezione diviso le unita' che ne escono.",
    t_catalog: "TIPI DI LAVORO, I LORO MATERIALI E IL LORO PREZZO",
    n_catalog: "Il costo materiale si calcola dai materiali, non si scrive a mano.",
    t_costs: "QUELLO CHE IL LABORATORIO PAGA ANCHE A BANCO FERMO",
    n_costs: "Affitto, energia, assicurazione, commercialista, dipendenti. Va guadagnato prima di guadagnare.",
    t_clients: "STUDI", n_clients: "Gli studi che mandano lavoro.",
    t_operators: "CHI LAVORA QUI", n_operators: "E le lavorazioni che ciascuno e' abilitato a fare.",
    t_about: "LAB LEDGER", n_about: "Questo file viene scritto da Lab Ledger ogni volta che il programma si apre e si chiude.",
    date: "Data", status: "Stato", client: "Cliente", patient: "Paziente", work: "Lavoro",
    units: "Unita'", doneby: "Eseguito da", redo: "Rifacimento", shipped: "Spedito",
    shipdate: "Data spedizione", courier: "Corriere", tracking: "Tracking",
    matcost: "Costo materiali", price: "Prezzo", margin: "Margine", note: "Note",
    incoming: "In entrata", outgoing: "In uscita", yes: "Si",
    month: "Mese", nworks: "Lavori", revenue: "Ricavo", year: "Anno", total: "TOTALE",
    material: "Materiale", packcost: "Costo confezione", pieces: "Unita' per confezione",
    unitcost: "Costo unitario", unit: "Unita'", usedmat: "Materiali usati", marginpct: "Margine %",
    category: "Categoria", name: "Nome", amount: "Importo", period: "Periodo",
    peryear: "All'anno", permonth: "Al mese", monthly: "Mensile", yearly: "Annuale",
    email: "Email", phone: "Telefono", vat: "P.IVA", address: "Indirizzo",
    worktypes: "Lavorazioni assegnate", everything: "Tutte",
    item: "Voce", value: "Valore", generated: "Scritto il", version: "Versione",
    pl_revenue: "Ricavo", pl_materials: "Materiali", pl_gross: "Margine lordo",
    pl_overheads: "Costi fissi", pl_operating: "Utile operativo", pl_net: "Utile netto",
    months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio",
      "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
  }
};
// Spanish, French and German fall back to English headers until someone
// translates them - the numbers are the same either way.
L.es = L.fr = L.de = L.en;

function labels(state) {
  const lang = (state.config && state.config.lang) || "en";
  return L[lang] || L.en;
}

// --- the same arithmetic the app does, so the file agrees with the screen ---
function unitCost(m) { return m && Number(m.pieces) ? (Number(m.packCost) || 0) / Number(m.pieces) : 0; }

function matCost(state, workName) {
  const wt = (state.config.works || []).find((w) => w.name === workName);
  if (!wt) return 0;
  if (wt.bom && wt.bom.length) {
    return wt.bom.reduce((s, line) => {
      const m = (state.config.materials || []).find((x) => x.id === line.material);
      return s + unitCost(m) * (Number(line.qty) || 0);
    }, 0);
  }
  return Number(wt.materialCost) || 0;
}

function listPrice(state, workName) {
  const wt = (state.config.works || []).find((w) => w.name === workName);
  return wt ? Number(wt.listPrice) || 0 : 0;
}

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function rowCost(state, w) { return r2((Number(w.units) || 0) * matCost(state, w.work)); }
function rowRevenue(state, w) { return w.redo ? 0 : r2((Number(w.units) || 0) * listPrice(state, w.work)); }

// --- sheet building ---------------------------------------------------------
function sheet(title, note, header, rows, widths) {
  const aoa = [[title], [note], [COPYRIGHT], [], header].concat(rows);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = (widths || header.map(() => 16)).map((w) => ({ wch: w }));
  return ws;
}

function buildWorkbook(state, appVersion) {
  const t = labels(state);
  const cfg = state.config || {};
  const works = (state.works || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Lab Ledger",
    Subject: "Dental lab production and costs",
    Author: "Lab Ledger",
    Company: "Lab Ledger",
    Comments: COPYRIGHT
  };

  // 1. Works ---------------------------------------------------------------
  XLSX.utils.book_append_sheet(wb, sheet(t.t_works, t.n_works,
    [t.date, t.status, t.client, t.patient, t.work, t.units, t.doneby, t.redo,
      t.shipped, t.shipdate, t.courier, t.tracking, t.matcost, t.price, t.margin, t.note],
    works.map((w) => {
      const cost = rowCost(state, w);
      const rev = rowRevenue(state, w);
      return [w.date || "", (w.status || "out") === "in" ? t.incoming : t.outgoing,
        w.client || "", w.patient || "", w.work || "", Number(w.units) || 0, w.doneBy || "",
        w.redo ? t.yes : "", w.shipped ? t.yes : "", w.shipDate || "", w.courier || "",
        w.tracking || "", cost, rev, r2(rev - cost), w.note || ""];
    }),
    [11, 11, 22, 20, 24, 7, 14, 11, 9, 13, 11, 18, 14, 12, 12, 24]), t.works);

  // 2. Summary -------------------------------------------------------------
  const done = works.filter((w) => (w.status || "out") === "out");
  const years = Array.from(new Set(done.map((w) => (w.date || "").slice(0, 4)).filter(Boolean))).sort();
  const summaryRows = [];
  years.forEach((y) => {
    const yr = done.filter((w) => (w.date || "").slice(0, 4) === y);
    t.months.forEach((mName, mi) => {
      const rows = yr.filter((w) => Number((w.date || "").slice(5, 7)) - 1 === mi);
      if (!rows.length) return;
      const cost = rows.reduce((s, w) => s + rowCost(state, w), 0);
      const rev = rows.reduce((s, w) => s + rowRevenue(state, w), 0);
      summaryRows.push([y, mName, rows.length,
        rows.reduce((s, w) => s + (Number(w.units) || 0), 0), r2(rev), r2(cost), r2(rev - cost)]);
    });
    const cost = yr.reduce((s, w) => s + rowCost(state, w), 0);
    const rev = yr.reduce((s, w) => s + rowRevenue(state, w), 0);
    summaryRows.push([y, t.total, yr.length,
      yr.reduce((s, w) => s + (Number(w.units) || 0), 0), r2(rev), r2(cost), r2(rev - cost)]);
    summaryRows.push([]);
  });
  XLSX.utils.book_append_sheet(wb, sheet(t.t_summary, t.n_summary,
    [t.year, t.month, t.nworks, t.units, t.revenue, t.matcost, t.margin],
    summaryRows, [8, 14, 9, 9, 14, 14, 14]), t.summary);

  // 3. Materials -----------------------------------------------------------
  XLSX.utils.book_append_sheet(wb, sheet(t.t_materials, t.n_materials,
    [t.material, t.packcost, t.pieces, t.unitcost, t.unit, t.note],
    (cfg.materials || []).map((m) => [m.name, Number(m.packCost) || 0,
      Number(m.pieces) || 0, r2(unitCost(m)), m.unit || "", m.note || ""]),
    [34, 14, 18, 14, 12, 34]), t.materials);

  // 4. Work types ----------------------------------------------------------
  XLSX.utils.book_append_sheet(wb, sheet(t.t_catalog, t.n_catalog,
    [t.work, t.usedmat, t.matcost, t.price, t.margin, t.marginpct],
    (cfg.works || []).map((w) => {
      const cost = r2(matCost(state, w.name));
      const price = Number(w.listPrice) || 0;
      const bom = (w.bom || []).map((line) => {
        const m = (cfg.materials || []).find((x) => x.id === line.material);
        return line.qty + " x " + (m ? m.name : "?");
      }).join(" + ");
      return [w.name, bom, cost, price, r2(price - cost), price ? Math.round(100 * (price - cost) / price) + "%" : ""];
    }), [30, 44, 14, 12, 12, 11]), t.catalog);

  // 5. Running costs -------------------------------------------------------
  const overheads = cfg.overheads || [];
  const costRows = overheads.map((o) => {
    const year = o.period === "month" ? (Number(o.amount) || 0) * 12 : (Number(o.amount) || 0);
    return [o.category || "", o.name || "", Number(o.amount) || 0,
      o.period === "month" ? t.monthly : t.yearly, r2(year), r2(year / 12)];
  });
  const totalYear = overheads.reduce((s, o) =>
    s + (o.period === "month" ? (Number(o.amount) || 0) * 12 : (Number(o.amount) || 0)), 0);
  if (costRows.length) costRows.push(["", t.total, "", "", r2(totalYear), r2(totalYear / 12)]);
  XLSX.utils.book_append_sheet(wb, sheet(t.t_costs, t.n_costs,
    [t.category, t.name, t.amount, t.period, t.peryear, t.permonth],
    costRows, [18, 28, 12, 12, 14, 14]), t.costs);

  // 6. Clients -------------------------------------------------------------
  XLSX.utils.book_append_sheet(wb, sheet(t.t_clients, t.n_clients,
    [t.name, t.email, t.phone, t.vat, t.address, t.note],
    (cfg.clients || []).map((c) => [c.name || "", c.email || "", c.phone || "",
      c.vat || "", c.address || "", c.note || ""]),
    [26, 28, 18, 18, 30, 28]), t.clients);

  // 7. Operators -----------------------------------------------------------
  XLSX.utils.book_append_sheet(wb, sheet(t.t_operators, t.n_operators,
    [t.name, t.worktypes],
    (cfg.operators || []).map((o) => {
      const names = (o.works || [])
        .map((id) => ((cfg.works || []).find((w) => w.id === id) || {}).name)
        .filter(Boolean);
      return [o.name || "", names.length ? names.join(", ") : t.everything];
    }), [24, 60]), t.operators);

  // 8. About ---------------------------------------------------------------
  XLSX.utils.book_append_sheet(wb, sheet(t.t_about, t.n_about,
    [t.item, t.value],
    [
      [t.version, appVersion || ""],
      [t.generated, new Date().toISOString().slice(0, 16).replace("T", " ")],
      ["", ""],
      ["Lab Ledger", "https://github.com/vladpereverzyev/lab-ledger"],
      ["", COPYRIGHT]
    ], [22, 60]), t.about);

  return wb;
}

module.exports = { buildWorkbook, COPYRIGHT };
