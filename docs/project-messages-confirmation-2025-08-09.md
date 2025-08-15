# Project Messages — Confirmation (front‑end only, no backend)

Status: Confirmed scope. No visual theme changes. No layout changes beyond specified additions.
Audience: Techstyles design system alignment (consistent with My Inbox).

## Goals
- Keep the existing two‑pane layout (thread list left, reading pane right).
- Align components with My Inbox patterns (chips, spacing, paddings) while staying project‑scoped.
- No backend; front‑end only mocks and interactions.

## Global UI/UX adherence
- Colors: Use existing Techstyles palette (neutral/earthy tokens). No new color blocks. Avoid blue/indigo unless already used in system tokens.
- Pills/Badges: Reuse shared shapes/sizes (rounded‑md, 12px height, 10px horizontal padding, icon+text for AA).
- Spacing: 16px base spacing; 24px section gaps; list rows 12–16px padding.
- Typography: Semibold for sender/thread title; 70% tone for preview text.
- Icons: Use lucide-react (Mail, MessageSquare, Zap/System, Sparkles/AI) to match existing iconography.

## Header (unchanged)
- Breadcrumb and project tabs remain as-is.
- Controls row (match My Inbox styles):
  - Search: “Search messages…”
  - Buttons: Filter, Mark all read
  - Same sizes/variants as Inbox to ensure visual consistency.

## Left column — Thread list
- Tabs (segmented pills): All, Action‑Required, Starred
  - Variants mirror Inbox: active = filled dark neutral; inactive = outline neutral.
- Secondary filter chips (optional, multi-select):
  - Email (envelope), Portal (chat bubble), System (gear), AI (sparkle)
  - Inactive = outline neutral; active = filled neutral.
- Row content (72px height target; 12–16px padding):
  - Line 1: Avatar (24) + Sender/Thread name (semibold) + time (right-aligned)
  - Line 2: One-line preview, ellipsized, text at ~70% tone
  - Badges on line 1: source pill (Email/Portal/System/AI), actions pill (e.g., “2 actions”), paperclip icon if attachments
- Hover: subtle bg hover (#F8FAFC equivalent in system neutrals), right-edge kebab (⋯) menu:
  - Star/Unstar, Pin/Unpin, Mute, Move to… (no functionality yet)
- Pinned behavior: Pinned threads appear at top under tiny “Pinned” label.
- Empty states:
  - All: “No messages yet. Connect email or start a portal thread.”
  - Action‑Required: “You’re all caught up 🙌”
- Loading: 3–5 skeleton rows.

## Right column — Reading pane
- Sticky header bar:
  - Thread title (semibold)
  - Stacked avatars
  - Source pill (Email/Portal/System/AI)
  - Icons: Star, Share, ⋯ (menu: Copy link, Open in portal/email, Print, Delete — no functionality)
  - Subline: “12 messages • last updated 2:45 PM”
- AI Summary bar (when > 6 messages):
  - Compact card with 3 sections: Key points • Decisions • Next steps (3 bullets each, placeholder text)
  - Right-side buttons: Convert → Task, Convert → RFI, Convert → PO (open empty modals)
- Message body:
  - Bubble style consistent with current mock
  - Tiny source icon per bubble
  - Attachments as chips (file/image)
    - Inline buttons on chips: Add to Vision Board, Create PO
  - Message hover micro-toolbar (right): Reply, Forward, ⋯ (Convert to Task/RFI/PO, Save to Docs)
- Composer:
  - Textarea
  - “Send as” segmented control (Email / Portal)
  - Icons: attach, emoji
  - Disabled states acceptable; no backend calls.

## “Action‑Required” (front‑end heuristic)
Mark a thread as action‑required if any are true:
- Has a pending approval tag
- Last message ends with “?”
- New attachment exists
- AI Summary present with “needs review”

UI effects:
- Small red dot + “x actions” pill on list rows
- Header chip: “Action items: x”

## Mobile behavior
- Panes stack vertically
- Thread list full width
- Reading pane opens as a sheet

## Accessibility
- AA contrast minimum respected
- Badges include icon + text (no color-only signaling)
- Keyboard: rows navigable; kebab menus accessible; sticky header controls tabbable
- Close reading sheet with Esc on mobile/overlay

## Acceptance criteria
- Tabs/chips filter the left list visually (front‑end only).
- Clicking a row loads the thread in the right pane; header stays sticky on scroll.
- AI Summary card renders (mock) for long threads with three Convert buttons opening empty modals.
- Attachment chips show both quick actions; clicking surfaces placeholder toasts.
- Empty and loading states appear as specified.
- Visuals, padding, and chips match My Inbox styles for consistency.

## Implementation plan (small, isolated deltas — no wholesale rewrite)
1. Page controls row:
   - Reuse Inbox control styles for Search, Filter, Mark all read.
2. Tabs + chips:
   - Add segmented tabs (All, Action‑Required, Starred).
   - Add optional multi-select source chips (Email, Portal, System, AI) with outline/filled variants.
3. Thread list row:
   - Ensure 24 avatar, two-line format, badges, paperclip icon.
   - Add hover bg and right-edge kebab with placeholder items.
   - Add “Pinned” grouping label (if any pinned).
   - Skeleton component (3–5 rows) + empty states.
4. Reading pane:
   - Sticky header with title, avatars, source pill, actions.
   - Subline for count/updated time.
   - Conditional AI Summary card (>6 messages), 3 sections, 3 Convert buttons with empty modal stubs.
   - Message bubbles retain current styling; add tiny source icon; enhance attachment chips with two inline buttons.
   - Micro-toolbar on hover per message.
   - Composer with segmented control (Email/Portal) matching Inbox sizes/variants.
5. Action‑Required logic:
   - Compute per-thread flags on the client from mock data; render dot + “x actions” pill and header chip.
6. Mobile:
   - Use responsive classes to stack panes; reading pane as sheet on small breakpoints.

## Data & analytics (light, optional)
- Console.log events: tab change, chip toggle, row open, open kebab, convert click, approve, share, mark all read, search.
- No network calls.

## Open questions (to confirm before coding)
- Do you prefer “Portal” or “Client Portal” for the source pill label in this view?
- Star vs Pin behaviors: should pinned imply starred or be exclusive?
- AI Summary threshold: strictly > 6 messages or include long single messages?
