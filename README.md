# OmniRefund

Refund router for TON merchants, powered by STON.fi Omniston.

## Problem

Crypto payments are easy to accept, but hard to reverse. Merchants still need refunds, partial refunds, cancellations and correction flows after a customer has already paid.

## Solution

OmniRefund lets a TON merchant enter a real refund amount, paste a real customer wallet, request a live STON.fi Omniston RFQ, connect a TON wallet and generate a transparent receipt from the live quote or from a signed wallet transaction.

## Hackathon Track

STON.fi track.

The app uses:

- `@ston-fi/api` to load TON assets from STON.fi API.
- `@ston-fi/omniston-sdk-react` / Omniston v1beta8 to request live RFQ quotes.
- `omniston.buildTransfer()` to build a real TON transaction payload from the quote.
- `@tonconnect/ui-react` to connect a wallet and open the transaction in the wallet.

## What is real in this MVP

- User enters the refund amount manually.
- User selects refund token and output token manually.
- User enters the real customer recipient address manually.
- Token list is loaded from STON.fi API, with known TON/USDT/STON defaults for convenience.
- Quote is requested through live Omniston RFQ.
- Quote card shows quote ID, RFQ ID, resolver, deadline, expected output and fees.
- Wallet connection is live through TON Connect.
- The real transaction payload is built through Omniston `buildTransfer()`.
- If the wallet signs the transaction, the receipt stores the returned BOC hash.

## What is still MVP/demo

- The dashboard order is demo context.
- There is no merchant login.
- There is no database; receipts are stored in localStorage.
- Settlement tracking after signing is not implemented yet.

## Features

- Landing page
- Live local dashboard with accumulated receipt history
- Editable refund form
- Real recipient address input
- STON.fi API token loading
- Live STON.fi Omniston RFQ
- TON Connect wallet connection
- Omniston transaction build
- Wallet signing through TON Connect
- Quote receipt and signed transaction receipt
- Copy receipt button

## Tech Stack

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- `@ston-fi/api`
- `@ston-fi/omniston-sdk`
- `@ston-fi/omniston-sdk-react`
- `@tonconnect/ui-react`
- `@ton/core`
- localStorage
- pnpm

## Demo Flow

1. Open the landing page.
2. Open the demo dashboard.
3. Open the refund flow.
4. Enter refund amount.
5. Select refund token and output token.
6. Paste customer TON wallet address.
7. Click **Get Live Omniston Quote**.
8. Review quote ID, RFQ ID, resolver, output amount and fees.
9. Connect a TON wallet.
10. Either save a live quote receipt or click **Build & Sign Real Refund Swap**.
11. If signed, view receipt with BOC hash.

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Update these values after publishing the app to a public HTTPS domain:

```env
NEXT_PUBLIC_APP_URL=https://your-public-domain.example
NEXT_PUBLIC_TONCONNECT_MANIFEST_URL=https://your-public-domain.example/tonconnect-manifest.json
NEXT_PUBLIC_OMNISTON_API_URL=wss://omni-ws.ston.fi
```

Also update:

```txt
public/tonconnect-manifest.json
```

## Run Locally

Install dependencies with pnpm:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Publish

1. Push this project to a public GitHub repository.
2. Publish it to any public HTTPS hosting that supports Next.js.
3. Set environment variables from `.env.example`.
4. Update `public/tonconnect-manifest.json` to your public domain.
5. Rebuild and open the public URL.

## Submission Description

OmniRefund is a refund router for TON merchants, powered by STON.fi Omniston.

Most crypto projects focus on accepting payments. OmniRefund focuses on what happens after payment: cancellations, corrections, partial refunds and transparent receipts.

The MVP shows a paid order as merchant context, then lets the merchant enter a real amount and recipient, request a live Omniston quote, connect a TON wallet, build a transaction payload through Omniston and create a receipt that preserves quote and wallet-signing metadata.

## Limitations

This is a hackathon MVP.

- The dashboard order is demo context.
- Receipts are stored in localStorage.
- Settlement tracking after wallet signing is planned as a future upgrade.
- OmniRefund never holds funds.


## Dashboard behavior

The dashboard is not a database-backed merchant admin panel. It is a local browser workspace for the hackathon demo.

- It shows the connected wallet status.
- It shows Omniston RFQ + TON Connect as the active integrations.
- It saves every quote receipt or signed wallet receipt into `localStorage`.
- It displays recent receipts as an accumulated local history.
- It can clear the local history for a clean demo run.

This keeps the MVP simple while proving that the user can create multiple custom refund receipts from live Omniston quotes.
