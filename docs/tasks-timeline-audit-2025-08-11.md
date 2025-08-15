# Tasks > Timeline: Visual/Behavior Audit and Root-Cause Analysis
Date: 2025-08-11

This document explains why recent visual changes to Project > Tasks > Timeline are not appearing and provides a step-by-step verification plan. No code has been edited as part of this audit.

---

## Executive summary

The Timeline and the Board/List/Timeline tabs are using CSS variables like `var(--clay-filled)`, `var(--clay-on-filled)`, `var(--clay-border)`, `var(--clay-foreground)`, and `var(--clay-ring)`. These variables are not defined anywhere in `app/globals.css`. Because the variables are undefined, the browser computes those backgrounds/borders to “nothing/transparent,” leaving the controls looking monochrome/neutral. 

In contrast, our Tailwind palette already defines a `clay` color scale (e.g., `clay.500 = #E07A57`) in `tailwind.config.ts`, but the component code is not using `bg-clay-500` etc.; it uses CSS variables that don’t exist. That is the primary reason the UI still appears black-and-white and unchanged.

There is not a second/duplicate Timeline component being rendered. The page at `app/projects/[id]/tasks/page.tsx` imports the Timeline from `@/components/tasks/timeline-view`, which aligns with the single file present in the repository.

---

## Symptoms you are seeing

- Tabs “Board / List / Timeline,” Week/Month toggle, and action buttons show gray/neutral states and blue/default focus outlines instead of the brand’s clay styling.
- Phase counts appear as gray outline chips rather than clay-filled circular badges with white text.
- Today highlight appears neutral rather than clay.
- Month header in some screenshots shows minimal change.

These all map back to `var(--clay-*)` tokens not being present in `:root`.

---

## Inventory of relevant files and where the styling is coming from

1) Page using Timeline
- app/projects/[id]/tasks/page.tsx
  - Imports Timeline: `import TimelineView from "@/components/tasks/timeline-view"`
  - Also styles the “Board / List / Timeline” tabs using classes with `var(--clay-*)` tokens.

2) Timeline component
- components/tasks/timeline-view.tsx
  - Uses the same `var(--clay-*)` tokens for:
    - Week/Month toggle active/inactive states
    - Today highlight wash/line
    - Filter/action buttons (outline color, focus ring)
    - Phase count pills (intended to match CRM Leads badge)
  - Uses list colors for task bars (works), but the general controls rely on undefined `--clay-*` variables.

3) Global styles and tokens
- app/globals.css
  - Defines many CSS variables (`--background`, `--foreground`, `--primary`, etc.) and sidebar tokens.
  - Does NOT define any `--clay-*` variables. This is the critical mismatch.

4) Tailwind theme
- tailwind.config.ts
  - Defines Tailwind colors including a `clay` scale with explicit hex values (e.g., `DEFAULT: "#E07A57"`, and multiple shades).
  - These are available as utility classes (e.g., `bg-clay-500`) but are not automatically exposed as CSS variables (e.g., `--clay-filled`) unless you manually create them in CSS.

Conclusion: Components expect CSS variables like `--clay-filled` but only Tailwind color tokens are defined. No runtime mapping exists between them.

---

## Why you don’t see any changes despite edits

- The edited classes such as `bg-[var(--clay-filled)]` compile to CSS that reads `background-color: var(--clay-filled);`
- Because `--clay-filled` isn’t defined in `app/globals.css`, the browser falls back to no value (transparent). Controls then display using the remaining neutral/outline styles, resulting in an unchanged, monochrome look.
- Similarly, `focus-visible:ring-[var(--clay-ring)]` renders a ring that references an undefined token; the browser shows default focus outline or none, which is why you still see neutral/blue outlines.

---

## Duplicate/Multiple versions check

- Referenced import: `@/components/tasks/timeline-view` from `app/projects/[id]/tasks/page.tsx`
- Present file: `components/tasks/timeline-view.tsx`
- No alternate or duplicate `timeline-view.tsx` is present in the repository tree you provided.
- No alias switching: The `@` alias points to the project root’s `src` or base (based on standard Next setup you’re using), and the path matches the single file.

Conclusion: The app renders the correct Timeline component file; there are no duplicates intercepting your edits.

---

## Verification checklist (no code changes required)

Use this to verify the root cause in the running app/browser:

1) Inspect Week/Month toggle
   - Right-click “Week” in the Timeline header > Inspect.
   - In the Styles panel, find the rule containing `background-color: var(--clay-filled)`.
   - Check the Computed panel:
     - If “background-color” shows as “var(--clay-filled)” with a warning or resolves to transparent/initial, that confirms the token is missing.

2) Inspect phase count badge
   - Inspect the small count next to a phase name (e.g., “Concept 2”).
   - Find `background-color: var(--clay-filled)` and `color: var(--clay-on-filled)`.
   - Verify that neither token is defined in Computed styles.

3) Search for clay variables in global CSS
   - Open `app/globals.css` and search for `--clay-`.
   - You should find zero matches. This confirms tokens are undefined globally.

4) Confirm Tailwind clay palette exists
   - Open `tailwind.config.ts` and locate `extend.colors.clay`.
   - You’ll see defined hex values (e.g., `#E07A57` etc.). 
   - These are available for utility classes (e.g., `bg-clay-500`) but do not auto-generate CSS variables like `--clay-filled`.

5) Confirm single Timeline component
   - Confirm only one file at `components/tasks/timeline-view.tsx`.
   - Confirm `app/projects/[id]/tasks/page.tsx` imports exactly that path.

All five checks should point to the missing CSS variable definitions as the primary cause.

---

## Recommended resolution options (choose one)

A) Keep the component code as-is (uses `var(--clay-*)`) and define the tokens once in CSS.
- Add these to `:root` in `app/globals.css` (values aligned to your Tailwind `clay` scale and brand):
  - `--clay-filled: #E07A57;`          // Clay default fill
  - `--clay-on-filled: #FFFFFF;`       // Text on clay
  - `--clay-border: #F1BBAA;`          // Light clay border (from clay.200/300)
  - `--clay-foreground: #8A4A33;`      // Clay dark foreground (from clay.800)
  - `--clay-ring: #CE6B4E;`            // Focus ring (from clay.600)
- Pros: One central place to align the entire Tasks area to the brand. Minimal component churn. 
- Cons: Introduces new global CSS variables (but names are unique/prefixed to clay).

B) Remove `var(--clay-*)` usage and switch components to Tailwind utility colors (no new globals).
- Example replacements:
  - Active buttons: `bg-clay-500 text-white`, focus ring: `focus-visible:ring-clay-600`
  - Outlines/borders: `border-clay-200`
  - Today highlight: `bg-clay-500/10` and center line `bg-clay-500`
  - Phase count badge: `bg-clay-500 text-white`
- Pros: Uses your already-defined Tailwind color scale, no global variables required.
- Cons: Requires editing the Tasks components to replace the var() references.

Note: You asked not to edit code in this step. The above are proposed next actions; no changes have been applied yet.

---

## Alignment with global UI/UX (design mapping)

The following are the elements that should adopt clay styling to match your Messages/Procurement examples:

- Tabs (Board/List/Timeline): 
  - Active: clay-filled with white text, clay ring on focus.
  - Inactive: white background, clay border, clay foreground text.
- Week/Month segmented buttons: same as above.
- Phase count badge: compact circular clay fill with white text (same size as CRM Leads “2”).
- Today marker: clay faint column wash + clay crisp center line.
- Filter chips: clay outline and text.
- Bars: keep list-based color tints for differentiation; borders remain neutral for legibility.

These align directly with the visual language seen in your screenshots.

---

## Why we also saw blue outlines in some screenshots

- Blue outline is the browser’s default focus outline on buttons/controls when the component doesn’t specify a custom `focus-visible` ring or removes outline. Since the clay `--clay-ring` token is missing, any intended custom focus ring also fails to resolve, leaving default browser outlines.

---

## Minimal-impact change path (when you’re ready)

You asked for no code edits now. When approved, the lowest risk path is:

1) Define `--clay-` tokens in `app/globals.css` (Option A) to immediately “turn on” the existing design without touching any components.
2) If we later prefer to avoid global variables, perform a second pass to migrate the Tasks components to Tailwind `bg-clay-500` style utilities and then remove the global tokens.

Either path will produce the visible clay styling you expect across the Tasks Timeline without touching other product areas.

---

## Post-fix QA checklist

After implementing either Option A or B:

- Week active state shows clay fill; Month inactive shows clay border/foreground.
- Today’s column shows a faint clay background with a crisp clay center line.
- Phase counts appear as small clay-filled circular badges with white text.
- “Board / List / Timeline” active pill shows clay fill; inactive show clay border/foreground.
- No default blue outlines anywhere; focus rings are clay.
- Bars still reflect list colors and remain legible.

---

## Open questions for you

- Confirm the exact shades for `--clay-*` tokens, if you want shades different from our tailwind config (e.g., lighter border or darker ring).
- Should Month view be the full calendar year (current behavior by design) or collapse to “last month/current/next month” window?
- Do you want avatars/progress rendered on bars as a follow-up?
