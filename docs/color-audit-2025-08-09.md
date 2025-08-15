Techstyles Color Audit — Accents Only (No background changes)
Scope: Identify accent elements (pills, status/type chips, CTA/buttons, selected toggles, badges, “out of stock”, etc.) that are not using the earthy palette (clay, terracotta, sage, olive, ochre, greige, slate/ink variants). No changes made; this is a checklist.

Key notes
- Neutral grays/whites for surface/backgrounds are OK per your instructions. This audit flags places where accent colors are obvious non-earthy (e.g., Tailwind red/blue or default dark “primary”).
- Many primary CTAs currently use bg-gray-900 or theme primary; callouts below mark those.
- Earthy palette seen in code: clay, terracotta, sage, olive, ochre, greige, slate/slatex, ink.

Audit by route

Library
- /library/products
  - Selected category tab uses bg-gray-900 text-white (primary accent not in earthy palette).
  - Product “Out of Stock” badge uses bg-red-100 text-red-700 (non-earthy red).
  - Primary “Add Product” button uses default Button (theme primary). Verify primary maps to an earthy color, otherwise it’s off-palette.

- /library/materials
  - “Add Material” is outline (neutral). No off-palette accents found.

CRM
- /crm/contacts
  - “Add Contact” button uses bg-gray-900 hover:bg-gray-800 (primary accent not earthy).
  - AvatarFallbacks use bg-gray-900 text-white in some rows (optional: consider slate/greige/ink for consistency).

- /crm/leads
  - “Add Lead” uses bg-primary text-primary-foreground (depends on theme primary; verify it’s set to an earthy tone).
  - Status chips and score colors are already aligned to earthy palette (OK).

- /crm/proposals
  - “New Proposal” button uses bg-gray-900 hover:bg-gray-800 (primary accent not earthy).
  - Status chips are mapped to earthy palette (OK).

- /crm/pipeline
  - View toggle (“Board”/“Table”) active state uses bg-neutral-900 text-white (primary accent not earthy).
  - Stage chips are earthy (OK).

Home
- /home/dashboard
  - Quick Actions input “Send” icon button uses bg-neutral-900 (primary accent not earthy).
  - Other badges/cards use earthy or neutral accents (OK).

- /home/inbox
  - Filter “All” button uses bg-gray-900 text-white (primary accent not earthy).
  - Bottom “Send” button uses bg-gray-900 text-white (primary accent not earthy).
  - Type badges and unread dot use earthy colors (OK).

- /home/calendar
  - View toggles (Month/Week/Today) active use bg-gray-100 text-gray-900 (neutral). If you want selected states to be earthy, mark for change.
  - “New” button uses bg-gray-900 text-white (primary accent not earthy).
  - Event chips/dots use earthy hexes (OK).

- /home/time (not provided)
  - Please verify any primary CTAs, selected toggles, and badges aren’t using bright blue/yellow/green or default dark primaries.

Projects
- /projects/[id]
  - Hero “On Track” badge uses bg-sage-300/30 with white text. Consider olive text (optional) for consistency; current is legible over photo.
  - “Edit” button (over image) uses white/10 overlay with white text (neutral overlay). If you want all CTAs earthy, mark it.
  - Remaining KPI chips, progress, alerts use earthy palette (OK).

- /projects/[id]/tasks (not provided)
  - Check any status/priority chips and primary CTAs for off-palette (e.g., gray-900, tailwind reds).

- /projects/[id]/calendar (not provided)
  - Verify selected states and primary CTAs.

- /projects/[id]/messages (not provided)
  - Verify primary CTAs, mention/system chips align with earthy palette.

- /projects/[id]/procurement (not provided)
  - Verify alerts/badges/PO states align with earthy palette.

- /projects/[id]/finance (not provided)
  - Verify status chips (paid/pending/overdue) avoid Tailwind reds/yellows; use terracotta/ochre/sage mapping.

- /projects/[id]/docs, /projects/[id]/contractors (not provided)
  - Verify primary CTAs, selected toggles.

Reports
- /reports, /reports/productivity (not provided)
  - Verify any KPIs, trend badges, and CTA buttons use earthy palette, not bright blue/green/yellow.

Settings
- /settings and all subpages (not provided)
  - Verify primary buttons and selected controls don’t use default dark/brand or Tailwind bright colors.

Shared components (used across many pages)
- Buttons:
  - Multiple pages use bg-gray-900 text-white for primary CTAs (Contacts, Proposals, Inbox, Calendar “New”, sometimes Dashboard send). If theme primary isn’t mapped to earthy, these will appear off-palette. Mark for global primary review.
- NavPills:
  - Active pill uses bg-neutral-100 (neutral). If you want active pills to be earthy, mark for update (count chip is already clay).
- Badges/Chips:
  - Most status/type chips are already earthy. Biggest outlier is “Out of Stock” red in Library Products.

Summary of priority fixes
1) Replace bg-gray-900 text-white CTAs with an earthy primary across: /crm/contacts, /crm/proposals, /home/inbox, /home/calendar (“New”), selected category in /library/products.
2) Replace non-earthy red “Out of Stock” in /library/products with terracotta mapping.
3) Confirm theme primary maps to an earthy color so instances like “Add Lead” (bg-primary) render correctly.
4) Optional: Align active toggles (e.g., /crm/pipeline, /home/calendar view toggles) to earthy selected states if desired.
5) Optional: Adjust hero badge text color on /projects/[id] from white to olive for full consistency (current is legible over imagery).

End of report — no code changes made.
