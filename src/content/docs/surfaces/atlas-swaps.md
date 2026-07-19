---
title: "Atlas Swaps"
---

:::note[Open gap — this page is a stub]

**Atlas Swaps has no dedicated reconnaissance dossier yet.** Everything below
comes from adjacency notes captured during the exchange-staging survey and from
the product/methodology docs — not from a first-hand pass over the Atlas Swaps
codebase. Treat this page as an index card, not documentation.
**Unblock path:** a scoped recon pass over the Atlas Swaps source tree (the
repo copy is the source of truth; a running staging instance exists), producing
its own dossier: module map, RFQ workflow states, API surface, oracle-feed
consumption details, and open risks. This page then gets rewritten from that
dossier.

:::
## What it is

**Atlas Swaps** (renamed 2026-07-17; formerly "Hedge OS") is the operator console
for Atlas's **RFQ / block / swaps** workflow — the negotiated-trade counterpart to
the central-limit-order-book trading app. Where the exchange app serves continuous
on-screen trading, Atlas Swaps is the desk surface for quote-requested and
block-sized business in the same critical-minerals markets.

It is a Node/TypeScript web application, currently running against the staging
environment.

## Known integration points

- **Oracle price feed.** Atlas Swaps is an operator workflow that *consumes* the
  live oracle price feed through the exchange's market-data API, authenticated
  with a data-license key (the same licensing mechanism offered to external data
  licensees; key **name** only — values never appear in docs). It is a downstream
  reader of the reference feed, not a contributor to it.
- **Design language.** The console shares the trading app's design system (same
  typography and dark visual language), so the two surfaces read as one product.
- **Future oracle input — Class C (roadmap).** The published reference
  methodology pre-declares Atlas Swaps / DCM transaction data as a *planned*
  oracle input class ("Class C"), gated by an explicit **anti-circularity rule**:
  transactions whose pricing derives from the oracle must not feed back into the
  oracle. Today this is design intent, not implementation — the oracle currently
  takes no Atlas-native data at all. Any routing of swaps flow to external
  execution venues is likewise future-state. See [Roadmap](/roadmap/).

## What is *not* documented yet

- The RFQ lifecycle (request → quote → negotiation → execution → settlement) as
  actually implemented.
- The console's own API surface and data model.
- How executed swaps would be captured for the future Class C input (schema,
  attestation, the anti-circularity enforcement point).
- Deployment and operational posture.

All of the above belongs to the pending dedicated recon pass.
