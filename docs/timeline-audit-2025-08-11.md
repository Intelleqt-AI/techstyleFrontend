Title: Tasks > Timeline UI/UX Review and Root-Cause Sweep (No Code Changes)

Summary
- You’re seeing a monochrome Timeline with default/neutral styles and occasional blue focus outlines.
- Expected: clay-accented controls consistent with Messages/Procurement, clay-filled circular phase counts, list-colored task bars, and clearly distinct Week/Month modes.
- We performed a path, import, and theming sweep based on the current repo structure from this workspace snapshot.

Key Findings (why the UI looks unchanged)
1) Likely token mismatch (highest likelihood)
   - The Timeline styles reference clay tokens like: --clay-filled, --clay-on-filled, --clay-border, --clay-foreground (and optionally --clay-ring).
   - If these CSS variables are not defined globally (e.g., in :root or a theme wrapper), those arbitrary Tailwind classes resolve to “no value”, resulting in neutral/unchanged visuals.
   - The blue you still see is the default focus ring from the browser or from default shadcn ring styles, which appear when our classes don’t override with a valid token.
   - Evidence to collect (no code edit needed):
     - Open DevTools Console and run:
       - getComputedStyle(document.documentElement).getPropertyValue('--clay-filled')
       - getComputedStyle(document.documentElement).getPropertyValue('--clay-on-filled')
       - getComputedStyle(document.documentElement).getPropertyValue('--clay-border')
       - getComputedStyle(document.documentElement).getPropertyValue('--clay-foreground')
       - getComputedStyle(document.documentElement).getPropertyValue('--clay-ring')
     - If these return empty strings, the variables are missing at runtime. Any class like bg-[var(--clay-filled)] will have no effect.

2) Component path is correct, but there may be a parallel version (medium likelihood)
   - Current route: app/projects/[id]/tasks/page.tsx imports TimelineView from "@/components/tasks/timeline-view".
   - From the project inventory, only one TimelineView file is present under components/tasks/timeline-view.tsx.
   - Risk: a re-export (e.g., components/tasks/index.ts) or a similarly named component could be shadowing, but no such file was listed in the workspace dump. If the page is importing from "@/components/tasks" (folder index) in another branch or earlier state, it could resolve to an older version.
   - Verification (no code edit):
     - In the browser, open React DevTools > Components, select TimelineView, and confirm the file path shows components/tasks/timeline-view.tsx.
     - If you see a different path, note it here.

3) Active-state and focus styles on the top-level Board/List/Timeline pills (medium likelihood)
   - Those are rendered in app/projects/[id]/tasks/page.tsx via TabsTrigger classes. If they don’t include clay tokens (or tokens are missing), you’ll see neutral pills and blue focus rings.
   - This is a separate control from the Week/Month toggle inside TimelineView, so even if TimelineView is themed, the outer tabs can still look neutral.
   - Verification:
     - Inspect one of the Board/List/Timeline buttons in Elements. Look at the class string. If there’s no bg-[var(--clay-filled)] or ring override classes, it’s using the defaults.

4) Styles present but overridden (low likelihood)
   - If global CSS includes more specific rules, it could override button backgrounds/borders. Given shadcn’s approach (utility-first), this is less common, but worth checking in Computed styles for Week/Month buttons to see which rule “wins”.

5) Month/Week perception (context vs. scale)
   - Both modes still render daily columns (by design), but Month mode should show a month header row spanning each month, and Week mode should clamp to an 8-week window aligned to Mondays.
   - In your screenshot, you see a single "2025" header and daily ticks; this matches the previous single-row header implementation, implying the old TimelineView is still mounted or the month-span row is not rendering (token/height issues).
   - Verification:
     - In Elements, search the sticky top-right header for two stacked header rows (months row + days row). If only a single row exists, the older version is likely rendering.

What to Check, In Order (no edits)
1) Confirm which Timeline file is actually mounted
   - Use React DevTools to locate the TimelineView component and copy the resolved file path. It should be components/tasks/timeline-view.tsx.
   - If it points elsewhere (e.g., a different folder or an index barrel), note the exact path.

2) Confirm clay tokens exist at runtime
   - Run these in the Console:
     - getComputedStyle(document.documentElement).getPropertyValue('--clay-filled')
     - getComputedStyle(document.documentElement).getPropertyValue('--clay-on-filled')
     - getComputedStyle(document.documentElement).getPropertyValue('--clay-border')
     - getComputedStyle(document.documentElement).getPropertyValue('--clay-foreground')
     - getComputedStyle(document.documentElement).getPropertyValue('--clay-ring')
   - If any are empty, Timeline won’t show clay styling. That explains the black/white look.

3) Inspect the Week/Month buttons and phase count badge
   - Select the Week button and check its class list:
     - Expect to see bg-[var(--clay-filled)] when active, otherwise border-[var(--clay-border)] and text-[var(--clay-foreground)].
   - Select a phase count pill:
     - Expect to see bg-[var(--clay-filled)] text-[var(--clay-on-filled)] and small circular sizing.
   - If those classes are absent, an older TimelineView is mounted.

4) Inspect the Today highlight
   - In the timeline grid body, look for a faint clay column wash and a 2px clay center line.
   - If the highlight color is neutral/blue or not present, either clay tokens are missing or the old version is rendering.

5) Top-level tabs (Board / List / Timeline)
   - These are outside TimelineView. If they still show blue focus, it’s because they’re using the default ring styles in app/projects/[id]/tasks/page.tsx.
   - No change expected here from TimelineView alone.

Best-in-Class Target (to align with your global UI without editing yet)
- Active controls (tabs, segmented controls): clay-filled background with white text; neutral outline variants use clay borders/foreground.
- Phase counts: compact clay-filled circle with white text (CRM Leads badge style).
- Task bars: white card with subtle border, tinted by list color underneath (opacity ~25–30%), assignee chips optional.
- Grid: strong line on first-of-month, medium on Mondays, light for other days; clay “Today” wash and center line.
- Week view: fixed 8-week, Monday-aligned; Month view: clear month header spans across each month.

Likely Root Cause Decision Tree
- If tokens missing (Console shows empty values): Define tokens in your global theme (no code changes requested now, but this is required to see clay).
- If tokens exist but controls still neutral: TimelineView being rendered is an older version or a different component. Verify the mounted file path via React DevTools.
- If tokens exist and correct TimelineView is mounted: Look for CSS specificity overrides in Computed styles; check if Tailwind CSS arbitrary-value classes are present in the DOM (bg-[var(--clay-filled)] etc.). If present but overridden, note which rule overrides them.

Next Step Options (when you’re ready to apply changes)
- Minimal, localized change: Update only app/projects/[id]/tasks/page.tsx (Board/List/Timeline tabs) and components/tasks/timeline-view.tsx to use your verified clay tokens (no globals). 
- Or, if your environment uses different token names (e.g., --clay-500, --clay-contrast), map the classes to those names.

Appendix: Quick Verification Snippets (Console)
- Check if Week/Month buttons use clay background:
  [...document.querySelectorAll('button')]
    .filter(b => b.textContent?.trim() === 'Week' || b.textContent?.trim() === 'Month')
    .map(b => getComputedStyle(b).backgroundColor)

- Check token presence:
  ['--clay-filled','--clay-on-filled','--clay-border','--clay-foreground','--clay-ring']
    .reduce((acc,k)=> (acc[k]=getComputedStyle(document.documentElement).getPropertyValue(k).trim(),acc),{})

Observed Screens vs. Expectations
- Screens jWXQ9.png and qzTPi.png show neutral buttons and gray outline count pills: indicates missing tokens or old component mounted.
- Messages/Procurement and CRM Leads (UfmbM.png, wUMRQ.png, aJDBk.png) show the desired clay accents.

Conclusion
- The most probable cause of “no visible change” is that the clay variable names used in TimelineView do not exist in your current theme, so the classes resolve to no-ops. Second most likely: an older Timeline component is mounted.
- Perform the two quick checks (React DevTools path, console token values). Once confirmed, I can implement a surgical fix limited strictly to Tasks > Timeline and the Tasks tabs, aligning 1:1 with your global palette—no global edits required.
