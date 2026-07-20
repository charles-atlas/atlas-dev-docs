---
title: "Glossary"
---

One crisp definition per term of art used across these docs. The source composition
of the reference rates is licensed IP.

## Pricing & oracle

**Oracle price (reference)**
: The guarded external reference rate for a market, produced by the oracle pipeline
  and used as the anchor for marks, margin, and funding. Distinct from the mark.

**Mark price**
: The price a market actually trades and margins against. Resolution order: derived
  basket mark (for index markets, under v3) → order-book mid → market-maker mid →
  oracle reference.

**v2-blend**
: The second-generation composite reference: per mineral, the latest observation
  from each source is grouped into source classes, each class is reduced by an
  equal-weight median, and the class composites are combined by a
  **liquidity-weighted median** (never a mean) — so no single manipulated or stale
  print can drag the rate. Source identities and weights are licensed methodology.

**v3 layer**
: A feature-flagged evolution of the oracle inside the exchange: live FX conversion
  (an ECB-derived USD/CNY reference at ≤1h cadence) applied to all CNY-basis
  normalization, China-onshore premium surfaced as data, an oracle health endpoint,
  and index (basket) prices derived from their constituents every cycle at both the
  oracle and mark level.

**v3-derived**
: The provenance label for basket prices recomputed from constituent legs each
  cycle under the v3 layer, rather than scraped or random-walked independently.

**Source tiers**
: The weighting hierarchy over the five input classes (A–E), ranging from
  listed-venue prints (highest weight) through assessment/dealer data and
  physical-trade surveillance down to fundamentals and FX. Atlas-native market data
  sits **outside** the admissible set — excluded via the anti-circularity rule, not
  ranked as a class (see self-referential exclusion).

**Self-referential exclusion**
: The standing rule that Atlas's own market data is excluded from the reference
  blend while Atlas is the dominant venue for it: feeding the exchange's prices back
  into the oracle that anchors the exchange would be circular. The slot activates
  only once external liquidity exists (see anti-circularity rule).

**Carbonate basis**
: The lithium spec doctrine: "lithium" always means lithium carbonate. Hydroxide is
  a separate, never-blended series; the onshore/offshore carbonate spread is treated
  as signal (a premium), not error.

**China onshore premium**
: The observed spread between a mineral's China-onshore price and its
  international venue anchor, surfaced per market (`chinaOnshorePrice`,
  `chinaPremiumPct`) as information rather than blended away.

**OracleGuard**
: The clamp-and-halt state machine every oracle series passes through: per-tick
  move clamp, cumulative daily clamp, staleness detection, and a saturation halt
  after repeated same-direction clamps, with auto-clear on clean ticks. Halts
  persist across restarts by design.

**Reanchor**
: A one-time, deliberate re-seed of OracleGuard at a validated methodology cutover,
  so a known step-change in the reference doesn't grind through tick clamps into a
  spurious halt.

**Staleness gate**
: A freshness threshold on any consumed series; when exceeded, the consumer falls
  back to the previous-generation source for that market rather than serving stale
  data.

**Liveness states**
: The published freshness classification of each oracle series (fresh / stale /
  halted), designed so consumers can distinguish "moving" from "merely present".

**Basket identity**
: The invariant that an index market's served price equals the function of its
  constituent legs (`basket == f(legs)`), at both oracle and mark level. Legacy
  independently-evolving basket series violated it; the v3 layer enforces it by
  construction, and the health endpoint self-checks the gap.

**Basket markets**
: The index perpetuals — a rare-earths index, a battery-metals index (fixed-weight
  Li/Co/Ni), and an AI-critical-minerals dollar basket — priced from their
  constituent minerals.

**PRA-composite**
: The label for a reference constructed as a composite in the style of a price
  reporting agency assessment — multiple independent inputs reduced to one
  published rate — as opposed to a single-venue print.

**Atlas Spot**
: The perp-implied spot engine's output: a spot-equivalent price for each market
  backed out from the perpetual's trading price and its funding/basis state,
  published alongside the reference.

**Perp-implied spot**
: The core pricing thesis: start from an external reference, let the perpetual
  market trade around it, and derive a market-implied spot price from the perp —
  so the venue itself becomes a price-discovery instrument for illiquid physical
  markets.

**Funding basis**
: The smoothed spread between the perpetual's mark and the reference, which drives
  the periodic funding rate that pulls the perp back toward spot.

**Funding TWAP**
: A funding computation built on time-weighted averages over the funding window,
  hardening the rate against single-print manipulation at the window edge.

**Delayed view**
: The public tier of the data product: reference prices and Atlas Spot served with
  a fixed delay (with a cold-start guard that serves a static seed rather than ever
  leaking a live value). The venue's own trading prices are always live.

**Licensed feed**
: The real-time tier: callers whose API key is on the license allowlist (or whose
  account carries the license flag) receive the same payload without the delay.

**Input classes (A–E)**
: The methodology's pre-declared taxonomy of admissible reference inputs:
  **A** — listed-venue reference prints *(live)*; **B** — PRA (price-reporting-agency)
  assessments *(build)*; **C** — arm's-length transaction / OTC observations between
  **independent counterparties** (e.g. RFQ/block prints, DCM/SEF, physical crosses),
  admissible only under the anti-circularity rule — **Atlas's own market-making is
  excluded** *(build)*; **D** — ground truth: trade-implied unit values *(live)* plus
  sovereign producer-region data *(planned)*; **E** — fundamental anchors & FX (e.g.
  an ECB-derived FX reference) *(live)*.

**Anti-circularity rule**
: The published condition governing Class C: Atlas-originated transaction data may
  enter the reference only in ways that cannot feed back into the prices that
  generated it.

## Exchange & risk

**CLOB**
: Central limit order book — the real matching engine (price-time priority, one
  book per market) that replaced synthetic-fill execution; resting orders are
  durable and rehydrated at startup.

**Net-OI invariant**
: The settlement conservation law: per market, the sum of all open interest across
  accounts nets to zero. A drift alarm guards every fill-settlement path.

**Risk mark**
: A manipulation-resistant price used for margining and equity marking, insulated
  from transient book-mid distortion.

**Funding settlement**
: The periodic cash transfer between longs and shorts at the funding rate, with a
  per-interval clamp.

## Market making & risk

**VaultMM**
: The protocol's own market maker: a single accounting book quoting a multi-level,
  post-only two-sided ladder into every market's CLOB, managing inventory via
  spread skew, staleness-aware widening, and the concentration overlay. Two of these
  controls — staleness-aware widening and the concentration overlay — currently run
  in the staging/soak build and are **not yet promoted to production**.

**CaR (capital-at-risk)**
: The market-making book's per-market risk unit: absolute inventory notional times the initial
  margin ratio. Deliberately computed with the same constants in the engine, the
  measurement collector, and the public page so all surfaces agree.

**Concentration overlay**
: The portfolio-level risk control layered on CaR: when one market's share of total
  CaR crosses graduated thresholds, the maker widens the risk-increasing side,
  throttles size, and ultimately quotes one-sided — a passive unwind that never
  crosses the spread or forecasts price.

**IMR**
: Initial margin ratio — the fraction of notional required as margin; also the
  multiplier in the CaR definition.

**VaR**
: Value-at-risk — a parametric 1-day 95% inventory-loss estimate (|inv| × σ/√252 ×
  1.65 per market), a monitoring readout — distinct from CaR, which drives the
  control loop.

**Markout**
: Per-fill profit decomposition measured at fixed horizons after the fill: spread
  capture (fill versus mid at fill) minus adverse selection (mid drift after the
  fill). Distinguishes real market-making edge from inventory warehousing.

**Adverse selection**
: The loss component from trading against better-informed flow: the market moves
  against the maker's inventory immediately after filling.

**Informed flow**
: The fraction of order flow modeled as trading *with* short-term direction —
  the calibration lever that sets how much adverse selection the maker faces.

**ADV**
: Average daily volume; used both as a per-market weight and as the denominator in
  liquidity-adaptive controls ("never quote tight into a thin market").

**Spread floor (liquidity-adaptive)**
: A minimum half-spread that scales up as trailing volume thins, enforcing the
  "never tight + thin" safety rule.

**Prod-replica**
: A validation configuration in which the staging environment strips all flow
  overrides so its volume mix and dynamics replicate production's defaults —
  fidelity soak rather than stress soak.

**Soak**
: A long-running unattended validation run measuring stability, drift, and risk
  behavior over hours-to-days, typically under a compressed simulation clock.

**Shock library**
: A curated set of historically-calibrated stress scenarios replayed against the
  market-making book's risk model to estimate tail outcomes.

## Settlement & platform

**Canton rail**
: The external settlement-ledger integration for custody and transfers. Designed
  fail-closed: the application runs with the rail disabled unless its
  authentication and reconciliation preconditions are met.

**Fail-closed**
: The safety posture in which any validation failure (weak secret, stale commands,
  balance drift) disables the risky capability while the rest of the system keeps
  serving — the opposite of failing open or refusing to boot.

**Reconciliation halt**
: A persistent, restart-surviving stop on rail operations triggered by detected
  drift between internal balances and the settlement ledger, cleared only by
  operator review.

**Atlas Swaps**
: The OTC workflow product (RFQ, blocks, swaps) built alongside the exchange; a
  future source of Class C reference input under the anti-circularity rule.

**Prod-replica, delayed view** — see their entries above; these recur throughout
the operational docs.
