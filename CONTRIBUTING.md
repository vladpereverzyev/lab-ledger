# Contributing to Lab Ledger

Thanks for your interest! Lab Ledger is a small, focused, offline tool for dental
labs. Contributions of any size are welcome, especially **translations**.

## Add or improve a language (great first contribution)

The app UI ships in **English, Italian, Spanish, French and German**. Adding a
language is a **translation-only** change: no build tooling, no framework.

1. Open [`src/i18n.js`](src/i18n.js): it holds nothing but the translations.
2. Copy the `en` block, paste it as a new entry with your language code
   (e.g. `pt: { ... }`), and translate every value. Keep the **keys** unchanged.
3. Add your code to the `LANGS` array at the bottom of the file
   (e.g. `["en", "it", "es", "fr", "de", "pt"]`).
4. That's it. The language toggle button in the toolbar will cycle through it.

Improving an existing translation is just as welcome: fix a value in the matching
block and open a PR.

Notes: `months` and `months_short` must stay 12 entries, January to December,
in order. A key you leave out falls back to English rather than breaking.

## Report a bug or request a feature

Open an [issue](https://github.com/vladpereverzyev/lab-ledger/issues). For bugs,
please include your OS, what you did, and what you expected. Screenshots help.

## Run from source

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm start          # run the app
npm run dist       # build the Windows installer (output in release/)
```

The whole app is plain HTML/CSS/JS in `src/` plus a thin Electron shell in
`electron/`. No transpilers, no bundler; edit a file and restart.

## Guidelines

- Keep it simple. Lab Ledger's value is being small, offline and private.
- No telemetry, no network calls, no third-party CDNs (Chart.js and SheetJS are
  bundled locally).
- Match the surrounding code style; every catalog change saves automatically.
- Comments and code identifiers are in **English**.

## License

Lab Ledger is published under the [Business Source License 1.1](LICENSE), which
is source-available rather than open source: any lab may use it, nobody may
resell it, and each version turns into Apache 2.0 four years after its release.

So that the project can stay licensable as a single work - including under a
commercial licence sold to whoever wants to resell it - contributions need to
end up owned by one person. By opening a pull request you assign the copyright
in your contribution to Vladyslav Pereverzyev, worldwide and irrevocably; where
such an assignment does not hold in your jurisdiction, you instead grant an
unlimited, irrevocable, royalty-free licence to use, modify, sublicense and
relicense it, including under terms other than this one. You keep every right
to use your own contribution however you like, elsewhere.

If you cannot agree to that, say so in the pull request before you write any
code - a bug report or a reproduction is welcome all the same.
