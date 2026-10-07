---
name: Luminous Glass
colors:
  surface: '#faf9fd'
  surface-dim: '#dbd9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7ec'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1b1b1f'
  on-surface-variant: '#484555'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f2f0f4'
  outline: '#797587'
  outline-variant: '#c9c4d8'
  surface-tint: '#613de0'
  primary: '#5f3add'
  on-primary: '#ffffff'
  primary-container: '#7857f8'
  on-primary-container: '#fffbff'
  inverse-primary: '#cabeff'
  secondary: '#5e5d69'
  on-secondary: '#ffffff'
  secondary-container: '#e1deed'
  on-secondary-container: '#62616e'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4918c8'
  secondary-fixed: '#e3e1ef'
  secondary-fixed-dim: '#c7c5d3'
  on-secondary-fixed: '#1b1b25'
  on-secondary-fixed-variant: '#464651'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf9fd'
  on-background: '#1b1b1f'
  surface-variant: '#e3e2e6'
  glass-bg: rgba(255, 255, 255, 0.78)
  glass-border: rgba(255, 255, 255, 0.80)
  glass-stroke-subtle: rgba(18, 19, 22, 0.06)
  canvas-base: '#f8f9fb'
  surface-card: '#ffffff'
  text-muted: '#6b7280'
  text-subtle: '#9ca3af'
  slot-disabled: rgba(18, 19, 22, 0.04)
typography:
  headline-xl:
    fontFamily: Geologica
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geologica
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Geologica
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geologica
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geologica
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geologica
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geologica
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Geologica
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Geologica
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0em
  label-sm:
    fontFamily: Geologica
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

The design system is engineered specifically for premium, high-frequency service booking within the Telegram Mini App (TMA) ecosystem. It unites contemporary iOS-inspired Human Interface precision with tactile, luminous liquid glass surfaces.

The emotional signature is effortless clarity, quiet luxury, and modern cleanliness. Booking personal care and appointments requires an aura of hygiene, calm, and meticulous professionalism. The interface recedes cleanly into the background, allowing service imagery, open appointment slots, and fluid micro-interactions to lead the experience.

Key stylistic pillars:
- **Luminous Glass & Translucency:** Stacked backdrop filters, satin-finished translucent navigation docks, and specular 1px border highlights.
- **Airy Negative Space:** Generous vertical rhythm tuned to eliminate cramped webview constraints.
- **Micro-tactility:** Pill-shaped controls, soft organic squircle cards, and faint ambient shadows that ground floating sheets and calendar ribbons.

## Colors

The palette balances clinical cleanliness with an expressive, glowing lilac identity:

- **Primary (`#7c5cfc`):** The signature electric lilac. Drives core actions, active selection states, open slot badges, and verified emblems.
- **Secondary (`#f3f0ff`):** An airy ambient violet tint. Powers inactive slot tags, soft chip fills, counter indicators, and segmented containers.
- **Tertiary (`#10b981`):** A vibrant emerald tone reserved strictly for instant confirmations, "Master Available Today" pulses, and deposit completion badges.
- **Neutral (`#121316`):** Deep graphite. Provides high-legibility typographic contrast without harsh absolute blacks.

Substrate and glass treatments:
- Base canvas rests on off-white `#f8f9fb`.
- Cards sit on pure solid `#ffffff`.
- Translucent glass layers utilize `rgba(255, 255, 255, 0.78)` to `rgba(255, 255, 255, 0.85)` framed by crisp specular highlights of `rgba(255, 255, 255, 0.80)` with subtle boundary strokes at `rgba(18, 19, 22, 0.06)`.

## Typography

The design system adopts **Geologica** across all hierarchy levels. Geologica offers balanced geometric precision, human warmth, and exceptional Cyrillic/Latin legibility, blending seamlessly into modern Telegram Mini App interfaces.

- **Headlines:** Set with slightly tightened tracking (`-0.015em` to `-0.03em`) for a clean, editorial look that fits compact mobile portrait viewports.
- **Numbers & Times:** Prices, timestamps, and appointment durations (e.g., `14:30`, `3 500 ₽`) must enforce tabular numbers (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter across calendar strips and slot pickers.
- **Labels & Badges:** `label-sm` utilizes subtle positive tracking (`+0.02em`) to maintain sharp clarity when layered over translucent or tinted pill containers.

## Layout & Spacing

The layout is optimized for mobile-first views inside Telegram's in-app webview container, gracefully centering within a maximum width of 480px on desktop or tablet viewports.

- **Telegram Safe Areas:** Top paddings bind strictly to `var(--tg-viewport-safe-area-inset-top, 0px)` + `12px` to prevent overlap with native modal headers and close icons. Bottom navigation docks float `16px` above `var(--tg-viewport-safe-area-inset-bottom, 0px)`.
- **Rhythm & Padding:** Spacing operates on a 4px/8px modular base. Canvas margins sit at `1rem` (16px) on mobile viewports to provide maximum breathing room for scrollable horizontally oriented rails.
- **Horizontal Carousels:** Date pickers, category lists, and artist portfolio reels bleed edge-to-edge using negative margins matched with inline padding to allow continuous scrolling without sudden visual cutoff.

## Elevation & Depth

Visual hierarchy employs a three-tier light glass stack:

1. **Base Substrate:** Solid `#f8f9fb` canvas layer. Flat, zero elevation.
2. **Elevated Solid Card Tier:** Solid `#ffffff` surfaces layered with ambient, low-opacity drop shadows:
   - *Resting:* `box-shadow: 0 4px 20px -2px rgba(18, 19, 22, 0.04), 0 2px 6px -1px rgba(18, 19, 22, 0.02);`
   - *Active/Selected:* `box-shadow: 0 12px 32px -4px rgba(124, 92, 252, 0.12), 0 4px 12px -2px rgba(18, 19, 22, 0.03);`
3. **Luminous Glass Tier (Floating Chrome):** Sticky headers, floating booking bars, and bottom sheets leverage real-time backdrop blur:
   - Surface: `rgba(255, 255, 255, 0.78)`
   - Filter: `backdrop-filter: blur(24px) saturate(180%);`
   - Border: `1px solid rgba(255, 255, 255, 0.80)` with an ambient outer shadow of `0 16px 40px -8px rgba(18, 19, 22, 0.08)`.

## Shapes

The design system utilizes pill-shaped and rounded squircle geometry:

- **Cards & Bottom Sheets:** Structured with large organic corners (`rounded-3xl` / 1.5rem to 2rem), providing tactile separation from the window edges.
- **Controls & Time Chips:** Buttons, time slots, category filters, and search inputs are shaped with complete pill radiuses (`rounded-full` / 9999px) for comfortable touch targets.
- **Media & Avatars:** Provider portraits and media carousels use smooth squircle contours with subtle highlight rings (`ring-2 ring-primary/20`).

## Components

### Buttons
- **Primary:** Full pill (`rounded-full`), `#7c5cfc` fill, `#ffffff` Geologica text (`label-lg`), with subtle violet shadow (`0 8px 20px -4px rgba(124, 92, 252, 0.35)`). Active state scales slightly down (`transform: scale(0.98)`).
- **Secondary:** Full pill, `#f3f0ff` fill, `#7c5cfc` text, zero shadow, faint hover stroke.

### Chips & Slot Badges ("Окошки")
- **Available Slot:** Rounded-full badge (`px-4 py-2`), `#f3f0ff` fill, `#7c5cfc` text (`label-md`).
- **Selected Slot:** Solid `#7c5cfc` fill, `#ffffff` text, backed by ambient violet footlight glow.
- **Unavailable Slot:** `rgba(18, 19, 22, 0.04)` fill, muted `#9ca3af` text with strikethrough styling.

### Calendar Day Strip
- **Item Capsule:** Compact vertical pill card (`w-14 h-20 rounded-2xl`).
- **Resting:** `#ffffff` surface, 1px border `rgba(18, 19, 22, 0.06)`, weekday in `#9ca3af`, date number in `#121316`.
- **Selected:** Solid `#7c5cfc` background, `#ffffff` text, violet ambient elevation.

### Segmented Controls (Клиент / Мастер)
- **Track:** Glassmorphic pill container (`bg-black/5 p-1 backdrop-blur-md rounded-full`).
- **Thumb:** Crisp white pill with smooth spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`) and soft shadow (`0 2px 8px rgba(0, 0, 0, 0.06)`).

### Input Fields
- **Container:** Full-pill structure (`rounded-full bg-white px-4 py-3 border border-black/5`).
- **Focus:** Border tint shifts to `#7c5cfc` with a soft `0 0 0 3px rgba(124, 92, 252, 0.15)` focus ring.

### Floating Booking Dock
- Sticky suspended pill dock (`rounded-full backdrop-blur-xl bg-white/80 border border-white/80 p-2 pl-5 mx-4 shadow-lg`).
- Displays aggregated pricing on the left and a compact, high-contrast primary confirmation button on the right.