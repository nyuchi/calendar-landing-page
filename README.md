# Meeting load

A contribution graph for your calendar. Every day of the year as a square,
shaded by how many hours you were actually in meetings.

Lives in the Google Calendar sidebar. The card shows your headline numbers; one
click opens the full graph as an overlay without leaving Calendar.

**Product page:** planned for `tools.nyuchi.com/calendar-overlay` (not yet live)

## What's in this repo

| Path                                                                 | What it is                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`meeting-load/`](meeting-load)                                      | The add-on itself — Apps Script source, privacy policy, publishing checklist               |
| [`meeting-load/src/`](meeting-load/src)                              | `Code.gs`, `Index.html`, `appsscript.json` — the three files the Apps Script project needs |
| [`meeting-load/docs/PUBLISHING.md`](meeting-load/docs/PUBLISHING.md) | Getting a Google Workspace Marketplace listing                                             |

Start at [`meeting-load/README.md`](meeting-load/README.md) — it covers what
counts as a meeting, how to install, and how to run your own copy.

## Where the landing page lives

Despite this repository's name, the public landing page is **not** here. The
plan is for it to be served from `tools.nyuchi.com`, a single Cloudflare Worker
(`nyuchi-tools`) defined in
[`nyuchi/workspace-tools`](https://github.com/nyuchi/workspace-tools):

| URL                                         | Status                                       |
| ------------------------------------------- | -------------------------------------------- |
| `tools.nyuchi.com/calendar-overlay`         | Not yet published; page not yet in that repo |
| `tools.nyuchi.com/calendar-overlay/privacy` | Not yet published; page not yet in that repo |
| `tools.nyuchi.com/legal/terms`              | Not yet published; page not yet in that repo |

It lives there because `tools.nyuchi.com` is a Workers Custom Domain covering the
whole hostname, so a second Worker cannot claim a sub-path of it. Those routes
must be public while the rest of that site stays behind a login gate, because
the Marketplace listing's homepage, privacy and terms URLs are fetched by
Google's reviewers with no cookies. A policy behind a sign-in fails review.

## Privacy

Your calendar data never leaves Google. The script runs in your own Apps Script
account, reads your calendars, and renders the result. There is no server, no
analytics, and no third party. The only thing stored is your own settings —
which calendars to read and your year-start date — held in Google's per-user
property store.

Full detail in [`meeting-load/PRIVACY.md`](meeting-load/PRIVACY.md), intended for publication at
`tools.nyuchi.com/calendar-overlay/privacy`.

## Licence

MIT. See [LICENSE](LICENSE).
