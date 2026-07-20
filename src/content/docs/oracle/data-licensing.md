---
title: "Oracle Data Licensing — Delayed vs Real-Time"
---

The oracle reference and Atlas Spot are a **licensed data product**. The same
API serves two views of the same numbers:

| Caller | Reference + Atlas Spot | Trading data (mark, trades, candles, order book) |
|---|---|---|
| Public, unauthenticated | **Delayed** (a fixed publication delay) | Real-time |
| Licensed key | **Real-time** | Real-time |

The mark — where the perpetual actually trades — and all market/trading data
are always real-time for everyone: the venue stays fully usable without a
license. Only the *reference-price product* (the oracle output and the
perp-implied Atlas Spot series) carries the delay. This mirrors the standard
listed-market model: live trading, delayed tape for non-subscribers.

## The delayed public view

- The public reference and Atlas Spot are served behind a **fixed publication
  delay** — the delay window is a single configured value applied uniformly.
- A refresher loop reads oracle prices and Atlas Spot snapshots **as of
  `now() − delay`** from their history tables into in-memory delayed caches;
  unlicensed requests are served purely from those caches.
- Delayed responses are explicitly labeled: the payload carries
  `"delayed": true` and the delay window alongside the prices, so a consumer
  can never mistake the delayed tape for live data.

:::note[No per-market timestamps in the payload]

The published payload deliberately carries no per-market `asOf`
timestamps — freshness is inferable only from the delay window. If a
per-market as-of stamp is ever wanted (it would help licensees audit
latency), it is an API addition, not a licensing change. See the
[roadmap](/roadmap/).

:::

## The licensed real-time view

A licensee passes their key in the standard auth headers. A request is treated
as licensed iff:

- the SHA-256 hash of the presented key is in the configured allowlist
  (loaded at startup from an environment variable into an in-memory hash set),
  **or**
- the key's account carries a database-level data-license flag.

License-check results are cached briefly, with the cache bounded so it cannot
be used as a memory-growth vector. Licensed responses are the identical payload
shape with `"delayed": false` and no delay window.

**Key-handling design points (names only, by policy):**

- Raw key values are never stored server-side — only SHA-256 hashes are held
  in memory; the environment variable is the single provisioning point.
- Keys travel in headers, never in URLs, so they cannot leak into request
  logs or referrers.
- Revocation is removal from the environment list (restart) or clearing the
  account flag (effective within the license-check cache window).

## The cold-start leak guard

The one dangerous moment for a delayed feed is startup: for the first
`delay` seconds after boot there is no sample old enough to serve, and the
naive fallback — serving the live value until the delayed cache warms — would
leak real-time licensed data to unlicensed callers.

The delayed **price** endpoints (the public reference/oracle and prices views)
fail **closed**: if no delayed sample exists yet, they serve the static seed
price for the market rather than the live reference. On those endpoints an
unlicensed caller can therefore see a briefly *stale* number after a restart,
not the real-time reference.

## Per-mineral health disclosure

Alongside the price product, a public health readout provides, per mineral,
the current **anchor**, its **age**, the **source count** behind the composite,
and the cross-source **spread** — observability signals for judging the
reference's condition.

Public funding fields are recomputed from the **delayed** reference rather than
the live one, so the real-time rate cannot be reverse-engineered from the freely
available mark.

## Relationship to the oracle design

The licensing boundary is why the oracle's methodology pages are tiered: the
multi-source hierarchy and blend weights are themselves part of what
licensees pay for. Public-facing material describes the *design* — a
multi-source hierarchy blended by a median-of-medians, guarded and clamped —
without enumerating the sources or weights. See the
[oracle overview](/oracle/overview/).
