---
title: Roadmap
description: Planned and in-development capabilities across the Atlas oracle, exchange, and vault. Everything here is future-state; the rest of the docs describe what is live today.
---

The rest of these docs describe what Atlas runs **today**. This page is the forward
plan — capabilities that are designed, in development, or built and validated in
staging but not yet promoted to production. Nothing here is represented as operating
today.

:::note[How to read this page]
Each item carries a status:

- **In development** — actively being built.
- **Staging-validated** — built and exercised in the staging environment; promotion to production is pending.
- **Planned** — designed, with activation conditional on the stated criteria.

Activations are announced as versioned changes, so a capability moves from this page
into the live docs only when it is actually running in production.
:::

## Oracle & reference rates

- **Additional input classes** *(Planned / In development)* — price-reporting-agency
  assessments, arm's-length transaction and OTC observations (sourced through the RFQ
  and block workflow and partner execution venues), and sovereign producer-region data.
  Today the composite is built from listed-venue, redistributor, and dealer-sheet
  market data; these classes broaden input diversity as they are contracted and activated.
- **Direct licensed data feeds** *(Planned)* — replacing today's captured market data
  with licensed venue and assessment feeds. Until those licenses are in place, the docs
  and public methodology describe sources generically.
- **China-onshore premium surfacing** *(In development)* — ingest and publish the
  China-onshore price and premium/discount as an explicit cross-check on the ex-China anchor.
- **Extended liveness state machine** *(In development)* — today the published state is
  `FRESH` / `STALE` / `HALTED`. The target model distinguishes venue-anchored vs
  composite-priced live states and adds assessment-banded and scheduled-closure states,
  each with its own trading band and funding behavior.
- **Production index self-check enforcement** *(Staging-validated)* — per-cycle
  recomputation of each index from its constituents with a published served-vs-implied
  self-check, promoted to production so the identity holds continuously (in production
  today the self-check reports the gap rather than enforcing it).
- **Moving-input staleness test** *(Planned)* — a venue-calendar / unchanged-value test
  so a held or non-moving input is treated as stale, beyond today's wall-clock window.
- **Durable long-horizon audit archival** *(Planned)* — multi-year retention of every
  input observation and published value; today's published-rate history is retained on a
  shorter operational window.

## Funding & settlement

- **Carry-adjusted reference** *(In development)* — adjust the reference for storage,
  financing, and convenience yield (using the listed forward curve where one exists) so
  predictable carry is absorbed rather than left as a harvestable funding distortion.
  Today funding is a damped premium of mark vs the reference, with no carry term.
- **Time-weighted funding integrity** *(In development)* — time-weighted observation over
  the funding interval, in-window randomized observation instants, and an
  interval-over-interval clamp on the funding reference.
- **Signed-price support** *(Planned)* — mark, funding, and margin coherent at, near, and
  below zero. The present engine assumes positive prices.
- **Distributed-ledger settlement rail** *(In development)* — the settlement rail is
  integrated; activation is pending a coordinated security rotation.

## Exchange & venues

- **Third-party matching-engine licensing** *(Planned)* — wholesale licensing of the
  Atlas matching engine, order book, and settlement to external venues. Benchmark and
  reference-data licensing is available today; the full-stack engine model is future-state.
- **Perpetual-venue graduation** *(Planned)* — when external venues list contracts
  referencing Atlas benchmarks under published criteria (independent venues, trading
  history, depth and surveillance thresholds), their order-book and traded prints become
  admissible inputs, and the referenced market re-anchors from assessment-priced to
  market-priced.
- **Third-party liquidity** *(Planned)* — deepening the order books with external
  participant flow; today's test-environment liquidity is house-provided.

## Vault & liquidity

- **Portfolio concentration control in production** *(Staging-validated)* — the
  capital-at-risk concentration overlay is armed and exercised in the staging soak;
  promotion to production follows the A/B-from-flat validation.
- **External-venue market-making** *(Planned)* — extending the vault market maker to
  quote on external venues. Today it makes markets only in the Atlas order book.

## Governance & benchmark administration

- **Oversight function & charter** *(Planned)* — methodology ownership, parameter
  setting, input-class activation, and conflict review, with periodic independent
  external review.
- **Restatement policy** *(Planned)* — published-notice correction of material errors
  within the restatement window; annotation without alteration outside it.
- **IOSCO conformance** *(Target)* — the benchmark methodology targets conformance with
  the IOSCO Principles for Financial Benchmarks, assessed on a published annual review.
