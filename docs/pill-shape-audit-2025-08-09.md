# Status/Type Pill Shape Audit
Reference design: CRM > Leads (rectangular pill with rounded corners, thin border, no hover).

![CRM Leads reference](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-09%20at%2011.32.24-Kxw3p9bM2KPZMNI8waEclrDkThmV3i.png)

Target spec to match CRM > Leads:
- Shape: rectangular with rounded corners (rounded-md; not fully rounded).
- Border: 1px visible border (kept as-is per page logic/colors).
- Padding/size: approx. px-3 py-1, text-xs; consistent height across pages.
- Behavior: no hover color change; cursor default (non-interactive).
- Colors: do not change any colors (only shape/behavior if needed).

Below is a page-by-page inventory of pills that don’t match the CRM > Leads shape today.

---

## Confirmed mismatches (needs shape normalization)

1) CRM > Proposals
   - File: app/crm/proposals/page.tsx
   - Location: Status column uses `<Badge className={\`text-xs ${statusClasses(...)}\`}>`.
   - Issue: Shadcn Badge default shape is fully rounded; appears “half-moon”.
   - Action later: make rectangular (rounded-md), cursor-default, ensure no hover (color unchanged).

2) Projects (list grid)
   - File: app/projects/page.tsx
   - Location: Project card status badge (`<Badge className={\`${statusBadge.className} text-xs font-medium px-3 py-1 rounded-lg border\`}>`).
   - Issue: Explicit `rounded-lg` gives more pill-like curvature than CRM > Leads.
   - Action later: switch to rectangular (rounded-md), cursor-default. Keep existing border/colors.

3) Library > Products
   - File: app/library/products/page.tsx
   - Locations:
     - Category chip: `<Badge variant="outline" className="text-xs">...`
     - Tag chips: `<Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">...`
     - “Out of Stock”: `<Badge variant="secondary" className="bg-red-100 text-red-700">...`
   - Issue: Shadcn Badge defaults to fully rounded; appears “half-moon”.
   - Action later: rectangular shape for all these chips; keep colors exactly as-is.

4) Home > Tasks
   - File: app/home/tasks/page.tsx
   - Location: Kanban column count uses `<Badge className="bg-gray-100 text-gray-700 text-xs h-5 px-2">`.
   - Issue: Badge default is fully rounded; shape differs from CRM > Leads.
   - Action later: rectangular shape; keep count/background colors the same.

---

## Likely matches already (no change needed unless manual class differs)

5) CRM > Contacts
   - File: app/crm/contacts/page.tsx
   - Location: Type pill uses custom `span` with `rounded` (not full).
   - Status: Appears rectangular with modest radius; matches CRM > Leads intent.
   - Action: None (shape already rectangular).

6) Widgets > TasksWidget
   - File: components/widgets/tasks-widget.tsx
   - Location: Priority chip uses `span ... rounded px-2 ...`.
   - Status: Rectangular corners; no hover color shift defined here.
   - Action: None.

7) Widgets > ProjectsWidget
   - File: components/widgets/projects-widget.tsx
   - Location: Status chip uses `span ... rounded px-2 ...`.
   - Status: Rectangular corners; already aligned.
   - Action: None.

---

## Pages to verify (chips may exist via Badge or custom spans)

These pages weren’t fully shown in code or may include chips via shared components. Please navigate and confirm if any status/type chips appear “half-moon.” If yes, they should be converted to the rectangular style (rounded-md) without color changes.

- Projects subpages:
  - app/projects/[id]/page.tsx (overview)
  - app/projects/[id]/tasks/page.tsx
  - app/projects/[id]/calendar/page.tsx
  - app/projects/[id]/messages/page.tsx
  - app/projects/[id]/procurement/page.tsx
  - app/projects/[id]/finance/page.tsx
  - app/projects/[id]/docs/page.tsx
  - app/projects/[id]/docs/folders/[folderId]/page.tsx

- Home:
  - app/home/calendar/page.tsx
  - app/home/inbox/page.tsx
  - app/home/time/page.tsx (you’ve flagged color earlier; shape check specifically for any chips)

- Reports:
  - app/reports/page.tsx
  - app/reports/productivity/page.tsx

- Library:
  - app/library/page.tsx
  - app/library/materials/page.tsx

- CRM:
  - app/crm/page.tsx
  - app/crm/pipeline/page.tsx
  - app/crm/leads/page.tsx (reference design; no change needed)

- Finance:
  - app/finance/page.tsx

- Settings:
  - app/settings/page.tsx
  - app/settings/layout.tsx
  - app/settings/user/* (profile, security, notifications, appearance)
  - app/settings/studio/* (general, branding, finance, integrations, roles, api, audit-logs)

- Shared UI (if any chips inside):
  - components/data-cards.tsx
  - components/projects-overview.tsx
  - components/project-overview.tsx
  - components/project-header.tsx
  - components/breadcrumb-bar.tsx
  - components/sort-indicator.tsx
  - components/mini-bar-chart.tsx
  - components/shared/nav-pills.tsx (these are navigation pills; skip unless used as status/type chips)

---

## Implementation plan (when you approve code changes)
- Zero color changes; shape only.
- Make a single global adjustment so we don’t edit dozens of spots:
  1) Update the shared Badge base radius to rectangular (rounded-md) and ensure no hover behavior (already requested globally).
  2) Remove or normalize local overrides like `rounded-lg` on project status badges.
  3) For custom spans styled as chips, confirm they already use `rounded` (most do) and set to `rounded-md` if needed.
- Result: All status/type chips match CRM > Leads shape across the app.

If you want me to proceed with the actual changes, I’ll do it in a single minimal pass focusing only on shape (no color, no background, no structure).
