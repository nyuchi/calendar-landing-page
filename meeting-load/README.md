# Meeting load

A contribution graph for your calendar. Every day of the year as a square,
shaded by how many hours you were actually in meetings.

Lives in the Google Calendar sidebar. The card shows your headline numbers;
one click opens the full graph as an overlay without leaving Calendar.

![The graph](docs/screenshot.png)

## Why it exists

Calendar tells you what's next. It's bad at telling you what the last year
looked like — whether February really was worse than October, whether your
Tuesdays have quietly filled up, whether the term you remember as brutal
actually was.

This counts the hours and shows you the shape.

## What counts as a meeting

The numbers are only useful if they reflect time you actually spent. So:

- **You have to be in it.** An event counts if you organised it, or you were
  invited and didn't decline. Items sitting on a shared team calendar with no
  guest list are ignored unless you created them.
- **Overlaps merge.** Triple-booked from 9 to 10 counts as one hour, not three.
- **Not-really-meetings are dropped.** Out-of-office, working location,
  birthdays, all-day entries, and anything longer than 14 hours.

Colour bands: nothing · under 2h · 2–4h · 4–6.5h · 6.5h and over.

The year splits on a date you choose, so a school or fiscal year lines up
properly instead of being cut at 1 January.

## Privacy

Your calendar data never leaves Google. The script runs in your own Apps
Script account, reads your calendars, and renders the result. There is no
server, no analytics, and no third party. The only thing stored is your own
settings — which calendars to read and your year-start date — held in Google's
per-user property store.

Full detail in [PRIVACY.md](PRIVACY.md).

## Install

Once published, from Google Workspace Marketplace. Until then, or if you'd
rather run your own copy:

1. Create a project at [script.google.com](https://script.google.com).
2. **Project Settings** → tick _Show "appsscript.json" manifest file in editor_.
3. Copy in the three files from [`src/`](src). The HTML file must be named
   exactly `Index`.
4. **Services** → **+** → _Google Calendar API_, identifier `Calendar`,
   version `v3`.
5. **Deploy** → **New deployment** → **Web app**. Execute as _User accessing
   the web app_; access _Anyone_. Copy the URL.
6. Paste it into `WEB_APP_URL` at the top of `Code.gs`. Save.
7. **Deploy** → **Test deployments** → **Install**.
8. Open Google Calendar, hard refresh, click the add-on icon, pick your
   calendars.

Running your own copy shows a "Google hasn't verified this app" screen on
first authorisation. That's expected for an unverified script — click
_Advanced_ to continue. It doesn't appear on the Marketplace build.

## Develop

With [clasp](https://github.com/google/clasp):

```bash
npm install
cp .clasp.json.example .clasp.json   # add your script ID
npx clasp push
```

## Before you publish your own fork

Replace these placeholders:

| Placeholder         | Found in                | Set to                      |
| ------------------- | ----------------------- | --------------------------- |
| `{{COMPANY}}`       | `LICENSE`, `PRIVACY.md` | Your company or your name   |
| `{{SUPPORT_EMAIL}}` | `PRIVACY.md`            | A monitored address         |
| `{{PRIVACY_URL}}`   | `docs/PUBLISHING.md`    | Where you host the policy   |
| `{{HOMEPAGE_URL}}`  | `docs/PUBLISHING.md`    | Your marketing or repo page |

Then work through [docs/PUBLISHING.md](docs/PUBLISHING.md).

## Licence

MIT. See [LICENSE](LICENSE).
