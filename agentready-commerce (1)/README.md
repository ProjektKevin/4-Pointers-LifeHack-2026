# AgentReady Commerce

A dependency-free prototype for the AI-commerce content readiness challenge.

## What it demonstrates

AgentReady treats product content as a decision layer rather than a longer product description. It turns catalog records into four things a shopping agent can reason over:

1. **Identity** — normalized category, price, measurable attributes, and variants.
2. **Intent facets** — who the product is for, where/when it works, outcomes, and use cases.
3. **Evidence** — claim-level proof with source labels and dates.
4. **Trade-offs** — constraints and caveats surfaced alongside benefits.

The demo includes:

- An intent-aware query lab for natural-language shopping questions.
- Evidence-backed recommendation traces with matched and missing signals.
- A product readiness score across completeness, intent coverage, machine readability, evidence, and freshness.
- A product knowledge view with facts, intent facets, proof, and JSON export.
- A golden-query sweep that exposes repeated content gaps.
- JSON/CSV catalog import and an `agentready.catalog.v1` export.

## Run it

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Suggested live demo

1. Start with the preloaded Singapore half-marathon query.
2. Show the top recommendation and the matched intent chips: half marathon, humid weather, lightweight, and budget.
3. Click **Open full knowledge card** or **View structured output** to show the agent-ready representation.
4. Switch to **Intent insights** and run the golden-query sweep.
5. Point out the repeated gaps: the system is not only ranking products; it is telling the brand what evidence to publish next.
6. Export the knowledge layer to show the integration boundary.

## Architecture

```text
Raw catalog / CSV / JSON
          |
          v
  Normalization + enrichment
          |
          v
AgentReady product schema
  |        |         |
  v        v         v
Readiness  Retrieval  Golden-query
score      + ranking   simulator
  |        |         |
  +--------+---------+
           v
   Recommendation + gap queue
```

For production, the deterministic demo logic can be replaced with an LLM extraction step and vector/graph retrieval without changing the product schema or the brand-facing workflow. The important boundary is the structured, evidence-bearing knowledge layer.

## Score design

The prototype's readiness score is deliberately explainable:

```text
28% factual completeness
25% intent coverage
19% machine-readable attribute coverage
18% claim-level evidence
10% freshness
```

The query simulator parses intent signals, filters by product category, weights hard constraints such as budget and measured limits, and adds a modest readiness bonus. Each result retains its trace so a brand can see why a recommendation happened.

## Rubric mapping

| Rubric | Prototype evidence |
| --- | --- |
| Problem comprehension | Query lab makes explicit the difference between keywords and intent signals. |
| Solution architecture | Import → normalize → schema → score/retrieve/simulate → gap queue. |
| AI reasoning quality | Live queries rank across running, skincare, and air-care products with reasons. |
| Scalability | Shared schema plus category-specific normalized attributes; JSON/CSV import. |
| Brand adoptability | Static demo has an obvious integration boundary and one-click export. |

## Production path

- Connect Shopify/PIM feeds and map source provenance per field.
- Use an LLM with structured output to extract personas, use cases, trade-offs, and claim/evidence pairs.
- Store canonical attributes in a product graph and embeddings for retrieval.
- Maintain a versioned golden-query set per category and region.
- Log agent outcomes (selected, rejected, abstained) to calibrate the score.
- Add approvals, permissions, and expiration rules for regulated or fast-changing claims.

