// The fixed menu of qualitative signal keys the AI extraction step is allowed to
// choose from, per vertical. This must stay in sync with SIGNAL_REGISTRY in
// client/src/features/agentready/logic.js — the keys are what get matched back
// to real test functions on the client; the descriptions here only exist to help
// the model choose correctly and are never sent to the frontend.
export const SIGNAL_KEYS_BY_VERTICAL = {
  running: {
    halfMarathon: "Query mentions training for, or racing, a half marathon",
    humid: "Query mentions humid, warm, tropical, or Singapore-like climate conditions",
    lightweight: "Query asks for a lightweight or low-weight shoe",
    beginner: "Query mentions being a beginner or first-time runner",
    easyRuns: "Query mentions easy runs, or daily/casual training",
  },
  skincare: {
    oilySkin: "Query mentions oily or combination skin",
    sustainable: "Query mentions sustainability, eco-friendliness, or refillable packaging",
    fragranceFree: "Query asks for fragrance-free or unscented products",
  },
  air: {
    quiet: "Query mentions quiet or silent operation, or sleep-friendly noise levels",
    smallRoom: "Query mentions a small bedroom or compact room",
  },
};

export const VERTICALS = Object.keys(SIGNAL_KEYS_BY_VERTICAL);
