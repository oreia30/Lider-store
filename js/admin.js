// ==== PAINEL LÍDER STORE: núcleo, navegação, produtos e site ====

// ---------- estado ----------
let ADMIN_PRODUCTS = [];
let ADMIN_CATEGORIES = [];
let ADMIN_SETTINGS = {};
let ADMIN_BANNERS = [];
let COSTS = {};                    // product_id -> custo
let VARIANTS = {};                 // product_id -> [{ id, name, stock, sort_order }] (tamanho, voltagem...)

let statusFilter = "active";       // active | stock | low | nostock | noprice | hidden | all
let selecting = false;
const selectedIds = new Set();
let currentView = "inicio";

const LOW_STOCK = 2;
const HOOKS = { data: [], view: [] }; // outros arquivos se penduram aqui

const $ = (id) => document.getElementById(id);

// ---------- utilitários ----------
let toastTimer;
function showToast(text) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}
function slugify(str) {
  return (str || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function normalizeText(str) {
  return (str || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function formatBRL(v) { return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
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
function plural(n, one, many) { return `${Number(n).toLocaleString("pt-BR")} ${n === 1 ? one : many}`; }
function chunk(arr, size) { const o = []; for (let i = 0; i < arr.length; i += size) o.push(arr.slice(i, i + size)); return o; }
const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
const onlyDigits = (s) => String(s || "").replace(/\D/g, "");

const isActive = (p) => p.active !== false;
const stockOf = (p) => Number(p.stock || 0);
const hasPrice = (p) => Number(p.price) > 0;
const productById = (id) => ADMIN_PRODUCTS.find(p => p.id === id);
const variantsOf = (id) => VARIANTS[id] || [];
const hasVariants = (id) => variantsOf(id).length > 0;
function variantById(vid) {
  for (const k in VARIANTS) { const v = VARIANTS[k].find(x => x.id === vid); if (v) return v; }
  return null;
}
function setVariants(rows) {
  VARIANTS = {};
  (rows || []).forEach(v => { (VARIANTS[v.product_id] = VARIANTS[v.product_id] || []).push(v); });
  Object.values(VARIANTS).forEach(a => a.sort((x, y) => x.sort_order - y.sort_order || x.name.localeCompare(y.name)));
}

function stockPill(p) {
  const s = stockOf(p);
  if (s <= 0) return `<span class="pill pill-bad">Sem estoque</span>`;
  return `<span class="pill ${s <= LOW_STOCK ? "pill-warn" : "pill-ok"}">${s} em estoque</span>`;
}
function formError(el, text, focusEl) {
  el.textContent = text;
  el.classList.add("error");
  if (focusEl) focusEl.focus();
}
function clearMsg(el) { el.textContent = ""; el.classList.remove("error"); }
function skeleton(ul, n = 5) {
  ul.innerHTML = Array.from({ length: n }, () => `<li class="skeleton"><i></i><i></i></li>`).join("");
}

// ---------- confirmação ----------
function askConfirm({ title = "Tem certeza?", text = "", yes = "Excluir", no = "Voltar", danger = true, typeWord = null } = {}) {
  return new Promise((resolve) => {
    const ov = $("confirmOverlay");
    const typeInput = $("confirmTypeInput");
    $("confirmTitle").textContent = title;
    $("confirmText").textContent = text;
    $("confirmYes").textContent = yes;
    $("confirmNo").textContent = no || "";
    $("confirmNo").hidden = no === null;
    $("confirmYes").className = "btn " + (danger ? "btn-danger" : "btn-cta");
    $("confirmTypeWrap").hidden = !typeWord;
    typeInput.value = "";
    const sync = () => { $("confirmYes").disabled = !!typeWord && typeInput.value.trim().toUpperCase() !== typeWord; };
    typeInput.oninput = sync;
    if (typeWord) $("confirmTypeLabel").textContent = `Digite ${typeWord} para confirmar`;
    sync();
    ov.hidden = false;
    lockScroll();
    (typeWord ? typeInput : (no === null ? $("confirmYes") : $("confirmNo"))).focus();
    const done = (val) => {
      ov.hidden = true;
      typeInput.oninput = null;
      $("confirmYes").disabled = false;
      unlockScrollIfIdle();
      $("confirmYes").onclick = $("confirmNo").onclick = ov.onclick = null;
      document.removeEventListener("keydown", onKey);
      resolve(val);
    };
    const onKey = (e) => { if (e.key === "Escape") done(false); };
    document.addEventListener("keydown", onKey);
    $("confirmYes").onclick = () => done(true);
    $("confirmNo").onclick = () => done(false);
    ov.onclick = (e) => { if (e.target === ov) done(false); };
  });
}

// ---------- folhas (a página de trás não se mexe) ----------
let lockedY = 0;
function anySheetOpen() {
  return !!document.querySelector(".overlay:not([hidden])") || document.body.classList.contains("sale-open");
}
function lockScroll() {
  if (document.body.classList.contains("scroll-locked")) return;
  lockedY = window.scrollY;
  document.body.classList.add("scroll-locked");
  Object.assign(document.body.style, { position: "fixed", top: `-${lockedY}px`, left: "0", right: "0" });
}
function unlockScrollIfIdle() {
  if (anySheetOpen() || !document.body.classList.contains("scroll-locked")) return;
  document.body.classList.remove("scroll-locked");
  Object.assign(document.body.style, { position: "", top: "", left: "", right: "" });
  window.scrollTo(0, lockedY);
}
function openSheet(ov) {
  ov.hidden = false;
  lockScroll();
  const b = ov.querySelector(".sheet-body");
  if (b) b.scrollTop = 0;
}
function closeSheet(ov) { ov.hidden = true; unlockScrollIfIdle(); }
document.querySelectorAll(".overlay:not(.confirm-overlay)").forEach(ov => {
  ov.addEventListener("click", (e) => {
    if (e.target === ov || e.target.closest("[data-close]")) closeSheet(ov);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !$("confirmOverlay").hidden) return;
  const open = [...document.querySelectorAll(".overlay:not(.confirm-overlay):not([hidden])")].pop();
  if (open) closeSheet(open);
  else if (document.body.classList.contains("sale-open")) closeSalePanel();
  else if (selecting) setSelecting(false);
});

function setPhoto(img, src) {
  if (src) img.setAttribute("src", src); else img.removeAttribute("src");
  img.closest(".photo").classList.toggle("has-photo", !!src);
}
function syncPhotoLabels(img, emptyEl, changeEl) {
  const has = img.hasAttribute("src");
  emptyEl.hidden = has;
  changeEl.hidden = !has;
}

// ---------- entrar / sair ----------
async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data.session) showDashboard(data.session.user);
  else { $("loginWrap").hidden = false; $("dashboard").hidden = true; }
}
async function showDashboard(user) {
  $("loginWrap").hidden = true;
  $("dashboard").hidden = false;
  $("userEmail").textContent = user.email;
  $("meEmail").textContent = user.email;
  $("meAvatar").textContent = (user.email || "L")[0].toUpperCase();
  const start = new URLSearchParams(location.search).get("v");
  showView(start && $(`view-${start}`) ? start : "inicio", { replace: true });
  skeleton($("productList"));
  await loadAllData();
}
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("loginBtn");
  $("loginError").textContent = "";
  btn.disabled = true; btn.textContent = "Entrando…";
  const { data, error } = await sb.auth.signInWithPassword({ email: $("loginEmail").value.trim(), password: $("loginPassword").value });
  btn.disabled = false; btn.textContent = "Entrar";
  if (error) {
    $("loginError").textContent = error.message === "Email not confirmed" ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha não conferem.";
    return;
  }
  showDashboard(data.user);
});
document.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-action='logout']")) return;
  const ok = await askConfirm({ title: "Sair do painel?", text: "Você vai precisar do e-mail e da senha para entrar de novo.", yes: "Sair", danger: false });
  if (!ok) return;
  await sb.auth.signOut();
  location.reload();
});

// ---------- navegação ----------
const VIEW_TITLES = {
  inicio: "Início", produtos: "Produtos", vender: "Vender", vendas: "Vendas", prazo: "Prazo e clientes",
  maquininha: "Maquininha", site: "Loja e site", categorias: "Categorias", banners: "Banners", acessos: "Acessos", mais: "Mais"
};
const SUB_OF_MAIS = ["prazo", "maquininha", "site", "categorias", "banners", "acessos"];

function showView(name, { replace = false } = {}) {
  if (!$(`view-${name}`)) return;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  if (name === "mais" && isDesktop) name = "inicio";
  currentView = name;
  document.querySelectorAll(".view").forEach(v => v.hidden = v.id !== `view-${name}`);
  document.querySelectorAll(".bnav-item").forEach(b => {
    const on = b.dataset.view === name || (b.dataset.view === "mais" && SUB_OF_MAIS.includes(name));
    b.classList.toggle("active", on);
  });
  document.querySelectorAll(".side-item[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  $("topTitle").textContent = VIEW_TITLES[name] || "";
  $("topTitle").hidden = name === "inicio" && !isDesktop;
  $("topLogo").hidden = name !== "inicio" && !isDesktop;
  $("topBack").hidden = isDesktop || !SUB_OF_MAIS.includes(name);
  $("fabNewProduct").hidden = name !== "produtos";
  if (name !== "produtos") setSelecting(false);
  if (typeof closeSalePanel === "function" && name !== "vender") closeSalePanel();
  const url = new URL(location.href);
  url.searchParams.set("v", name);
  history[replace ? "replaceState" : "pushState"]({ v: name }, "", url);
  window.scrollTo({ top: 0 });
  HOOKS.view.forEach(fn => fn(name));
}
window.addEventListener("popstate", (e) => {
  const v = (e.state && e.state.v) || new URLSearchParams(location.search).get("v") || "inicio";
  if (!$("dashboard").hidden) showView(v, { replace: true });
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-view]");
  if (b && !b.closest(".overlay")) { showView(b.dataset.view); }
});
$("topBack").addEventListener("click", () => showView("mais"));

// ---------- carregar dados ----------
async function loadAllData() {
  const [prodRes, catRes, settRes, bannerRes, costRes, varRes] = await Promise.all([
    sb.from("products").select("*").order("created_at", { ascending: true }),
    sb.from("categories").select("*").order("sort_order", { ascending: true }),
    sb.from("settings").select("*"),
    sb.from("banners").select("*").order("sort_order", { ascending: true }),
    sb.from("product_costs").select("product_id,cost"),
    sb.from("product_variants").select("*")
  ]);
  if (!varRes.error) setVariants(varRes.data);
  if (prodRes.error) showToast("Não consegui carregar os produtos. Recarregue a página.");
  ADMIN_PRODUCTS = prodRes.data || [];
  ADMIN_CATEGORIES = catRes.data || [];
  ADMIN_SETTINGS = {};
  (settRes.data || []).forEach(s => { ADMIN_SETTINGS[s.key] = s.value; });
  ADMIN_BANNERS = bannerRes.data || [];
  COSTS = {};
  (costRes.data || []).forEach(c => { COSTS[c.product_id] = Number(c.cost); });
  const ids = new Set(ADMIN_PRODUCTS.map(p => p.id));
  [...selectedIds].forEach(id => { if (!ids.has(id)) selectedIds.delete(id); });

  if (ADMIN_SETTINGS.logo_url) ["sideLogo", "topLogo"].forEach(id => { $(id).src = ADMIN_SETTINGS.logo_url; });
  renderCategoryFilterOptions();
  renderProductsList();
  renderBannersList();
  fillSettingsForm();
  loadAdmins();
  HOOKS.data.forEach(fn => fn());
}
async function reloadProducts() {
  const [p, c, v] = await Promise.all([
    sb.from("products").select("*").order("created_at", { ascending: true }),
    sb.from("product_costs").select("product_id,cost"),
    sb.from("product_variants").select("*")
  ]);
  if (!v.error) setVariants(v.data);
  if (!p.error && p.data) ADMIN_PRODUCTS = p.data;
  if (!c.error) { COSTS = {}; (c.data || []).forEach(x => { COSTS[x.product_id] = Number(x.cost); }); }
  renderProductsList();
  HOOKS.data.forEach(fn => fn());
}
function categoryLabel(id) {
  const c = ADMIN_CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
}

// ---------- produtos: lista ----------
const productList = $("productList");
const productSearch = $("productSearch");
const productCategoryFilter = $("productCategoryFilter");

function renderCategoryFilterOptions() {
  const cur = productCategoryFilter.value;
  productCategoryFilter.innerHTML = `<option value="">Todas as categorias</option>` +
    ADMIN_CATEGORIES.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");
  productCategoryFilter.value = ADMIN_CATEGORIES.some(c => c.id === cur) ? cur : "";
  $("tileCats").textContent = plural(ADMIN_CATEGORIES.length, "categoria", "categorias");
}
function baseFiltered() {
  const q = normalizeText(productSearch.value.trim());
  const cat = productCategoryFilter.value;
  return ADMIN_PRODUCTS.filter(p => isActive(p) && (!q || normalizeText(p.name).includes(q)) && (!cat || p.category === cat));
}
const STATUS_TEST = {
  active: () => true,
  stock: (p) => stockOf(p) > 0,
  low: (p) => isActive(p) && stockOf(p) > 0 && stockOf(p) <= LOW_STOCK,
  nostock: (p) => isActive(p) && stockOf(p) <= 0,
  noprice: (p) => !hasPrice(p)
};
const visibleProducts = () => baseFiltered().filter(STATUS_TEST[statusFilter]);

function renderProductsList() {
  const base = baseFiltered();
  const count = (k) => base.filter(STATUS_TEST[k]).length;
  [["countActive", "active"], ["countStock", "stock"], ["countLow", "low"], ["countNoStock", "nostock"], ["countNoPrice", "noprice"]]
    .forEach(([id, k]) => { $(id).textContent = count(k); });

  const active = ADMIN_PRODUCTS.filter(isActive);
  const units = active.reduce((s, p) => s + Math.max(0, stockOf(p)), 0);
  const value = active.reduce((s, p) => s + Math.max(0, stockOf(p)) * (COSTS[p.id] || 0), 0);
  $("statActive").textContent = active.length.toLocaleString("pt-BR");
  $("catalogCtaSub").textContent = `${active.length} de ${ADMIN_PRODUCTS.length} produtos do catálogo na sua lista`;
  $("statUnits").textContent = units.toLocaleString("pt-BR");
  $("statValue").textContent = Math.round(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const list = visibleProducts();
  const filtered = productSearch.value || productCategoryFilter.value;
  if (list.length === 0) {
    const EMPTY = {
      active: `<strong>Sua lista está vazia</strong>Toque em "Escolher os produtos que eu trabalho" e marque os que você vende.`,
      stock: `<strong>Nada em estoque ainda</strong>Toque em "Chegou mercadoria" no Início para lançar o que comprou.`,
      low: `<strong>Nada acabando</strong>Nenhum produto que você trabalha está com ${LOW_STOCK} ou menos.`,
      nostock: `<strong>Tudo com estoque</strong>`,
      noprice: `<strong>Todos têm preço</strong>`,
    };
    productList.innerHTML = `<li class="list-empty">${filtered ? "<strong>Nada encontrado</strong>Tente outro nome ou limpe os filtros." : EMPTY[statusFilter]}</li>`;
  } else {
    productList.innerHTML = list.map(p => {
      const on = isActive(p);
      const sel = selectedIds.has(p.id);
      return `
      <li class="row${on ? "" : " is-hidden"}${sel ? " is-selected" : ""}" data-id="${p.id}">
        <button type="button" class="row-main" data-action="open" aria-pressed="${selecting ? sel : "false"}">
          <span class="check-box" aria-hidden="true"><svg class="i"><use href="#i-check"/></svg></span>
          <img class="thumb" src="${escapeHtml(p.img)}" alt="" loading="lazy" decoding="async">
          <span class="row-text">
            <span class="row-name">${escapeHtml(p.name)}</span>
            <span class="row-meta">
              ${hasPrice(p) ? `<span class="row-price">${formatBRL(p.price)}</span>` : `<span class="pill pill-bad">Sem preço</span>`}
              ${stockPill(p)}
              ${on ? "" : `<span class="pill pill-mute">Não trabalho</span>`}
            </span>
            ${hasVariants(p.id) ? `<span class="row-opts">${escapeHtml(variantsOf(p.id).map(v => `${v.name}: ${v.stock}`).join("  ·  "))}</span>` : ""}
          </span>
        </button>
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
    setChip(container, btn);
    onPick(btn.dataset[attr]);
  });
}
function setChip(container, btn) {
  container.querySelectorAll(".chip").forEach(c => { c.classList.toggle("active", c === btn); c.setAttribute("aria-selected", c === btn); });
  btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}
wireChips($("statusFilter"), "status", (v) => { statusFilter = v; renderProductsList(); });
function setStatusFilter(v) {
  statusFilter = v;
  const b = $("statusFilter").querySelector(`[data-status="${v}"]`);
  if (b) setChip($("statusFilter"), b);
  renderProductsList();
}

// toque: abre ou marca
let suppressNextClick = false;
productList.addEventListener("click", (e) => {
  const row = e.target.closest(".row");
  if (!row || !e.target.closest("[data-action='open']")) return;
  if (suppressNextClick) { suppressNextClick = false; return; }
  if (selecting) toggleSelected(row.dataset.id); else openProductModal(row.dataset.id);
});

// segurar o dedo liga a seleção
let pressTimer = null, pressStart = null;
productList.addEventListener("pointerdown", (e) => {
  suppressNextClick = false;
  const main = e.target.closest("[data-action='open']");
  if (!main || selecting) return;
  pressStart = { x: e.clientX, y: e.clientY };
  const id = main.closest(".row").dataset.id;
  pressTimer = setTimeout(() => {
    pressTimer = null; suppressNextClick = true;
    setSelecting(true); toggleSelected(id, true);
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

// ---------- seleção ----------
const bulkBar = $("bulkBar");
const selectAllCheckbox = $("selectAllCheckbox");
function setSelecting(on) {
  if (selecting === on && on) return;
  selecting = on;
  if (!on) selectedIds.clear();
  $("view-produtos").classList.toggle("selecting", on);
  $("selectModeBtn").classList.toggle("is-on", on);
  $("selectModeBtn").querySelector("span").textContent = on ? "Cancelar" : "Selecionar";
  renderProductsList();
}
function toggleSelected(id, force) {
  const want = force ?? !selectedIds.has(id);
  if (want) selectedIds.add(id); else selectedIds.delete(id);
  const row = productList.querySelector(`.row[data-id="${CSS.escape(id)}"]`);
  if (row) { row.classList.toggle("is-selected", want); row.querySelector(".row-main").setAttribute("aria-pressed", want); }
  updateSelectionUI();
}
function updateSelectionUI() {
  const vis = visibleProducts();
  const visSel = vis.filter(p => selectedIds.has(p.id)).length;
  $("selectAllRow").hidden = !selecting || vis.length === 0;
  selectAllCheckbox.checked = vis.length > 0 && visSel === vis.length;
  selectAllCheckbox.indeterminate = visSel > 0 && visSel < vis.length;
  $("selectAllLabel").textContent = selectAllCheckbox.checked ? `Todos os ${vis.length} marcados` : `Marcar todos os ${vis.length} da lista`;
  const n = selectedIds.size;
  bulkBar.hidden = !selecting;
  document.body.classList.toggle("has-bulk", selecting);
  $("bulkCount").textContent = n === 0 ? "Toque nos produtos para marcar" : plural(n, "selecionado", "selecionados");
  bulkBar.querySelectorAll(".bulk-btn").forEach(b => { b.disabled = n === 0; });
}
$("selectModeBtn").addEventListener("click", () => setSelecting(!selecting));
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
  if (!ids.length) return;
  const a = btn.dataset.bulk;
  if (a === "entry") openEntry(ids);
  if (a === "hide") {
    const ok = await askConfirm({
      title: ids.length === 1 ? "Tirar da sua lista?" : `Tirar ${ids.length} produtos da sua lista?`,
      text: "Saem de Produtos, de Vender e do site, mas continuam no catálogo. Para voltar, use \"Escolher os produtos que eu trabalho\".",
      yes: "Tirar", danger: false
    });
    if (ok) await setProductsActive(ids, false);
  }
  if (a === "more") openSheet($("bulkMoreOverlay"));
});
$("bulkDeleteBtn").addEventListener("click", async () => {
  closeSheet($("bulkMoreOverlay"));
  const ids = [...selectedIds];
  if (ids.length) await deleteProducts(ids);
});
async function withBulkBusy(fn) {
  bulkBar.querySelectorAll(".bulk-btn").forEach(b => b.disabled = true);
  try { return await fn(); } finally { updateSelectionUI(); }
}

// ---------- trabalho / não trabalho ----------
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
    const noPrice = active ? ids.filter(id => !hasPrice(productById(id) || {})).length : 0;
    const note = noPrice ? ` ${noPrice === 1 ? "Está" : `${noPrice} estão`} sem preço: só aparece${noPrice === 1 ? "" : "m"} no site com preço.` : "";
    if (quiet) {
      const p = productById(ids[0]);
      showToast((active ? `Trabalho: ${p?.name || "produto"}.` : `Não trabalho: ${p?.name || "produto"}. Saiu do site.`) + note);
    } else {
      showToast((active ? `${plural(ids.length, "produto marcado", "produtos marcados")} como Trabalho.` : `${plural(ids.length, "produto marcado", "produtos marcados")} como Não trabalho.`) + note);
    }
    HOOKS.data.forEach(fn => fn());
  } catch (err) {
    ADMIN_PRODUCTS.forEach(p => { if (before.has(p.id)) p.active = before.get(p.id); });
    renderProductsList();
    showToast("Não deu para salvar: " + err.message);
  }
}

// ---------- catálogo: escolher os produtos que trabalho ----------
let catSel = new Set(), catOrig = new Set(), catCat = "", catOnlyMarked = false;
function openCatalog() {
  catOrig = new Set(ADMIN_PRODUCTS.filter(isActive).map(p => p.id));
  catSel = new Set(catOrig);
  catCat = ""; catOnlyMarked = false;
  $("catalogSearch").value = "";
  clearMsg($("catalogMsg"));
  const cats = ADMIN_CATEGORIES.filter(c => ADMIN_PRODUCTS.some(p => p.category === c.id));
  $("catalogCats").innerHTML = `<button class="chip active" data-cat="">Tudo</button><button class="chip" data-cat="__marked">Marcados</button>` +
    cats.map(c => `<button class="chip" data-cat="${escapeHtml(c.id)}">${escapeHtml(c.label)}</button>`).join("");
  renderCatalog();
  openSheet($("catalogOverlay"));
}
function catalogVisible() {
  const q = normalizeText($("catalogSearch").value.trim());
  return ADMIN_PRODUCTS.filter(p => (!q || normalizeText(p.name).includes(q)) &&
    (catCat === "__marked" ? catSel.has(p.id) : (!catCat || p.category === catCat)));
}
function renderCatalog() {
  const list = catalogVisible();
  $("catalogList").innerHTML = list.length ? list.map(p => `
    <li class="row${catSel.has(p.id) ? " is-selected" : ""}" data-id="${p.id}" role="checkbox" aria-checked="${catSel.has(p.id)}" tabindex="0">
      <span class="check-box" aria-hidden="true"><svg class="i"><use href="#i-check"/></svg></span>
      <img class="thumb" src="${escapeHtml(p.img)}" alt="" loading="lazy" decoding="async">
      <span class="row-text"><span class="row-name">${escapeHtml(p.name)}</span>
        <span class="row-meta">${hasPrice(p) ? `<span class="row-price">${formatBRL(p.price)}</span>` : `<span class="pill pill-bad">Sem preço</span>`}<span>· ${escapeHtml(categoryLabel(p.category))}</span>${stockOf(p) > 0 ? `<span class="pill pill-ok">${stockOf(p)} em estoque</span>` : ""}</span></span>
    </li>`).join("") : `<li class="list-empty"><strong>Nada encontrado</strong></li>`;
  updateCatalogFoot();
}
function updateCatalogFoot() {
  let add = 0, rem = 0;
  catSel.forEach(id => { if (!catOrig.has(id)) add++; });
  catOrig.forEach(id => { if (!catSel.has(id)) rem++; });
  $("catalogCount").textContent = plural(catSel.size, "marcado", "marcados");
  $("catalogDiff").textContent = add || rem ? [add ? `+${add} na lista` : "", rem ? `−${rem} saindo` : ""].filter(Boolean).join(" · ") : "Nenhuma mudança";
  $("catalogSaveBtn").disabled = !add && !rem;
}
$("openCatalogBtn").addEventListener("click", openCatalog);
$("catalogSearch").addEventListener("input", renderCatalog);
$("catalogCats").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  setChip($("catalogCats"), b);
  catCat = b.dataset.cat;
  renderCatalog();
});
$("catalogList").addEventListener("click", (e) => {
  const r = e.target.closest(".row[data-id]");
  if (!r) return;
  const id = r.dataset.id;
  if (catSel.has(id)) catSel.delete(id); else catSel.add(id);
  const on = catSel.has(id);
  r.classList.toggle("is-selected", on);
  r.setAttribute("aria-checked", on);
  updateCatalogFoot();
});
$("catalogMarkPriced").addEventListener("click", () => { ADMIN_PRODUCTS.filter(hasPrice).forEach(p => catSel.add(p.id)); renderCatalog(); });
$("catalogMarkList").addEventListener("click", () => { catalogVisible().forEach(p => catSel.add(p.id)); renderCatalog(); });
$("catalogUnmarkList").addEventListener("click", () => { catalogVisible().forEach(p => catSel.delete(p.id)); renderCatalog(); });
$("catalogCloseBtn").addEventListener("click", async () => {
  const changed = [...catSel].some(id => !catOrig.has(id)) || [...catOrig].some(id => !catSel.has(id));
  if (changed && !await askConfirm({ title: "Sair sem salvar?", text: "As marcações que você fez não vão valer.", yes: "Sair sem salvar", no: "Continuar marcando" })) return;
  closeSheet($("catalogOverlay"));
});
$("catalogOverlay").addEventListener("click", (e) => {
  if (e.target !== $("catalogOverlay")) return;
  e.stopImmediatePropagation(); // não fecha sozinho: pergunta se tem mudança
  $("catalogCloseBtn").click();
}, true);
$("catalogSaveBtn").addEventListener("click", async () => {
  const add = [...catSel].filter(id => !catOrig.has(id));
  const rem = [...catOrig].filter(id => !catSel.has(id));
  const btn = $("catalogSaveBtn");
  btn.disabled = true; btn.textContent = "Salvando…";
  try {
    for (const [ids, active] of [[add, true], [rem, false]]) {
      for (const part of chunk(ids, 100)) {
        const { error } = await sb.from("products").update({ active }).in("id", part);
        if (error) throw error;
      }
    }
    ADMIN_PRODUCTS.forEach(p => { if (add.includes(p.id)) p.active = true; if (rem.includes(p.id)) p.active = false; });
    closeSheet($("catalogOverlay"));
    const noPrice = add.filter(id => !hasPrice(productById(id))).length;
    showToast(`Lista salva: ${plural(catSel.size, "produto", "produtos")}.${noPrice ? ` ${noPrice} sem preço só aparece${noPrice === 1 ? "" : "m"} no site com preço.` : ""}`);
    setStatusFilter("active");
    HOOKS.data.forEach(fn => fn());
  } catch (err) {
    formError($("catalogMsg"), "Não deu para salvar: " + err.message);
  } finally { btn.disabled = false; btn.textContent = "Salvar"; }
});

// ---------- excluir ----------
async function deleteProducts(ids) {
  const names = ids.map(id => productById(id)?.name).filter(Boolean);
  const ok = await askConfirm({
    title: ids.length === 1 ? "Excluir este produto de vez?" : `Excluir ${ids.length} produtos de vez?`,
    text: (ids.length === 1 ? `"${names[0]}" vai sumir do painel e do site, com estoque e histórico.` : `Eles vão sumir do painel e do site, com estoque e histórico.`) +
      ` Não dá para desfazer. Se você só não trabalha com ${ids.length === 1 ? "ele" : "eles"}, use "Não trabalho".`,
    yes: ids.length === 1 ? "Excluir" : `Excluir ${ids.length}`,
    typeWord: ids.length > 1 ? "EXCLUIR" : null
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
    HOOKS.data.forEach(fn => fn());
    showToast(ids.length === 1 ? "Produto excluído" : `${ids.length} produtos excluídos`);
    return true;
  } catch (err) {
    showToast("Não deu para excluir: " + err.message);
    await loadAllData();
    return false;
  }
}

// ---------- produto: formulário ----------
const productModalOverlay = $("productModalOverlay");
const productForm = $("productForm");
const productIdInput = $("productId");
const productNameInput = $("productName");
const productPriceInput = $("productPrice");
const productCostInput = $("productCost");
const productDescInput = $("productDesc");
const productCategorySelect = $("productCategory");
const productActiveInput = $("productActive");
const productInitialStock = $("productInitialStock");
const productImageFile = $("productImageFile");
const productImagePreview = $("productImagePreview");
const productSaveMsg = $("productSaveMsg");
const productSaveBtn = $("productSaveBtn");
const productHasOpts = $("productHasOpts");
const optList = $("optList");

$("newProductBtn").addEventListener("click", () => openProductModal(null));
$("fabNewProduct").addEventListener("click", () => openProductModal(null));

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

// categoria nova sem sair do cadastro
function fillProductCategories(selected) {
  productCategorySelect.innerHTML = ADMIN_CATEGORIES.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");
  if (selected && ADMIN_CATEGORIES.some(c => c.id === selected)) productCategorySelect.value = selected;
}
$("productNewCatBtn").addEventListener("click", () => {
  const w = $("productNewCatWrap");
  w.hidden = !w.hidden;
  if (!w.hidden) $("productNewCatName").focus();
});
$("productNewCatName").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("productNewCatSave").click(); } });
$("productNewCatSave").addEventListener("click", async () => {
  const label = $("productNewCatName").value.trim();
  if (!label) return $("productNewCatName").focus();
  const id = slugify(label);
  const found = ADMIN_CATEGORIES.find(c => c.id === id || normalizeText(c.label) === normalizeText(label));
  if (found) {
    productCategorySelect.value = found.id;
  } else {
    const btn = $("productNewCatSave");
    btn.disabled = true;
    const sort = ADMIN_CATEGORIES.reduce((m, c) => Math.max(m, Number(c.sort_order) || 0), -1) + 1;
    const { error } = await sb.from("categories").insert({ id, label, sort_order: sort });
    btn.disabled = false;
    if (error) return showToast("Não deu para criar a categoria: " + error.message);
    ADMIN_CATEGORIES.push({ id, label, sort_order: sort });
    fillProductCategories(id);
    renderCategoryFilterOptions();
    renderCategoriesList();
    showToast(`Categoria "${label}" criada`);
  }
  $("productNewCatName").value = "";
  $("productNewCatWrap").hidden = true;
});

// ---------- opções (tamanho, voltagem, cor...) ----------
function optRowHtml({ id = "", name = "", stock = null }) {
  const old = !!id;
  return `<li class="opt" data-vid="${escapeHtml(id)}">
    <input type="text" class="opt-name" value="${escapeHtml(name)}" placeholder="Ex: M" aria-label="Nome da opção" maxlength="40">
    ${old ? `<span class="opt-have"><b>${stock}</b>em estoque</span>`
          : `<input type="number" class="opt-qty" min="0" step="1" inputmode="numeric" placeholder="0" aria-label="Quantidade em estoque">`}
    <button type="button" class="icon-btn" data-opt-del aria-label="Tirar opção"><svg class="i sm"><use href="#i-x"/></svg></button>
  </li>`;
}
function renderOptHead() {
  const has = optList.children.length > 0;
  let head = $("optHead");
  if (!head) {
    head = document.createElement("div");
    head.id = "optHead"; head.className = "opt-head";
    head.innerHTML = `<span>OPÇÃO</span><span>QTD</span><span></span>`;
    optList.before(head);
  }
  head.hidden = !has;
}
function addOptRows(names) {
  const have = new Set([...optList.querySelectorAll(".opt-name")].map(i => normalizeText(i.value.trim())).filter(Boolean));
  // linha vazia some quando entra um pronto
  optList.querySelectorAll(".opt").forEach(li => { if (!li.dataset.vid && !li.querySelector(".opt-name").value.trim()) li.remove(); });
  names.filter(n => !have.has(normalizeText(n))).forEach(n => optList.insertAdjacentHTML("beforeend", optRowHtml({ name: n })));
  renderOptHead();
  syncOptNote();
}
function syncOptNote() {
  const id = productIdInput.value;
  const p = id ? productById(id) : null;
  const note = $("optNote");
  if (p && !hasVariants(id) && stockOf(p) > 0 && productHasOpts.checked) {
    note.hidden = false;
    note.textContent = `Hoje tem ${stockOf(p)} sem opção. Ao salvar, o estoque passa a ser a soma das quantidades de cada opção.`;
  } else note.hidden = true;
}
function setOptsMode(on) {
  productHasOpts.checked = on;
  $("productOpts").hidden = !on;
  const isNew = !productIdInput.value;
  $("productInitialStockWrap").hidden = !isNew || on;
  if (on && !optList.children.length) addOptRows([""]);
  syncOptNote();
}
productHasOpts.addEventListener("change", () => setOptsMode(productHasOpts.checked));
$("optPresets").addEventListener("click", (e) => {
  const b = e.target.closest("[data-preset]");
  if (b) addOptRows(b.dataset.preset.split(","));
});
$("optAddBtn").addEventListener("click", () => {
  optList.insertAdjacentHTML("beforeend", optRowHtml({}));
  renderOptHead();
  optList.lastElementChild.querySelector(".opt-name").focus();
});
optList.addEventListener("click", (e) => {
  const b = e.target.closest("[data-opt-del]");
  if (!b) return;
  b.closest(".opt").remove();
  renderOptHead();
});
function readOpts() {
  return [...optList.querySelectorAll(".opt")].map((li, i) => {
    const q = li.querySelector(".opt-qty");
    return { id: li.dataset.vid || null, name: li.querySelector(".opt-name").value.trim(), qty: q && q.value !== "" ? Math.floor(Number(q.value)) : 0, sort_order: i };
  }).filter(o => o.id || o.name);
}

const MOVE_LABEL = { entrada: "Entrada", venda: "Venda", ajuste: "Correção", cancelamento: "Venda cancelada" };
async function loadProductMoves(id) {
  const ul = $("productMoves");
  ul.innerHTML = "";
  const { data, error } = await sb.from("stock_moves").select("qty,kind,unit_cost,note,created_at,variant_name")
    .eq("product_id", id).order("created_at", { ascending: false }).limit(8);
  if (error || !data || productIdInput.value !== id) return;
  ul.innerHTML = data.map(m => {
    const when = new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const extra = [m.variant_name || "", m.unit_cost != null ? `${formatBRL(m.unit_cost)}/un` : "", m.note || ""].filter(Boolean).join(" · ");
    return `<li><span>${when} · ${MOVE_LABEL[m.kind] || m.kind}${extra ? ` <small>${escapeHtml(extra)}</small>` : ""}</span>
      <span class="${m.qty > 0 ? "mv-in" : "mv-out"}">${m.qty > 0 ? "+" : ""}${m.qty}</span></li>`;
  }).join("");
}
function renderVarStock(id) {
  const ul = $("productVarStock");
  const vs = variantsOf(id);
  ul.hidden = !vs.length;
  ul.innerHTML = vs.map(v => `<li class="${v.stock > 0 ? "" : "zero"}">${escapeHtml(v.name)} · ${v.stock}</li>`).join("");
}
function refreshProductStockBox() {
  const id = productIdInput.value;
  const p = productById(id);
  if (!p || productModalOverlay.hidden) return;
  $("productStockNum").textContent = stockOf(p);
  renderVarStock(id);
  // atualiza o "em estoque" das opções que já existem, sem mexer no que está sendo digitado
  optList.querySelectorAll(".opt[data-vid]").forEach(li => {
    const v = variantById(li.dataset.vid);
    const b = li.querySelector(".opt-have b");
    if (v && b) b.textContent = v.stock;
  });
  if (COSTS[id] != null && document.activeElement !== productCostInput) productCostInput.value = priceToInput(COSTS[id]);
  updateMarginLine();
  loadProductMoves(id);
}
HOOKS.data.push(refreshProductStockBox);

function openProductModal(id) {
  productForm.reset();
  clearMsg(productSaveMsg);
  $("productNewCatWrap").hidden = true;
  optList.innerHTML = "";
  fillProductCategories();
  if (id) {
    const p = productById(id);
    $("productModalTitle").textContent = "Editar produto";
    productIdInput.value = p.id;
    productNameInput.value = p.name;
    productDescInput.value = p.description || "";
    productPriceInput.value = hasPrice(p) ? priceToInput(p.price) : "";
    productCostInput.value = COSTS[p.id] != null ? priceToInput(COSTS[p.id]) : "";
    productCategorySelect.value = p.category;
    productActiveInput.checked = isActive(p);
    setPhoto(productImagePreview, p.img);
    $("productDeleteBtn").hidden = false;
    $("productStockBox").hidden = false;
    $("productStockNum").textContent = stockOf(p);
    variantsOf(p.id).forEach(v => optList.insertAdjacentHTML("beforeend", optRowHtml(v)));
    renderVarStock(p.id);
    loadProductMoves(p.id);
  } else {
    $("productModalTitle").textContent = "Novo produto";
    productIdInput.value = "";
    productActiveInput.checked = true;
    if (productCategoryFilter.value) productCategorySelect.value = productCategoryFilter.value;
    setPhoto(productImagePreview, "");
    $("productDeleteBtn").hidden = true;
    $("productStockBox").hidden = true;
    $("productMoves").innerHTML = "";
  }
  renderOptHead();
  setOptsMode(!!id && hasVariants(id));
  updateMarginLine();
  syncPhotoLabels(productImagePreview, $("productPhotoEmpty"), $("productPhotoChange"));
  openSheet(productModalOverlay);
}
productImageFile.addEventListener("change", () => {
  const f = productImageFile.files[0];
  if (f) setPhoto(productImagePreview, URL.createObjectURL(f));
  syncPhotoLabels(productImagePreview, $("productPhotoEmpty"), $("productPhotoChange"));
});
$("productDeleteBtn").addEventListener("click", async () => {
  const id = productIdInput.value;
  if (id && await deleteProducts([id])) closeSheet(productModalOverlay);
});
$("productEntryBtn").addEventListener("click", () => { if (productIdInput.value) openEntry([productIdInput.value]); });
$("productAdjustBtn").addEventListener("click", () => { if (productIdInput.value) openAdjust(productIdInput.value); });

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg(productSaveMsg);
  const price = parsePrice(productPriceInput.value);
  if (!Number.isFinite(price) || price < 0) return formError(productSaveMsg, "Preço inválido. Escreva só o valor, por exemplo 99,90.", productPriceInput);
  const costRaw = productCostInput.value.trim();
  const cost = costRaw ? parsePrice(costRaw) : null;
  if (costRaw && (!Number.isFinite(cost) || cost < 0)) return formError(productSaveMsg, "Custo inválido. Escreva só o valor, por exemplo 45,00.", productCostInput);
  const initial = productInitialStock.value === "" ? 0 : Math.floor(Number(productInitialStock.value));
  if (!Number.isFinite(initial) || initial < 0) return formError(productSaveMsg, "Quantidade inválida.", productInitialStock);
  if (!productCategorySelect.value) return formError(productSaveMsg, "Escolha a categoria ou crie uma nova.", productCategorySelect);
  const id = productIdInput.value;
  let imgUrl = id ? productById(id).img : "";
  const file = productImageFile.files[0];
  if (!imgUrl && !file) return formError(productSaveMsg, "Coloque uma foto do produto.");

  // opções: o que fica, o que entra, o que sai
  const useOpts = productHasOpts.checked;
  const opts = useOpts ? readOpts() : [];
  if (useOpts) {
    if (!opts.length) return formError(productSaveMsg, "Coloque pelo menos uma opção, ou desligue \"Tem tamanhos ou opções\".");
    const blank = opts.find(o => !o.name);
    if (blank) return formError(productSaveMsg, "Tem opção sem nome. Escreva o nome ou tire a linha.");
    const seen = new Set();
    for (const o of opts) {
      const k = normalizeText(o.name);
      if (seen.has(k)) return formError(productSaveMsg, `A opção "${o.name}" está repetida.`);
      seen.add(k);
      if (!Number.isFinite(o.qty) || o.qty < 0) return formError(productSaveMsg, `Quantidade inválida em "${o.name}".`);
    }
  }
  const before = id ? variantsOf(id) : [];
  const keepIds = new Set(opts.filter(o => o.id).map(o => o.id));
  const removed = before.filter(v => !keepIds.has(v.id));
  const lostUnits = removed.reduce((n, v) => n + Number(v.stock), 0);
  if (removed.length && lostUnits > 0) {
    const ok = await askConfirm({
      title: useOpts ? `Tirar ${removed.length === 1 ? `a opção ${removed[0].name}` : `${removed.length} opções`}?` : "Desligar as opções?",
      text: `${plural(lostUnits, "unidade sai", "unidades saem")} do estoque (${removed.map(v => `${v.name}: ${v.stock}`).join(", ")}). O histórico de vendas continua.`,
      yes: "Tirar mesmo"
    });
    if (!ok) return;
  }

  productSaveBtn.disabled = true;
  productSaveBtn.textContent = file ? "Enviando foto…" : "Salvando…";
  try {
    if (file) imgUrl = await uploadImage(file, "produtos", { maxSize: 1000 });
    const payload = { name: productNameInput.value.trim(), description: productDescInput.value.trim() || null, price, category: productCategorySelect.value, img: imgUrl, active: productActiveInput.checked };
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
    // opções
    if (removed.length) {
      const { error } = await sb.from("product_variants").delete().in("id", removed.map(v => v.id));
      if (error) throw error;
    }
    for (const o of opts.filter(o => o.id)) {
      const old = before.find(v => v.id === o.id);
      if (old && (old.name !== o.name || old.sort_order !== o.sort_order)) {
        const { error } = await sb.from("product_variants").update({ name: o.name, sort_order: o.sort_order }).eq("id", o.id);
        if (error) throw error;
      }
    }
    const fresh = opts.filter(o => !o.id);
    let entries = [];
    if (fresh.length) {
      const { data, error } = await sb.from("product_variants")
        .insert(fresh.map(o => ({ product_id: productId, name: o.name, stock: 0, sort_order: o.sort_order }))).select("id,name");
      if (error) throw error;
      entries = fresh.filter(o => o.qty > 0).map(o => ({ product_id: productId, variant_id: data.find(d => d.name === o.name).id, qty: o.qty, unit_cost: cost }));
    } else if (!useOpts && !id && initial > 0) {
      entries = [{ product_id: productId, qty: initial, unit_cost: cost }];
    }
    if (entries.length) {
      const { error } = await sb.rpc("pdv_entrada", { p_items: entries, p_note: "Estoque inicial" });
      if (error) throw error;
    }
    closeSheet(productModalOverlay);
    showToast(id ? "Produto atualizado" : "Produto cadastrado");
    await loadAllData();
  } catch (err) {
    formError(productSaveMsg, /product_variants_uq|duplicate/.test(err.message) ? "Tem opção com nome repetido." : "Não deu para salvar: " + err.message);
    await reloadProducts();
  } finally {
    productSaveBtn.disabled = false;
    productSaveBtn.textContent = "Salvar";
  }
});

// ---------- envio de imagem (foto do celular é reduzida antes) ----------
async function shrinkImage(file, maxSize) {
  if (!maxSize || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise(r => cv.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch { return file; }
}
async function uploadImage(raw, folder, { maxSize } = {}) {
  const file = await shrinkImage(raw, maxSize);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, "")) || "img"}.${ext}`;
  const { error } = await sb.storage.from(STORE_IMAGES_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return sb.storage.from(STORE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

// ---------- categorias ----------
const categoriesList = $("categoriesList");
function renderCategoriesList() {
  if (!ADMIN_CATEGORIES.length) {
    categoriesList.innerHTML = `<li class="list-empty"><strong>Nenhuma categoria</strong>Crie uma para separar os produtos no site.</li>`;
    return;
  }
  categoriesList.innerHTML = ADMIN_CATEGORIES.map(c => {
    const all = ADMIN_PRODUCTS.filter(p => p.category === c.id);
    return `<li class="row" data-id="${escapeHtml(c.id)}">
      <button type="button" class="row-main" data-action="edit"><span class="row-text">
        <span class="row-name">${escapeHtml(c.label)}</span>
        <span class="row-meta"><span>${plural(all.length, "produto", "produtos")}</span><span>· ${all.filter(isActive).length} trabalho</span><span>· ordem ${c.sort_order}</span></span>
      </span></button>
      <div class="row-actions"><button type="button" class="icon-btn" data-action="delete" aria-label="Excluir categoria ${escapeHtml(c.label)}"><svg class="i sm"><use href="#i-trash"/></svg></button></div>
    </li>`;
  }).join("");
}
categoriesList.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = b.closest(".row").dataset.id;
  if (b.dataset.action === "edit") openCategoryModal(id);
  if (b.dataset.action === "delete") deleteCategory(id);
});
let categoryIdManual = false;
$("categoryId").addEventListener("input", () => { categoryIdManual = true; });
$("categoryLabel").addEventListener("input", () => { if (!categoryIdManual) $("categoryId").value = slugify($("categoryLabel").value); });
$("newCategoryBtn").addEventListener("click", () => openCategoryModal(null));
function openCategoryModal(id) {
  $("categoryForm").reset();
  clearMsg($("categorySaveMsg"));
  categoryIdManual = false;
  if (id) {
    const c = ADMIN_CATEGORIES.find(c => c.id === id);
    $("categoryModalTitle").textContent = "Editar categoria";
    $("categoryOriginalId").value = c.id;
    $("categoryLabel").value = c.label;
    $("categoryId").value = c.id;
    $("categorySort").value = c.sort_order;
    categoryIdManual = true;
  } else {
    $("categoryModalTitle").textContent = "Nova categoria";
    $("categoryOriginalId").value = "";
    $("categorySort").value = ADMIN_CATEGORIES.length;
  }
  openSheet($("categoryModalOverlay"));
}
$("categoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const orig = $("categoryOriginalId").value;
  const payload = { id: slugify($("categoryId").value), label: $("categoryLabel").value.trim(), sort_order: Number($("categorySort").value) || 0 };
  const { error } = orig ? await sb.from("categories").update(payload).eq("id", orig) : await sb.from("categories").insert(payload);
  if (error) return formError($("categorySaveMsg"), "Não deu para salvar: " + error.message);
  closeSheet($("categoryModalOverlay"));
  showToast("Categoria salva");
  await loadAllData();
});
async function deleteCategory(id) {
  const c = ADMIN_CATEGORIES.find(c => c.id === id);
  const inUse = ADMIN_PRODUCTS.filter(p => p.category === id).length;
  if (inUse) {
    await askConfirm({ title: "Essa categoria tem produtos", text: `"${c ? c.label : id}" tem ${plural(inUse, "produto", "produtos")}. Mude eles de categoria antes.`, yes: "Entendi", no: null, danger: false });
    return;
  }
  if (!await askConfirm({ title: "Excluir categoria?", text: `"${c ? c.label : ""}" vai sair do site.` })) return;
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) return showToast("Não deu para excluir: " + error.message);
  showToast("Categoria excluída");
  await loadAllData();
}

// ---------- banners ----------
const bannersList = $("bannersList");
function renderBannersList() {
  if (!ADMIN_BANNERS.length) {
    bannersList.innerHTML = `<li class="list-empty"><strong>Nenhum banner</strong>Sem banner, o site mostra o padrão da loja.</li>`;
    return;
  }
  bannersList.innerHTML = ADMIN_BANNERS.map(b => `<li class="row" data-id="${b.id}">
    <button type="button" class="row-main" data-action="edit">
      <img class="thumb-wide" src="${escapeHtml(b.image_url)}" alt="" loading="lazy">
      <span class="row-text"><span class="row-name">${escapeHtml(b.badge_text || "Sem selo")}</span><span class="row-meta">Ordem ${b.sort_order}</span></span>
    </button>
    <div class="row-actions"><button type="button" class="icon-btn" data-action="delete" aria-label="Excluir banner"><svg class="i sm"><use href="#i-trash"/></svg></button></div>
  </li>`).join("");
}
bannersList.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = b.closest(".row").dataset.id;
  if (b.dataset.action === "edit") openBannerModal(id);
  if (b.dataset.action === "delete") deleteBanner(id);
});
$("newBannerBtn").addEventListener("click", () => openBannerModal(null));
function openBannerModal(id) {
  $("bannerForm").reset();
  clearMsg($("bannerSaveMsg"));
  const b = id ? ADMIN_BANNERS.find(x => x.id === id) : null;
  $("bannerModalTitle").textContent = b ? "Editar banner" : "Novo banner";
  $("bannerId").value = b ? b.id : "";
  setPhoto($("bannerImagePreview"), b ? b.image_url : "");
  $("bannerBadgeText").value = b ? (b.badge_text || "") : "";
  $("bannerSort").value = b ? b.sort_order : ADMIN_BANNERS.length;
  syncPhotoLabels($("bannerImagePreview"), $("bannerPhotoEmpty"), $("bannerPhotoChange"));
  openSheet($("bannerModalOverlay"));
}
$("bannerImageFile").addEventListener("change", () => {
  const f = $("bannerImageFile").files[0];
  if (f) setPhoto($("bannerImagePreview"), URL.createObjectURL(f));
  syncPhotoLabels($("bannerImagePreview"), $("bannerPhotoEmpty"), $("bannerPhotoChange"));
});
$("bannerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("bannerSaveMsg"), btn = $("bannerSaveBtn");
  clearMsg(msg);
  const id = $("bannerId").value;
  let url = id ? ADMIN_BANNERS.find(b => b.id === id).image_url : "";
  const f = $("bannerImageFile").files[0];
  if (!url && !f) return formError(msg, "Escolha uma imagem para o banner.");
  btn.disabled = true; btn.textContent = f ? "Enviando imagem…" : "Salvando…";
  try {
    if (f) url = await uploadImage(f, "banners", { maxSize: 1600 });
    const payload = { image_url: url, badge_text: $("bannerBadgeText").value.trim() || null, sort_order: Number($("bannerSort").value) || 0 };
    const { error } = id ? await sb.from("banners").update(payload).eq("id", id) : await sb.from("banners").insert(payload);
    if (error) throw error;
    closeSheet($("bannerModalOverlay"));
    showToast(id ? "Banner atualizado" : "Banner criado");
    await loadAllData();
  } catch (err) {
    formError(msg, "Não deu para salvar: " + err.message);
  } finally { btn.disabled = false; btn.textContent = "Salvar"; }
});
async function deleteBanner(id) {
  if (!await askConfirm({ title: "Excluir banner?", text: "A imagem sai do topo do site." })) return;
  const { error } = await sb.from("banners").delete().eq("id", id);
  if (error) return showToast("Não deu para excluir: " + error.message);
  showToast("Banner excluído");
  await loadAllData();
}

// ---------- loja e site ----------
const DEFAULT_MSG_BUY = "Olá! Tenho interesse em comprar:\n\n1x {produto} - {preco}\n\nTotal: {total}";
const DEFAULT_MSG_CART = "Olá! Gostaria de fazer o seguinte pedido na {loja}:\n\n{itens}\n\nTotal: {total}";
const settingOnlyStock = $("settingOnlyStock");
function fillSettingsForm() {
  $("settingStoreName").value = ADMIN_SETTINGS.store_name || "";
  $("settingWhatsapp").value = ADMIN_SETTINGS.whatsapp_number || "";
  $("settingInstagram").value = ADMIN_SETTINGS.instagram || "";
  $("settingTagline").value = ADMIN_SETTINGS.store_tagline || "";
  $("settingPromo").value = ADMIN_SETTINGS.promo_text || "";
  setPhoto($("settingLogoPreview"), ADMIN_SETTINGS.logo_url || "assets/logo/logo.png");
  $("settingMsgBuy").value = ADMIN_SETTINGS.whatsapp_msg_buy || DEFAULT_MSG_BUY;
  $("settingMsgCart").value = ADMIN_SETTINGS.whatsapp_msg_cart || DEFAULT_MSG_CART;
  settingOnlyStock.checked = ADMIN_SETTINGS.site_only_in_stock === "true";
  updateOnlyStockHint();
}
function updateOnlyStockHint() {
  const shown = ADMIN_PRODUCTS.filter(p => isActive(p) && hasPrice(p) && (!settingOnlyStock.checked || stockOf(p) > 0)).length;
  $("onlyStockHint").textContent = settingOnlyStock.checked
    ? `Ligado: o site mostra ${plural(shown, "produto", "produtos")}. O que zerar some sozinho e volta quando der entrada.`
    : `Desligado: o site mostra os ${plural(shown, "produto", "produtos")} de Trabalho com preço, com ou sem estoque.`;
  $("tileSite").textContent = `${plural(shown, "produto", "produtos")} no site`;
}
HOOKS.data.push(updateOnlyStockHint);
settingOnlyStock.addEventListener("change", async () => {
  const on = settingOnlyStock.checked;
  settingOnlyStock.disabled = true;
  const { error } = await sb.from("settings").upsert({ key: "site_only_in_stock", value: on ? "true" : "false" });
  settingOnlyStock.disabled = false;
  if (error) { settingOnlyStock.checked = !on; return showToast("Não deu para salvar: " + error.message); }
  ADMIN_SETTINGS.site_only_in_stock = on ? "true" : "false";
  updateOnlyStockHint();
  showToast(on ? "Site mostra só o que tem em estoque" : "Site mostra todos os produtos de Trabalho");
});
$("settingLogoFile").addEventListener("change", () => {
  const f = $("settingLogoFile").files[0];
  if (f) setPhoto($("settingLogoPreview"), URL.createObjectURL(f));
});
$("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("settingsSaveMsg"), btn = $("settingsSaveBtn");
  clearMsg(msg);
  btn.disabled = true; btn.textContent = "Salvando…";
  try {
    let logo = ADMIN_SETTINGS.logo_url || "";
    const f = $("settingLogoFile").files[0];
    if (f) logo = await uploadImage(f, "logo");
    const rows = [
      { key: "store_name", value: $("settingStoreName").value.trim() },
      { key: "whatsapp_number", value: onlyDigits($("settingWhatsapp").value) },
      { key: "instagram", value: $("settingInstagram").value.trim().replace(/^@/, "") },
      { key: "logo_url", value: logo },
      { key: "store_tagline", value: $("settingTagline").value.trim() },
      { key: "promo_text", value: $("settingPromo").value.trim() },
      { key: "whatsapp_msg_buy", value: $("settingMsgBuy").value.trim() || DEFAULT_MSG_BUY },
      { key: "whatsapp_msg_cart", value: $("settingMsgCart").value.trim() || DEFAULT_MSG_CART }
    ];
    const { error } = await sb.from("settings").upsert(rows);
    if (error) throw error;
    showToast("Ajustes salvos");
    await loadAllData();
  } catch (err) {
    formError(msg, "Não deu para salvar: " + err.message);
  } finally { btn.disabled = false; btn.textContent = "Salvar"; }
});

// ---------- acessos ----------
let currentAdminUserId = null;
async function callAdminUsersFn(payload) {
  const { data } = await sb.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Entre de novo.");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Erro inesperado.");
  return json;
}
async function loadAdmins() {
  const msg = $("adminsListMsg");
  clearMsg(msg);
  try {
    const { data } = await sb.auth.getSession();
    currentAdminUserId = data?.session?.user?.id || null;
    const { users } = await callAdminUsersFn({ action: "list" });
    $("adminsList").innerHTML = (users || []).map(u => `<li class="row">
      <span class="row-main"><span class="avatar">${escapeHtml((u.email || "?")[0].toUpperCase())}</span><span class="row-text">
        <span class="row-name">${escapeHtml(u.email)}${u.id === currentAdminUserId ? ` <span class="pill pill-mute">você</span>` : ""}</span>
        <span class="row-meta">Último acesso: ${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "nunca"}</span>
      </span></span>
      <div class="row-actions">${u.id === currentAdminUserId ? "" : `<button type="button" class="icon-btn" data-action="delete-admin" data-id="${u.id}" data-email="${escapeHtml(u.email)}" aria-label="Remover acesso"><svg class="i sm"><use href="#i-trash"/></svg></button>`}</div>
    </li>`).join("");
  } catch (err) {
    $("adminsList").innerHTML = "";
    formError(msg, "Não consegui carregar a lista: " + err.message);
  }
}
$("adminsList").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-action='delete-admin']");
  if (!b) return;
  if (!await askConfirm({ title: "Remover acesso?", text: `${b.dataset.email} não vai mais conseguir entrar no painel.`, yes: "Remover" })) return;
  try { await callAdminUsersFn({ action: "delete", userId: b.dataset.id }); showToast("Acesso removido"); loadAdmins(); }
  catch (err) { showToast("Não deu para remover: " + err.message); }
});
$("newAdminBtn").addEventListener("click", () => { $("adminForm").reset(); clearMsg($("adminSaveMsg")); openSheet($("adminModalOverlay")); });
$("adminForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("adminSaveBtn");
  btn.disabled = true; btn.textContent = "Salvando…";
  try {
    await callAdminUsersFn({ action: "create", email: $("adminEmail").value.trim(), password: $("adminPassword").value });
    closeSheet($("adminModalOverlay"));
    showToast("Acesso criado");
    loadAdmins();
  } catch (err) { formError($("adminSaveMsg"), "Não deu para salvar: " + err.message); }
  finally { btn.disabled = false; btn.textContent = "Salvar"; }
});

window.addEventListener("DOMContentLoaded", checkSession);
