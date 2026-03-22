# Design System — Mission Control

## Product Context
- **What this is:** An ops dashboard for managing AI agent teams — projects, budgets, approvals, activity, costs, and org structure.
- **Who it's for:** Kavin (single operator) managing a fleet of AI agents across multiple projects.
- **Space/industry:** AI agent orchestration. Closest peers: Paperclip, Linear (for density/hierarchy), Vercel dashboard (for restraint).
- **Project type:** Internal ops dashboard. Dark mode only. Desktop-first, PWA-capable.

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian
- **Decoration level:** Minimal — zero decorative elements. No gradients, blobs, illustrations, or ornament. Every pixel conveys information.
- **Mood:** A control surface. Serious, dense, trustworthy. Closer to a Bloomberg terminal than a Notion doc. The dashboard communicates authority through restraint — it doesn't need to sell you on anything.
- **Reference sites:** Paperclip (same category), Linear (density/hierarchy), Vercel dashboard (dark-mode restraint).

## Typography
- **Display/Hero:** System sans (`-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif`) — native feel on Mac, zero loading overhead.
- **Body:** System sans (same stack) at 16px base. `text-[14px]` for most UI text, `text-[13px]` for sidebar items, breadcrumbs, and secondary table cells.
- **UI/Labels:** System mono (`"SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`) for micro-labels: `text-[11px] uppercase tracking-[0.15em] font-mono`. This is the signature typographic choice — military/industrial micro-labels.
- **Data/Tables:** System mono with `tabular-nums` for all numbers, budgets, costs, timestamps, issue counts. Ensures columns align.
- **Code:** Same mono stack. `text-xs` (12px) for inline code, `text-sm` for code blocks.
- **Loading:** None — system fonts only. Zero FOUT, zero latency.
- **Scale:**
  - Page entity name: `text-[30px] font-semibold leading-none tracking-tight` — commands the page
  - Page title (list pages): `text-[16px] font-semibold uppercase tracking-[0.2em]` — distinct from section headers
  - Card section header: `text-[14px] font-semibold text-foreground` — inside card header area, not uppercase, not mono
  - Micro-label: `text-[11px] uppercase tracking-[0.15em] font-mono` — table column headers, metric card labels, form labels, sidebar section labels
  - Body: `text-[14px]` (14px)
  - Small: `text-[12px]` (12px)

## Color
- **Approach:** Restrained — achromatic base with semantic-only accent colors. No brand color. No decorative color.
- **Background:** `oklch(0.145 0 0)` — near-black, zero chroma
- **Card/elevated:** `oklch(0.205 0 0)` — subtle lift from background
- **Secondary/muted:** `oklch(0.269 0 0)` — borders, inputs, accent backgrounds
- **Foreground:** `oklch(0.985 0 0)` — near-white
- **Muted foreground:** `oklch(0.708 0 0)` — secondary text, labels
- **Ring (focus):** `oklch(0.556 0 0)` — visible but not distracting
- **Semantic colors (bordered badge style):**
  - Active/success: emerald (`border border-emerald-500/20 bg-emerald-500/10 text-emerald-400`)
  - Running/in-progress: cyan/indigo (`border border-indigo-500/20 bg-indigo-500/10 text-indigo-400`)
  - Warning/pending: amber/yellow (`border border-amber-500/20 bg-amber-500/10 text-amber-400`)
  - Error/destructive: red (`border border-red-500/20 bg-red-500/10 text-red-400`)
  - Proposed/review: violet (`border border-violet-500/20 bg-violet-500/10 text-violet-400`)
  - Completed: blue (`border border-blue-500/20 bg-blue-500/10 text-blue-400`)
  - Neutral/archived: zinc (`border border-zinc-700/50 bg-zinc-800/50 text-muted-foreground`)
- **Dark mode:** Only mode. No light mode. `color-scheme: dark` on html.

## Spacing
- **Base unit:** 4px (Tailwind default)
- **Density:** Compact — this is an information-dense ops dashboard
- **Scale:** `gap-0.5`(2) `gap-1`(4) `gap-2`(8) `gap-3`(12) `p-[20px]`(20) `p-6`(24) `space-y-6`(24) between major sections
- **Metric card gaps:** `gap-2` (8px)
- **Section spacing:** `space-y-6` (24px) between top-level sections
- **Content padding:** `p-6 md:p-8` on main content area
- **Sidebar width:** `w-60` (240px) fixed

## Layout
- **Approach:** Grid-disciplined
- **Structure:** Fixed sidebar (240px) + scrollable content area. Full viewport height (`h-dvh`).
- **Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for metric cards. Data tables for project lists.
- **Max content width:** `max-w-[1400px] mx-auto` on main content area.
- **Border radius:**
  - **Cards, sections, banners: `rounded-[2px]`** — minimal softening. Matches Aura reference.
  - **Buttons, inputs, textareas, dropdowns, nav items: `rounded-[6px]`** — soft interactive elements.
  - **Exception: `rounded-full`** — status dots, badge pills. Semantically circular.
  - **Exception: `rounded-[2px]`** — sidebar project dots (`w-1.5 h-1.5`).
  - **Never: `rounded-lg`** — too bubbly, reads as AI-generated.
- **Borders:** `border border-border` (1px, `oklch(0.269 0 0)`) on all cards and sections.
- **Shadows:** `shadow-sm` on cards for subtle depth. `shadow-lg` on dropdown menus. No shadows on flat elements.
- **Card background:** `bg-card` (full opacity) — distinct from page background. Creates clear card boundaries.
- **Focus rings:** `box-shadow: 0 0 0 3px oklch(0.556 0 0 / 0.5)` — 3px ring at 50% opacity on `:focus-visible`.
- **Responsive strategy:** Hide table columns at breakpoints (`hidden sm:table-cell`, `hidden lg:table-cell`). Touch targets enforced at 44px via `@media (pointer: coarse)`.

## Motion
- **Approach:** Minimal-functional
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for enter animations (spring-like overshoot). `ease` for simple transitions.
- **Duration:** `transition-colors` on hover/focus (150ms default). Activity row enter: 520ms with blur+overshoot. Chevron rotation: 150ms.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all keyframe animations. Transitions remain (they're too subtle to cause issues).
- **Rules:** No decorative animation. No loading spinners beyond `animate-pulse` on skeletons. No page transitions. Motion exists only to communicate state changes.

## Component Patterns

### Cards
- Default: `bg-card border border-border rounded-[2px] shadow-sm` — full card background, minimal corners, subtle shadow.
- Card with header: Section title inside `p-[20px] border-b border-border`, content below. Section headers are `text-[14px] font-semibold text-foreground` (not uppercase, not mono).
- Elevated (primary status): same as default + `border-l-2 border-l-{color} bg-accent/20` — left accent border + tinted background. Max one per view.
- Table cells inside cards use `px-[20px] py-3.5` padding to align with card header.
- Metric cards use `p-[20px]` internally.

### Status Badges
- Pill shape: `rounded-full px-2.5 py-0.5 text-[11px] font-medium`
- Bordered style: `border border-{color}-500/20 bg-{color}-500/10 text-{color}-400` (e.g., `border border-emerald-500/20 bg-emerald-500/10 text-emerald-400`)
- 20+ status mappings defined in `StatusBadge.jsx`

### Metric Cards
- Large number: `text-[30px] font-semibold leading-none tracking-tight tabular-nums`
- Label below: `text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground`
- Icon top-right: `size-20 text-muted-foreground/40 group-hover:text-muted-foreground`
- Hover: `hover:bg-accent/30`
- Monetary values: `font-mono` for tabular alignment

### Breadcrumbs
- Separator: `›` (right single guillemet) in `text-muted-foreground/40`
- Back link: `text-[13px] text-muted-foreground` with arrow icon
- Current page: `text-[13px] font-semibold text-foreground`

### Empty States
- Centered vertically with `py-16`
- Icon in `bg-muted/50 p-3` container (no border-radius — matches zero-radius system)
- Primary text: `text-sm text-muted-foreground`
- Secondary text: `text-xs text-muted-foreground/60`

### Tables
- Container: `w-full text-left border-collapse whitespace-nowrap`
- Header: `text-[11px] uppercase font-mono tracking-[0.15em] text-muted-foreground font-normal pb-3 px-[20px] pt-4 border-b border-border`
- Rows: `border-b border-border/50 hover:bg-accent/40 transition-colors cursor-pointer` with `tabIndex="0"`
- Cells: `px-[20px] py-3.5`
- No zebra striping. Hover state is sufficient.
- Budget columns: inline `h-1.5 rounded-full` progress bars with percentage label

### Sidebar
- Brand header: `h-[60px]` with `border-b border-border`, branded icon in `w-6 h-6 rounded-md`, title in `text-sm font-semibold tracking-wide`
- Nav container: `p-4 space-y-6`
- Section labels: `text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground` with `mb-2 px-2`
- Nav items: `px-2 py-1.5 rounded-[6px] text-[13px] font-medium` with `h-4 w-4` icons, `focus:ring-[3px] focus:ring-ring/50`
- Active: `bg-accent/60 text-foreground`
- Inactive: `text-muted-foreground hover:bg-accent/40 hover:text-foreground`
- Project items: small dot (`w-1.5 h-1.5 rounded-[2px]`) + name, `rounded-[6px]` on hover
- Footer: user profile card with initials avatar (`w-8 h-8 rounded-[6px] bg-secondary border border-border`), name + version

## Anti-Patterns (Never Do)

1. **No `rounded-lg` on anything.** Cards use `rounded-[2px]`. Buttons/inputs/dropdowns/nav use `rounded-[6px]`. `rounded-full` for pills and dots only.
2. **No gradients.** Not on buttons, not on backgrounds, not on anything.
3. **No decorative color.** Every color must map to a semantic meaning.
4. **Shadows are intentional.** `shadow-sm` on cards, `shadow-lg` on dropdowns. No shadows on flat elements, rows, or buttons.
5. **No web fonts.** System stack only. Zero loading overhead.
6. **No light mode.** This is a dark-mode-only product.
7. **No `prompt()` or `alert()`.** Native browser dialogs break the visual language. Use inline modals.
8. **No arrow icons on clickable rows.** Hover state + cursor communicate clickability. The arrow is visual noise.
9. **No centered section headers.** Left-align everything except empty states.
10. **No hardcoded counts.** All numbers must derive from data.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-22 | Initial design system created | Codified from shipped dashboard after design review + QA pass. Documents existing opinions rather than inventing new ones. |
| 2026-03-22 | `rounded-sm` on cards, sharp on buttons/inputs | Softened from zero-radius after Paperclip comparison. Cards get 2px warmth, interactive elements stay crisp. No `rounded-md` or `rounded-lg`. |
| 2026-03-22 | System font stack only, no web fonts | Mac-first internal tool. Native feel, zero FOUT, zero latency. SF Pro + SF Mono. |
| 2026-03-22 | Semantic-only color, no brand color | Ops dashboard — data speaks, chrome stays quiet. Every hue maps to a status meaning. |
| 2026-03-22 | Dark mode only | Ops tools live in dark mode. No light mode planned or needed. |
| 2026-03-22 | 11px uppercase mono micro-labels | Signature typographic choice. Military/industrial feel. Used for table headers, metric labels, form labels, sidebar labels. Section headers upgraded to 14px semibold. |
| 2026-03-22 | Left-border accent for primary status cards | Differentiates the most important section from uniform bordered boxes. Max one per view. |
| 2026-03-22 | Entity names at 30px on detail pages | Per Paperclip comparison — entity names must command the page. Bumped from 24px to 30px for more presence. |
| 2026-03-22 | Card background lift with `bg-card/50` | Subtle depth without shadows. Cards are visually distinct from page background. |
| 2026-03-22 | Card padding increased to `p-5` | More breathing room inside cards. Inspired by Paperclip's generous spacing. |
| 2026-03-22 | Section headers split from micro-labels | Section h3/h4 headers now 14px semibold (readable). Micro-labels (11px mono uppercase) reserved for table/metric/form/sidebar labels. |
| 2026-03-22 | `shadow-sm` on cards, `shadow-lg` on dropdowns | Adopted from Paperclip. Adds depth in dark mode without being heavy. Reversed earlier "no shadows" rule. |
| 2026-03-22 | `bg-card` full opacity on cards | Upgraded from `bg-card/50`. Cards are now clearly distinct from page background. |
| 2026-03-22 | `rounded-md` on buttons, inputs, dropdowns | Adopted from Paperclip. Soft interactive elements feel more polished. Cards stay `rounded-sm`. |
| 2026-03-22 | Focus ring: 3px box-shadow at 50% opacity | Adopted from Paperclip. More polished than 1px outline. Uses ring color at half opacity. |
| 2026-03-22 | Sections wrapped in cards with headers inside | Per Aura reference. Section title lives inside the card (px-5 py-4 border-b), not as standalone h3 above. |
| 2026-03-22 | Table cell padding px-5 py-3.5 | Matches card header padding. More breathing room than px-4 py-3. |
| 2026-03-22 | Main content padding p-6 md:p-8 | Bumped from p-4 md:p-6. Matches Aura's p-8 for generous spacing. |
| 2026-03-22 | Sidebar nav items rounded-md | Per Aura reference. Softens nav items without being bubbly. |
| 2026-03-22 | Sidebar brand header h-[60px] with border-b | Per Aura reference. Taller header with clear separation. |
| 2026-03-22 | Ported Aura HTML classes directly | All component classes now match Aura reference: p-[20px], rounded-[2px], tracking-[0.15em], rounded-[6px] nav, bordered status badges, inline progress bars, user profile footer, 6px scrollbar. |
