# Kashaf Web Temp

Single-page responsive landing website for Kashaf trial registration with Backendless integration.

## Features

- One landing page with app-matching theme + logo.
- Trial details section (Name, Date/Time, Location, Price) fetched by `VITE_TRIAL_OBJECT_ID`.
- Player apply form:
  - `email`, `name`, `dob`, `profile pic`, `location`, `height`, `weight`, `dominant foot`, `position`.
  - Submits to Backendless using existing service patterns.
  - Any non-supplied fields are sent as empty/dummy values.
- After successful submit, form is replaced by:
  - InstaPay QR + link
  - WhatsApp contact
  - Payment screenshot instruction
- Hidden owner mode:
  - No visible login button.
  - Double-click (desktop) or long-press (mobile) on top-right club logo opens login modal.
  - Club owner can edit trial details and review applications in a table.
  - Paid checkbox updates `paymentStatus` through backend service.

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required values:

- `VITE_BACKENDLESS_APP_ID`
- `VITE_BACKENDLESS_API_KEY`
- `VITE_BACKENDLESS_SERVER_URL`
- `VITE_TRIAL_OBJECT_ID`
- `VITE_DUMMY_PASSWORD`

## Local Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

This project includes `vercel.json` with SPA rewrite support.

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Add all `VITE_*` env vars in Vercel Project Settings.
