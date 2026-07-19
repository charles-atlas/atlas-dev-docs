---
title: "How the Vault Market Maker Works"
---

The vault is backed by a single automated **market maker** (the "VaultMM") that
quotes every Atlas market from one engine. It is the counterparty behind the
Liquidity Vault: the vault's NAV tracks the market-making account's *real* equity,
so the maker's spread capture, net of adverse selection, **is** the vault's yield.
This page describes how it makes markets today.

:::note[Test-environment liquidity]

The matching engine, settlement, margin, and liquidation are production mechanics,
but the counterparty flow the maker trades against today is **house-provided and
simulated** — the ten markets run as a test environment. The advantages described
below are properties of the *architecture*; they are not a claim of live
third-party-flow profitability. Quoting on **external venues** is future-state —
see the [Roadmap](/roadmap/).

:::

## One engine, all markets

A single engine runs a fast quote-and-fill loop across every market: it advances
each market's price, refreshes inventory and risk off the hot path, posts a resting
ladder into each order book, and generates the taker fills that cross it. Keeping it
in one process is deliberate — the cross-market risk view (see the
[concentration overlay](/vault/risk-overlay/)) only exists because one engine sees
the whole book at once.

## How liquidity is allocated across markets

Depth is **not** spread evenly. Each market receives a share of the maker's capital
set by its **configured weight**, scaled by a utilization target, with the remainder
held back as a first-loss buffer. That capital is split across both sides of the
book and across ladder levels, so a heavier-weighted market carries a deeper book
than a thin one. The result is a book whose depth per market is intentional and
proportional, not uniform.

## Quoting on an endogenous mid

Quotes do **not** center on the raw oracle. The maker maintains an **endogenous
mid** per market — a flow-driven micro-price that carries momentum (fills nudge it,
with square-root price impact), decays back toward the oracle anchor, and drifts
with small noise between fills. This is what makes the tape trend and consolidate
like a real book instead of pinning flat to the reference.

Crucially, the pull toward the oracle anchor **weakens as open interest grows**:

- in a **thin** market the oracle (the external reference) leads price, and the mid
  hugs it;
- as the book **deepens**, the perpetual's own clearing price leads, and the oracle
  becomes a convergence anchor rather than a driver.

This index-to-perp inversion is the mechanism behind the [Atlas Spot](/oracle/overview/)
thesis — the perp's own mark becomes the best continuous spot estimate once it has
real liquidity behind it. Every quote is still bounded to a fixed band around the
oracle anchor, so no quote can escape the public deviation guard.

## Posting real resting liquidity

The maker posts **real resting limit orders** (post-only) into each market's
central-limit-order-book — a multi-level two-sided ladder around the mid, not
synthetic display quotes. Spreads adapt to conditions:

- **inventory skew** — the ladder leans against the maker's current position, so it
  quotes tighter on the side that flattens the book;
- **inventory tiers** — as a position grows relative to its cap, the maker widens,
  then throttles, then stops quoting the risk-increasing side entirely;
- **staleness-aware widening** — when the reference has not refreshed recently, the
  maker widens by the expected drift over that gap, so a counterparty timing a slow
  reference window cannot pick off a stale mark;
- **liquidity-adaptive floor** — spreads are wider in a thin market and tighten
  automatically as traded volume builds.

Portfolio-level concentration is handled separately by the
[CaR concentration overlay](/vault/risk-overlay/), which looks across markets rather
than at any single book.

## Realistic economics

Left unchecked, a maker capturing full spread against uninformed flow would post an
unrealistically high return. The engine deliberately models **adverse selection**: a
calibrated fraction of flow trades *with* the prevailing momentum, so the maker
takes on inventory that then moves against it. That toxic-flow cost pulls the
modeled return down to a realistic level — which is the point, because the vault's
NAV tracks the maker's *real* equity, and the first-loss buffer has to be a genuine
variance cushion rather than a cosmetic one.

## The order-book-integration advantage — and the benchmark boundary

The maker's edge is **architectural**: it is co-located in-process with the matching
engine. It reads the live book (best bid/ask and depth), posts and cancels resting
ladders with no network hop, settles through the same path, keeps a live inventory
view, and applies its own price impact to its mid. That co-location — zero-latency
quoting on an inventory-aware mid, with first structural position in every book — is
the structural advantage of running the maker inside the venue.

That advantage is confined to **execution**, and it is walled off from the
**benchmark**:

:::caution[Execution edge, not a benchmark edge]

The maker benefits from co-location with the *matching engine*. The *reference rate*
is a different thing: Atlas's own order book, its mid, and Atlas Spot are
**structurally excluded** from reference-rate formation (the anti-circularity /
self-reference rule described in the [oracle overview](/oracle/overview/)). The
per-market **mark** and vault P&L are venue-internal and never feed the benchmark.
So the maker can have an execution advantage inside the venue while the benchmark
remains independent of Atlas execution data — the two do not conflict.

:::

## What's not built yet

- **External-venue market-making** — the engine posts through a generic order
  interface, so pointing an instance at an external venue is a natural extension, but
  today the maker only quotes Atlas's own books. *(Roadmap.)*
- **Real third-party flow** — today's counterparty flow is house-provided and
  simulated in the test environment. *(Roadmap.)*
- **Production concentration overlay** — the
  [CaR overlay](/vault/risk-overlay/) is validated on staging and slated for the
  production build. *(Roadmap.)*
