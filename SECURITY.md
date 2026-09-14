# Security Policy

Lab Ledger is an offline desktop app. It has no account and no server: your data
stays in a local file on your computer and is never uploaded.

It needs no internet connection. It goes online only for updates, through
read-only requests to the public GitHub REST API: the automatic check (at most
once a day at startup, on by default, switch it off in **Catalog > Settings**),
a check by hand when you click the version number, and a download when you press
**Download** - a downloaded installer is checked against the SHA-256 sums
published with the release and deleted if it does not match. None of these
sends anything but the request and a `User-Agent`, and nothing is ever
downloaded or installed on its own. The details are in the README, section
"GitHub API".

The attack surface is therefore small, but we take any security issue seriously.

## What the password protects, and what it does not

The administrator password and the per-operator permissions protect the app's
screens and actions: who can sign in, who can see prices and profit, who can add
or edit works, delete them, change the catalog, export or back up. Passwords
themselves are never stored, only a PBKDF2-SHA256 hash over a random per-user
salt.

They do not encrypt the files on disk. The data lives in a plain JSON file, and
so does the administrator recovery code kept beside it, so anyone who can read
that computer's files can read the data without going through the app. This is a
deliberate choice for a tool that runs on a lab's own trusted machine: treat the
password as a convenience barrier between people who already share that machine,
not as protection against someone who has the files.

What protects the data itself is who is allowed to use the computer: a separate
operating-system account per person, full-disk encryption (BitLocker on Windows,
FileVault on macOS, LUKS on Linux), and the usual physical security. If the
machine is shared with people who should not see the numbers, or is a laptop that
can be lost or stolen, turn on disk encryption. A plain backup or the companion
Excel file is a full copy of the same data, so keep it somewhere with the same
care. An **encrypted backup** (AES-256-GCM, with a key derived from a password
you choose) is the exception: without that password it cannot be opened, and
without it neither can you.

Inside the app, the window runs sandboxed under a Content Security Policy that
allows only the app's own files, and it cannot be navigated anywhere else.

## Supported versions

Only the latest release receives security fixes. Please update to the newest
version from the [releases page](https://github.com/vladpereverzyev/lab-ledger/releases/latest)
before reporting an issue.

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |
| Older   | No        |

## Reporting a vulnerability

Please report vulnerabilities privately, not in a public issue.

- Preferred: use GitHub's private vulnerability reporting on this repository
  (the "Report a vulnerability" button in the Security tab), if enabled.
- Otherwise: contact the maintainer through their GitHub profile at
  https://github.com/vladpereverzyev.

Please include steps to reproduce, the app version, and your operating system.
You can expect an initial response within a few days. Thank you for helping keep
Lab Ledger and its users safe.
