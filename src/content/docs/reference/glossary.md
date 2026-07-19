---
title: "Glossary"
---

data-source recipe (the source composition of the reference rates is licensed IP).
One crisp definition per term of art used across these docs.

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
  (replacing a hardcoded constant), China-onshore premium surfaced as data, an
  oracle health endpoint, and index (basket) prices derived from their constituents
  every cycle at both the oracle and mark level.

**v3-derived**
: The provenance label for basket prices recomputed from constituent legs each
  cycle under the v3 layer, rather than scraped or random-walked independently.

**Source tiers**
: The oracle's five-class input taxonomy, ranging from listed-venue prints (highest
  weight) through assessment/dealer data and physical-trade surveillance down to
  fundamentals and FX. One class — Atlas-native market data — is **deliberately
  empty** (see self-referential exclusion).

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

**Input classes (A–D)**
: The methodology's pre-declared taxonomy of admissible reference inputs:
  A — listed-venue prints; B — PRA assessments; C — Atlas-originated transaction
  data (swaps/blocks), admissible only under the anti-circularity rule; D —
  sovereign producer data.

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

## Vault & market making

**VaultMM**
: The protocol's own market maker: a single accounting book quoting a multi-level,
  post-only two-sided ladder into every market's CLOB, managing inventory via
  spread skew, staleness-aware widening, and the concentration overlay.

**Liquidity Vault (Earn vault)**
: The LP product wrapping the VaultMM book: depositors hold shares whose net asset
  value tracks the market maker's real equity.

**NAV**
: Net asset value of the vault — defined as the market-making book's real equity
  (cash plus inventory marked at the risk mark), never a fabricated accrual.

**MMF wrapper**
: The money-market-fund-style share accounting: at or above par the share price is
  pegged at $1 and gains are paid as newly minted shares; below par the share price
  floats and recovers on a high-water mark.

**First-loss buffer**
: A capped house-funded cushion that absorbs the gap between the book's raw return
  and the target carry — smoothing LP returns and taking the first loss in a
  drawdown.

**Break the buck**
: The event of the share price falling below par; deep impairment hard-pauses new
  deposits to protect incoming LPs.

**High-water mark**
: The recovery rule below par: the share price must regain its prior peak before
  gains are again distributed as minted shares.

**Capture bps**
: The legacy calibrated scalar (basis points of venue volume) once used to accrue
  vault yield; retained as a reported constant after the real-equity model replaced
  it as the accrual mechanism.

**return_index**
: The deposit-neutral "value of $1" index: it compounds only the vault's applied
  per-tick return, so deposits and withdrawals cannot distort it. The honest basis
  for realized-return measurement.

**raw_return_index**
: The parallel index compounding the *unshaped* per-tick book return — before
  buffer smoothing — from which the emergent APY is measured.

**Emergent APY**
: The realized headline yield: the annualized cumulative growth of the raw return
  index over a trailing window, rather than a promised target. Short windows are
  acknowledged as statistically unresolvable; the trend of the buffer is the
  secondary signal.

**Deposit-neutral**
: Any flow or accounting operation constructed so it cannot move the return index —
  it changes assets and shares together, never the value of an existing share.

**CaR (capital-at-risk)**
: The vault's per-market risk unit: absolute inventory notional times the initial
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
: Value-at-risk — here a one-day, 95% inventory loss estimate from per-market
  volatility.

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
  vault risk model to estimate tail outcomes.

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

**Prod-replica, delayed view, emergent APY** — see their entries above; these three
recur throughout the operational docs.
