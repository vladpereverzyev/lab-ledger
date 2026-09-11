# Security Policy

Lab Ledger is an offline desktop app. It has no account and no server: your data
stays in a local file on your computer and is never uploaded.

It makes exactly one network call, and only if you leave it enabled: a read-only
request to the public GitHub REST API to learn the latest published release, at
most once a day. It sends nothing but the request and a `User-Agent`, and it
never downloads or installs anything on its own. Switch it off in
**Catalog > Settings** and the app makes no network calls at all. The details
are in the README, section "GitHub API".

The attack surface is therefore small, but we take any security issue seriously.

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
