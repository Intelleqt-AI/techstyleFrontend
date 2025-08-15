# Pill Shape Verification — Rectangular (rounded-md), no hover

Scope: Status/type chips only. No color or background edits.

Global change:
- components/ui/badge.tsx now uses `rounded-md` (rectangular) and no hover/transition styles.
- This affects all Badge-based chips everywhere.

Target pages to verify visually:

Confirmed updated by global Badge change:
- CRM > Proposals (app/crm/proposals/page.tsx): Status column chips now rectangular, thin border, no hover.
- Library > Products (app/library/products/page.tsx):
  - Category chip
  - Tag chips
  - “Out of Stock” chip
- Home > Tasks (app/home/tasks/page.tsx): Column count chip matches rectangular shape.

Explicit local fix:
- Projects list (app/projects/page.tsx): Replaced `rounded-lg` with `rounded-md` on the card status badge.

Additional areas to spot-check (Badge chips may appear via shared code):
- Projects detail subpages:
  - /projects/[id], /projects/[id]/tasks, /calendar, /messages, /procurement, /finance, /docs, /docs/folders/[folderId]
- Home:
  - /home/calendar, /home/inbox, /home/time (any chips present)
- Reports:
  - /reports, /reports/productivity
- CRM:
  - /crm/leads (reference design), /crm/contacts, /crm/pipeline
- Library:
  - /library, /library/materials
- Finance:
  - /finance
- Settings:
  - /settings and all subpages

Notes:
- Navigation tabs/pills in components like components/shared/nav-pills.tsx are not status/type chips; unchanged by this pass.
- If any page uses custom <span> chips with manual rounding (not Badge), call them out and I’ll normalize to rounded-md in a follow-up.
