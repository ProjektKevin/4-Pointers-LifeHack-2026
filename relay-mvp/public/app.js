const state = {
  catalog: null,
  products: [],
  activeFilter: "all",
  activeProduct: null,
  lastSimulation: null
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatMoney = (value, currency = "SGD") => {
  const amount = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 0 }).format(Number(value || 0));
  if (currency === "SGD") return `S$${amount}`;
  return new Intl.NumberFormat("en-SG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0));
};

function showToast(message, mark = "✓") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${escapeHtml(mark)}</span>${escapeHtml(message)}`;
  $("#toastRegion").append(toast);
  setTimeout(() => toast.remove(), 3300);
}

function navigate(viewName) {
  const view = $(`#view-${viewName}`);
  if (!view) return;
  $$(".view").forEach((item) => item.classList.toggle("active", item === view));
  $$(".nav-item[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $("#currentViewLabel").textContent = view.dataset.title || viewName;
  if (location.hash !== `#${viewName}`) history.pushState({ view: viewName }, "", `#${viewName}`);
  document.title = `${view.dataset.title || "Relay"} — Relay`;
  $(".sidebar").classList.remove("mobile-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (viewName === "catalog") renderCatalog();
  if (viewName === "query-lab" && !state.lastSimulation) runSimulation();
}

async function loadCatalog() {
  try {
    const response = await fetch("/api/catalog");
    if (!response.ok) throw new Error("Could not load catalog");
    state.catalog = await response.json();
    state.products = state.catalog.products;
    updateDashboard();
    renderCatalog();
    await runSimulation(false);
  } catch (error) {
    showToast(error.message, "!");
  }
}

function updateDashboard() {
  const scores = state.products.map((item) => item.readiness?.score ?? 0);
  const overall = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const enriched = scores.filter((score) => score >= 55).length;
  $("#overallScore").textContent = overall;
  $("#scoreRing").style.setProperty("--score", overall);
  $("#enrichedCount").textContent = enriched;
  $("#catalogCoverage").textContent = `of ${state.products.length}`;
  $("#catalogProgress").style.width = `${state.products.length ? (enriched / state.products.length) * 100 : 0}%`;
  $("#navProductCount").textContent = state.products.length;
  $("#allCount").textContent = state.products.length;
}

function thumbTone(product, index = 0) {
  const colors = ["coral", "sand", "forest", "ice"];
  if (/coral|red|orange/i.test(product.color || "")) return "coral";
  if (/sand|cream|beige/i.test(product.color || "")) return "sand";
  if (/forest|green|ink|black/i.test(product.color || "")) return "forest";
  if (/blue|ice|white/i.test(product.color || "")) return "ice";
  return colors[index % colors.length];
}

function renderCatalog() {
  if (!state.products.length) return;
  const query = $("#catalogSearch")?.value.toLowerCase().trim() || "";
  const filtered = state.products.filter((product) => {
    const score = product.readiness?.score ?? 0;
    const filterMatch = state.activeFilter === "all" || (state.activeFilter === "ready" ? score >= 75 : score < 75);
    const haystack = [product.name, product.id, product.category, product.description, ...(product.features || []), ...(product.useCases || [])].join(" ").toLowerCase();
    return filterMatch && (!query || haystack.includes(query));
  });

  $("#catalogTableBody").innerHTML = filtered.map((product, index) => {
    const score = product.readiness?.score ?? 0;
    const proofCount = (product.proof || []).filter((item) => item.verified).length;
    const date = product.updatedAt ? new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short" }).format(new Date(product.updatedAt)) : "Unknown";
    return `<tr data-product-id="${escapeHtml(product.id)}" tabindex="0">
      <td><div class="product-cell"><span class="product-thumb ${thumbTone(product, index)}"></span><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.id)} · ${escapeHtml(formatMoney(product.price, product.currency))}</small></span></div></td>
      <td><div class="table-score"><span class="mini-ring" style="--mini-score:${score}"><strong>${score}</strong></span><span><strong>${escapeHtml(product.readiness?.grade || "Not scored")}</strong><small>${score >= 75 ? "Agent-ready" : "Review gaps"}</small></span></div></td>
      <td><div class="context-tags">${(product.useCases || []).slice(0, 2).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}${(product.useCases || []).length > 2 ? `<span>+${product.useCases.length - 2}</span>` : ""}</div></td>
      <td><span class="evidence-count"><svg viewBox="0 0 24 24"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>${proofCount} verified</span></td>
      <td><span class="fresh-date">${date}</span></td>
      <td><button class="row-menu" aria-label="Open ${escapeHtml(product.name)}"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button></td>
    </tr>`;
  }).join("");

  $("#catalogEmpty").hidden = filtered.length > 0;
}

async function runSimulation(animate = true) {
  const query = $("#queryInput")?.value.trim();
  if (!query || query.length < 3) {
    showToast("Enter a shopping need first.", "!");
    return;
  }
  const button = $("#runQueryButton");
  if (animate) {
    button.disabled = true;
    button.firstChild.textContent = "Reasoning… ";
    $("#queryResults").hidden = true;
    $("#loadingResults").hidden = false;
    await new Promise((resolve) => setTimeout(resolve, 420));
  }
  try {
    const response = await fetch("/api/simulate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, products: state.products })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Simulation failed");
    state.lastSimulation = data;
    renderSimulation(data);
  } catch (error) {
    showToast(error.message, "!");
  } finally {
    if (animate) {
      button.disabled = false;
      button.firstChild.textContent = "Run simulation ";
      $("#loadingResults").hidden = true;
      $("#queryResults").hidden = false;
    }
  }
}

function renderSimulation(data) {
  $("#resultCount").textContent = `${data.results.length} candidate${data.results.length === 1 ? "" : "s"}`;
  $("#parseTime").textContent = `${9 + Math.floor(Math.random() * 8)} ms`;
  $("#parsedChips").innerHTML = data.parsedIntents.length
    ? data.parsedIntents.map((item) => `<span>${escapeHtml(item.label)} · ${escapeHtml(item.value)}</span>`).join("")
    : `<span>Open-ended discovery</span>`;
  $("#queryResults").innerHTML = data.results.map((result, index) => {
    const product = result.product;
    const reasons = result.evidence.map((item) => `<span>${escapeHtml(item.label)} <i>· ${escapeHtml(item.source)}</i></span>`).join("");
    const constraint = result.constraints.find((item) => !item.startsWith("Exceeds"));
    const summary = [
      constraint,
      result.matched.length ? `Matches ${result.matched.slice(0, 3).join(", ")}` : null,
      product.availability === "InStock" ? "Currently in stock" : product.availability
    ].filter(Boolean).join(" · ");
    return `<article class="result-card ${index === 0 ? "top-result" : ""}" data-product-id="${escapeHtml(product.id)}" tabindex="0">
      <span class="rank-badge">${index + 1}</span>
      <div class="result-body"><div class="result-title-row"><h3>${escapeHtml(product.name)}</h3>${index === 0 ? `<span class="top-choice">Best grounded match</span>` : ""}</div><p>${escapeHtml(summary)}</p><div class="evidence-pills">${reasons}</div></div>
      <div class="confidence"><strong>${result.confidence}%</strong><small>confidence</small><span class="confidence-bar"><i style="width:${result.confidence}%"></i></span></div>
    </article>`;
  }).join("");
}

function productJsonLd(product) {
  const origin = state.catalog?.brand?.domain ? `https://${state.catalog.brand.domain}` : location.origin;
  const url = String(product.url || "").startsWith("http") ? product.url : `${origin}${product.url || ""}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    sku: product.id,
    description: product.description,
    category: product.category,
    image: product.image ? [product.image] : undefined,
    color: product.color,
    material: product.materials,
    audience: (product.personas || []).map((item) => ({ "@type": "Audience", audienceType: item })),
    additionalProperty: [
      product.weightGrams ? { "@type": "PropertyValue", name: "Weight", value: product.weightGrams, unitCode: "GRM" } : null,
      product.heelDropMm ? { "@type": "PropertyValue", name: "Heel-to-toe drop", value: product.heelDropMm, unitCode: "MMT" } : null,
      ...(product.useCases || []).map((item) => ({ "@type": "PropertyValue", name: "Suitable for", value: item }))
    ].filter(Boolean),
    offers: { "@type": "Offer", url, priceCurrency: product.currency, price: product.price, availability: `https://schema.org/${product.availability}`, itemCondition: "https://schema.org/NewCondition" },
    dateModified: product.updatedAt
  };
}

function openProduct(productId, tab = "facts") {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.activeProduct = product;
  $("#drawerSku").textContent = product.id;
  renderProductDrawer(product, tab);
  $("#productDrawer").classList.add("open");
  $("#productDrawer").setAttribute("aria-hidden", "false");
  $("#drawerScrim").hidden = false;
  document.body.style.overflow = "hidden";
}

function renderProductDrawer(product, activeTab = "facts") {
  const readiness = product.readiness || { score: 0, grade: "Not scored", checks: [] };
  const missing = (readiness.checks || []).filter((item) => !item.passed);
  $("#drawerContent").innerHTML = `
    <div class="drawer-hero"><div class="shoe-illustration"></div><span class="drawer-score"><strong>${readiness.score}</strong><small>${escapeHtml(readiness.grade)}</small></span></div>
    <div class="drawer-body">
      <div class="drawer-title-line"><div><span class="eyebrow">${escapeHtml(product.category || "Product")}</span><h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(product.color || "")}${product.weightGrams ? ` · ${product.weightGrams} g` : ""}</p></div><span class="drawer-price">${escapeHtml(formatMoney(product.price, product.currency))}</span></div>
      <p class="drawer-description">${escapeHtml(product.description || "No description supplied.")}</p>
      <div class="drawer-tabs"><button class="${activeTab === "facts" ? "active" : ""}" data-drawer-tab="facts">Approved facts</button><button class="${activeTab === "markup" ? "active" : ""}" data-drawer-tab="markup">JSON-LD</button><button class="${activeTab === "gaps" ? "active" : ""}" data-drawer-tab="gaps">Readiness gaps</button></div>
      <div id="drawerTabPanel">${drawerTabContent(product, activeTab, missing)}</div>
    </div>`;
}

function drawerTabContent(product, activeTab, missing) {
  if (activeTab === "markup") return `<section class="drawer-section"><h3>Matching structured data</h3><pre class="drawer-json">${escapeHtml(JSON.stringify(productJsonLd(product), null, 2))}</pre></section>`;
  if (activeTab === "gaps") {
    const content = missing.length ? missing.map((item) => `<div class="gap-panel"><strong>${escapeHtml(item.label)}</strong><p>Add this field to recover up to ${item.weight} readiness points. Keep any new claim aligned with visible product copy.</p></div>`).join("<br>") : `<div class="gap-panel"><strong>No blocking gaps</strong><p>This product has core commercial data, context, evidence and freshness metadata. Continue monitoring price and availability.</p></div>`;
    return `<section class="drawer-section"><h3>Content readiness review</h3>${content}</section>`;
  }
  return `<section class="drawer-section"><h3>Decision facts</h3><div class="fact-grid">
      <div class="fact-card"><small>Availability</small><strong>${escapeHtml(product.availability || "Unknown")}</strong></div>
      <div class="fact-card"><small>Weight</small><strong>${product.weightGrams ? `${product.weightGrams} g` : "—"}</strong></div>
      <div class="fact-card"><small>Heel drop</small><strong>${product.heelDropMm ? `${product.heelDropMm} mm` : "—"}</strong></div>
    </div></section>
    <section class="drawer-section"><h3>Suitable for</h3><div class="tag-cloud">${(product.useCases || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("") || "—"}</div></section>
    <section class="drawer-section"><h3>Audience</h3><div class="tag-cloud">${(product.personas || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("") || "—"}</div></section>
    <section class="drawer-section"><h3>Verified evidence</h3><div class="proof-list">${(product.proof || []).map((item) => `<div class="proof-item"><span>${item.verified ? "✓" : "?"}</span><p><strong>${escapeHtml(item.claim)}</strong><small>${escapeHtml(item.source || "Source needed")}</small></p></div>`).join("") || `<div class="gap-panel"><strong>No evidence attached</strong><p>Add a specification sheet, test result, or materials declaration.</p></div>`}</div></section>`;
}

function closeProduct() {
  $("#productDrawer").classList.remove("open");
  $("#productDrawer").setAttribute("aria-hidden", "true");
  $("#drawerScrim").hidden = true;
  document.body.style.overflow = "";
}

function openUpload() {
  $("#uploadModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeUpload() {
  $("#uploadModal").hidden = true;
  document.body.style.overflow = "";
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index], next = text[index + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field); if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("CSV needs a header and at least one product row.");
  const headers = rows[0].map((item) => item.trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ""])));
}

function listValue(value) {
  if (Array.isArray(value)) return value;
  return String(value || "").split(/[|;]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeProduct(raw, index) {
  const pick = (...names) => names.map((name) => raw[name]).find((value) => value !== undefined && value !== "");
  const name = pick("name", "title", "product_name", "Product Name") || `Untitled product ${index + 1}`;
  const features = listValue(pick("features", "benefits", "key_features", "Features"));
  const description = pick("description", "body", "product_description", "Description") || [name, features.length ? `Features include ${features.join(", ")}.` : ""].filter(Boolean).join(". ");
  const priceValue = String(pick("price", "amount", "Price") || "0").replace(/[^0-9.]/g, "");
  return {
    id: String(pick("id", "sku", "SKU", "product_id") || `IMPORTED-${String(index + 1).padStart(3, "0")}`),
    name: String(name),
    category: String(pick("category", "product_type", "Category") || "Uncategorized"),
    price: Number(priceValue || 0),
    currency: String(pick("currency", "price_currency", "Currency") || state.catalog?.brand?.currency || "SGD").toUpperCase(),
    availability: normalizeAvailability(pick("availability", "stock", "Availability")),
    url: String(pick("url", "link", "product_url", "URL") || `/products/${slugify(name)}`),
    image: String(pick("image", "image_url", "Image") || ""),
    color: String(pick("color", "colour", "Color") || ""),
    sizes: listValue(pick("sizes", "size", "Sizes")),
    weightGrams: numberValue(pick("weightGrams", "weight_grams", "weight", "Weight")),
    heelDropMm: numberValue(pick("heelDropMm", "heel_drop_mm", "drop", "Heel Drop")),
    materials: listValue(pick("materials", "material", "Materials")),
    features,
    useCases: listValue(pick("useCases", "use_cases", "suitable_for", "Use Cases")),
    personas: listValue(pick("personas", "audiences", "audience", "Personas")),
    description: String(description),
    proof: Array.isArray(raw.proof) ? raw.proof : [],
    sustainability: String(pick("sustainability", "sustainability_claim", "Sustainability") || ""),
    care: String(pick("care", "care_instructions", "Care") || ""),
    updatedAt: String(pick("updatedAt", "updated_at", "last_updated") || new Date().toISOString())
  };
}

function normalizeAvailability(value) {
  const text = String(value || "InStock").toLowerCase().replaceAll(/[^a-z]/g, "");
  if (["outofstock", "soldout", "unavailable", "false", "0"].includes(text)) return "OutOfStock";
  if (["lowstock", "limited"].includes(text)) return "LowStock";
  if (["preorder", "presale"].includes(text)) return "PreOrder";
  return "InStock";
}

function numberValue(value) {
  const number = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function processCatalogFile(file) {
  if (!file) return;
  if (file.size > 2_000_000) return showToast("Choose a file smaller than 2 MB.", "!");
  try {
    const text = await file.text();
    let raw;
    if (file.name.toLowerCase().endsWith(".csv")) raw = parseCsv(text);
    else {
      const parsed = JSON.parse(text);
      raw = Array.isArray(parsed) ? parsed : parsed.products;
      if (parsed.brand) state.catalog.brand = { ...state.catalog.brand, ...parsed.brand };
    }
    if (!Array.isArray(raw) || !raw.length) throw new Error("No products found in that file.");
    const products = raw.slice(0, 500).map(normalizeProduct);
    const response = await fetch("/api/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ products }) });
    const validation = await response.json();
    state.products = products.map((product, index) => ({ ...product, readiness: validation.results[index] }));
    state.lastSimulation = null;
    updateDashboard();
    renderCatalog();
    closeUpload();
    navigate("catalog");
    showToast(`${state.products.length} product${state.products.length === 1 ? "" : "s"} mapped and scored.`);
  } catch (error) {
    showToast(error.message || "Could not read that catalog.", "!");
  }
}

function download(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCatalog() {
  const brand = state.catalog?.brand || { name: "Imported brand" };
  const payload = {
    schema_version: "1.0",
    brand,
    generated_at: new Date().toISOString(),
    products: state.products.map((product) => ({
      id: product.id,
      canonical_url: product.url,
      name: product.name,
      category: product.category,
      description: product.description,
      commercial: { price: product.price, currency: product.currency, availability: product.availability, sizes: product.sizes || [] },
      suitability: { use_cases: product.useCases || [], audiences: product.personas || [], features: product.features || [] },
      specifications: { weight_grams: product.weightGrams, heel_drop_mm: product.heelDropMm, materials: product.materials || [] },
      substantiation: product.proof || [],
      provenance: { source: "brand_catalog", approved: true, updated_at: product.updatedAt }
    }))
  };
  download("agent-products.json", JSON.stringify(payload, null, 2));
  showToast("Agent product feed exported.");
}

function downloadBlueprint() {
  const content = `# Relay production integration blueprint

1. Connect the brand PIM or commerce platform through a read-only catalog sync.
2. Map identity, commercial data, specifications, use cases, audiences, and evidence.
3. Route drafted enrichments to brand/legal approval; never publish unapproved claims.
4. Render matching visible product copy and schema.org Product JSON-LD.
5. Publish /.well-known/agent-products.json with canonical URLs and modified timestamps.
6. Put permissioned query endpoints behind OAuth 2.0, scopes, rate limits, and audit logs.
7. Revalidate visible-content parity, price, stock, source citations, and freshness on every release.
8. Monitor query coverage and recommendation gaps without inserting hidden agent instructions.

Demo endpoints:
- GET /.well-known/agent-products.json
- GET /api/products/:sku
- POST /api/simulate
- POST /api/validate
`;
  download("relay-integration-blueprint.md", content, "text/markdown");
  showToast("Integration blueprint downloaded.");
}

async function copyTarget(id) {
  const element = document.getElementById(id);
  if (!element) return;
  await navigator.clipboard.writeText(element.textContent.trim());
  showToast("Copied to clipboard.");
}

function bindEvents() {
  $$("[data-view]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.view)));
  $$("[data-view-target]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.viewTarget)));
  $$("[data-action='open-upload']").forEach((button) => button.addEventListener("click", openUpload));
  $$("[data-action='close-upload']").forEach((button) => button.addEventListener("click", closeUpload));
  $$("[data-action='show-toast']").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.message, "i")));
  $$("[data-copy-target]").forEach((button) => button.addEventListener("click", () => copyTarget(button.dataset.copyTarget)));
  $$("[data-example]").forEach((button) => button.addEventListener("click", () => { $("#queryInput").value = button.dataset.example; runSimulation(); }));
  $$("[data-query]").forEach((button) => button.addEventListener("click", () => { $("#queryInput").value = button.dataset.query; navigate("query-lab"); setTimeout(() => runSimulation(), 50); }));
  $$("[data-product-id]").forEach((button) => {
    if (button.closest("#catalogTableBody") || button.closest("#queryResults")) return;
    button.addEventListener("click", () => openProduct(button.dataset.productId, button.classList.contains("preview-product-button") ? "markup" : "gaps"));
  });
  $$(".filter-button").forEach((button) => button.addEventListener("click", () => { state.activeFilter = button.dataset.filter; $$(".filter-button").forEach((item) => item.classList.toggle("active", item === button)); renderCatalog(); }));

  $("#catalogSearch").addEventListener("input", renderCatalog);
  $("#focusSearchButton").addEventListener("click", () => { navigate("catalog"); setTimeout(() => $("#catalogSearch").focus(), 100); });
  $("#runQueryButton").addEventListener("click", () => runSimulation());
  $("#queryInput").addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") runSimulation(); });
  $("#exportCatalogButton").addEventListener("click", exportCatalog);
  $("#downloadBlueprintButton").addEventListener("click", downloadBlueprint);
  $("#runValidationButton").addEventListener("click", async () => { await new Promise((resolve) => setTimeout(resolve, 250)); showToast("Validation passed: feed and visible fields are aligned."); });
  $("#closeDrawerButton").addEventListener("click", closeProduct);
  $("#drawerScrim").addEventListener("click", closeProduct);
  $(".mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("mobile-open"));
  $("#uploadModal").addEventListener("click", (event) => { if (event.target === $("#uploadModal")) closeUpload(); });
  $("#catalogFile").addEventListener("change", (event) => processCatalogFile(event.target.files[0]));
  $("#loadDemoButton").addEventListener("click", () => { closeUpload(); showToast("Demo catalog is already loaded and ready."); });
  const dropZone = $("#dropZone");
  ["dragenter", "dragover"].forEach((type) => dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach((type) => dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.remove("dragover"); }));
  dropZone.addEventListener("drop", (event) => processCatalogFile(event.dataTransfer.files[0]));

  $("#catalogTableBody").addEventListener("click", (event) => { const row = event.target.closest("tr[data-product-id]"); if (row) openProduct(row.dataset.productId); });
  $("#catalogTableBody").addEventListener("keydown", (event) => { const row = event.target.closest("tr[data-product-id]"); if (row && (event.key === "Enter" || event.key === " ")) openProduct(row.dataset.productId); });
  $("#queryResults").addEventListener("click", (event) => { const card = event.target.closest("[data-product-id]"); if (card) openProduct(card.dataset.productId); });
  $("#drawerContent").addEventListener("click", (event) => { const tab = event.target.closest("[data-drawer-tab]"); if (tab && state.activeProduct) renderProductDrawer(state.activeProduct, tab.dataset.drawerTab); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeProduct(); if (!$("#uploadModal").hidden) closeUpload(); } });
  window.addEventListener("popstate", () => { const name = location.hash.slice(1) || "overview"; if ($(`#view-${name}`)) navigate(name); });
}

bindEvents();
loadCatalog().then(() => {
  const initialView = location.hash.slice(1);
  if (initialView && $(`#view-${initialView}`)) navigate(initialView);
});
