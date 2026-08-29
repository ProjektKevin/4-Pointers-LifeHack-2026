# Relay

Relay is a working MVP for a transparent AI-commerce product knowledge layer. A brand imports a CSV or JSON catalog, reviews normalized facts and evidence, and publishes three aligned surfaces:

1. Shopper-visible product content.
2. Matching `schema.org/Product` JSON-LD.
3. A discoverable product feed and optional query API for AI agents.

It deliberately does **not** create hidden copy or instructions for agents. Machine-readable claims must match visible content and retain their source.

## Run it

```bash
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

No package installation is required. Relay uses Node.js built-ins and browser-native JavaScript.

## Demo path

1. Start on **Start here** and follow the three numbered steps.
2. Open **Products** and select a product to inspect approved facts, evidence, JSON-LD, and gaps.
3. Open **Test with AI** and run the included Singapore half-marathon prompt.
4. Show the ranked result, constraints, confidence, and field-level citations.
5. Open **Publish** to show the JSON-LD snippet, live feed, query endpoint, and trust checklist.

Try importing a `.json` object with a `products` array, a raw JSON array, or CSV. Common aliases such as `title`, `sku`, `product_type`, `price`, `stock`, `features`, `use_cases`, and `audience` are normalized locally.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `GET` | `/api/catalog` | Catalog plus readiness explanations |
| `GET` | `/.well-known/agent-products.json` | Agent-readable, approved product feed |
| `GET` | `/feeds/openai-products-preview.json` | Flat adapter aligned to current OpenAI Agentic Commerce fields |
| `GET` | `/api/products/:sku` | Normalized product and matching JSON-LD |
| `POST` | `/api/simulate` | Grounded intent-to-product ranking |
| `POST` | `/api/validate` | Catalog readiness validation |

Example:

```bash
curl -X POST http://127.0.0.1:4173/api/simulate \
  -H 'content-type: application/json' \
  -d '{"query":"lightweight half marathon shoes for humid weather under S$200, size 10"}'
```

## Readiness model

The score is deterministic and auditable rather than a black-box number. It checks identity, commercial data, canonical URL, description depth, features, use cases, audiences, materials, evidence, freshness, and care/sustainability fields. Each check has an explicit point value totaling 100.

## Architecture

```text
PIM / CSV / commerce export
            │
            ▼
  normalization + validation
            │
            ├── readiness score + gaps
            ├── brand/legal approval gate
            └── canonical product profile
                       │
          ┌────────────┼──────────────┐
          ▼            ▼              ▼
   visible copy   Product JSON-LD   feed / API
          └────────────┬──────────────┘
                       ▼
             agent query simulation
          constraints + evidence + provenance
```

The MVP keeps catalog import in the browser session and serves the bundled demo catalog through the API. A production build would replace that boundary with a PIM/commerce connector, durable storage, role-based approval, OAuth scopes, rate limits, signed webhooks, and freshness monitoring.

The OpenAI adapter maps the current required flat fields (`item_id`, `title`, `description`, `url`, `image_url`, `availability`, `price`, `brand`, `seller_name`, and `target_countries`) and marks the Singapore demo as requiring a market-eligibility review. It is a preview/validation surface, not a claim that submitting a URL alone enrolls a merchant. Production onboarding should use the current OpenAI Commerce file-upload or product-feed API pathway available to the merchant.

## Tests

```bash
npm test
```

The checks cover scoring, JSON-LD parity, feed provenance, budget and size constraints, the headline live-demo query, and HTTP endpoints.

## Legal and trust position

Hidden content is not automatically illegal in every jurisdiction, but cloaking, misleading structured data, undisclosed claims, privacy violations, or attempts to manipulate ranking systems can create regulatory, platform-policy, and consumer-trust risk. Relay's safer product position is transparent factual publishing: claims agree with the visible page, sources are retained, agents receive canonical identity and freshness metadata, and the brand approves generated enrichment before publication. This README is a product design summary, not legal advice.
