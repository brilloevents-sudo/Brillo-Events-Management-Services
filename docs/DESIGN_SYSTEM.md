# Brillo Events Santa Operations Hub — Design System Specification

**Version:** 2.0.0  
**Authority:** *Brillo Events Santa Operations Hub Full UI/UX Codex Master Prompt*

---

## 1. Visual Direction & Brand Philosophy

The visual language balances **editorial prestige** with **operational clarity**. It reflects Brillo Events’ reputation as the premier holiday talent agency in the Philippines without resorting to cartoonish, novelty holiday themes.

```
+---------------------------------------------------------------------------------+
| SIDEBAR (Fixed / Collapsible)                 | WORKSPACE CANVAS                |
| Background: Deep Charcoal (#171A18)           | Background: Warm Canvas (#F6F3EC)|
| Surface: Dark Panel (#202421)                | Surface: Crisp Ivory (#FFFEFB)  |
| Text: Muted Silver / White                    | Text: Deep Slate (#252824)      |
| Accents: Muted Gold (#B99A5B)                 | Primary Action: Crimson (#A92F3A)|
+---------------------------------------------------------------------------------+
```

---

## 2. Core Color Palette & Design Tokens

### 2.1 Brand & Neutral Tokens
| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| `--color-charcoal` | `#171A18` | Master sidebar background, navigation container |
| `--color-dark-panel` | `#202421` | Sidebar active item, dark card background |
| `--color-warm-canvas`| `#F6F3EC` | Admin workspace main canvas background |
| `--color-surface` | `#FFFEFB` | Data cards, tables, modal surfaces, form inputs |
| `--color-surface-hover` | `#F2EDE2` | Table row hover, list item hover |
| `--color-muted-gold` | `#B99A5B` | Brand highlights, selected tabs, star ratings, badges |
| `--color-gold-hover` | `#9F8349` | Gold button hover state |
| `--color-crimson` | `#A92F3A` | Primary CTA, urgent non-destructive action, high priority |
| `--color-crimson-hover`| `#8E252F` | Primary button hover |
| `--color-body` | `#252824` | Primary body text, headings in warm canvas |
| `--color-muted-text` | `#6B706C` | Supporting labels, secondary captions, table headers |
| `--color-border` | `#E2DED4` | Dividers, card borders, table row borders |
| `--color-border-dark`| `#2C312D` | Sidebar dividers and dark card borders |

### 2.2 Semantic Status Palette
> [!IMPORTANT]
> **No state may be communicated by color alone.** Every status indicator must combine a distinctive text label with a semantic icon or pattern.

| Status | Background | Text Color | Border Color | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Secured / Verified** | `#EBF7EE` | `#1B6330` | `#B7E4C7` | `CheckCircle2` |
| **Hold / Review** | `#FFF9E6` | `#8C6207` | `#FDE047` | `Clock` |
| **Awaiting Staff** | `#F3E8FF` | `#6B21A8` | `#D8B4FE` | `AlertCircle` |
| **Conflict / Alert** | `#FFF1F2` | `#9F1239` | `#FECDD3` | `AlertTriangle` |
| **Expired / Closed** | `#F3F4F6` | `#4B5563` | `#E5E7EB` | `Archive` |

---

## 3. Typography Scale

### 3.1 Font Families
- **Display Serif:** `Playfair Display`, `Georgia`, serif (Used for major page titles, hero headers, modal titles).
- **Interface Sans:** `Inter`, `system-ui`, `-apple-system`, sans-serif (Used for body text, tables, forms, control buttons).
- **Metadata Monospace:** `JetBrains Mono`, `ui-monospace`, monospace (Used for booking IDs, currency numbers, cell coordinates, timestamps).

### 3.2 Hierarchy
| Level | Font Family | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title** | Serif | 28px / 1.75rem | 700 Bold | 1.2 | Top of workspace pages |
| **Section Header** | Serif | 20px / 1.25rem | 600 SemiBold | 1.3 | Card group headings |
| **Uppercase Label**| Sans / Mono | 11px / 0.6875rem | 700 Bold | 1.0 | Small section tracking (`tracking-wider`) |
| **Body Primary** | Sans | 14px / 0.875rem | 400 Regular | 1.5 | Standard text, table rows |
| **Body Strong** | Sans | 14px / 0.875rem | 600 SemiBold | 1.5 | Table cell emphasis, user names |
| **Caption / Meta** | Sans | 12px / 0.75rem | 500 Medium | 1.4 | Helper text, secondary timestamps |

---

## 4. Component Standards & Controls

### 4.1 Button Hierarchy
- **Primary Action:**
  ```css
  bg-[#A92F3A] hover:bg-[#8E252F] text-white font-medium px-4 py-2 rounded-lg shadow-sm transition active:scale-[0.99]
  ```
- **Secondary Neutral:**
  ```css
  bg-[#FFFEFB] hover:bg-[#F6F3EC] text-[#252824] border border-[#E2DED4] font-medium px-3.5 py-2 rounded-lg transition
  ```
- **Gold Accent:**
  ```css
  bg-[#B99A5B] hover:bg-[#9F8349] text-white font-medium px-3.5 py-2 rounded-lg transition
  ```
- **Ghost / Tertiary:**
  ```css
  hover:bg-[#F2EDE2] text-[#6B706C] hover:text-[#252824] px-2.5 py-1.5 rounded-md transition
  ```

### 4.2 Form Inputs & Focus States
- **Standard Input:**
  ```css
  bg-[#FFFEFB] border border-[#E2DED4] text-[#252824] placeholder-[#6B706C]/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B99A5B] focus:border-[#B99A5B] transition
  ```
- **Required Indicator:** Red asterisk with accessible `aria-required="true"`.
- **Error Feedback:** Red border (`border-crimson-600`) with assistive text below input linked via `aria-describedby`.

### 4.3 Data Table Specifications
- **Header:** Uppercase, tracking-wider, `bg-[#F6F3EC] text-[#6B706C] text-xs font-semibold py-3 px-4 border-b border-[#E2DED4]`.
- **Rows:** Alternating subtle ivory surfaces, `hover:bg-[#F2EDE2] transition py-3 px-4 border-b border-[#E2DED4]/70`.
- **Financial Alignment:** All numeric sums (PHP / ₱) must be **right-aligned** using tabular numbers.

---

## 5. Layout Grid & Elevation

- **Sidebar Width:** 260px fixed desktop (collapsible to 68px icon-only).
- **Workspace Max Width:** 1440px centered for standard operational forms; fluid full-width for complex scheduling calendars and 12-column financial tables.
- **Corner Radii:**
  - Small elements / badges: 4px (`rounded`)
  - Cards, inputs, buttons: 8px (`rounded-lg`)
  - Modals & Drawers: 12px (`rounded-xl`)
- **Shadow Scale:**
  - `shadow-sm`: Subtle border lift for buttons
  - `shadow-md`: Cards and dropdown menus
  - `shadow-xl`: Modal dialogs and quick-action slide-over drawers

---

## 6. Accessibility & Motion Guidelines

- **Focus Ring:** Explicit 2px focus ring with 2px offset (`outline: 2px solid #B99A5B; outline-offset: 2px;`).
- **Motion Timing:** Fast, purposeful transitions between 150ms and 200ms (`ease-out`). No bouncing or celebratory confetti.
- **Reduced Motion:** All transitions drop to 0ms when `prefers-reduced-motion: reduce` is enabled in user OS settings.
