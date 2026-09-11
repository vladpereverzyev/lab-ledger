"use strict";

// ===========================================================================
// Who is at the bench.
//
// A lab is rarely one person, and the person who records a job is not always
// the person allowed to see what it earns. So: one administrator with the
// lab's details, any number of operators, and a tick list of what each of them
// may do. Everything is local - there is no server to sign in to.
//
// Passwords are never stored. What is stored is PBKDF2-SHA256 over a random
// per-user salt, 150000 rounds, which is what the browser's own crypto does
// for the same job. A forgotten password cannot be recovered, only reset by
// the administrator - that is the point of storing it this way.
// ===========================================================================

const PERMISSIONS = ["viewMoney", "editWorks", "delWorks", "editCatalog", "export"];
const PBKDF2_ROUNDS = 150000;

let session = null;     // the user currently signed in

// --- hashing ---------------------------------------------------------------
function randomSalt() {
  const b = new Uint8Array(16);
  (window.crypto || {}).getRandomValues
    ? window.crypto.getRandomValues(b)
    : b.forEach((_, i) => { b[i] = Math.floor(Math.random() * 256); });
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

function toHex(buf) {
  return Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const subtle = window.crypto && window.crypto.subtle;
  if (!subtle) {
    // Should not happen in Electron or on https, but a demo opened from a
    // plain file:// page must still work rather than lock the user out.
    let h = 0;
    const s = salt + password;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return "weak:" + (h >>> 0).toString(16);
  }
  const key = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: PBKDF2_ROUNDS, hash: "SHA-256" },
    key, 256);
  return toHex(bits);
}

// --- the register ----------------------------------------------------------
function ensureUsersShape(state) {
  state.users = state.users || { business: {}, list: [] };
  state.users.business = state.users.business || {};
  state.users.list = state.users.list || [];
  state.history = state.history || [];
}

function hasAdmin(state) {
  return state.users.list.some((u) => u.role === "admin");
}

function allPermissions() {
  const o = {};
  PERMISSIONS.forEach((p) => { o[p] = true; });
  return o;
}

async function makeUser(role, fields, password) {
  const salt = randomSalt();
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    role,
    firstName: fields.firstName || "",
    lastName: fields.lastName || "",
    username: (fields.username || "").trim().toLowerCase(),
    salt,
    hash: await hashPassword(password, salt),
    can: role === "admin" ? allPermissions() : (fields.can || { editWorks: true }),
    createdAt: new Date().toISOString()
  };
}

async function checkPassword(user, password) {
  return (await hashPassword(password, user.salt)) === user.hash;
}

async function setPassword(user, password) {
  user.salt = randomSalt();
  user.hash = await hashPassword(password, user.salt);
}

// --- recovery code ---------------------------------------------------------
// Six groups of four. The alphabet has no I, O, 0 or 1 in it, because this
// code is read back over the phone more often than it is typed off a screen.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeRecoveryCode() {
  const b = new Uint8Array(24);
  (window.crypto || {}).getRandomValues
    ? window.crypto.getRandomValues(b)
    : b.forEach((_, i) => { b[i] = Math.floor(Math.random() * 256); });
  // 256 divides by 32, so the modulo does not favour the start of the alphabet.
  const chars = Array.from(b, (x) => CODE_ALPHABET[x % CODE_ALPHABET.length]);
  return [0, 4, 8, 12, 16, 20].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

// Typed with spaces, lower case or the dashes left out: all the same code.
function normalizeCode(code) {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function makeRecovery(code) {
  const salt = randomSalt();
  return {
    salt,
    hash: await hashPassword(normalizeCode(code), salt),
    createdAt: new Date().toISOString()
  };
}

async function checkRecovery(rec, code) {
  if (!rec || !rec.salt || !normalizeCode(code)) return false;
  return (await hashPassword(normalizeCode(code), rec.salt)) === rec.hash;
}

// --- session ---------------------------------------------------------------
function currentUser() { return session; }
function signIn(user) { session = user; }
function signOut() { session = null; }

function displayName(u) {
  if (!u) return "";
  const n = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return n || u.username;
}

// An administrator may do everything; an operator only what was ticked. With
// nobody signed in - the browser demo - nothing is locked.
function can(what) {
  if (!session) return true;
  if (session.role === "admin") return true;
  return !!(session.can && session.can[what]);
}

function isAdmin() { return !session || session.role === "admin"; }

// --- history ---------------------------------------------------------------
function logAction(state, actionKey, detail) {
  state.history = state.history || [];
  state.history.unshift({
    at: new Date().toISOString(),
    who: displayName(session) || "-",
    action: actionKey,
    detail: detail || ""
  });
  // A bench log nobody prunes becomes a file nobody opens.
  if (state.history.length > 2000) state.history.length = 2000;
}

window.LLAuth = {
  PERMISSIONS, ensureUsersShape, hasAdmin, makeUser, checkPassword, setPassword, allPermissions,
  currentUser, signIn, signOut, displayName, can, isAdmin, logAction, hashPassword, randomSalt,
  makeRecoveryCode, makeRecovery, checkRecovery
};
