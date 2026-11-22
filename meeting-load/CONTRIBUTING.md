# Contributing

Issues and pull requests welcome.

## Running it locally

See the install steps in the README. There is no build step — the three files
in `src/` are what runs.

## Things worth knowing

`Code.gs` runs server-side in Apps Script (V8, but written in ES5 style for
readability in the online editor). `Index.html` runs in the browser and
receives its data injected at template-evaluation time, not over an API call.

The filtering rules in `keep_()` are the heart of it. If you change what counts
as a meeting, update the README and PRIVACY.md to match — the privacy policy
makes specific claims about what is read and retained.

## Scopes

Do not add scopes without discussion. The app deliberately stays within
_sensitive_ scopes; adding a _restricted_ scope such as Gmail or full Drive
access would require an annual paid security assessment for anyone publishing
a fork.
