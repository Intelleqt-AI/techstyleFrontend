Techstyles UI standardization audit
Date: 2025-08-09
Requested baseline: Rectangular-rounded chips like CRM > Contacts
Scope: Identify every page/subpage with pills/badges/status/type containers; list current shape/size/colors/hover; explain why prior “global” changes didn’t take and enumerate pages needing edits. No code changes applied.

Target spec (proposed; match CRM > Contacts exactly)
- Shape: rectangular-rounded (Tailwind "rounded", not rounded-md or rounded-full)
- Size: text-xs, px-2.5 py-1
- Border: 1px visible border (earthy palette, low-contrast)
- Colors: Earthy palette only (clay/sage/olive/ochre/terracotta/greige/taupe/slatex), no Tailwind defaults like blue/green/yellow/red
- Hover: None. Status/type chips do not change color on hover
- Component strategy: Prefer a single shared component for status/type; avoid per-page ad-hoc spans

Why the previous “universal” change didn’t work
- Multiple patterns exist in parallel:
  1) shadcn/ui <Badge> component (we adjusted globally to rounded-md). Pages override className colors, but shape remains from Badge; however…
  2) Custom components: components/chip.tsx defines StatusBadge/TypeChip using baseChip (rounded-md, px-3 py-1)
  3) Ad-hoc spans: Some pages render raw <span className="... rounded ..."> with inline hex colors (e.g., CRM > Contacts)
- Result: Changing Badge alone cannot affect StatusBadge/TypeChip or ad-hoc spans. Likewise changing chip.tsx cannot affect ad-hoc spans or pages using Badge with strong class overrides
- Mixed radii and paddings:
  - Contacts uses rounded and px-2.5
  - Badge + StatusBadge use rounded-md and px-3
- Mixed color systems:
  - Some pages use earthy tokens (clay/sage/olive/ochre/terracotta/greige/slatex)
  - Some use Tailwind’s blue/green/yellow/red or hex codes
- Status vocabularies differ by page (e.g., “paid/approved/pending/ordered/delivered”) and aren’t mapped in the shared StatusBadge; these pages fell back to custom Badge styling with default Tailwind colors

Route-by-route inventory

CRM
1) /crm/contacts (app/crm/contacts/page.tsx)
   - Type container: <span className={`inline-flex ... px-2.5 py-1 rounded text-xs font-medium ${getTypeBadge(type)}`}/>
   - Shape: rounded (matches requested baseline)
   - Size: text-xs, px-2.5 py-1 (matches requested baseline)
   - Colors: Inline hex mapped to earthy (sage/olive, clay, ochre, greige). Good palette, but uses hex not tailwind tokens
   - Hover: None on chip. Table rows have hover, fine
   - Notes: This is the baseline spec the team wants to standardize on

2) /crm/leads (app/crm/leads/page.tsx)
   - Status container: <StatusBadge status={lead.status} />
   - Shape: rounded-md (not rounded)
   - Size: text-xs, px-3 py-1 (via baseChip)
   - Colors: Earthy tokens (slatex/ochre/sage/terracotta). Good palette
   - Hover: None on chip
   - Non-compliance: Radius and padding differ from CRM > Contacts baseline

3) /crm/proposals (app/crm/proposals/page.tsx)
   - Status container: <StatusBadge status={proposal.status} />
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy for all mapped statuses (“Draft/Sent/Under Review/Accepted/Rejected”)
   - Hover: None
   - Non-compliance: Radius/padding differ from CRM > Contacts baseline

Home
4) /home/calendar (app/home/calendar/page.tsx)
   - Project “badge”: <Badge variant="outline" className="text-xs" style={{ color: hex, borderColor: hex }}/>
   - Shape: rounded-md (from Badge)
   - Size: text-xs, px-3 py-1 (Badge default)
   - Colors: Earthy (clay/sage/olive/ochre) and greige tints. Good palette
   - Hover: Badges none; other interactive buttons have hover as expected
   - Non-compliance: Radius/padding differ from Contacts

5) /home/inbox (app/home/inbox/page.tsx)
   - Type labels (“Mention”, “System”, “Comment”): <Badge className="... text-xs"> … with earthy colors
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy palette (clay/greige/sage)
   - Hover: None on badges
   - Non-compliance: Radius/padding differ from Contacts

6) /home/time (app/home/time/page.tsx)
   - Billable badges: <Badge className="bg-bone-50 text-olive-700 border-olive-700/20 text-xs">Billable</Badge> (and Non-billable)
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy palette (bone/olive/slatex). Good
   - Hover: None on badges
   - Non-compliance: Radius/padding differ from Contacts

7) /home/tasks (app/home/tasks/page.tsx)
   - Column counters: <TypeChip label={count} />
   - Task priority: <StatusBadge status="high" | "medium" | "low" />
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy (terracotta/clay/greige)
   - Hover: None on chips
   - Non-compliance: Radius/padding differ from Contacts

Projects
8) /projects (grid) (app/projects/page.tsx)
   - Card status (On Track/At Risk/Ahead): <StatusBadge status={project.status} label={...}/>
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy (sage/olive/terracotta/ochre)
   - Hover: None on chip
   - Non-compliance: Radius/padding differ from Contacts

9) /projects/[id] (Overview) (app/projects/[id]/page.tsx)
   - Hero “On Track” label: <span className="inline-flex ... rounded px-2 py-0.5 text-xs bg-sage-300/30 ...">
   - Shape: rounded (matches baseline)
   - Size: text-xs, px-2 py-0.5 (slightly smaller padding than Contacts)
   - Colors: Earthy (sage/greige/clay/terracotta/olive). Good
   - Hover: None on chip
   - Non-compliance: Padding uses px-2 py-0.5 vs baseline px-2.5 py-1 (minor)

10) /projects/[id]/tasks (app/projects/[id]/tasks/page.tsx)
   - Column counters: <TypeChip />
   - Task badges: <StatusBadge status={priority}/>, optional “Overdue”
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy (terracotta/clay/greige)
   - Hover: None
   - Non-compliance: Radius/padding differ from Contacts

11) /projects/[id]/messages (app/projects/[id]/messages/page.tsx)
   - Thread list uses color labels via typeStyle: Email/Portal/Approval/RFI/System with Tailwind defaults:
     - Email: blue-100/800
     - Portal: amber-100/800
     - Approval: green-100/800
     - RFI: yellow-100/800
     - System: gray-100/800
   - Separate “actions” count: bg-red-100 text-red-800
   - Shape: These are inline text+icon rows (not formal chips), but where labels appear they are plain text; “actions” uses a rounded badge (rounded)
   - Size: when present as badge: text-xs, px-2 py-0.5
   - Colors: Tailwind default colors (blue/amber/green/yellow/red) — not earthy
   - Hover: None on these labels
   - Non-compliance: Color palette not earthy; shape/size varies

12) /projects/[id]/calendar (app/projects/[id]/calendar/page.tsx)
   - Legend uses plain colored squares (not chips)
   - Timeline bars use defaults:
     - task: bg-blue-500
     - delivery: border-red-500
     - milestone/allocation: grays
   - Date header “today” highlight uses rgba(255,255,0,0.1) (yellow)
   - Colors: Not earthy (blue/red/yellow)
   - Non-compliance: Palette

13) /projects/[id]/procurement (app/projects/[id]/procurement/page.tsx)
   - Table status: <Badge className={`text-xs ${ delivered -> bg-green-50 text-green-700 border-green-200; ordered -> bg-blue-50 text-blue-700 border-blue-200; pending -> bg-amber-50 text-amber-700 border-amber-200 }`}/>
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Tailwind green/blue/amber, not earthy
   - Hover: None on chips
   - Non-compliance: Palette; also radius/padding differ from Contacts

14) /projects/[id]/finance (app/projects/[id]/finance/page.tsx)
   - Table status: <Badge className={`text-xs ${ paid -> bg-green-50 text-green-700; approved -> bg-blue-50 text-blue-700; pending -> bg-yellow-50 text-yellow-700 }`} />
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Tailwind green/blue/yellow, not earthy
   - Hover: None on chips
   - Non-compliance: Palette; radius/padding differ from Contacts

Library
15) /library/products (app/library/products/page.tsx)
   - Category/Tags: <TypeChip />
   - Stock: <StatusBadge status="Out of Stock" /> (when out of stock)
   - Shape: rounded-md
   - Size: text-xs, px-3 py-1
   - Colors: Earthy (greige/taupe/slatex + status mapping)
   - Hover: None on chips
   - Non-compliance: Radius/padding differ from Contacts

Reports
16) /reports (app/reports/page.tsx)
   - No chips present (cards only)
   - No action required

17) /reports/productivity (app/reports/productivity/page.tsx)
   - KPI delta badges: <Badge variant="secondary" className={ green or red sets }>
     - Positive: bg-green-50 text-green-700 border-green-200
     - Negative: bg-red-50 text-red-700 border-red-200
   - Table billable: <Badge className="bg-green-50 text-green-700 text-xs">{m.billable}%</Badge>
   - Insights tiles: Use green/amber/blue panels
   - Shape: rounded-md (Badge)
   - Size: text-xs, px-3 py-1 for badges
   - Colors: Tailwind green/red/blue/amber (not earthy)
   - Hover: None on badges
   - Non-compliance: Palette; radius/padding differ from Contacts

Summary of non-compliance and pages to edit

A) Shape & size mismatches vs CRM > Contacts (rounded + px-2.5 py-1, text-xs):
- Using rounded-md, px-3 py-1 (shared Badge/Chip defaults):
  - /crm/leads
  - /crm/proposals
  - /home/calendar
  - /home/inbox
  - /home/time
  - /home/tasks
  - /projects
  - /projects/[id]/tasks
  - /library/products
  - /projects/[id]/procurement
  - /projects/[id]/finance
  - /reports/productivity
- Minor padding variance:
  - /projects/[id] (Overview): badge uses px-2 py-0.5 (keep or normalize)

B) Palette using Tailwind defaults (blue/green/yellow/red) rather than earthy tokens:
  - /projects/[id]/messages (typeStyle + red actions count)
  - /projects/[id]/calendar (bars + yellow “today”)
  - /projects/[id]/procurement (status chips)
  - /projects/[id]/finance (status chips)
  - /reports/productivity (KPI deltas, billable %, insight panels)
  - Also scattered icon colors in /home/tasks columns (text-blue-600/orange-600/green-600/yellow-600) if we want full palette purity

C) Ad-hoc vs shared component usage:
  - CRM > Contacts uses ad-hoc span + hex. Everything else should converge to one shared component to guarantee future global updates
  - Status vocab gaps: Procurement (ordered/pending/delivered) and Finance (paid/approved/pending) not present in components/chip.tsx mapping; this caused pages to use shadcn Badge + Tailwind default colors

Proposed remediation plan (no code yet; for sign-off)

1) Confirm universal spec
   - Shape: “rounded” (not md), matching CRM > Contacts visually
   - Size: text-xs, px-2.5 py-1
   - Border: 1px, subtle earthy border per status/type (no hover)
   - One source of truth: a single Chip component supporting both “status” and “type” variants

2) Expand status mapping to cover all vocabularies (examples)
   - CRM: new/contacted/qualified/lost
   - Proposals: draft/sent/under review/accepted/rejected
   - Projects: on-track/at-risk/ahead
   - Tasks: high/medium/low/overdue
   - Procurement: ordered/pending/delivered
   - Finance: paid/approved/pending
   - Inbox types (optional alignment): mention/system/comment/email/portal/rfi/approval
   - Reports: positive/negative-neutral tags if needed

3) Replace Tailwind primary colors with earthy tokens
   - Blue -> slatex range
   - Green -> sage/olive range
   - Yellow/Amber -> ochre range
   - Red -> terracotta range
   - Gray -> greige/taupe/slatex/neutral as appropriate

4) Converge on a single component
   - Update shared Chips to “rounded” + px-2.5 py-1 + no hover
   - Replace per-page Badge/inline spans with the shared component (status/type) on non-CRM pages for consistency
   - Keep Badge for unrelated UI (e.g., button adornments), but not for status/type

Edit backlog by route (what and why; no changes yet)

High priority (palette + shape/size):
- /projects/[id]/procurement: Replace Badge colors (green/blue/amber) with earthy; replace components with shared StatusChip (rounded, px-2.5 py-1)
- /projects/[id]/finance: Replace Badge colors (green/blue/yellow) with earthy; migrate to shared StatusChip
- /reports/productivity: Replace green/red/blue/amber on KPI badges and billable% with earthy equivalents (olive/terracotta/slatex/ochre); consider insights panel accents too; chip shape to rounded + px-2.5
- /projects/[id]/messages: Replace typeStyle color families to earthy and standardize any chip-like “actions” badge to rounded + px-2.5; optionally migrate labels to TypeChip/StatusChip

Medium priority (shape/size normalization, palette already earthy):
- /crm/leads: StatusBadge from shared should switch to rounded + px-2.5
- /crm/proposals: Same as above
- /home/calendar: Outline Badge to rounded + px-2.5; keep style-based colors (earthy) as is
- /home/inbox: Badge instances to rounded + px-2.5
- /home/time: Badge instances to rounded + px-2.5
- /home/tasks: TypeChip/StatusBadge to rounded + px-2.5
- /projects: Card StatusBadge to rounded + px-2.5
- /projects/[id]/tasks: TypeChip/StatusBadge to rounded + px-2.5
- /library/products: TypeChip/StatusBadge to rounded + px-2.5

Low priority (minor)
- /projects/[id] (Overview): Hero “On Track” uses px-2 py-0.5 — either keep (hero-only) or normalize to px-2.5 py-1

Open decisions (please confirm)
- Adopt exact CRM > Contacts padding (px-2.5 py-1) as global standard? If yes, we will adjust both Badge and custom Chips to match
- Use Tailwind tokens from tailwind.config.ts (e.g., text-olive-700, bg-greige-100) instead of inline hex? Recommend yes for 1-line palette updates
- For “system/mention/comment/email/portal/rfi/approval” labels: Should these be TypeChip (category) or StatusChip (state)? Suggest TypeChip, earthy neutral variant by default
- Keep badges strictly static (no hover classes) across the board? Recommend yes (except for focus-visible rings when tabbable links are used)

Risks and why prior attempts felt “breaking”
- Global change confined to Badge doesn’t touch ad-hoc spans or the custom Chip; similarly, changing the custom Chip won’t affect pages using Badge + per-page colors
- Status vocab gaps forced pages to re-introduce Tailwind defaults
- Different radii (“rounded”, “rounded-md”, occasional “rounded-full” in external code) and paddings produced a mixed look even when colors were corrected

Next steps (after your go-ahead)
- Lock spec: rounded + px-2.5 py-1, no hover
- Expand status mapping (procurement, finance, inbox/report tags)
- Sweep pages in the backlog above to (a) switch to the shared component and (b) remap colors to earthy tokens
- Optional: add named Tailwind tokens (already present) for consistency; convert lingering inline hex to tokens

Appendix: Palette mapping suggestions
- Positive/success -> sage/olive (e.g., bg-sage-300/40 text-olive-700 border-olive-700/20)
- Caution/at-risk -> ochre or terracotta (e.g., bg-ochre-300/30 text-ochre-700 border-ochre-700/30)
- Negative/error -> terracotta (e.g., bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30)
- Neutral/info -> slatex/greige tints (e.g., bg-slatex-500/10 text-slatex-700 border-slatex-500/20)
