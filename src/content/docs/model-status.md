---
title: "Model Status & Validation"
description: What is live vs simulated, how mature each model is, and what still needs validating against real market data.
---

This page states plainly what is running today, what it is measured against, and how
far each model is from something you would trust with real capital. It is written to
be read by a skeptic: where a component is heuristic, it says so; where a number comes
from a simulation rather than a market, it says so.

:::danger[The load-bearing caveat]
The exchange's counterparty flow is currently **simulated** (a house flow model in a
test environment). Therefore the market maker's realised spread capture, its markout,
and the vault's yield are **outputs of that flow model, not evidence of edge against
real order flow.** No performance number on this site should be read as a validated,
real-market result. What is validated is the *engineering* (the matching engine,
settlement, accounting invariants) and the *internal consistency* of the models — not
their P&L against real adverse selection.
:::

## What runs against real vs simulated inputs

| Component | Input today | What that means |
|---|---|---|
| Matching engine / settlement / margin | Real orders, deterministic engine | Production-grade; exercised in a test environment |
| Reference-price oracle | Live external market data (a small number of sources) | Real prices; thin source set (see [oracle overview](/oracle/overview/)) |
| Index construction | Live constituent references | Exact identity; sound |
| Market-maker quoting | Real book, **simulated** taker flow | Quotes are real; the counterparty it profits from is a model |
| Vault NAV / APY | Tracks the MM account's real equity — **against simulated flow** | Accounting is honest; the P&L it accrues is not real-flow P&L |
| Funding settlement | Real per-position settlement | Mechanics real; the funding *design* is incomplete (below) |

## Model maturity

We grade each model on a deliberately unforgiving ladder:

- **Heuristic** — sensible rules, hand-tuned; no optimality claim.
- **Principled** — derived from a model of the problem (control, estimation, or risk theory).
- **Calibrated** — parameters fit to data.
- **Validated** — tested out-of-sample / against real market data.

| Model | Maturity | Honest gap |
|---|---|---|
| CLOB matching engine | **Validated** (unit-tested, deterministic) | Not a model — this is solid. |
| Endogenous mark dynamics | **Calibrated heuristic** | A momentum/mean-reversion process tuned to realistic vol; not derived from a microstructure model. |
| MM quoting & inventory control | **Heuristic** | Tiered spread/skew/cutoff ladder. Target is an optimal-control quote (reservation price + inventory-and-vol-aware optimal spread, à la Avellaneda–Stoikov). See [market making](/vault/market-making/). |
| Adverse-selection / toxic flow | **Parametric** | Modelled as a fixed informed-flow fraction, *set* rather than *estimated* from real flow. No Glosten–Milgrom/Kyle-style pricing of information. |
| Oracle blend | **Principled estimator, fixed guards** | Weighted median-of-medians is robust by construction; but the movement guards are fixed thresholds, not vol-adaptive, and manipulation resistance is asserted, not quantified. |
| Funding | **Incomplete** | Point-in-time damped premium; **no carry adjustment** — structurally wrong for storable commodities (persistent, harvestable basis). Carry-adjusted + time-weighted funding is on the [roadmap](/roadmap/). |
| Portfolio risk (CaR overlay) | **Governance control, not a risk model** | Notional-concentration cap; no covariance, no portfolio VaR/ES. Understates joint risk across the correlated battery/AI complex. See [risk overlay](/vault/risk-overlay/). |
| Index identity | **Validated** | Exact recompute-from-constituents with a self-check. Sound. |

## What validation would require

None of the economic results are validated against real market flow. A credible
validation program, in rough order:

1. **Real-flow shadow.** Run the quoting and risk models in shadow against live
   third-party flow (no capital at risk) and measure realised markout, fill-adverse
   selection, and inventory paths — the numbers that actually matter.
2. **Historical backtest / replay.** Replay real tape for each mineral through the
   quoting and funding logic; report out-of-sample Sharpe, drawdown, and markout with
   confidence intervals, not point estimates.
3. **Manipulation-cost simulation.** Quantify the oracle's resistance directly: how
   much capital, across how many independent inputs, moves the blend by *X* bps within
   an observation window. Publish the curve.
4. **A/B risk-overlay soak from flat.** The controlled experiment (overlay on vs off,
   same seed and regime) that isolates the overlay's effect on peak concentration vs
   its cost in markout — including a crisis regime the benign baseline can't exercise.
5. **Funding convergence study.** Once carry-adjusted funding is built, measure basis
   stability and residual harvestable distortion vs the current point-in-time design.

Until (1) and (2) exist, treat every performance figure here as a property of the
simulation, not a forecast of live results.

## Model-risk register

The assumptions most likely to be wrong, stated up front:

- **Simulated flow is representative.** The informed-flow fraction and order-size
  distribution are hand-set. Real flow could be materially more toxic; the vault
  buffer is sized against the *simulated* loss distribution, not a real one.
- **Per-market risk is separable.** The CaR overlay treats each market's concentration
  independently. Lithium/cobalt/nickel are highly correlated, so true portfolio risk
  is understated and the overlay may act late in a joint drawdown.
- **Oracle sources are independent.** Manipulation resistance assumes input diversity;
  if the live sources are co-moved or co-stale, the effective diversity is lower than
  the source count suggests.
- **Fixed guards fit all minerals.** Movement clamps and staleness windows are not
  scaled to each mineral's volatility, so they are simultaneously too tight for calm
  markets and too loose for volatile ones.
- **Positive-price assumption.** The mark/funding/margin path assumes strictly positive
  prices; signed-price coherence is not yet implemented.

We would rather you learn these from us than find them yourself.
