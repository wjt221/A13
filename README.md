# YPO Atlantic 13 — Member Event Calendar

A password-protected, single-page event calendar for the YPO Atlantic 13 Chapter. No server, no build step — open `index.html` in any browser.

## Features

- Lock screen with chapter password
- Calendar view (month grid) and List view toggle
- Filter by event type: Social, Education, Business, Family
- Click any event to see full detail modal — date, location, chair, description
- "Add to Google Calendar" button on every event
- Sign out button
- Responsive design: navy + gold, Cormorant Garamond + Outfit fonts

## Accessing the app

Open `index.html` in a browser (double-click, or serve via any static host such as GitHub Pages, Netlify, or a local web server).

**Password:** `atlantic13`

## Changing the password

Open `index.html` in any text editor and find this line near the top of the `<script>` block:

```js
const PW = "atlantic13";
```

Replace `"atlantic13"` with your new password, save the file, and redeploy.

## Updating event data

Event data is embedded directly in `index.html` as a JavaScript array called `EVENTS`. Each entry looks like this:

```js
{
  id: 1,
  title: "US Open",
  label: "Aug 31 – Sep 1, 2026",   // Display string
  start: "2026-08-31",              // ISO date (YYYY-MM-DD)
  end:   "2026-09-01",              // ISO date (inclusive)
  monthOnly: false,                 // true = show on 1st of month in calendar view
  location: "New York, NY",
  chair: "Raghav",
  category: "Core Event",           // Core Event | Virtual Event | Optional Event
  type: "social",                   // social | education | business | family
  desc: ""                          // HTML string, or "" for no description
}
```

### Steps to add or edit an event

1. Open `index.html` in a text editor.
2. Locate the `EVENTS` array (search for `const EVENTS`).
3. Add a new object or edit an existing one following the format above.
4. Increment the `id` field for any new event (use the next available integer).
5. Save and redeploy (or just refresh the browser for local testing).

### Event types

| `type` value  | Filter tab  | Accent colour |
|---------------|-------------|---------------|
| `social`      | Social      | Deep blue     |
| `education`   | Education   | Navy          |
| `business`    | Business    | Plum          |
| `family`      | Family      | Forest green  |

### Month-only events

Set `monthOnly: true` for events whose exact dates are TBD (e.g. "February 2027"). These appear on the 1st of the month in the calendar grid, but display their full `label` string everywhere else.

## Data source

Events were imported from the Google Sheet **"YPO A13 Learning Calendar Data"** stored in the chapter's Google Drive folder (`1-i_-By_G62x-A0W2oTuTtCQzg0ioBV9B`). Re-import whenever the sheet changes by copying the updated rows into the `EVENTS` array.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages → Source** and select the `main` branch, root folder.
3. GitHub will publish the site at `https://<your-org>.github.io/<repo-name>/`.
