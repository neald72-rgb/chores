# Weekly Chore Tracker

A kid's chore tracker that runs as an installable, offline web app (PWA) on each child's own phone. It is built for two teenagers, one phone each. There is no server, no accounts and no syncing. Everything lives in the browser's localStorage on that phone.

## Files

- `index.html`: the whole app (HTML, CSS and vanilla JS in one file). No build step, no dependencies.
- `sw.js`: service worker, stale-while-revalidate cache so the app opens offline.
- `manifest.json`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`: install metadata and icons.
- Hosted on GitHub Pages from the `main` branch. Merging to `main` publishes.

## Rules for changes

- Keep it a single `index.html` with no external scripts, fonts or network calls.
- When `index.html`, `sw.js`, the icons or the precache list change, bump the cache name in `sw.js` (`const C="chores-vN"`) so phones refresh.
- Phones keep old data. Any change to the stored shape needs a migration: an IIFE after `var S=load()` keyed on `S.v`, then bump `S.v`. Never break existing logs. (`fresh()` deliberately starts at `v:7` so the v8 library migration runs for new installs too.)
- Storage key: `chorechart.v1`. Do not rename it, or the repository, or phones lose their history.
- iPhone is the main target. The home screen app keeps its own storage, separate from Safari.

## Data model (`S`, saved to localStorage `chorechart.v1`)

- `name`, `pin` (4 digits, plain text, a speed bump not real security), `v` (schema version).
- `lists[cat].e`: array of chores `{t, g?, on?, custom?}`. `on:false` means hidden from the child. `g` is the library group. `custom` means the child typed it. `lists[cat].h` is legacy and always empty. Categories: `health` (Be Healthy), `help` (Help Out), `char` (Develop Character).
- `logs["YYYY-MM-DD"][cat]`: two slots (index 0 and 1). A slot is `{h:[], e:[chore names], b:["e:Chore"...] bonus flags, p:{"e:Chore":1|2|3} points, a:true when approved, t:timestamp}`.
- `pens`: parent-entered penalties `{id, d:date, amt:whole dollars, why, t}`.
- `opts`: `{own: child may type own chores, theme: "sunrise"|"ocean"|"matrix"}`.
- `tiers`: last points the parent gave each chore (lowercase name), used to pre-select on approval.
- Logs and penalties older than 183 days (about 6 months) are deleted on launch.

## Behaviour and decisions

- Weeks run Saturday to Friday. Two logs per day per category. Future days are locked. Past weeks are view-only.
- Money model: the weekly total is in dollars. Points are set by the parent at approval: 1 = up to 20 min, 2 = 20-60 min, 3 = over 1 hour or stretches their skills. The child never sees times, tiers or points.
- Approved logs from before tiers existed have no `p` and count 1 per chore.
- Chores whose name ends in "x2" count at most twice per week.
- Bonus: the child flags "On my own, without being asked!" and gets a flat $1, whatever the tier.
- Penalties subtract dollars in the week of their date. The weekly total may go below zero. Only a parent can add or remove them (inside the PIN-protected Parent area); the child can see them.
- Status of a log: approved (`a`), pending, or late (more than 24 hours unapproved, earns nothing). A parent can still "Approve anyway" for late ones. Pending logs show as a count, not dollars.
- Approvals are final. The parent cannot change points afterward. The child cannot edit an approved log but can remove it (double tap). Editing a pending log keeps its original timestamp. Editing is allowed only before approval.
- Parent area (gear and "Parent area" button, PIN protected): approve logs and set points, add or remove penalties, choose the chore library, set name and theme, toggle "child can type own chores", backup and restore, change PIN, erase logs.
- Chore library: curated chores per category, grouped (`LIB`). Existing chores stay ticked. The rest start hidden. The child's dropdown shows only ticked chores. The child cannot type the name of a hidden chore.
- Themes: `data-theme` on `<html>`. Sunrise is the default (base `:root`), Ocean and Matrix override tokens. Matrix also runs the falling-code canvas. A tiny script in `<head>` sets the theme from localStorage before first paint.

## Non-goals (decided)

- No syncing between parent and child phones, no accounts, no server.
- No ads. No real money handling.
- Not hand-crafted for the App Store; it is a PWA hosted on GitHub Pages.

## Open ideas

- Optional minutes entry that must meet a chore's minimum time.
- A real app icon from a designer (180, 192, 512 px PNGs, no transparency).
