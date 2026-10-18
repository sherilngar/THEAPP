# SO/ AI Concierge · proposal demo

A presentation-ready demo of an AI concierge for **SO/ Al Marjan Island, Ras Al Khaimah** (257 rooms). Guests write in their own words; the concierge answers from approved hotel information, turns each message into tickets for the right department, keeps the guest updated, asks for a rating, and hands over to a person whenever it should.

Prepared by Ahmed Elsayyad, Duty Manager, for the General Manager, senior management and IT.

> **This is a proposal demo.** It runs entirely in the browser on GitHub Pages: a scripted offline concierge stands in for Claude, and all data stays on the device. Hotel details marked **Sample content** are placeholders.

## Screens

| Route            | What it shows                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#/`             | Landing page with entry points, a QR code for the guest app and “How it works”                                                                           |
| `#/guest`        | Mobile guest app: chat, services grid, live request tracker, English and Arabic (right to left)                                                          |
| `#/staff`        | Staff board: 12 department tabs, timer rings, accept / on the way / done / reassign / notes, escalation, search and filters, ticket drawer with the chat |
| `#/insights`     | Management view: open vs completed, time to accept and complete, escalations, top 10 requests, ratings, dining orders                                    |
| `#/present`      | Split screen (phone + board) with a guided six-step demo and a reset button                                                                              |
| `#/architecture` | For IT: animated layer diagram, security notes, three-phase rollout                                                                                      |
| `#/admin`        | Settings: response standards, outlet hours, full knowledge-base editor, reset demo data                                                                  |

Demo access:

- **Staff board:** any department, PIN `1234`.
- **Settings:** password `so-admin-2026`. This only keeps casual viewers out. A static site cannot protect anything for real; the pilot uses staff single sign-on.

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev            # http://localhost:5173
```

| Command                                                       | Purpose                                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run build`                                               | Type-check and build to `dist/`                                                                              |
| `npm run preview`                                             | Serve the production build                                                                                   |
| `npm test`                                                    | Unit tests (Vitest): routing, escalation timing, tool validation, data masking, English and Arabic scenarios |
| `npm run e2e`                                                 | End-to-end tests (Playwright): every guided-demo scenario, mobile and desktop viewports, English and Arabic  |
| `npm run lint` / `npm run format:check` / `npm run typecheck` | ESLint, Prettier, TypeScript strict                                                                          |
| `npm run qr -- <url>`                                         | Write a printable QR code for the guest app to `docs/guest-qr.png`                                           |

## Publish on GitHub Pages

1. Create the repository (for example `so-ai-concierge`) and push `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/pages.yml` (tests, build, deploy). The site appears at `https://<your-user>.github.io/so-ai-concierge/`.
4. Make the QR code for the printed handout: `npm run qr -- https://<your-user>.github.io/so-ai-concierge/#/guest`.

The app uses hash routes and relative asset paths, so it works from any Pages sub-path without extra configuration. `.github/workflows/ci.yml` runs the full quality checks on every pull request.

GitHub Pages on a free account needs a public repository. Nothing secret is in this repository.

## How the offline concierge works

`src/ai/engine.ts` is a deterministic engine that does what the live Claude tools will do, so the demo never depends on a network:

- **Free text, several requests:** “The AC is loud, send two towels and book a table for 8” becomes an Engineering ticket (detail: noisy), a Housekeeping ticket (2 towels) and a booking that asks for the one missing detail (party size).
- **Catalogue:** every item in the brief's request catalogue (`src/domain/catalogue.ts`) is both a services-grid option and a phrase it understands, in English and Arabic (including Arabic dual forms such as منشفتين = two towels).
- **Never guesses:** answers come only from `src/data/knowledge.json`; unknown questions go to the ambassador.
- **People for sensitive matters:** complaints, unhappy tone, medical, security, refunds, compensation, valuables and other guests are handed to a person. Emergencies show guidance and alert Security and the Duty Manager.
- **Dining orders** are read back, allergies flagged, and placed only after a clear “yes”.
- **Privacy:** card, passport and Emirates ID numbers are masked before storage, with a reminder to the guest.
- **Prompt injection** attempts are declined.
- **Validation:** every request passes the same zod tool schemas (`src/domain/tools.ts`) the live AI function will use, before a ticket exists.

Replies are in English or Arabic. Other languages are detected and answered in English with a note; the live AI answers in any language.

## Data and sync

`src/store/store.ts` keeps state in `localStorage` and mirrors it to every open tab with `BroadcastChannel`, using revision numbers so tabs never overwrite newer data. One tab (chosen with the Web Locks API) runs the escalation clock. Present mode shows the phone and the board in one window; to use a real phone and a laptop at the same time, the pilot needs the shared database (phase 2).

## Phase 2: real AI and live data across devices

Prepared but **not yet built** in this repository:

- `supabase/migrations/0001_pilot_schema.sql`: the pilot database schema with row-level security and realtime.
- `.env.example`: the variables the pilot needs, and where each may live.

Still to build for the pilot: a serverless function that calls Claude (`claude-haiku-5-5` by default, `claude-sonnet-5-5` optional) with the same tools, streaming and rate limits, and a store adapter that reads and writes Supabase instead of `localStorage`. That needs a host with server functions (for example Netlify), because the AI key must never reach the browser; GitHub Pages cannot do this.

## Sample content and what still needs real hotel data

The only confirmed facts are the location (Al Marjan Island, Ras Al Khaimah, UAE) and 257 rooms. Everything else is a placeholder:

- Outlet names, types, opening hours and dress codes (four generic outlets)
- Check-in and check-out times, late check-out, pets, smoking and dress-code policies
- Wi-Fi network name and sign-in method
- Spa hours, treatment list, in-room massage availability; gym, classes, sauna and steam hours
- Pool and beach hours, towels, cabanas; kids' club hours and ages, babysitting, activity schedule
- Transport options and parking
- In-room dining hours and the full menu (dishes, dietary tags, allergens, options). No prices are shown.
- Contact points and emergency instructions
- Staff names (Nadia, Maria, Rajesh and others), the sample guest (Sarah Mitchell, room 1207) and other rooms
- Response standards for Laundry, Recreation, IT & AV and Duty Manager (the brief did not define them)
- Seven days of generated history on Insights (toggle “Live demo only” to hide it)

Edit all of it in Settings (`#/admin`) or `src/data/knowledge.json`, and set `"sample": false` on each section once it is approved. The “Sample content” badge disappears when nothing sample remains.

## Brand

The logo is the file supplied by the hotel (`public/brand/so-logo.jpg`), with its white margins trimmed for display (`so-logo-trimmed.webp`); it is never redrawn. On dark backgrounds the same file is shown inverted as an interim measure. Replace both with the official `so-logo.svg` and `so-logo-white.svg` when available and update `src/components/ui/Logo.tsx`. Colours and type follow the brief's palette (ivory, sand, warm black, bronze; Cormorant Garamond and Rubik, with Noto Naskh Arabic for Arabic) until official brand guidelines are provided.

## Running cost (approximate)

**This demo on GitHub Pages: no cost.** No AI calls, no database.

For the phase 2 pilot, AI cost from Anthropic's published API prices (Claude Haiku 5.5: $0.10 per million input tokens, $0.50 per million output tokens; Claude Sonnet 5.5: $2 and $10). The assumption is about 6,000 input tokens per turn (instructions, knowledge base and tools) and 300 output tokens, before prompt-caching savings:

| Usage                                                            | Turns per month | Haiku 5.5 | Sonnet 5.5 |
| ---------------------------------------------------------------- | --------------- | --------- | ---------- |
| Demo and pilot testing (300 chats × 8 turns)                     | about 2,400     | about $2  | about $36  |
| Whole hotel (about 180 occupied rooms × 2 chats a day × 6 turns) | about 65,000    | about $50 | about $970 |

Prompt caching of the fixed instructions and knowledge base reduces the input share substantially. Database and hosting for a pilot usually fit within the free tiers of Supabase and Netlify; check their current pricing pages before committing, as plans change.

## Quality checks (latest run)

- TypeScript strict, ESLint and Prettier clean; no console errors in any tested flow
- 32 unit tests and 21 end-to-end tests passing (Present mode runs on desktop only)
- Lighthouse (mobile) on `/` and `/guest`: Performance 91, Accessibility 100, Best Practices 100, SEO 100
- Respects `prefers-reduced-motion`; keyboard navigable with visible focus; live regions for new messages

## Project structure

```
src/
  ai/           offline concierge engine, text understanding, knowledge-base answers
  domain/       types, departments, request catalogue, escalation, tool schemas, data masking
  data/         knowledge.json (sample), knowledge schema, demo guest and sample history
  store/        local store synced across tabs
  components/   guest app, chat cards, staff board, shared UI
  pages/        one file per route
  demo/         guided demo script used by Present mode
tests/unit      Vitest
tests/e2e       Playwright
supabase/       pilot schema (phase 2)
```
