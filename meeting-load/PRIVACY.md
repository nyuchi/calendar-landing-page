# Privacy policy

**Meeting load**
Last updated: 14 August 2026

## Summary

Meeting load reads your Google Calendar to draw a graph of how many hours you
spent in meetings. It runs entirely inside your own Google account. No calendar
data is transmitted to us or to anyone else, because there is no server to
transmit it to.

## What the app accesses

| Scope               | Why                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `calendar.readonly` | Read events from the calendars you choose, to count hours. Read your calendar list, so you can choose them. |
| `userinfo.email`    | Identify which guest-list entry is yours, so meetings you declined can be excluded.                         |
| `script.storage`    | Store your settings.                                                                                        |

Read-only throughout. The app cannot create, edit or delete events.

## What is stored, and where

Two things, both held by Google inside your own account:

- **Your settings** — the calendar IDs you selected and your year-start date.
  Stored in Apps Script user properties.
- **A temporary cache** — daily hour totals, held for one hour to avoid
  re-reading your calendar on every view. Stored in the Apps Script cache and
  discarded automatically.

Event titles, descriptions, locations, attachments and guest lists are read in
memory to calculate durations and are never written anywhere. Only the total
hours per day are retained, and only in the one-hour cache.

## What is not done

- No calendar data is sent to any server operated by Nyuchi Africa (Pvt) Ltd.
- No data is sold, shared, or disclosed to third parties.
- No analytics, telemetry, tracking or advertising.
- No profiling, and no use of your data to train machine learning models.

## Limited use

Use of information received from Google APIs adheres to the
[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy),
including the Limited Use requirements.

## Retention and deletion

Settings persist until you change them or uninstall the app. The cache expires
within an hour. Uninstalling the add-on from your Google account removes its
access and its stored settings. Because nothing is held outside your account,
there is nothing further for us to delete.

## Children

Not directed at children under 13, and not intended for their use.

## Changes

Material changes will be published here with a revised date. Continued use
after a change constitutes acceptance.

## Contact

Nyuchi Africa (Pvt) Ltd — <hello@nyuchi.com>
