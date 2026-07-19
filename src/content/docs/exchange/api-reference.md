---
title: "Exchange API Reference"
---

REST + WebSocket API for the Atlas critical-minerals perpetuals exchange. The API
is **dYdX-v4-shaped**: versioned routes live under `/v4`, and most market-data
routes also have legacy unversioned aliases (e.g. `/markets` for
`/v4/perpetualMarkets`).

:::note[Where this lives in the product]

The exchange ships its own public API documentation page at
**`/trade/api.html`** (the "API" item in the product nav). This page mirrors and
extends that content; the product page is the user-facing source.

:::
## Conventions

- **Base URL** — the environment's origin (production or staging), routes under
  `/v4`. The product docs page renders the origin it is served from.
- **Authentication** — authenticated routes take a **session token in the
  `X-API-Key` header**, obtained from `/v4/auth/email-login` or
  `/v4/auth/email-signup`. Public market-data routes need no auth.
- **Units** — all cash amounts are USDC; sizes are in each market's native unit
  (`sizeUnit`: tonnes, lb, or troy oz; `quoteUnit` e.g. `USD/tonne`).
- **Errors** — JSON bodies; rate-limit rejections are `429` with `Retry-After`.

```bash
curl -H "X-API-Key: $TOKEN" $BASE/v4/auth/me
```

---

## Market data (public)

### `GET /v4/perpetualMarkets`

All markets with mark/oracle price, 24h stats, funding, open interest, best
bid/ask, tick/step size, and (for the basket markets) constituents.

```json
{ "markets": { "NI-USD": {
   "markPrice": "17521.02", "oraclePrice": "17790.0", "priceChange24H": "-2.54",
   "volume24H": "3132179.63", "openInterest": "8639845.93",
   "nextFundingRate": "-0.0005", "atlasSpot": "17687.16",
   "tickSize": "0.01", "stepSize": "0.001", "sizeUnit": "t",
   "quoteUnit": "USD/tonne", "maxLeverage": 5 } } }
```

The ten markets: **LI-USD, CO-USD, NI-USD, CU-USD, AL-USD, AG-USD, ZN-USD** plus
three composite indices **REE-USD** (rare earths), **AI-USD** (AI
critical-minerals basket), **BATT-USD** (battery metals). Max leverage 5×; initial
margin fraction 0.2, maintenance 0.1.

:::note[Reference and funding fields follow the licensed/delayed model]

The reference-price and funding-derived fields here — `oraclePrice`,
`nextFundingRate`, and `atlasSpot` — are part of the licensed reference-data
product. Unlicensed callers receive them on the standard delay; licensees
receive them in real time. `markPrice`, trade, candle, and order-book fields are
always real-time. See [Data delay & licensing](#data-delay-licensing).

:::

### `GET /v4/orderbooks/perpetualMarket/{market}`

Resting depth for a market: `{ asks: [...], bids: [...] }`, each level
`{ price, size }`.

### `GET /v4/trades/perpetualMarket/{market}`

Recent prints for a market (also `GET /v4/trades` across markets).

```json
{ "id": "69ca…", "side": "BUY", "price": "17523.40", "size": "0.002",
  "liquiditySource": "MAKER", "createdAt": "2026-06-12T22:59:25Z" }
```

### `GET /v4/candles/perpetualMarkets/{market}`

OHLCV candles; `?resolution=` one of `1MIN 5MINS 15MINS 1HOUR 4HOURS 1DAY`,
`?limit=` for depth. History spans back through 2025.

### `GET /v4/oracle` · `GET /v4/atlas-spot`

`/v4/oracle` returns reference prices per market; `/v4/atlas-spot` returns the
perp-implied spot (mark − funding basis) with reference and funding fields
(`referenceSource: "PRA-composite"`). Both are subject to the licensing delay —
see [Data delay & licensing](#data-delay-licensing).

---

## Authentication

### `POST /v4/auth/email-signup` · `POST /v4/auth/email-login`

Body `{ email, password }` → `{ sessionToken, accountId, email }` (signup also
returns a one-time `recoveryPhrase`). Use `sessionToken` as `X-API-Key`.

### `GET /v4/auth/me` *(auth)*

Current user + account:

```json
{ "account": { "balance": "9999.09", "equity": "9998.82",
  "availableBalance": "9393.99", "marginUsed": "604.82",
  "unrealizedPnl": "-0.27" } }
```

Wallet-based auth is also supported: `GET /v4/auth/challenge` issues a signing
challenge, `POST /v4/auth/wallet-login` verifies the signature.

:::note[Retired routes]

The original `POST /v4/auth/signup` and `POST /v4/auth/login` (which minted
unauthenticated demo accounts) are retired and return **410 Gone**.

:::
---

## Account *(auth)*

- `GET /v4/perpetualPositions` — open positions:
  `{ market, side, size, entryPrice, margin, leverage, liquidationPrice }`.
- `GET /v4/orders` — open/pending orders incl.
  `type, price, triggerPrice, triggerDirection, reduceOnly, remaining, status`.

---

## Trading *(auth)*

### `POST /v4/orders`

Place an order. Rate-limited (60 per 10 s).

| Field | Type | Notes |
|---|---|---|
| `market` | string | e.g. `NI-USD` |
| `side` | string | `BUY` / `SELL` |
| `size` | number | in the market's native unit |
| `type` | string | `MARKET` / `LIMIT` / `STOP` |
| `price` | number | required for `LIMIT` |
| `leverage` | number | 1 … `maxLeverage` |
| `triggerPrice` | number | `STOP` only |
| `triggerDirection` | string | `above` / `below` (TP vs SL) |
| `reduceOnly` | bool | close-only (TP/SL) |

```json
{ "success": true, "trade": { "id": "…", "market": "NI-USD",
  "side": "BUY", "price": 17523.4, "size": 0.05, "status": "FILLED" } }
```

### `DELETE /v4/orders/{id}` · `POST /v4/orders/{id}/cancel`

Cancel a resting order (ownership-checked).

---

## Vault

- `GET /v4/vault` *(public)* — vault TVL, APY, share price, depositors; include
  `X-API-Key` to also get `userPosition`.
- `GET /v4/vault/history` *(public)* — NAV/share-price time series.
- `POST /v4/vault/deposit` *(auth)* — `{ amount }` mints shares at the live price.
- `POST /v4/vault/withdraw` *(auth)* — `{ amount }`, `{ shares }`, or
  `{ all: true }`.

---

## Growth

- `GET /v4/leaderboard` *(public)* — ranked traders by realised PnL / volume;
  `?metric=pnl|volume`, `?window=24h|7d|30d|all`. Accounts are pseudonymous
  (display handle, never email).
- `GET /v4/rewards` *(auth)* — points, tier, claimable balance, epoch breakdown.
- `GET /v4/referrals` *(auth)* — referral code, invitees, earned rebates.
- `GET /v4/notifications` *(auth)* — in-app notifications
  (`{ id, type, title, body, read, createdAt }`);
  `POST /v4/notifications/read` with `{ ids: [...] }` or `{ all: true }`.
- `GET /v4/portfolio/history` *(auth)* — account equity/PnL series;
  `?resolution=1HOUR|1DAY`, `?range=24h|7d|30d|all`.

---

## WebSocket

`WS /ws` *(public)* — live event stream at `wss://<origin>/ws`. Subscribe by
channel, optionally per market:

```json
{ "type": "subscribe", "channel": "orderbook", "market": "NI-USD" }
{ "type": "subscribe", "channel": "trade", "market": "NI-USD" }
{ "type": "subscribe", "channel": "liquidation" }
```

Channels: `trade` (new prints), `orderbook` (depth snapshots per market),
`liquidation` (forced closes, all markets). Unsubscribe with the same shape and
`"type": "unsubscribe"`. Server messages carry a `type` matching the channel:

```json
{ "type": "trade", "market": "NI-USD", "side": "BUY",
  "price": "17523.4", "size": "0.05", "time": "…" }
{ "type": "orderbook", "market": "NI-USD",
  "asks": [["17525.0","0.4"]], "bids": [["17520.0","0.6"]] }
{ "type": "liquidation", "market": "NI-USD", "side": "SELL",
  "size": "1.20", "price": "17480.0", "time": "…" }
```

Prefer the WebSocket stream over polling market data.

---

## Rate limits

Per session token (authenticated routes) or per IP (public routes). Exceeding a
bucket returns `429 Too Many Requests` with a `Retry-After` header (seconds); back
off at least that long.

| Bucket | Limit | Applies to |
|---|---|---|
| `orders` | 60 / 10 s | `POST /v4/orders`, cancels |
| `read` | 100 / 10 s | public market-data + account reads |
| `auth` | 10 / 60 s | login / signup |

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3

{ "error": "rate_limited", "bucket": "orders", "retryAfter": 3 }
```

---

## Data delay & licensing

The reference oracle and Atlas-Spot prices are a **licensed data product**.
Unlicensed (public / unauthenticated) access to `/v4/oracle` and `/v4/atlas-spot`
is served on a **15-minute delay** (`delayed: true`, `delaySeconds: 900`, plus an
`asOf` timestamp). Licensees receive the real-time feed (`delayed: false`) using
their licensed key. Mark, trade, candle, and order-book data are always real-time
and not subject to the delay.

```json
{ "prices": { "LI-USD": "19790.0", "NI-USD": "16840.13", "…": "…" },
  "delayed": true, "delaySeconds": 900 }
```

---

## Full route map

The complete surface (~77 routes) as registered in `server_v2.py`, one line each.
Routes marked *(alias)* also exist without the `/v4` prefix.

### Health & config

| Route | Purpose |
|---|---|
| `GET /health` | Liveness + coarse counters (trades, accounts, WS clients, rail status) |
| `GET /v4/config` | Client config: taker fee rate, rail enablement, version |
| `GET /v4/height` *(alias)* | Block-height-shaped heartbeat (epoch-derived) |

### Market data

| Route | Purpose |
|---|---|
| `GET /v4/perpetualMarkets` *(alias `/markets`)* | All markets + stats |
| `GET /v4/orderbooks/perpetualMarket/{market}` *(alias `/orderbook/{market}`)* | Depth |
| `GET /v4/trades/perpetualMarket/{market}` *(alias `/trades/{market}`)* | Prints per market |
| `GET /v4/trades` *(alias)* | Recent prints, all markets |
| `GET /v4/candles/perpetualMarkets/{market}` *(alias `/candles/{market}`)* | OHLCV |
| `GET /v4/atlas-spot` | Perp-implied spot per market |
| `GET /v4/oracle` *(aliases `/oracle`, `/prices`)* | Reference prices (delayed publicly) |
| `GET /v4/oracle/health` *(staging build)* | Oracle self-check: anchor venue, ages, spreads, basket gap |
| `GET /v4/intelligence/feed` | News/intelligence feed |
| `GET /v4/leaderboard` | Public leaderboard |
| `WS /ws` | Realtime stream |

### Auth & identity

| Route | Purpose |
|---|---|
| `GET /v4/auth/challenge` | Wallet signing challenge |
| `GET /v4/auth/me` | Current user + account |
| `POST /v4/auth/email-signup` / `email-login` | Email auth → session token |
| `POST /v4/auth/signup` / `login` | Retired (410) |
| `POST /v4/auth/reset-password` | Reset via recovery phrase |
| `POST /v4/auth/change-password` | Change password (rate-limited) |
| `POST /v4/auth/recover` | Recovery-phrase flow |
| `POST /v4/auth/wallet-login` | Signature login |

### Wallet & accounts

| Route | Purpose |
|---|---|
| `GET /v4/wallet/sync` | Embedded-wallet state sync |
| `POST /v4/wallet/onchain-setup-complete` | Mark on-chain setup done |
| `POST /v4/wallet/claim-demo` | Claim demo funds (throttled) |
| `POST /v4/wallet/gas-topup` | Gas top-up |
| `POST /v4/accounts` *(alias `/account/create`)* | Create account |
| `GET /v4/addresses/{addr}` *(alias `/account/{addr}`)* | Account lookup |

### Trading & transfers

| Route | Purpose |
|---|---|
| `GET /v4/perpetualPositions` *(alias `/positions`)* | Open positions |
| `GET /v4/orders` | Open orders |
| `POST /v4/orders` *(alias `/order`)* | Place order |
| `DELETE /v4/orders/{id}` · `POST /v4/orders/{id}/cancel` | Cancel |
| `POST /v4/faucet` *(alias)* | Demo funds faucet |
| `POST /v4/withdraw/request` | Signed withdraw request |

### Vault

| Route | Purpose |
|---|---|
| `GET /v4/vault` · `GET /v4/vault/history` | Vault state + series |
| `POST /v4/vault/deposit` · `POST /v4/vault/withdraw` | Move funds |

### Canton rail

| Route | Purpose |
|---|---|
| `GET /v4/canton/balance` | Rail-side balance view |
| `POST /v4/canton/claim-demo` | Demo claim via the rail |
| `POST /v4/canton/withdraw` | Rail withdraw (503 while rail halted) |
| `GET /v4/canton/admin/reconciliation` | Admin reconciliation report |

### Growth & misc

| Route | Purpose |
|---|---|
| `GET /v4/rewards` · `GET /v4/referrals` | Rewards / referrals state |
| `GET /v4/notifications` · `POST /v4/notifications/read` | Notifications |
| `GET /v4/portfolio/history` | Equity series |
| `POST /v4/licensing-lead` | Data-licensing lead capture |
| `GET /favicon.ico` | Favicon |

### Pages (served by the same app)

| Route | Purpose |
|---|---|
| `GET /` *(alias `/landing`)* | Landing fallback |
| `GET /trade` | Desktop trading terminal (mobile UAs redirected to `/mobile`) |
| `GET /mobile` | Mobile app |
| `GET /ai` · `GET /intelligence` | AI-basket page, intelligence page |
| `GET /{full_path:path}` | Static-file resolver / SPA catch-all / 404 |
