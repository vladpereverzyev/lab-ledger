"use strict";

// The recovery code is the one piece of Lab Ledger that can lock a lab out of
// its own archive, or let the wrong person in. It gets tested.
//
//   node --test

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");

// auth.js is a browser script: it wants a window with a crypto on it.
global.window = { crypto: require("node:crypto").webcrypto };
require(path.join(__dirname, "..", "src", "auth.js"));
const Auth = global.window.LLAuth;

test("a code is six groups of four, from an unambiguous alphabet", () => {
  for (let i = 0; i < 200; i++) {
    const code = Auth.makeRecoveryCode();
    assert.match(code, /^[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){5}$/,
      "unexpected shape or a confusable character: " + code);
  }
});

test("two codes are never the same", () => {
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(Auth.makeRecoveryCode());
  assert.strictEqual(seen.size, 500);
});

test("the code verifies, however it is typed back", async () => {
  const code = Auth.makeRecoveryCode();
  const rec = await Auth.makeRecovery(code);
  for (const typed of [code, code.toLowerCase(), code.replace(/-/g, ""), " " + code + " ",
                       code.replace(/-/g, " ")]) {
    assert.ok(await Auth.checkRecovery(rec, typed), "should accept: " + typed);
  }
});

test("the clear code is not in the data file", async () => {
  const code = Auth.makeRecoveryCode();
  const rec = await Auth.makeRecovery(code);
  const stored = JSON.stringify(rec);
  assert.ok(!stored.includes(code));
  assert.ok(!stored.includes(code.replace(/-/g, "")));
  assert.ok(rec.hash && rec.salt && rec.hash !== rec.salt);
});

test("another code does not open it, and neither does nothing at all", async () => {
  const rec = await Auth.makeRecovery(Auth.makeRecoveryCode());
  assert.ok(!(await Auth.checkRecovery(rec, Auth.makeRecoveryCode())));
  for (const empty of ["", "   ", "----", null, undefined]) {
    assert.ok(!(await Auth.checkRecovery(rec, empty)), "should refuse: " + String(empty));
  }
  assert.ok(!(await Auth.checkRecovery(null, "ABCD-EFGH-JKLM-NPQR-STUV-WXYZ")));
});

test("a reset password replaces the old one and re-salts it", async () => {
  const user = await Auth.makeUser("admin", { firstName: "A", username: "a" }, "first-password");
  const oldSalt = user.salt, oldHash = user.hash;
  await Auth.setPassword(user, "second-password");
  assert.notStrictEqual(user.salt, oldSalt);
  assert.notStrictEqual(user.hash, oldHash);
  assert.ok(await Auth.checkPassword(user, "second-password"));
  assert.ok(!(await Auth.checkPassword(user, "first-password")));
});

// --- encrypted backup ------------------------------------------------------
test("an encrypted backup comes back byte for byte with the right password", async () => {
  const archive = { works: [{ id: "w1", client: "Röntgen", units: 3 }], schemaVersion: 1, note: "€ 1.234,50" };
  const blob = await Auth.encryptBackup(archive, "correct horse battery staple");
  assert.ok(Auth.isEncryptedBackup(blob));
  const back = await Auth.decryptBackup(blob, "correct horse battery staple");
  assert.deepStrictEqual(back, archive);
});

test("the clear archive is not anywhere in the encrypted file", async () => {
  const archive = { secret: "PATIENT-NAME-12345", amount: 999 };
  const blob = await Auth.encryptBackup(archive, "pw");
  assert.ok(!blob.includes("PATIENT-NAME-12345"));
  assert.ok(!blob.includes("999"));
});

test("the wrong password cannot open an encrypted backup", async () => {
  const blob = await Auth.encryptBackup({ a: 1 }, "right-password");
  await assert.rejects(() => Auth.decryptBackup(blob, "wrong-password"));
});

test("two backups of the same data differ (fresh salt and iv)", async () => {
  const a = await Auth.encryptBackup({ a: 1 }, "pw");
  const b = await Auth.encryptBackup({ a: 1 }, "pw");
  assert.notStrictEqual(a, b);
  assert.deepStrictEqual(await Auth.decryptBackup(a, "pw"), await Auth.decryptBackup(b, "pw"));
});

test("a plain JSON backup is not mistaken for an encrypted one", () => {
  assert.ok(!Auth.isEncryptedBackup(JSON.stringify({ works: [] })));
  assert.ok(!Auth.isEncryptedBackup("not even json"));
});
