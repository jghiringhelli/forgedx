# Section 03 — Design System

## 3.1 Theme

Dark mode by default. Tailwind config: `darkMode: ["class"]` with `.dark` on `<html>`. PragmaWorks brand color: **Forge Orange** (`#F97316` — Tailwind orange-500 family) as accent, replacing Vairix Green.

## 3.2 Color Palette — PragmaWorks Forge Orange

| Token | Hex |
|-------|-----|
| `forge-50` | `#fff7ed` |
| `forge-100` | `#ffedd5` |
| `forge-200` | `#fed7aa` |
| `forge-300` | `#fdba74` |
| `forge-400` | `#fb923c` |
| `forge-500` (DEFAULT) | `#f97316` |
| `forge-600` | `#ea580c` |
| `forge-700` | `#c2410c` |
| `forge-800` | `#9a3412` |
| `forge-900` | `#7c2d12` |
| `forge-950` | `#431407` |

## 3.3 CSS Variables — Dark Mode (primary)

```css
:root .dark {
  --background: 220 13% 5%;           /* Very dark — page background */
  --foreground: 210 40% 98%;          /* Near-white — body text */
  --card: 220 13% 8%;                 /* Card surfaces */
  --card-foreground: 210 40% 98%;
  --popover: 220 13% 8%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;             /* Light — primary buttons */
  --primary-foreground: 220 13% 5%;
  --secondary: 220 10% 14%;           /* Dark gray — secondary surfaces */
  --secondary-foreground: 210 40% 98%;
  --muted: 220 10% 14%;
  --muted-foreground: 215 20% 65%;    /* Medium gray — secondary text */
  --accent: 25 95% 53%;               /* Forge orange — accent/CTA */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 220 10% 14%;
  --input: 220 10% 14%;
  --ring: 25 95% 53%;                 /* Forge orange — focus rings */
  --radius: 0.5rem;
}
```

## 3.4 GS Score Color Semantics

| Score Range | Color | Tailwind Class | Meaning |
|-------------|-------|----------------|---------|
| 0–4 | Red | `text-red-400` | Critical — immediate attention needed |
| 5–8 | Amber | `text-amber-400` | Developing — significant gaps |
| 9–11 | Yellow-Green | `text-yellow-400` | Progressing — foundational GS present |
| 12–14 | Green | `text-green-400` | Strong — GS discipline mature |

## 3.5 shadcn/ui Configuration

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

## 3.6 Typography

- **Font:** Geist (via `next/font/google` or local), assigned to `--font-sans`; Geist Mono for code/scores
- **Body class:** `font-sans antialiased`

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem | Descriptions, error messages |
| `text-sm` | 0.875rem | Labels, card titles, secondary text |
| `text-base` | 1rem | Body text, inputs |
| `text-lg` | 1.125rem | Section headers |
| `text-2xl` | 1.5rem | Metric values |
| `text-4xl` | 2.25rem | GS score display (hero) |

## 3.7 Component Patterns

### GS Score Badge
```
bg-[score-color]/20 text-[score-color] border-[score-color]/40 rounded-lg px-3 py-1.5
font-mono text-2xl font-bold
```
Displays as `12/14` with the color from §3.4.

### Hypothesis Cards
- **Container:** `border-slate-700 bg-slate-900/50 rounded-xl`
- **Header:** pathology name + severity badge + evidence strength badge
- **Evidence level colors:** weak=red, moderate=amber, strong=yellow-green, corroborated=green

### Severity Badges
| Severity | Colors |
|----------|--------|
| `critical` | `bg-red-500/20 text-red-400 border-red-500/30` |
| `high` | `bg-orange-500/20 text-orange-400 border-orange-500/30` |
| `medium` | `bg-yellow-500/20 text-yellow-400 border-yellow-500/30` |
| `low` | `bg-slate-500/20 text-slate-400 border-slate-500/30` |

### Funnel CTA Cards (Public)
- **Skool CTA:** `bg-forge-500 text-white hover:bg-forge-600 rounded-xl p-6 shadow-lg shadow-forge-500/25`
- **Workshop CTA:** `border border-forge-500/40 text-forge-400 hover:bg-forge-500/10 rounded-xl p-6`

### Logo
```
font-mono text-lg font-bold text-forge-500
```
Text: **ForgeDX** with tagline: "Generative Specification Diagnostic"

## 3.8 Icon System

Use `lucide-react` for all icons.

| Context | Size |
|---------|------|
| Inline / metric cards | `h-4 w-4` |
| Navigation | `h-5 w-5` |
| Hero / empty states | `h-12 w-12` |

## 3.9 GS Radar Chart (7 Properties)

Recharts `RadarChart` with 7 axes, one per GS property (Self-describing, Bounded, Verifiable, Defended, Auditable, Composable, Executable). Score range 0–2 per axis.

- **Fill color:** `forge-500/20`
- **Stroke color:** `forge-500`
- **Grid color:** `slate-700`
- **Label color:** `slate-400`
