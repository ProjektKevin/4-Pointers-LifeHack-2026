# AgentReady Commerce — Features & Problem Fit

This document explains what's actually built so far in the `client/` app, how each piece works mechanically, and how it maps back to the hackathon problem statement. It's meant as a working reference, not marketing copy — it also calls out what's real versus simulated, so nobody gets surprised in a live demo or judging Q&A.

## The problem, in one paragraph

Shoppers are increasingly asking AI assistants natural-language questions ("lightweight running shoes for a humid half marathon, under S$200") instead of using keyword search. Most brand product content — titles, bullet specs, marketing copy — was written for humans skimming a webpage, not for an AI agent trying to reason about fit, trade-offs, and evidence before recommending something. AgentReady is a tool that helps a brand see, score, and structure their product content so an AI shopping agent can actually use it.

## Feature-by-feature

### 1. Structured Product Knowledge Layer
**What it is:** Every product is modeled with far more than a title/price/specs. Each one carries `idealFor` (use situations), `personas` (who it's for), `useCases`, `attributes` (machine-readable spec pairs), `benefits`, `claims` (each with an evidence source and a verified flag), `tradeoffs` (honest downsides), a `sustainability` score, and `faqs`.

**How it works today:** This rich shape is just hand-authored JSON per product (`client/src/features/agentready/data.js`) — nothing generates it. A function, `structuredProduct()`, converts any product into a normalized `agentready.product.v1` export format — identity, an "agent summary" sentence, intent facets, evidence, trade-offs, and a computed readiness score — which downloads as a JSON file. Import (`coerceImportedProduct()`) only fills in blank defaults for missing fields; it doesn't derive anything from raw text.

**How it's actually meant to work:** A real brand doesn't have `idealFor`/`personas`/`claims` sitting in clean fields anywhere — what they have is a raw catalog: title, marketing description, spec sheet, price, maybe reviews. The intended flow is: brand uploads that raw material → an AI step *reads* the description/specs and *derives* the structured fields (idealFor, personas, useCases, benefits) from it → a readiness score and one-sentence agent summary get computed → the brand downloads the structured version back. That AI-derivation step is entirely missing right now; today the structured fields simply have to already exist by the time a product enters the system.

**The one hard guardrail on that AI step:** it must never invent `claims`/`evidence`. A claim like "24 dB sleep mode" is only legitimate if the brand's raw source material actually states a real test/certification/source. If it doesn't, the honest behavior is to mark that as a content gap ("claim plausible, no evidence supplied yet") — not to fabricate a citation. Inventing evidence would be a genuine brand/legal risk, not just a demo shortcut.

**Why this needs a human in the loop:** because that AI step is inference, not fact, nothing it drafts should be treated as verified until a person at the brand confirms it. That means every AI-derived field needs a status (e.g. "AI-suggested" vs. "brand-approved") before it's trustworthy enough to publish — which doesn't exist yet either.

**Problem-statement link:** Directly answers *"How should brands describe products beyond traditional titles and specifications?"* and *"How can product attributes, personas, use cases, comparisons... be represented in ways AI systems can reason over?"* The AI-derivation step specifically is the brief's suggested **AI Content Copilot** outcome — currently unbuilt (tracked separately, see below).

### 2. Content Readiness Score
**What it is:** Every product gets a single 0–100 score plus a breakdown, shown on the Command Center's leaderboard and each product's knowledge card.

**How it works today:** A weighted formula (`readinessFor()`): 28% factual completeness (are the fields a vertical needs actually filled in?), 25% intent coverage (enough use-cases/personas/trade-offs/FAQs to be useful?), 19% machine-readable attribute count, 18% claim-level evidence (verified claims with a real source, capped), 10% freshness (how recent is `lastUpdated`). It also surfaces the single "biggest gap" for that product — the most actionable thing to fix first. This part is deliberately **not** AI — it's plain arithmetic over structured fields, which is a strength, not a gap: it's fully explainable and auditable, unlike a black-box AI-generated score.

**How it's meant to work:** Same mechanism, but it should be scoring the *output of Feature 1's AI-derivation step* — so a brand's day-one score reflects how much of the AI-drafted content is still unreviewed/unapproved, not just whether fields are non-empty. Right now there's no "AI-suggested vs. brand-approved" status anywhere (see Feature 1), so the score can't yet distinguish confirmed-accurate content from an AI guess that hasn't been checked.

**Scoping decision:** the weights (28/25/19/18/10%) are reasonable-looking but unvalidated against real AI agent behavior — in principle a product scoring 95 should get picked more often than one scoring 70, but nobody has measured that. Given the timeline, this is being **accepted as a working assumption rather than validated** — the formula is treated as correct as-is, not something to test/recalibrate against real outcomes right now.

**Problem-statement link:** Directly answers *"How can brands measure whether their content is 'AI-ready'?"* — this is the closest thing in the brief to a **Content Readiness Score**, one of the explicitly suggested outcomes.

### 3. Intent-Aware Query Lab (NEED DISCUSSION)
**What it is:** Type a natural-language shopping question (or click a preset example) and get the top 3 matching products, each with a fit score, which signals it matched (✓) or missed (○), and a plain-language reason. A "show reasoning trace" view exposes exactly how the ranking was computed.

**How it works today:** `parseQuery()` reads the sentence and extracts a category, a budget, a time constraint, and a set of "signals" (e.g. half-marathon, humid climate, lightweight, oily skin, quiet) using hand-written keyword/regex patterns per vertical. `queryResult()` scores every product against those signals: category match + intent-fit percentage + budget match/penalty + a small readiness bonus. Results are sorted and the top 3 returned. This is **not** an LLM or real AI reasoning — it's deterministic keyword matching, hand-coded per product vertical. It works well for the queries it was built to expect, but a genuinely novel question or new product category would need new code, not just new data.

**Why this needs discussion:** replacing the regex parser with a real LLM raises an actual architecture fork I don't think has been decided:
- **Option A — hybrid:** an LLM extracts structured intent (category, budget, constraints) from the query, then the *existing deterministic scoring formula* ranks products against that structured intent. Keeps the "reasoning trace" honest and auditable, but limits how flexible the reasoning can be.
- **Option B — end-to-end:** hand the LLM the whole query plus the structured catalog and let it reason and rank directly (closer to how real tools like ChatGPT browsing or Perplexity Shopping actually work). More flexible and more "real AI reasoning" for the demo, but harder to make the "reasoning trace" fully truthful (an LLM's stated reasoning isn't guaranteed to match its actual process), and adds cost/latency per query.

I don't have enough context to pick one for you — it changes the whole ranking pipeline and the credibility of the "reasoning trace" feature depending on which way you go.

**Problem-statement link:** This is the live demonstration of *"AI agents can only recommend products effectively when brands provide [the right] content"* — it's the closest thing to the **Simulation Platform** outcome, at small scale.

### 4. Product Knowledge / Catalog Explorer (NEED DISCUSSION)
**What it is:** A searchable, filterable grid of all products. Selecting one opens a knowledge panel with three tabs — **Facts** (specs), **Intent facets** (personas/use-cases), **Proof** (claims + evidence) — plus a button to view the raw structured JSON for that product.

**How it works today:** Client-side filter over the product array (search matches against the full product JSON, which is crude — not fuzzy or semantic; category filter matches `vertical`). The three tabs just render different slices of the same product object. It's read-only — there is no way to edit anything from this screen.

**Why this needs discussion:** given Feature 1 needs an "AI-suggested vs. brand-approved" review step somewhere, this page is the obvious *place* for it to live — but right now it's purely a read-only viewer, not an editing/approval workspace. I'm not sure whether the intent is (a) keep this as a simple browse-only knowledge viewer and build a separate review/approval screen elsewhere, or (b) turn this page itself into the content-review tool (add edit fields, approve/reject buttons, version history per product). Those are two fairly different amounts of work and different UX, so this is worth deciding deliberately rather than me guessing.

**Problem-statement link:** This is the human-facing side of the knowledge layer — lets a brand *see* what an agent would see, tab by tab.

### 5. Golden-Query Sweep & Gap Detection (NEED DISCUSSION)
**What it is:** Runs a fixed set of 6 representative shopping questions (spanning all three verticals) through the same ranking engine automatically, reports how many "passed" (top result scored ≥75%), and aggregates the most common missing content signals into a prioritized gap list.

**How it works today:** `runSweep()` just calls the same query engine 6 times and tallies results. The gap panel counts how often each specific missing signal (e.g. "no humid-climate test data") shows up across queries — the idea being: a gap that blocks multiple queries is worth fixing first.

**Why this needs discussion:** the brief specifically describes this outcome as testing against *"thousands"* of queries — 6 hardcoded ones is a stand-in, not a scaled-down version of the same thing. Getting to real scale needs an actual source for those queries, and I see at least three different approaches with real trade-offs, and no clear signal on which one is intended:
- AI-generates a large, diverse set of plausible shopper queries per category (needs an LLM call, and needs the generated queries to actually be realistic, which is hard to verify automatically).
- Log real queries from actual usage over time and replay those (needs the product to be live first — a chicken-and-egg problem for a pre-launch tool).
- Keep it small and human-curated, but be honest in the demo that it's a sample, not a scale claim.

Separately, there's also an unresolved inconsistency worth flagging: each product already has a hardcoded, hand-written `contentGaps` field in `data.js` (e.g. "No independent wet-grip test published yet"), which is a *different* mechanism from the gaps the sweep computes live from missing query signals. These two gap systems currently don't talk to each other, and it's not obvious whether they should be unified into one, or are legitimately meant to represent different things (author-declared gaps vs. detected-from-usage gaps).

**Problem-statement link:** Answers *"identify content gaps"* from the brief, and is a (small-scale) version of the **Simulation Platform** outcome — "tests products against ... natural language shopping queries to identify content gaps."

### 6. Catalog Import / Export
**What it is:** Upload a JSON or CSV file to replace the demo catalog with your own products. Export the whole catalog (or a single product) as a structured JSON knowledge-layer file.

**How it works today:** Import is parsed entirely in the browser (`FileReader` + a small CSV parser) and run through `coerceImportedProduct()`, which fills in sensible defaults for anything missing (e.g. guesses the vertical from the category name) — it does not derive anything intelligently from raw text. Export serializes every product through `structuredProduct()` into an `agentready.catalog.v1` JSON file and triggers a browser download. Nothing is sent to or stored on a server — it's all local to your browser session.

**How it's meant to work:** this is really the delivery mechanism for Feature 1's fixes, not a separate design question — once import accepts genuinely raw catalog data and runs it through a real AI-derivation step (Feature 1, items 1–2), this feature doesn't need new decisions of its own. It also needs the backend for the same reason Feature 1 does: real persistence instead of "reload the page and your import is gone."

**Problem-statement link:** Directly answers *"Can generative AI be used to automatically transform existing product catalogs into agent-optimized content?"* — partially: it transforms the *shape*, but doesn't yet generate new persuasive content with AI (see limitations).

## How it's built (architecture, briefly)

- **Frontend only, currently.** React 19 + Vite + React Router, with its own scoped CSS (doesn't touch the rest of the app's Tailwind/shadcn styling). All state lives in a React context (`AgentReadyProvider`) — no server calls.
- **Routes:** `/` (Command Center), `/catalog` (Product Knowledge), `/insights` (Intent Insights).
- **Backend status:** the project has a real Express + Postgres skeleton (`server/`), but it is **not connected** to any of the above yet — the entire feature runs on a hardcoded 8-product array shipped with the client. This was a deliberate scoping decision to get the UI/logic right first.
- **Logic is pure and testable:** all scoring/parsing/ranking functions live in one file (`logic.js`) with no DOM dependency, verified directly against real query scenarios.

## Mapping to the judging rubric

| Rubric point | Where it shows up | Honest status |
|---|---|---|
| Problem comprehension | The whole "four layers" framing (identity/intent/evidence/trade-offs) baked into the data model and every panel | Strong |
| Solution architecture | Readiness scoring + schema export + query engine, cleanly separated (`data.js` / `logic.js` / context / components) | Good on paper; not yet backed by real persistence or an API |
| AI reasoning quality (live demo) | The Query Lab and golden-query sweep | Works well on anticipated queries; **not real AI** — regex/keyword-based, will visibly struggle on an unanticipated question |
| Scalability & generalizability | Vertical-agnostic schema, but... | Weak — adding a new category means hand-writing new regex signal detectors, not a generalized extraction step |
| Brand adoptability | Clean JSON export format, explicit integration boundary | Conceptual only — no real connector to any commerce platform yet |

## Known limitations / honest gaps

1. **No real AI.** The "intent understanding" is keyword pattern matching, not an LLM. This is the single biggest risk if a judge tries an off-script query.
2. **No backend.** Everything is a static array in the browser; nothing persists, nothing is shared across users/devices.
3. **Narrow scope.** Only 3 verticals, 8 products, 6 test queries — all hardcoded.
4. **No content generation.** Import fills in *defaults*, it doesn't use AI to *write* personas, claims, or descriptions from raw catalog data (the "AI Content Copilot" outcome from the brief isn't built).
5. **No real distribution mechanism yet.** There's a separate, agreed-upon plan (schema.org-aligned structured markup + a permissioned product API/feed, replacing an earlier — and rejected — "invisible text" idea) that has not been built yet.

## Natural next steps (not yet started)
- Swap the regex query parser for a real LLM-based intent extractor (fixes both "AI reasoning quality" and "scalability" rubric points at once).
- Stand up the read-only product API on the existing Express server (the deferred backend work).
- Align the JSON schema to real schema.org vocabulary and sketch the compliant on-page markup + feed model.
