// ==== ESTADO ====
let ADMIN_PRODUCTS = [];
let ADMIN_CATEGORIES = [];
let ADMIN_SETTINGS = {};
let ADMIN_BANNERS = [];
let COSTS = {};                  // product_id -> custo

let statusFilter = "all";        // all | stock | nostock | active | hidden
let selecting = false;
const selectedIds = new Set();
let currentTab = "produtos";

const LOW_STOCK = 2;             // "acabando" quando tem até isso

const $ = (id) => document.getElementById(id);

// ==== ELEMENTOS ====
const loginWrap = $("loginWrap");
const dashboard = $("dashboard");
const loginForm = $("loginForm");
const loginError = $("loginError");
const loginBtn = $("loginBtn");
const userEmailEl = $("userEmail");
const logoutBtn = $("logoutBtn");

// ==== UTILITÁRIOS ====
let toastTimer;
function showToast(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function slugify(str) {
  return (str || "")
    .toString()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(str) {
  return (str || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parsePrice(str) {
  let s = String(str ?? "").trim().replace(/[^\d.,]/g, "");
  if (s === "") return NaN;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function priceToInput(n) {
  if (n == null || n === "") return "";
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function plural(n, one, many) {
  return `${Number(n).toLocaleString("pt-BR")} ${n === 1 ? one : many}`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const isActive = (p) => p.active !== false;
const stockOf = (p) => Number(p.stock || 0);
const productById = (id) => ADMIN_PRODUCTS.find(p => p.id === id);

function stockPill(p) {
  const s = stockOf(p);
  if (s <= 0) return `<span class="stock-pill is-zero">Sem estoque</span>`;
  return `<span class="stock-pill${s <= LOW_STOCK ? " is-low" : ""}">${s} em estoque</span>`;
}

// ==== CONFIRMAÇÃO ====
function askConfirm({ title = "Tem certeza?", text = "", yes = "Excluir", no = "Voltar", danger = true } = {}) {
  return new Promise((resolve) => {
    const overlay = $("confirmOverlay");
    $("confirmTitle").textContent = title;
    $("confirmText").textContent = text;
    $("confirmYes").textContent = yes;
    $("confirmNo").textContent = no;
    $("confirmNo").hidden = no === null;
    $("confirmYes").className = "abtn " + (danger ? "abtn-danger" : "abtn-primary");
    overlay.hidden = false;
    lockScroll();
    (no === null ? $("confirmYes") : $("confirmNo")).focus();
    const done = (val) => {
      overlay.hidden = true;
      unlockScrollIfIdle();
      $("confirmYes").onclick = $("confirmNo").onclick = overlay.onclick = null;
      document.removeEventListener("keydown", onKey);
      resolve(val);
    };
    const onKey = (e) => { if (e.key === "Escape") done(false); };
    document.addEventListener("keydown", onKey);
    $("confirmYes").onclick = () => done(true);
    $("confirmNo").onclick = () => done(false);
    overlay.onclick = (e) => { if (e.target === overlay) done(false); };
  });
}

// ==== SHEETS (a página atrás não se mexe) ====
let lockedScrollY = 0;
function lockScroll() {
  if (document.body.classList.contains("scroll-locked")) return;
  lockedScrollY = window.scrollY;
  document.body.classList.add("scroll-locked");
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
}
function unlockScrollIfIdle() {
  if (document.querySelector(".sheet-overlay:not([hidden])")) return;
  if (!document.body.classList.contains("scroll-locked")) return;
  document.body.classList.remove("scroll-locked");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  window.scrollTo(0, lockedScrollY);
}
function openSheet(overlay) {
  overlay.hidden = false;
  lockScroll();
  const body = overlay.querySelector(".sheet-body");
  if (body) body.scrollTop = 0;
}
function closeSheet(overlay) {
  overlay.hidden = true;
  unlockScrollIfIdle();
}
document.querySelectorAll(".sheet-overlay:not(.confirm-overlay)").forEach(ov => {
  ov.addEventListener("click", (e) => {
    if (e.target === ov || e.target.closest("[data-close]")) closeSheet(ov);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !$("confirmOverlay").hidden) return;
  const open = [...document.querySelectorAll(".sheet-overlay:not(.confirm-overlay):not([hidden])")].pop();
  if (open) closeSheet(open);
  else if (selecting) setSelecting(false);
});

function setPhotoPreview(img, src) {
  if (src) img.setAttribute("src", src); else img.removeAttribute("src");
  img.closest(".photo-pick").classList.toggle("has-photo", !!src);
}

// ==== AUTENTICAÇÃO ====
async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data.session) showDashboard(data.session.user);
  else showLogin();
}

function showLogin() {
  loginWrap.hidden = false;
  dashboard.hidden = true;
}

async function showDashboard(user) {
  loginWrap.hidden = true;
  dashboard.hidden = false;
  userEmailEl.textContent = user.email;
  renderProductsSkeleton();
  await loadAllData();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando…";
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  loginBtn.disabled = false;
  loginBtn.textContent = "Entrar";
  if (error) {
    loginError.textContent = error.message === "Email not confirmed"
      ? "Confirme seu e-mail antes de entrar (veja sua caixa de entrada)."
      : "E-mail ou senha não conferem.";
    return;
  }
  showDashboard(data.user);
});

logoutBtn.addEventListener("click", async () => {
  await sb.auth.signOut();
  showLogin();
});

// ==== ABAS ====
function showTab(name) {
  currentTab = name;
  document.querySelectorAll(".admin-tab").forEach(t => {
    const on = t.dataset.tab === name;
    t.classList.toggle("active", on);
    t.setAttribute("aria-current", on ? "page" : "false");
  });
  document.querySelectorAll(".admin-panel").forEach(p => p.hidden = p.id !== `panel-${name}`);
  $("fabNewProduct").hidden = name !== "produtos";
  if (name !== "produtos") setSelecting(false);
  if (typeof onPdvTab === "function") onPdvTab(name);
  window.scrollTo({ top: 0 });
}
document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

// ==== CARREGAR DADOS ====
async function loadAllData() {
  const [prodRes, catRes, settRes, bannerRes, costRes] = await Promise.all([
    sb.from("products").select("*").order("created_at", { ascending: true }),
    sb.from("categories").select("*").order("sort_order", { ascending: true }),
    sb.from("settings").select("*"),
    sb.from("banners").select("*").order("sort_order", { ascending: true }),
    sb.from("product_costs").select("product_id,cost")
  ]);
  if (prodRes.error) showToast("Não consegui carregar os perfumes. Recarregue a página.");
  ADMIN_PRODUCTS = prodRes.data || [];
  ADMIN_CATEGORIES = catRes.data || [];
  ADMIN_SETTINGS = {};
  (settRes.data || []).forEach(s => { ADMIN_SETTINGS[s.key] = s.value; });
  ADMIN_BANNERS = bannerRes.data || [];
  COSTS = {};
  (costRes.data || []).forEach(c => { COSTS[c.product_id] = Number(c.cost); });

  const ids = new Set(ADMIN_PRODUCTS.map(p => p.id));
  [...selectedIds].forEach(id => { if (!ids.has(id)) selectedIds.delete(id); });

  if (ADMIN_SETTINGS.logo_url) $("headerLogo").src = ADMIN_SETTINGS.logo_url;

  renderCategoryFilterOptions();
  renderProductsList();
  renderBannersList();
  fillSettingsForm();
  loadAdmins();
  if (typeof onPdvDataLoaded === "function") onPdvDataLoaded();
}

// recarrega só os perfumes (estoque mudou)
async function reloadProducts() {
  const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: true });
  if (!error && data) ADMIN_PRODUCTS = data;
  const costRes = await sb.from("product_costs").select("product_id,cost");
  if (!costRes.error) { COSTS = {}; (costRes.data || []).forEach(c => { COSTS[c.product_id] = Number(c.cost); }); }
  renderProductsList();
  if (typeof onPdvDataLoaded === "function") onPdvDataLoaded();
}

function categoryLabel(id) {
  const c = ADMIN_CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
}

// ==== PERFUMES: LISTA ====
const productList = $("productList");
const productSearch = $("productSearch");
const productCategoryFilter = $("productCategoryFilter");

function renderCategoryFilterOptions() {
  const current = productCategoryFilter.value;
  productCategoryFilter.innerHTML = `<option value="">Todas as categorias</option>` +
    ADMIN_CATEGORIES.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");
  productCategoryFilter.value = ADMIN_CATEGORIES.some(c => c.id === current) ? current : "";
}

function renderProductsSkeleton() {
  productList.innerHTML = Array.from({ length: 6 }, () => `<li class="skeleton-row"><i></i><i></i></li>`).join("");
}

function baseFiltered() {
  const q = normalizeText(productSearch.value.trim());
  const cat = productCategoryFilter.value;
  return ADMIN_PRODUCTS.filter(p =>
    (!q || normalizeText(p.name).includes(q)) && (!cat || p.category === cat)
  );
}

const STATUS_TEST = {
  all: () => true,
  stock: (p) => stockOf(p) > 0,
  nostock: (p) => stockOf(p) <= 0,
  active: isActive,
  hidden: (p) => !isActive(p)
};

function visibleProducts() {
  return baseFiltered().filter(STATUS_TEST[statusFilter]);
}

function renderProductsList() {
  const base = baseFiltered();
  const count = (k) => base.filter(STATUS_TEST[k]).length;
  $("countAll").textContent = base.length;
  $("countStock").textContent = count("stock");
  $("countNoStock").textContent = count("nostock");
  $("countActive").textContent = count("active");
  $("countHidden").textContent = count("hidden");

  const units = ADMIN_PRODUCTS.reduce((s, p) => s + Math.max(0, stockOf(p)), 0);
  $("productsSummary").textContent =
    `${plural(ADMIN_PRODUCTS.length, "perfume", "perfumes")} · ${plural(units, "unidade", "unidades")} em estoque`;

  const list = visibleProducts();
  const filtered = productSearch.value || productCategoryFilter.value;

  if (list.length === 0) {
    let msg;
    if (ADMIN_PRODUCTS.length === 0) msg = `<strong>Nenhum perfume cadastrado</strong>Toque no + para cadastrar o primeiro.`;
    else if (filtered) msg = `<strong>Nada encontrado</strong>Tente outro nome ou limpe os filtros.`;
    else if (statusFilter === "stock") msg = `<strong>Nada em estoque ainda</strong>Toque em Selecionar, marque o que chegou e use "Entrada".`;
    else if (statusFilter === "nostock") msg = `<strong>Tudo com estoque</strong>Nenhum perfume zerado.`;
    else if (statusFilter === "hidden") msg = `<strong>Nenhum perfume oculto</strong>Tudo que está cadastrado aparece no site.`;
    else if (statusFilter === "active") msg = `<strong>Nada aparecendo no site</strong>Selecione os perfumes e toque em "Mostrar".`;
    else msg = `<strong>Nada encontrado</strong>`;
    productList.innerHTML = `<li class="list-empty">${msg}</li>`;
  } else {
    productList.innerHTML = list.map(p => {
      const on = isActive(p);
      const sel = selectedIds.has(p.id);
      return `
      <li class="product-row${on ? "" : " is-hidden"}${sel ? " is-selected" : ""}" data-id="${p.id}">
        <button type="button" class="row-main" data-action="open" aria-pressed="${selecting ? sel : "false"}">
          <span class="check-box" aria-hidden="true"><svg class="icon"><use href="#i-check"/></svg></span>
          <img class="row-thumb" src="${escapeHtml(p.img)}" alt="" loading="lazy" decoding="async">
          <span class="row-text">
            <span class="row-name">${escapeHtml(p.name)}</span>
            <span class="row-meta">
              <span class="row-price">${formatBRL(p.price)}</span>
              ${stockPill(p)}
              ${on ? "" : `<span class="row-badge">Oculto</span>`}
            </span>
          </span>
        </button>
        <label class="row-toggle" title="${on ? "Aparece no site" : "Oculto do site"}">
          <input type="checkbox" class="switch" data-action="toggle" ${on ? "checked" : ""} aria-label="Aparece no site: ${escapeHtml(p.name)}">
        </label>
      </li>`;
    }).join("");
  }
  updateSelectionUI();
  renderCategoriesList();
}

productSearch.addEventListener("input", renderProductsList);
productCategoryFilter.addEventListener("change", renderProductsList);

function wireChips(container, attr, onPick) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    container.querySelectorAll(".chip").forEach(c => {
      c.classList.toggle("active", c === btn);
      c.setAttribute("aria-selected", c === btn);
    });
    btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    onPick(btn.dataset[attr]);
  });
}

wireChips($("statusFilter"), "status", (v) => { statusFilter = v; renderProductsList(); });

// toque na linha: abre o perfume ou marca/desmarca
let suppressNextClick = false;
productList.addEventListener("click", (e) => {
  const row = e.target.closest(".product-row");
  if (!row) return;
  if (e.target.closest("[data-action='open']")) {
    if (suppressNextClick) { suppressNextClick = false; return; }
    if (selecting) toggleSelected(row.dataset.id);
    else openProductModal(row.dataset.id);
  }
});

productList.addEventListener("change", (e) => {
  const sw = e.target.closest("input[data-action='toggle']");
  if (!sw) return;
  setProductsActive([sw.closest(".product-row").dataset.id], sw.checked, { quiet: true });
});

// segurar o dedo liga o modo seleção
let pressTimer = null;
let pressStart = null;
productList.addEventListener("pointerdown", (e) => {
  suppressNextClick = false;
  const main = e.target.closest("[data-action='open']");
  if (!main || selecting) return;
  pressStart = { x: e.clientX, y: e.clientY };
  const id = main.closest(".product-row").dataset.id;
  pressTimer = setTimeout(() => {
    pressTimer = null;
    suppressNextClick = true;
    setSelecting(true);
    toggleSelected(id, true);
    if (navigator.vibrate) navigator.vibrate(15);
  }, 450);
});
const cancelPress = () => { clearTimeout(pressTimer); pressTimer = null; };
productList.addEventListener("pointerup", cancelPress);
productList.addEventListener("pointercancel", cancelPress);
productList.addEventListener("pointermove", (e) => {
  if (pressTimer && pressStart && Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > 10) cancelPress();
});
productList.addEventListener("contextmenu", (e) => { if (e.target.closest(".row-main")) e.preventDefault(); });

// ==== SELEÇÃO ====
const selectModeBtn = $("selectModeBtn");
const bulkBar = $("bulkBar");
const selectAllCheckbox = $("selectAllCheckbox");

function setSelecting(on) {
  if (selecting === on && on) return;
  selecting = on;
  if (!on) selectedIds.clear();
  $("panel-produtos").classList.toggle("selecting", on);
  selectModeBtn.classList.toggle("is-on", on);
  selectModeBtn.querySelector("span").textContent = on ? "Cancelar" : "Selecionar";
  renderProductsList();
}

function toggleSelected(id, force) {
  const want = force ?? !selectedIds.has(id);
  if (want) selectedIds.add(id); else selectedIds.delete(id);
  const row = productList.querySelector(`.product-row[data-id="${CSS.escape(id)}"]`);
  if (row) {
    row.classList.toggle("is-selected", want);
    row.querySelector(".row-main").setAttribute("aria-pressed", want);
  }
  updateSelectionUI();
}

function updateSelectionUI() {
  const vis = visibleProducts();
  const visSelected = vis.filter(p => selectedIds.has(p.id)).length;
  $("selectAllRow").hidden = !selecting || vis.length === 0;
  selectAllCheckbox.checked = vis.length > 0 && visSelected === vis.length;
  selectAllCheckbox.indeterminate = visSelected > 0 && visSelected < vis.length;
  $("selectAllLabel").textContent = selectAllCheckbox.checked
    ? `Todos os ${vis.length} marcados`
    : `Marcar todos os ${vis.length} da lista`;

  const n = selectedIds.size;
  bulkBar.hidden = !selecting;
  document.body.classList.toggle("has-bulk", selecting);
  $("bulkCount").textContent = n === 0 ? "Toque nos perfumes para marcar" : plural(n, "selecionado", "selecionados");
  bulkBar.querySelectorAll(".bulk-btn").forEach(b => { b.disabled = n === 0; });
}

selectModeBtn.addEventListener("click", () => setSelecting(!selecting));
$("bulkCancelBtn").addEventListener("click", () => setSelecting(false));

selectAllCheckbox.addEventListener("change", () => {
  const vis = visibleProducts();
  const allOn = vis.every(p => selectedIds.has(p.id));
  vis.forEach(p => { if (allOn) selectedIds.delete(p.id); else selectedIds.add(p.id); });
  renderProductsList();
});

bulkBar.addEventListener("click", async (e) => {
  const btn = e.target.closest(".bulk-btn");
  if (!btn || btn.disabled) return;
  const ids = [...selectedIds];
  if (ids.length === 0) return;
  const action = btn.dataset.bulk;
  if (action === "entry") openEntry(ids);
  if (action === "show") await setProductsActive(ids, true);
  if (action === "hide") await setProductsActive(ids, false);
  if (action === "delete") await deleteProducts(ids);
});

async function withBulkBusy(fn) {
  bulkBar.querySelectorAll(".bulk-btn").forEach(b => b.disabled = true);
  try { return await fn(); }
  finally { updateSelectionUI(); }
}

// ==== MOSTRAR / OCULTAR ====
async function setProductsActive(ids, active, { quiet = false } = {}) {
  const before = new Map(ids.map(id => [id, productById(id)?.active]));
  ADMIN_PRODUCTS.forEach(p => { if (before.has(p.id)) p.active = active; });
  if (!quiet) setSelecting(false); else renderProductsList();

  const run = async () => {
    for (const part of chunk(ids, 100)) {
      const { error } = await sb.from("products").update({ active }).in("id", part);
      if (error) throw error;
    }
  };
  try {
    await (quiet ? run() : withBulkBusy(run));
    if (quiet) {
      const p = productById(ids[0]);
      showToast(active ? `Aparecendo no site: ${p?.name || "perfume"}` : `Oculto do site: ${p?.name || "perfume"}`);
    } else {
      showToast(active ? `${plural(ids.length, "perfume aparece", "perfumes aparecem")} no site agora` : `${plural(ids.length, "perfume ocultado", "perfumes ocultados")} do site`);
    }
    if (typeof onPdvDataLoaded === "function") onPdvDataLoaded();
  } catch (err) {
    ADMIN_PRODUCTS.forEach(p => { if (before.has(p.id)) p.active = before.get(p.id); });
    renderProductsList();
    showToast("Não deu para salvar: " + err.message);
  }
}

// ==== EXCLUIR ====
async function deleteProducts(ids) {
  const names = ids.map(id => productById(id)?.name).filter(Boolean);
  const ok = await askConfirm({
    title: ids.length === 1 ? "Excluir este perfume?" : `Excluir ${ids.length} perfumes?`,
    text: (ids.length === 1 ? `"${names[0]}" vai sumir do painel e do site.` : `Eles vão sumir do painel e do site.`) +
      ` O histórico de vendas continua. Não dá para desfazer; se só quiser esconder, use "Ocultar".`,
    yes: ids.length === 1 ? "Excluir" : `Excluir ${ids.length}`
  });
  if (!ok) return false;

  try {
    await withBulkBusy(async () => {
      for (const part of chunk(ids, 100)) {
        const { error } = await sb.from("products").delete().in("id", part);
        if (error) throw error;
      }
    });
    ids.forEach(id => selectedIds.delete(id));
    ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter(p => !ids.includes(p.id));
    if (selecting) setSelecting(false); else renderProductsList();
    if (typeof onPdvDataLoaded === "function") onPdvDataLoaded();
    showToast(ids.length === 1 ? "Perfume excluído" : `${ids.length} perfumes excluídos`);
    return true;
  } catch (err) {
    showToast("Não deu para excluir: " + err.message);
    await loadAllData();
    return false;
  }
}

// ==== PERFUME: FORMULÁRIO ====
const productModalOverlay = $("productModalOverlay");
const productForm = $("productForm");
const productModalTitle = $("productModalTitle");
const productIdInput = $("productId");
const productNameInput = $("productName");
const productPriceInput = $("productPrice");
const productCostInput = $("productCost");
const productCategorySelect = $("productCategory");
const productActiveInput = $("productActive");
const productInitialStock = $("productInitialStock");
const productImageFile = $("productImageFile");
const productImagePreview = $("productImagePreview");
const productSaveMsg = $("productSaveMsg");
const productSaveBtn = $("productSaveBtn");
const productDeleteBtn = $("productDeleteBtn");

$("newProductBtn").addEventListener("click", () => openProductModal(null));
$("fabNewProduct").addEventListener("click", () => openProductModal(null));
$("productCancelBtn").addEventListener("click", () => closeSheet(productModalOverlay));

function syncPhotoLabels(img, emptyEl, changeEl) {
  const has = img.hasAttribute("src");
  emptyEl.hidden = has;
  changeEl.hidden = !has;
}

function updateMarginLine() {
  const price = parsePrice(productPriceInput.value);
  const cost = parsePrice(productCostInput.value);
  const el = $("productMargin");
  if (!Number.isFinite(price) || !Number.isFinite(cost) || cost <= 0) { el.textContent = ""; return; }
  const profit = price - cost;
  const pct = price > 0 ? Math.round((profit / price) * 100) : 0;
  el.classList.toggle("is-bad", profit < 0);
  el.innerHTML = `Lucro por unidade: <strong>${formatBRL(profit)}</strong> (${pct}% do preço)`;
}
productPriceInput.addEventListener("input", updateMarginLine);
productCostInput.addEventListener("input", updateMarginLine);

const MOVE_LABEL = { entrada: "Entrada", venda: "Venda", ajuste: "Correção", cancelamento: "Venda cancelada" };

async function loadProductMoves(id) {
  const ul = $("productMoves");
  ul.innerHTML = "";
  const { data, error } = await sb.from("stock_moves")
    .select("qty,kind,unit_cost,stock_after,note,created_at")
    .eq("product_id", id).order("created_at", { ascending: false }).limit(8);
  if (error || !data || productIdInput.value !== id) return;
  ul.innerHTML = data.map(m => {
    const when = new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const extra = [m.unit_cost != null ? `${formatBRL(m.unit_cost)}/un` : "", m.note || ""].filter(Boolean).join(" · ");
    return `<li><span>${when} · ${MOVE_LABEL[m.kind] || m.kind}${extra ? ` <small>${escapeHtml(extra)}</small>` : ""}</span>
      <span class="mv-qty ${m.qty > 0 ? "mv-in" : "mv-out"}">${m.qty > 0 ? "+" : ""}${m.qty}</span></li>`;
  }).join("");
}

function refreshProductStockBox(id) {
  const p = productById(id);
  if (!p || productIdInput.value !== id || productModalOverlay.hidden) return;
  $("productStockNum").textContent = stockOf(p);
  if (COSTS[id] != null && !productCostInput.matches(":focus")) productCostInput.value = priceToInput(COSTS[id]);
  updateMarginLine();
  loadProductMoves(id);
}

function openProductModal(id) {
  productForm.reset();
  productSaveMsg.textContent = "";
  productSaveMsg.classList.remove("error");
  productCategorySelect.innerHTML = ADMIN_CATEGORIES.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");

  if (id) {
    const p = productById(id);
    productModalTitle.textContent = "Editar perfume";
    productIdInput.value = p.id;
    productNameInput.value = p.name;
    productPriceInput.value = priceToInput(p.price);
    productCostInput.value = COSTS[p.id] != null ? priceToInput(COSTS[p.id]) : "";
    productCategorySelect.value = p.category;
    productActiveInput.checked = isActive(p);
    setPhotoPreview(productImagePreview, p.img);
    productDeleteBtn.hidden = false;
    $("productInitialStockWrap").hidden = true;
    $("productStockBox").hidden = false;
    $("productStockNum").textContent = stockOf(p);
    loadProductMoves(p.id);
  } else {
    productModalTitle.textContent = "Novo perfume";
    productIdInput.value = "";
    productActiveInput.checked = true;
    const cat = productCategoryFilter.value;
    if (cat) productCategorySelect.value = cat;
    setPhotoPreview(productImagePreview, "");
    productDeleteBtn.hidden = true;
    $("productInitialStockWrap").hidden = false;
    $("productStockBox").hidden = true;
    $("productMoves").innerHTML = "";
  }
  updateMarginLine();
  syncPhotoLabels(productImagePreview, $("productPhotoEmpty"), $("productPhotoChange"));
  openSheet(productModalOverlay);
}

productImageFile.addEventListener("change", () => {
  const file = productImageFile.files[0];
  if (file) setPhotoPreview(productImagePreview, URL.createObjectURL(file));
  syncPhotoLabels(productImagePreview, $("productPhotoEmpty"), $("productPhotoChange"));
});

productDeleteBtn.addEventListener("click", async () => {
  const id = productIdInput.value;
  if (!id) return;
  const deleted = await deleteProducts([id]);
  if (deleted) closeSheet(productModalOverlay);
});

$("productEntryBtn").addEventListener("click", () => { if (productIdInput.value) openEntry([productIdInput.value]); });
$("productAdjustBtn").addEventListener("click", () => { if (productIdInput.value) openAdjust(productIdInput.value); });

function formError(msgEl, text, focusEl) {
  msgEl.textContent = text;
  msgEl.classList.add("error");
  if (focusEl) focusEl.focus();
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  productSaveMsg.classList.remove("error");
  productSaveMsg.textContent = "";

  const price = parsePrice(productPriceInput.value);
  if (!Number.isFinite(price) || price < 0) return formError(productSaveMsg, "Preço inválido. Escreva só o valor, por exemplo 99,90.", productPriceInput);
  const costRaw = productCostInput.value.trim();
  const cost = costRaw ? parsePrice(costRaw) : null;
  if (costRaw && (!Number.isFinite(cost) || cost < 0)) return formError(productSaveMsg, "Custo inválido. Escreva só o valor, por exemplo 45,00.", productCostInput);
  const initial = productInitialStock.value === "" ? 0 : Math.floor(Number(productInitialStock.value));
  if (!Number.isFinite(initial) || initial < 0) return formError(productSaveMsg, "Quantidade inválida.", productInitialStock);

  const id = productIdInput.value;
  let imgUrl = id ? productById(id).img : "";
  const file = productImageFile.files[0];
  if (!imgUrl && !file) return formError(productSaveMsg, "Coloque uma foto do perfume.");

  productSaveBtn.disabled = true;
  productSaveBtn.textContent = file ? "Enviando foto…" : "Salvando…";

  try {
    if (file) imgUrl = await uploadImage(file, "produtos", { maxSize: 1000 });

    const payload = {
      name: productNameInput.value.trim(),
      price,
      category: productCategorySelect.value,
      img: imgUrl,
      active: productActiveInput.checked
    };

    let productId = id;
    if (id) {
      const { error } = await sb.from("products").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await sb.from("products").insert(payload).select("id").single();
      if (error) throw error;
      productId = data.id;
    }

    if (cost != null && cost !== COSTS[productId]) {
      const { error } = await sb.from("product_costs").upsert({ product_id: productId, cost, updated_at: new Date().toISOString() });
      if (error) throw error;
    }

    if (!id && initial > 0) {
      const { error } = await sb.rpc("pdv_entrada", {
        p_items: [{ product_id: productId, qty: initial, unit_cost: cost }],
        p_note: "Estoque inicial"
      });
      if (error) throw error;
    }

    closeSheet(productModalOverlay);
    showToast(id ? "Perfume atualizado" : "Perfume cadastrado");
    await loadAllData();
  } catch (err) {
    formError(productSaveMsg, "Não deu para salvar: " + err.message);
  } finally {
    productSaveBtn.disabled = false;
    productSaveBtn.textContent = "Salvar";
  }
});

// ==== UPLOAD DE IMAGEM ====
// Fotos do celular chegam com 3–8 MB; reduzimos antes de enviar.
async function shrinkImage(file, maxSize) {
  if (!maxSize || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function uploadImage(rawFile, folder, { maxSize } = {}) {
  const file = await shrinkImage(rawFile, maxSize);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeBase = slugify(file.name.replace(/\.[^.]+$/, "")) || "img";
  const path = `${folder}/${Date.now()}-${safeBase}.${ext}`;

  const { error: uploadError } = await sb.storage.from(STORE_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined
  });
  if (uploadError) throw uploadError;

  const { data } = sb.storage.from(STORE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ==== AJUSTES: SUB-ABAS ====
wireChips($("configTabs"), "sub", (sub) => {
  document.querySelectorAll(".config-sub").forEach(s => s.hidden = s.id !== `sub-${sub}`);
});

// ==== CATEGORIAS ====
const categoriesList = $("categoriesList");

function renderCategoriesList() {
  if (ADMIN_CATEGORIES.length === 0) {
    categoriesList.innerHTML = `<li class="list-empty"><strong>Nenhuma categoria</strong>Crie uma para separar os perfumes no site.</li>`;
    return;
  }
  categoriesList.innerHTML = ADMIN_CATEGORIES.map(c => {
    const total = ADMIN_PRODUCTS.filter(p => p.category === c.id);
    const on = total.filter(isActive).length;
    return `
    <li class="simple-row" data-id="${escapeHtml(c.id)}">
      <button type="button" class="row-main" data-action="edit">
        <span class="row-text">
          <span class="row-name">${escapeHtml(c.label)}</span>
          <span class="row-meta"><span>${plural(total.length, "perfume", "perfumes")}</span><span>${on} no site</span><span>Ordem ${c.sort_order}</span></span>
        </span>
      </button>
      <div class="row-actions">
        <button type="button" class="btn-icon" data-action="delete" aria-label="Excluir categoria ${escapeHtml(c.label)}"><svg class="icon"><use href="#i-trash"/></svg></button>
      </div>
    </li>`;
  }).join("");
}

categoriesList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = btn.closest(".simple-row").dataset.id;
  if (btn.dataset.action === "edit") openCategoryModal(id);
  if (btn.dataset.action === "delete") deleteCategory(id);
});

const categoryModalOverlay = $("categoryModalOverlay");
const categoryForm = $("categoryForm");
const categoryModalTitle = $("categoryModalTitle");
const categoryOriginalIdInput = $("categoryOriginalId");
const categoryLabelInput = $("categoryLabel");
const categoryIdInput = $("categoryId");
const categorySortInput = $("categorySort");
const categorySaveMsg = $("categorySaveMsg");

$("newCategoryBtn").addEventListener("click", () => openCategoryModal(null));

let categoryIdManuallyEdited = false;
categoryIdInput.addEventListener("input", () => { categoryIdManuallyEdited = true; });
categoryLabelInput.addEventListener("input", () => {
  if (!categoryIdManuallyEdited) categoryIdInput.value = slugify(categoryLabelInput.value);
});

function openCategoryModal(id) {
  categoryForm.reset();
  categorySaveMsg.textContent = "";
  categorySaveMsg.classList.remove("error");
  categoryIdManuallyEdited = false;

  if (id) {
    const c = ADMIN_CATEGORIES.find(c => c.id === id);
    categoryModalTitle.textContent = "Editar categoria";
    categoryOriginalIdInput.value = c.id;
    categoryLabelInput.value = c.label;
    categoryIdInput.value = c.id;
    categorySortInput.value = c.sort_order;
    categoryIdManuallyEdited = true;
  } else {
    categoryModalTitle.textContent = "Nova categoria";
    categoryOriginalIdInput.value = "";
    categorySortInput.value = ADMIN_CATEGORIES.length;
  }
  openSheet(categoryModalOverlay);
}

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  categorySaveMsg.classList.remove("error");
  categorySaveMsg.textContent = "Salvando…";

  const originalId = categoryOriginalIdInput.value;
  const payload = {
    id: slugify(categoryIdInput.value),
    label: categoryLabelInput.value.trim(),
    sort_order: Number(categorySortInput.value) || 0
  };

  try {
    let error;
    if (originalId) ({ error } = await sb.from("categories").update(payload).eq("id", originalId));
    else ({ error } = await sb.from("categories").insert(payload));
    if (error) throw error;

    closeSheet(categoryModalOverlay);
    showToast("Categoria salva");
    await loadAllData();
  } catch (err) {
    formError(categorySaveMsg, "Não deu para salvar: " + err.message);
  }
});

async function deleteCategory(id) {
  const c = ADMIN_CATEGORIES.find(c => c.id === id);
  const inUse = ADMIN_PRODUCTS.filter(p => p.category === id).length;
  if (inUse) {
    await askConfirm({
      title: "Essa categoria tem perfumes",
      text: `"${c ? c.label : id}" tem ${plural(inUse, "perfume", "perfumes")}. Mude eles de categoria ou exclua antes de remover a categoria.`,
      yes: "Entendi", no: null, danger: false
    });
    return;
  }
  const ok = await askConfirm({ title: "Excluir categoria?", text: `"${c ? c.label : ""}" vai sair do site.` });
  if (!ok) return;
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) { showToast("Não deu para excluir: " + error.message); return; }
  showToast("Categoria excluída");
  await loadAllData();
}

// ==== BANNERS ====
const bannersList = $("bannersList");

function renderBannersList() {
  if (ADMIN_BANNERS.length === 0) {
    bannersList.innerHTML = `<li class="list-empty"><strong>Nenhum banner</strong>Sem banner, o site mostra o padrão da loja.</li>`;
    return;
  }
  bannersList.innerHTML = ADMIN_BANNERS.map(b => `
    <li class="simple-row" data-id="${b.id}">
      <button type="button" class="row-main" data-action="edit">
        <img class="row-thumb-wide" src="${escapeHtml(b.image_url)}" alt="" loading="lazy">
        <span class="row-text">
          <span class="row-name">${escapeHtml(b.badge_text || "Sem selo")}</span>
          <span class="row-meta"><span>Ordem ${b.sort_order}</span></span>
        </span>
      </button>
      <div class="row-actions">
        <button type="button" class="btn-icon" data-action="delete" aria-label="Excluir banner"><svg class="icon"><use href="#i-trash"/></svg></button>
      </div>
    </li>
  `).join("");
}

bannersList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = btn.closest(".simple-row").dataset.id;
  if (btn.dataset.action === "edit") openBannerModal(id);
  if (btn.dataset.action === "delete") deleteBanner(id);
});

const bannerModalOverlay = $("bannerModalOverlay");
const bannerForm = $("bannerForm");
const bannerModalTitle = $("bannerModalTitle");
const bannerIdInput = $("bannerId");
const bannerImageFile = $("bannerImageFile");
const bannerImagePreview = $("bannerImagePreview");
const bannerBadgeTextInput = $("bannerBadgeText");
const bannerSortInput = $("bannerSort");
const bannerSaveMsg = $("bannerSaveMsg");
const bannerSaveBtn = $("bannerSaveBtn");

$("newBannerBtn").addEventListener("click", () => openBannerModal(null));

function openBannerModal(id) {
  bannerForm.reset();
  bannerSaveMsg.textContent = "";
  bannerSaveMsg.classList.remove("error");

  if (id) {
    const b = ADMIN_BANNERS.find(b => b.id === id);
    bannerModalTitle.textContent = "Editar banner";
    bannerIdInput.value = b.id;
    setPhotoPreview(bannerImagePreview, b.image_url);
    bannerBadgeTextInput.value = b.badge_text || "";
    bannerSortInput.value = b.sort_order;
  } else {
    bannerModalTitle.textContent = "Novo banner";
    bannerIdInput.value = "";
    setPhotoPreview(bannerImagePreview, "");
    bannerSortInput.value = ADMIN_BANNERS.length;
  }
  syncPhotoLabels(bannerImagePreview, $("bannerPhotoEmpty"), $("bannerPhotoChange"));
  openSheet(bannerModalOverlay);
}

bannerImageFile.addEventListener("change", () => {
  const file = bannerImageFile.files[0];
  if (file) setPhotoPreview(bannerImagePreview, URL.createObjectURL(file));
  syncPhotoLabels(bannerImagePreview, $("bannerPhotoEmpty"), $("bannerPhotoChange"));
});

bannerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  bannerSaveMsg.classList.remove("error");
  bannerSaveMsg.textContent = "";

  const id = bannerIdInput.value;
  let imgUrl = id ? ADMIN_BANNERS.find(b => b.id === id).image_url : "";
  const file = bannerImageFile.files[0];
  if (!imgUrl && !file) return formError(bannerSaveMsg, "Escolha uma imagem para o banner.");

  bannerSaveBtn.disabled = true;
  bannerSaveBtn.textContent = file ? "Enviando imagem…" : "Salvando…";
  try {
    if (file) imgUrl = await uploadImage(file, "banners", { maxSize: 1600 });

    const payload = {
      image_url: imgUrl,
      badge_text: bannerBadgeTextInput.value.trim() || null,
      sort_order: Number(bannerSortInput.value) || 0
    };

    let error;
    if (id) ({ error } = await sb.from("banners").update(payload).eq("id", id));
    else ({ error } = await sb.from("banners").insert(payload));
    if (error) throw error;

    closeSheet(bannerModalOverlay);
    showToast(id ? "Banner atualizado" : "Banner criado");
    await loadAllData();
  } catch (err) {
    formError(bannerSaveMsg, "Não deu para salvar: " + err.message);
  } finally {
    bannerSaveBtn.disabled = false;
    bannerSaveBtn.textContent = "Salvar";
  }
});

async function deleteBanner(id) {
  const ok = await askConfirm({ title: "Excluir banner?", text: "A imagem sai do topo do site." });
  if (!ok) return;
  const { error } = await sb.from("banners").delete().eq("id", id);
  if (error) { showToast("Não deu para excluir: " + error.message); return; }
  showToast("Banner excluído");
  await loadAllData();
}

// ==== LOJA E SITE ====
const settingsForm = $("settingsForm");
const settingStoreName = $("settingStoreName");
const settingWhatsapp = $("settingWhatsapp");
const settingInstagram = $("settingInstagram");
const settingLogoFile = $("settingLogoFile");
const settingLogoPreview = $("settingLogoPreview");
const settingsSaveMsg = $("settingsSaveMsg");
const settingsSaveBtn = $("settingsSaveBtn");
const settingMsgBuy = $("settingMsgBuy");
const settingMsgCart = $("settingMsgCart");
const settingOnlyStock = $("settingOnlyStock");

const DEFAULT_MSG_BUY = "Olá! Tenho interesse em comprar:\n\n1x {produto} - {preco}\n\nTotal: {total}";
const DEFAULT_MSG_CART = "Olá! Gostaria de fazer o seguinte pedido na {loja}:\n\n{itens}\n\nTotal: {total}";

function fillSettingsForm() {
  settingStoreName.value = ADMIN_SETTINGS.store_name || "";
  settingWhatsapp.value = ADMIN_SETTINGS.whatsapp_number || "";
  settingInstagram.value = ADMIN_SETTINGS.instagram || "";
  setPhotoPreview(settingLogoPreview, ADMIN_SETTINGS.logo_url || "assets/logo/logo.png");
  settingMsgBuy.value = ADMIN_SETTINGS.whatsapp_msg_buy || DEFAULT_MSG_BUY;
  settingMsgCart.value = ADMIN_SETTINGS.whatsapp_msg_cart || DEFAULT_MSG_CART;
  settingOnlyStock.checked = ADMIN_SETTINGS.site_only_in_stock === "true";
  updateOnlyStockHint();
}

function updateOnlyStockHint() {
  const shown = ADMIN_PRODUCTS.filter(p => isActive(p) && (!settingOnlyStock.checked || stockOf(p) > 0)).length;
  $("onlyStockHint").textContent = settingOnlyStock.checked
    ? `Ligado: o site mostra ${plural(shown, "perfume", "perfumes")}. O que zerar some sozinho e volta quando você der entrada.`
    : `Desligado: o site mostra todos os ${plural(shown, "perfume", "perfumes")} marcados como "no site", com ou sem estoque.`;
}

settingOnlyStock.addEventListener("change", async () => {
  const on = settingOnlyStock.checked;
  settingOnlyStock.disabled = true;
  const { error } = await sb.from("settings").upsert({ key: "site_only_in_stock", value: on ? "true" : "false" });
  settingOnlyStock.disabled = false;
  if (error) {
    settingOnlyStock.checked = !on;
    showToast("Não deu para salvar: " + error.message);
    return;
  }
  ADMIN_SETTINGS.site_only_in_stock = on ? "true" : "false";
  updateOnlyStockHint();
  showToast(on ? "Site mostra só o que tem em estoque" : "Site mostra todos os perfumes marcados");
});

settingLogoFile.addEventListener("change", () => {
  const file = settingLogoFile.files[0];
  if (file) setPhotoPreview(settingLogoPreview, URL.createObjectURL(file));
});

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  settingsSaveMsg.classList.remove("error");
  settingsSaveMsg.textContent = "";
  settingsSaveBtn.disabled = true;
  settingsSaveBtn.textContent = "Salvando…";

  try {
    let logoUrl = ADMIN_SETTINGS.logo_url || "";
    const file = settingLogoFile.files[0];
    if (file) logoUrl = await uploadImage(file, "logo");

    const rows = [
      { key: "store_name", value: settingStoreName.value.trim() },
      { key: "whatsapp_number", value: settingWhatsapp.value.replace(/\D/g, "") },
      { key: "instagram", value: settingInstagram.value.trim().replace(/^@/, "") },
      { key: "logo_url", value: logoUrl },
      { key: "whatsapp_msg_buy", value: settingMsgBuy.value.trim() || DEFAULT_MSG_BUY },
      { key: "whatsapp_msg_cart", value: settingMsgCart.value.trim() || DEFAULT_MSG_CART }
    ];

    const { error } = await sb.from("settings").upsert(rows);
    if (error) throw error;

    showToast("Ajustes salvos");
    await loadAllData();
  } catch (err) {
    formError(settingsSaveMsg, "Não deu para salvar: " + err.message);
  } finally {
    settingsSaveBtn.disabled = false;
    settingsSaveBtn.textContent = "Salvar ajustes";
  }
});

// ==== ACESSOS ====
const adminsList = $("adminsList");
const adminsListMsg = $("adminsListMsg");
const adminModalOverlay = $("adminModalOverlay");
const adminForm = $("adminForm");
const adminEmailInput = $("adminEmail");
const adminPasswordInput = $("adminPassword");
const adminSaveMsg = $("adminSaveMsg");
const adminSaveBtn = $("adminSaveBtn");

let currentAdminUserId = null;

async function callAdminUsersFn(payload) {
  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Entre de novo.");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Erro inesperado.");
  return json;
}

function formatDate(iso) {
  if (!iso) return "nunca";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

async function loadAdmins() {
  adminsListMsg.textContent = "";
  adminsListMsg.classList.remove("error");
  try {
    const { data: sessionData } = await sb.auth.getSession();
    currentAdminUserId = sessionData?.session?.user?.id || null;
    const { users } = await callAdminUsersFn({ action: "list" });
    renderAdminsList(users || []);
  } catch (err) {
    adminsList.innerHTML = "";
    adminsListMsg.textContent = "Não consegui carregar a lista: " + err.message;
    adminsListMsg.classList.add("error");
  }
}

function renderAdminsList(users) {
  if (users.length === 0) {
    adminsList.innerHTML = `<li class="list-empty">Ninguém além de você.</li>`;
    return;
  }
  adminsList.innerHTML = users.map(u => `
    <li class="simple-row">
      <span class="row-main" style="cursor:default">
        <span class="row-text">
          <span class="row-name">${escapeHtml(u.email)}${u.id === currentAdminUserId ? ` <span class="row-badge">você</span>` : ""}</span>
          <span class="row-meta"><span>Último acesso: ${formatDate(u.last_sign_in_at)}</span></span>
        </span>
      </span>
      <div class="row-actions">
        ${u.id === currentAdminUserId ? "" : `<button type="button" class="btn-icon" data-action="delete-admin" data-id="${u.id}" data-email="${escapeHtml(u.email)}" aria-label="Remover acesso de ${escapeHtml(u.email)}"><svg class="icon"><use href="#i-trash"/></svg></button>`}
      </div>
    </li>
  `).join("");
}

adminsList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='delete-admin']");
  if (!btn) return;
  const ok = await askConfirm({
    title: "Remover acesso?",
    text: `${btn.dataset.email} não vai mais conseguir entrar no painel.`,
    yes: "Remover"
  });
  if (!ok) return;
  try {
    await callAdminUsersFn({ action: "delete", userId: btn.dataset.id });
    showToast("Acesso removido");
    await loadAdmins();
  } catch (err) {
    showToast("Não deu para remover: " + err.message);
  }
});

$("newAdminBtn").addEventListener("click", () => {
  adminForm.reset();
  adminSaveMsg.textContent = "";
  adminSaveMsg.classList.remove("error");
  openSheet(adminModalOverlay);
});

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  adminSaveBtn.disabled = true;
  adminSaveBtn.textContent = "Salvando…";
  adminSaveMsg.classList.remove("error");
  adminSaveMsg.textContent = "";
  try {
    await callAdminUsersFn({
      action: "create",
      email: adminEmailInput.value.trim(),
      password: adminPasswordInput.value
    });
    closeSheet(adminModalOverlay);
    showToast("Acesso criado");
    await loadAdmins();
  } catch (err) {
    formError(adminSaveMsg, "Não deu para salvar: " + err.message);
  } finally {
    adminSaveBtn.disabled = false;
    adminSaveBtn.textContent = "Salvar";
  }
});

// ==== INIT ====
// (pdv.js carrega depois e completa as telas de entrada, vender e vendas)
window.addEventListener("DOMContentLoaded", checkSession);
