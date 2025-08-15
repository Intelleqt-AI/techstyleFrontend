Pill/Badge/Chip Audit
Date: 2025-08-09

Legend
- Shape:
  - half-moon = rounded-full (fully pill)
  - rectangular-rounded = rounded / rounded-md / rounded-lg (gentle corners)
- Size: Tailwind classes (padding/height/font-size)
- Colors: Tailwind classes or hex used on the chip
- Hover: Explicit hover styles on the chip itself (not on card rows)

Summary (current state)
- Rectangular-rounded chips found on: CRM > Leads, Projects (grid card badge), Project Overview (hero chip), Widgets (Tasks, Projects some spans)
- Half-moon chips found on: CRM > Proposals, Library > Products (category/tags/stock), Home > Tasks (counts, priority), Finance, Clients, Project Tasks, Project Messages, Calendar (global), Productivity Report, Home > Dashboard, Settings > Studio > Team
- Palette mismatches (bright blue/green/purple/amber) still appear on: Calendar (blue/green/purple/amber), Finance (blue/green/yellow/red variants), Home > Tasks (blue/orange/green column icon colors), Project Tasks (blue/orange/yellow/green/indigo column colors), Messages (blue/green/purple/yellow type colors). Backgrounds are not considered in this audit.

Detailed by Route

1) CRM
1.1 /crm/leads
- Component: custom span via badgeClass()
- Shape: rectangular-rounded ("rounded")
- Size: px-2.5 py-1, text-xs, font-medium
- Colors: 
  - New: bg-slatex-500/10 text-slatex-700 border-slatex-500/20
  - Contacted: bg-ochre-300/20 text-ochre-700 border-ochre-700/20
  - Qualified: bg-sage-300/40 text-olive-700 border-olive-700/20
  - Lost: bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30
- Hover: none on chip
- Notes: Matches desired rectangular-rounded reference from your screenshot.

1.2 /crm/proposals
- Component: shadcn/ui Badge with custom classes
- Shape: half-moon (Badge default rounded-full)
- Size: text-xs (no explicit px on many, but relies on Badge padding), some status map uses bg hex/rgba
- Colors (earthy custom): 
  - Draft: bg-[#EFEAE2] text-[#7D786C] border-[#B6B0A4]
  - Sent: bg-[rgba(107,124,133,0.12)] text-[#4B5960] border-[rgba(107,124,133,0.35)]
  - Under Review: bg-[#D8A864] text-[#1F1D1A] border-[#C78A3B]
  - Accepted: bg-[#B9C7B7] text-[#6E7A58] border-[#8FA58F]
  - Rejected: bg-[rgba(183,90,65,0.12)] text-[#6A4B3C] border-[#B75A41]
- Hover: none on chip
- Notes: Shape mismatch with CRM > Leads (half-moon vs rectangular-rounded).

1.3 /crm/contacts (not provided) and 1.4 /crm/pipeline (not provided)
- Not in repository content; cannot audit.

2) Projects
2.1 /projects (grid)
- Component: custom Badge-like span on image corner
- Shape: rectangular-rounded (rounded-lg)
- Size: text-xs font-medium px-3 py-1 plus border
- Colors: status mapping earthy (bg-sage/terracotta/ochre variants) via class string
- Hover: none on chip
- Notes: Matches rectangular-rounded; consistent with Leads.

2.2 /projects/[id] (Project Overview)
- Component: custom span in hero
- Shape: rectangular-rounded ("rounded")
- Size: px-2 py-0.5 text-xs font-medium
- Colors: bg-sage-300/30 text-white/90 border-white/20 (within hero overlay)
- Hover: none on chip
- Notes: Rectangular-rounded; consistent.

2.3 /projects/[id]/tasks
- Component(s): shadcn/ui Badge for counts and priorities
- Shape: half-moon (Badge default)
- Size: 
  - Column count: text-xs h-5 px-2
  - Priority: text-xs, color-coded
  - Overdue: text-xs
- Colors: priority/status chips use red/yellow/gray variants (red-50 etc.) and Overdue red-100 mixed; column headers use many non-earthy icon colors (blue/orange/yellow/green/indigo) but those are icons, not chips
- Hover: none on chips
- Notes: Shape mismatch vs Leads; palette mixed with non-earthy colors.

2.4 /projects/[id]/calendar
- Component: minimal explicit chips; most are controls
- Shape: n/a (no Badge chips rendered as chips)
- Size: n/a
- Colors: uses neutral grays; legend squares use blue/red etc. (not chips)
- Hover: n/a
- Notes: No status/type chips observed.

2.5 /projects/[id]/messages
- Component: shadcn/ui Badge for type and approvals (in the original file variant)
- Shape: half-moon (Badge default)
- Size: text-xs
- Colors: typeColor values (bg-green-100, bg-blue-100, bg-purple-100, bg-yellow-100); approvals: bg-red-100…
- Hover: none on chips
- Notes: Shape mismatch vs Leads; palette is non-earthy in places (blue/purple/yellow).

2.6 /projects/[id]/procurement (not provided), 2.7 /projects/[id]/finance (not provided), 2.8 /projects/[id]/docs (not provided)
- Not in repository content; cannot audit.

3) Library
3.1 /library/products
- Component: shadcn/ui Badge for category/tags and “Out of Stock”
- Shape: half-moon (Badge default)
- Size: text-xs; tag counts also text-xs; overlay “Out of Stock” uses Badge
- Colors: category (outline, neutral), tags (gray-100), out-of-stock (bg-red-100 text-red-700 border-red-200)
- Hover: none on chips (actions overlay buttons have hover, not chips)
- Notes: Shape mismatch vs Leads.

3.2 /library/materials and /library (not provided)
- Not in repository content; cannot audit.

4) Home
4.1 /home/dashboard
- Component: shadcn/ui Badge for small quick-action pills and counts (e.g., Overdue)
- Shape: half-moon (Badge default)
- Size: text-xs, px varies per usage
- Colors: greige/clay/sage/olive variants for quick actions; Overdue uses bg-terracotta-600/10 etc. (earthy); some others are neutral
- Hover: quick-action Badges have hover:bg-greige-300/60 (explicit hover present)
- Notes: Some chips include a hover (should be removed in fix). Shape half-moon.

4.2 /home/tasks
- Component(s): shadcn/ui Badge for column counts and internal chips; some spans for counts in other spots
- Shape: half-moon (Badge default) for column count; other inner spans may be rectangular-rounded
- Size: count: text-xs h-5 px-2; internal: text-xs
- Colors: mostly neutral grays; priorities elsewhere use earthy in widgets
- Hover: none on chips
- Notes: Mixed; header count is half-moon.

4.3 /home/calendar (not provided) and 4.4 /home/inbox (not provided) and 4.5 /home/time (not provided)
- Not in repository content; cannot audit.

5) Global Calendar (Top-level)
5.1 /calendar
- Component: shadcn/ui Badge for event type tags
- Shape: half-moon (Badge default)
- Size: default Badge sizing (implicit) with text from event.type; elsewhere day cells use dots not chips
- Colors: event.color strings include non-earthy: 
  - bg-blue-100 text-blue-800 border-blue-200
  - bg-green-100 text-green-800 border-green-200
  - bg-purple-100 text-purple-800 border-purple-200
  - bg-amber-100 text-amber-800 border-amber-200
- Hover: none on chips
- Notes: Shape mismatch; palette non-earthy.

6) Finance
6.1 /finance
- Component: shadcn/ui Badge for status in table (paid/approved/pending/overdue/draft)
- Shape: half-moon (Badge default)
- Size: text-xs whitespace-nowrap
- Colors: 
  - paid: bg-green-50 text-green-700 border-green-200
  - approved: bg-blue-50 text-blue-700 border-blue-200
  - pending: bg-yellow-50 text-yellow-700 border-yellow-200
  - overdue: bg-red-50 text-red-700 border-red-200
  - draft: bg-gray-50 text-gray-700 border-gray-200
- Hover: none on chips
- Notes: Shape mismatch; palette includes bright blue/yellow/green.

7) Clients
7.1 /clients
- Component: shadcn/ui Badge for status (active/prospect/inactive)
- Shape: half-moon (Badge default)
- Size: text-xs
- Colors: 
  - active: bg-green-50 text-green-700 border-green-200
  - prospect: bg-yellow-50 text-yellow-700 border-yellow-200
  - inactive: bg-gray-50 text-gray-700 border-gray-200
- Hover: none on chips
- Notes: Shape mismatch; palette uses bright green/yellow.

8) Reports
8.1 /reports/productivity
- Component: shadcn/ui Badge in KPI tiles for deltas (variant secondary) and possibly other small labels
- Shape: half-moon (Badge default)
- Size: text-xs
- Colors: delta badges switch between green/red (bg-green-50 text-green-700 border-green-200 OR bg-red-50 text-red-700 border-red-200)
- Hover: none on chips
- Notes: Shape mismatch; colors acceptable (earthy-leaning red/green) but still bright green.

8.2 /reports (index) not provided
- Not in repository content; cannot audit.

9) Settings
9.1 /settings/studio/team
- Component: shadcn/ui Badge used via StatusBadge() wrapper (invited/active/suspended)
- Shape: half-moon (Badge default)
- Size: implicit Badge
- Colors: 
  - active: bg-emerald-100 text-emerald-700 (non-earthy emerald)
  - invited: bg-neutral-100 text-neutral-700
  - suspended: bg-rose-100 text-rose-700 (non-earthy rose)
- Hover: hover:bg-emerald-100 and hover:bg-neutral-100 and hover:bg-rose-100 are explicitly added (chip has hover)
- Notes: Shape mismatch; explicit hover present; palette partially non-earthy.

10) Widgets (Dashboard components)
10.1 components/widgets/tasks-widget.tsx
- Component: span styled as chip (priority)
- Shape: rectangular-rounded ("rounded")
- Size: px-2 py-0.5 text-xs font-medium; border
- Colors:
  - high: bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30
  - medium: bg-clay-500/10 text-clay-600 border-clay-500/30
  - low: bg-sage-300/30 text-olive-700 border-olive-700/20
- Hover: none on chip
- Notes: Rectangular-rounded; matches desired shape.

10.2 components/widgets/projects-widget.tsx
- Component: span styled as chip (status)
- Shape: rectangular-rounded ("rounded")
- Size: px-2 py-0.5 text-xs font-medium; border
- Colors:
  - on-track: bg-sage-300/30 text-olive-700 border-olive-700/20
  - at-risk: bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30
  - ahead: bg-clay-500/10 text-clay-700 border-clay-500/30
- Hover: none on chip
- Notes: Rectangular-rounded; matches desired shape.

11) Other Notables
- components/widgets/ai-insights-widget.tsx uses a small colored icon container (not a chip). No Badge here.
- app/projects/[id]/calendar legend uses squares/circles, not chips.
- app/home/dashboard “Quick Actions” uses shadcn Badge with explicit hover (hover:bg-greige-300/60).

Open Items (not available to audit in current repo snapshot)
- /home/time, /home/inbox, /home/calendar (Home namespace pages other than dashboard/tasks)
- /crm/contacts, /crm/pipeline, /reports (index), /library/materials, /library (root)
- /projects/[id]/procurement, /projects/[id]/finance, /projects/[id]/docs (and subfolders)

Recommendation (next step, no code yet)
- Decide globally: shape = half-moon or rectangular-rounded.
  - Your CRM > Leads and multiple widgets already use rectangular-rounded; Proposals/Finance/Clients/Calendar and others use half-moon via Badge.
- Once decided:
  - Option A: keep using shadcn Badge and centrally set shape to rectangular-rounded (rounded-md) in the Badge component, then remove local rounded-full overrides (none seen) and replace custom spans gradually.
  - Option B: introduce a shared StatusBadge/TypeChip with fixed px-3 py-1 text-xs rounded-md border and map earthy colors; then replace instances page-by-page.
- Also remove any explicit hover on chips (found on Settings > Team, Home > Dashboard quick actions).

This document contains no code changes.
