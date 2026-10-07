---
name: Luminous Glass Booking
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
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0em
  label-sm:
    fontFamily: Plus Jakarta Sans
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

The design system is engineered specifically for premium, high-frequency service booking within the Telegram Mini App (TMA) ecosystem. It unites contemporary iOS-inspired Human Interface guidelines with tactile, translucent "Liquid Glass" surfaces.

The emotional signature is effortless precision, quiet luxury, and cleanliness. Booking personal care—such as master cosmetologists, top-tier barbers, or wellness therapists—requires an aura of hygiene, calm, and meticulous professionalism. The interface recedes entirely, allowing editorial imagery, clear time slots, and fluid micro-interactions to take precedence.

Visually, the system relies on:
- **Liquid Glass & Translucency:** Optical depth achieved through stacked backdrop filters, satin-finished translucent navigation rails, and specular 1px border highlights.
- **Airy Negative Space:** Generous vertical rhythm that eliminates cramped Telegram webview aesthetics.
- **Micro-tactility:** Gentle physical feedback, pill-shaped tactile controls, and soft ambient shadows that ground floating sheets and calendar ribbons.

## Colors

The palette balances clinical clarity with an expressive violet identity:

- **Primary (`#7C5CFC`):** The signature electric lilac. Used for primary actions, selected booking states, active slot indicators, and brand verification emblems. Pressed and active states transition to `#6D48E5`.
- **Secondary (`#F3F0FF`):** A soft, ambient violet tint. Powers inactive slot tags, soft chip selections, notification counters, and primary container fills.
- **Tertiary (`#10B981`):** A tailored emerald tone reserved strictly for instant confirmations, "Master Available Today" pulses, and deposit completion badges.
- **Neutral (`#121316`):** Deep graphite. Provides high-legibility typographic contrast without the harshness of pure `#000000`. Secondary text utilizes `#6B7280`, while placeholder and micro-captions leverage `#9CA3AF`.
- **Canvas & Glass Substrates:** The root background operates on an off-white canvas (`#F8F9FB`), lifting to `#FFFFFF` for solid cards, and `rgba(255, 255, 255, 0.72)` to `rgba(255, 255, 255, 0.85)` for glass surfaces framed by a subtle highlight of `rgba(255, 255, 255, 0.60)` over `rgba(18, 19, 22, 0.05)`.

## Typography

The design system utilizes **Plus Jakarta Sans** across all text tiers. Its modern geometric curves, humanist apertures, and clean metric structure echo the native elegance of SF Pro while introducing crisp character tailored for Cyrillic and Latin alphabets.

- **Headlines:** Set tightly with negative letter spacing (`-0.015em` to `-0.03em`) to mimic iOS editorial headers. Headlines command structure without dominating mobile portrait layouts.
- **Numbers & Times:** Numerics in service costs and time slots (e.g., `14:30`, `3 500 ₽`) must be typeset using tabular figure styling where available (`tnum`), preserving clean spatial alignment inside calendars and booking slots.
- **Micro-labels:** Small badges (`label-sm`) adopt slight positive tracking for crisp optical readability over glass containers.

## Layout & Spacing

The layout is built for mobile-first views within Telegram's in-app webview container, gracefully expanding into centered, tablet-width app frames (maximum container width of 480px on desktop environments).

- **Telegram Safe Areas:** Top paddings strictly map to `var(--tg-viewport-safe-area-inset-top, 0px)` + `12px` to prevent collisions with Telegram's native modal header and action buttons. Bottom navigation floats `16px` above `var(--tg-viewport-safe-area-inset-bottom, 0px)`.
- **Rhythm & Padding:** Component spacing adheres to an organic 4px/8px modular base. Edge margins consistently remain at `1rem` (16px) on mobile viewports to maximize surface area for rich horizontal carousels (e.g., horizontal calendar strips and master portfolio stories).
- **Horizontal Scrolling Strips:** Calendar days, category pills, and appointment chips bleed full width through negative horizontal margins with matching inline padding (`px-4`) to ensure natural glide without harsh clipping.

## Elevation & Depth

Visual hierarchy uses a refined 3-tier optical stack:

1. **Substrate (Base Level):** Solid background (`#F8F9FB`) upon which content renders. Flat without elevation.
2. **Elevated Card Surface:** Solid pure white (`#FFFFFF`) cards layered with ultra-diffused, ambient drop shadows:
   - *Resting Card:* `box-shadow: 0 4px 20px -2px rgba(18, 19, 22, 0.04), 0 2px 6px -1px rgba(18, 19, 22, 0.02);`
   - *Hover/Active Card:* `box-shadow: 0 12px 32px -4px rgba(124, 92, 252, 0.08), 0 4px 12px -2px rgba(18, 19, 22, 0.03);`
3. **Liquid Glass Tier (Floating Chrome):** Modals, sticky headers, bottom sheets, and the floating navigation dock leverage translucent blur:
   - Background: `rgba(255, 255, 255, 0.78)`
   - Filter: `backdrop-filter: blur(24px) saturate(180%);`
   - Border: Multi-layered inset highlights using `border: 1px solid rgba(255, 255, 255, 0.8)` with an outer drop shadow of `0 16px 40px -8px rgba(18, 19, 22, 0.08)`.

## Shapes

The design system embraces deep, organic curvature (Level 3: Pill & Hyper-curved squircle aesthetics):

- **Main Content Cards & Bottom Sheets:** Formed with `rounded-3xl` (24px to 32px), creating soft, organic boundaries that echo iOS interactive cards.
- **Controls & Slot Chips:** Buttons, time pills, category chips, and search inputs are shaped as full pills (`rounded-full`, 9999px), providing an inviting, tactile target for thumb-driven interactions.
- **Avatar Portraits & Portfolio Previews:** Master portraits use smooth `20px` continuous squircles (`corner-smoothing: 60%`) or circular pills with violet highlight borders (`ring-2 ring-primary/20`).

## Components

### Segmented Mode Switcher (Клиент / Мастер)
- **Container:** Full-pill glass container (`bg-black/5 p-1 backdrop-blur-md`).
- **Thumb:** Pure white sliding pill with smooth spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`), backed by a low-contrast ambient shadow (`0 2px 8px rgba(0,0,0,0.06)`).
- **Text:** Semi-bold label switching from `#6B7280` to `#121316` on selection.

### Calendar Day Strip
- **Item Card:** Vertical compact capsules (`w-14 h-20 rounded-2xl flex-col items-center justify-center`).
- **Resting:** Background `#FFFFFF`, 1px border `#F1F3F5`, week label in `#9CA3AF`, day number in `#121316`.
- **Selected:** Background `#7C5CFC`, text `#FFFFFF`, glowing ambient violet footlight shadow (`0 8px 16px -2px rgba(124, 92, 252, 0.35)`).

### Appointment Time Slots ("Окошки")
- **Pills:** Compact rounded-full badges (`px-4 py-2 text-sm font-medium`).
- **Available:** Background `#F3F0FF`, text `#7C5CFC`, subtle hover border `rgba(124, 92, 252, 0.2)`.
- **Selected:** Solid background `#7C5CFC`, text `#FFFFFF`.
- **Booked/Disabled:** Background `rgba(0, 0, 0, 0.03)`, text `#D1D5DB`, crossed through or dimmed.

### Interactive Category Chips
- Inline horizontal rail of pill chips (`rounded-full px-4 py-2.5`). Unselected chips use pure white with faint borders; selected chips use `#121316` background with white text, or accent lilac with soft icon illumination.

### Master Service Card
- Elevated white surface (`rounded-3xl p-4 shadow-sm`).
- Features author row with avatar, verified lilac badge, rating star in warm amber, horizontal portfolio preview with rounded-xl thumbnails, and a bottom row displaying next available "Окошко" time slot.

### Floating Action / Booking Bar
- Sticky bottom pill dock suspended over content.
- Glassmorphic container (`backdrop-blur-xl bg-white/80 border border-white/60 p-2 pl-5 rounded-full mx-4 shadow-lg`).
- Displays total service price on the left and a prominent action button ("Записаться") on the right in solid violet.