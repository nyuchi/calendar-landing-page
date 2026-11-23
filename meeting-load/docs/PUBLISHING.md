# Publishing to Google Workspace Marketplace

Getting a public listing takes two separate Google reviews: **OAuth
verification** (are your scopes justified) and **Marketplace review** (is the
listing acceptable). They run independently and both must pass.

> Google revises these requirements regularly. Check the current
> [Marketplace documentation](https://developers.google.com/workspace/marketplace/how-to-publish)
> before committing time — this checklist reflects the process as of August 2026.

## Before you start

Decide which Google account owns this. Whoever publishes appears on the
listing, is named in the privacy policy, and receives support requests. Use a
company account, not a personal or employer one.

You will need a domain you control, verified in
[Google Search Console](https://search.google.com/search-console), hosting your
privacy policy and homepage.

The three listing URLs above are already live on `tools.nyuchi.com`, served by
the `nyuchi-tools` Cloudflare Worker in
[`nyuchi/workspace-tools`](https://github.com/nyuchi/workspace-tools). Note that
most of that site sits behind a login gate — these pages are explicitly exempted
(`PUBLIC_SITE_PAGES` in `mcp/src/index.ts`) precisely because Google's reviewers
fetch them unauthenticated. If a reviewer reports a redirect to a sign-in page,
that exemption is what to check first.

## Scope classification

`calendar.readonly` is a **sensitive** scope. That means verification is
required, but not a third-party security assessment.

Do not add Gmail or full Drive scopes. Those are **restricted**, which triggers
an annual CASA security assessment costing five figures. The app is designed to
stay on the sensitive side of that line — keep it there.

## Steps

### 1. Cloud project

1. Create a project in [Google Cloud Console](https://console.cloud.google.com).
2. Enable the **Google Workspace Marketplace SDK** and the **Google Calendar API**.
3. In Apps Script: **Project Settings** → set the GCP project number to this
   project. The script must live under the project you publish from.

### 2. OAuth consent screen

| Field              | Value                                               |
| ------------------ | --------------------------------------------------- |
| User type          | External                                            |
| App name           | Meeting load                                        |
| Support email      | <hello@nyuchi.com>                                  |
| App homepage       | <https://tools.nyuchi.com/calendar-overlay>         |
| Privacy policy     | <https://tools.nyuchi.com/calendar-overlay/privacy> |
| Authorised domains | Your verified domain                                |

Add the three scopes from `src/appsscript.json`. Write a justification for
each — say plainly what the app does with the data and that nothing leaves the
user's account. Then **Publish app** to move it out of testing.

### 3. Verification submission

Google asks for:

- A **demo video** (unlisted YouTube is fine) showing the OAuth consent screen,
  then each scope being used in the app. Narrate why each is needed.
- Scope justifications.
- A reachable privacy policy at the URL you gave, naming the app explicitly.

Expect follow-up questions. Turnaround is typically a few weeks, mostly
waiting.

### 4. Deploy the add-on

1. **Deploy** → **New deployment** → **Add-on**. Note the deployment ID.
2. Separately, deploy the **Web app**: execute as _User accessing_, access
   _Anyone_. Paste the URL into `WEB_APP_URL` in `Code.gs`, then redeploy the
   add-on so the published version contains it.

### 5. Marketplace listing

In the Marketplace SDK **App Configuration**:

- App visibility: **Public**
- Integration: **Google Workspace Add-on**, using the deployment ID from step 4
- OAuth scopes matching the manifest exactly

In **Store Listing**:

| Asset                | Requirement                                            |
| -------------------- | ------------------------------------------------------ |
| Application icon     | 128×128 PNG                                            |
| Card banner          | 220×140 PNG                                            |
| Screenshots          | At least one, 1280×800 or 640×400                      |
| Detailed description | What it does, what counts as a meeting, privacy stance |
| Category             | Productivity                                           |
| Terms of service URL | `https://tools.nyuchi.com/legal/terms`                 |
| Privacy policy URL   | `https://tools.nyuchi.com/calendar-overlay/privacy`    |
| Support URL          | `https://tools.nyuchi.com/calendar-overlay#support`    |

Then submit for review.

## Common rejection causes

- Privacy policy doesn't name the app, or sits on an unverified domain.
- Demo video doesn't show the consent screen, or skips a scope.
- Listing screenshots show a different UI to the shipped app.
- Manifest scopes and listing scopes disagree.
- Support URL leads to a page that doesn't offer a way to get support.

## After launch

Publishing an update means a new add-on deployment plus resubmitting the
listing. Scope changes trigger re-verification, so get the scope set right
before the first submission rather than adding to it later.
