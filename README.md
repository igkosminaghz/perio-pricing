# Perio Atlas

Interactive browser app for **optimal periodontal pricelist design** — a market atlas of published fees from Croatia and neighbouring countries, plus a live two-column clinic list (Economic / High-end) that you can edit, stack, print, and export.

Three modes live in **the same app** (no reload):

| Mode | What it is |
| --- | --- |
| **Pricelist / Atlas** | Market dashboard, editable two-column pricelist, treatment pathways, procedure stacks |
| **Clinical timeline** | Visit-by-visit protocol planner (severity → chair time, fees, €/hour) |
| **Membership** | Subscription / retainer tiers priced from your live list |

Language: **Croatian / English** toggle in the header. Default is Croatian when the browser language starts with `hr`, otherwise English. Choice is stored in `localStorage`.

This is a static Vite + React + TypeScript site. No backend. Edits persist in `localStorage`.

**Planning only.** Fees, stacks and €/chair-hour figures are for clinic planning — not a diagnosis, treatment plan, or invoice.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

The compiled site is in `dist/` (`base: './'` so it also works as a downloadable folder). Zip `dist/` or this repo for an offline copy.

## Deploy on Render (static site)

`render.yaml` is a Blueprint: build `npm install && npm run build`, publish `dist`, SPA rewrite to `index.html`.

1. Push this folder to a Git repository (GitHub, GitLab, or Bitbucket).
2. In [Render](https://dashboard.render.com), **New → Blueprint** (or **New → Static Site**) and connect the repo.
3. Use these settings if you create the service by hand:

| Setting | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

Custom domain: add it under the static site’s **Settings**.

## How to use the app

### Modes and language

- Header **segmented control** switches Atlas / Clinical timeline / Membership without leaving the page.
- **HR | EN** switches the whole chrome, dashboard, pricelist labels, about/sources, and procedure names.

### Prices stay editable

- Edit any Economic or High-end field. Totals, packages, stacks, planner and membership all use those live fees.
- **Reset** on a row restores the recommended fee. Header **Reset** restores recommended fees, default packages and stacks but keeps the clinic name.

### Stack procedures

In the pricelist, tick two or more lines. The dock at the bottom shows live totals, summed chair time, and €/chair-hour for the stack vs the same items billed alone.

- **Same-session stack** — one chair sitting (e.g. exam + photos + GBT), optional discount.
- **Sequential stack** — a package across visits.

Saved stacks appear under **Stacks** (below Pathways) and persist in this browser.

### ROI (every mode)

Each procedure and stack shows **chair minutes**, **net after materials**, and **€ per chair-hour**. Longer visits that still earn more per hour than the median are highlighted. The same economics appear in the planner and membership views.

Formula: `(price − material) / (minutes / 60)`.

### Other Atlas tools

- **Clinic identity:** name, city and tagline on the printed pricelist.
- **Add procedure:** custom lines stored in this browser (include minutes and materials so ROI works).
- **Combinations:** Pathways — percent or fixed euro discount; the same procedure can appear more than once (e.g. four quadrants).
- **Print / PDF:** browser print dialog → **Save as PDF**. Chrome/Edge produce the cleanest brochure.
- **Export JSON:** clinic identity, overrides, custom procedures, packages and stacks. **Import JSON** restores them on another machine.

Data lives in:

- `src/data/clinics.ts` — clinics and URLs
- `src/data/procedures.ts` — procedure catalogue and recommended fees
- `src/data/observations.ts` — sourced market prices
- `src/data/bundles.ts` — default treatment pathways
- `src/data/protocols.ts` — clinical timeline logic
- `src/data/subscriptions.ts` — membership tier definitions

## Colour palette

| Role | Hex |
| --- | --- |
| Pine / primary | `#14352f` |
| Surgical teal | `#1c4f48` |
| Sage | `#8aa396` |
| Ivory background | `#f4efe6` |
| Stone | `#e6dfd2` |
| Champagne gold | `#c4a574` |
| Bronze | `#8f7048` |
| Charcoal text | `#2a2723` |

Headings: Cormorant Garamond. Interface: Outfit.

## Data coverage & honesty

Public pricelists were collected on **21 August 2026** from Croatia (Zagreb, Rijeka and other published Croatian lists), Slovenia, Italy, Hungary and Turkey, with Austria (AHR orientation fees), Bosnia and Serbia as context.

Hungarian forint amounts use the ECB reference rate **1 EUR = 365.10 HUF (20 Aug 2026)**. BAM is pegged. RSD uses an approximate mid-market rate documented in the app.

**Estimated or tariff (not a clinic invoice):** Italian 2026 nomenclatore, Austrian AHR, EsteQuality ranges (midpoints), and recommended fees for procedures that never appeared as named lines (GEM 21S-type biologics, aPDT, named tunnel technique, stand-alone peri-implant mucositis, and other cutting-edge lines). Those rows are tagged in the UI.

This app is a planning tool, not a diagnosis or an invoice. Always confirm a live clinical quote.
