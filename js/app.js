// ==== CONFIGURAÇÃO DA LOJA (valores padrão, sobrescritos pelo banco) ====
const CONFIG = {
  whatsappNumber: "5532984280734",
  storeName: "Líder Store"
};

// ==== MENSAGENS PADRÃO DO WHATSAPP (usadas se não houver configuração salva) ====
const DEFAULT_MSG_BUY = "Olá! Tenho interesse em comprar:\n\n1x {produto} - {preco}\n\nTotal: {total}";
const DEFAULT_MSG_CART = "Olá! Gostaria de fazer o seguinte pedido na {loja}:\n\n{itens}\n\nTotal: {total}";

function fillTemplate(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));
}

// ==== CARRINHO (localStorage) ====
const CART_KEY = "liderstore_cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

let cart = loadCart();

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

// chave do carrinho: id do produto, ou "id|opção" quando tem tamanho/opção
const cartKey = (pid, vid) => (vid ? `${pid}|${vid}` : pid);
function parseKey(key) {
  const [pid, vid] = String(key).split("|");
  const p = findProduct(pid);
  const v = p && vid ? (p.variants || []).find(x => x.id === vid) : null;
  const ok = !!p && (vid ? !!v : !(p.variants || []).length);
  return { p, v, ok };
}
const hasOptions = (p) => !!(p && p.variants && p.variants.length);
const itemName = (p, v) => (v ? `${p.name} (${v.name})` : p.name);

function addToCart(id, qty = 1, vid = null) {
  const key = cartKey(id, vid);
  cart[key] = (cart[key] || 0) + qty;
  saveCart(cart);
  renderCart();
  showToast("Produto adicionado ao carrinho");
}

function setQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart(cart);
  renderCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [key, q]) => {
    const { p, ok } = parseKey(key);
    return ok ? sum + p.price * q : sum;
  }, 0);
}
function pruneCart() {
  let changed = false;
  Object.keys(cart).forEach(k => { if (!parseKey(k).ok) { delete cart[k]; changed = true; } });
  if (changed) saveCart(cart);
}

// ==== DADOS DA LOJA (Supabase) ====
let PRODUCTS = [];
let CATEGORIES = [];
let SETTINGS = {};
let BANNERS = [];
let currentCategory = ""; // "" = Tudo
let searchQuery = "";

// ==== RENDER PRODUTOS ====
const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const sectionTitle = document.getElementById("sectionTitle");
const categoryBarInner = document.getElementById("categoryBarInner");
const footerCategories = document.getElementById("footerCategories");
const searchEmpty = document.getElementById("searchEmpty");

function normalizeText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function currentProducts() {
  if (searchQuery) {
    const q = normalizeText(searchQuery);
    return PRODUCTS.filter(p => normalizeText(p.name).includes(q));
  }
  if (!currentCategory) return PRODUCTS;
  return PRODUCTS.filter(p => p.category === currentCategory);
}

function categoryLabel(id) {
  if (!id) return "Todos os produtos";
  const cat = CATEGORIES.find(c => c.id === id);
  return cat ? cat.label : "Produtos";
}

function renderProducts() {
  const list = currentProducts();

  if (sectionTitle) {
    sectionTitle.textContent = searchQuery
      ? `Resultados para "${searchQuery}"`
      : categoryLabel(currentCategory);
  }
  productCount.textContent = `${list.length} produto${list.length === 1 ? "" : "s"}`;

  if (searchEmpty) searchEmpty.hidden = list.length !== 0;

  productGrid.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image-wrap">
        <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">${formatBRL(p.price)}</div>
        ${hasOptions(p) ? `<div class="product-options-hint">${escapeHtml(p.variants.map(v => v.name).join(" · "))}</div>` : ""}
        <div class="product-actions">
          <button class="btn btn-add" data-action="add" data-id="${p.id}">Adicionar</button>
          <button class="btn btn-buy" data-action="buy" data-id="${p.id}">Comprar</button>
        </div>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

productGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  const id = btn ? btn.dataset.id : e.target.closest(".product-card")?.dataset.id;
  if (!id) return;
  const product = findProduct(id);
  if (!product) return;

  // com tamanho/opção: abre o produto para escolher antes
  if (btn && hasOptions(product)) {
    openProductModal(product, { needPick: true });
  } else if (btn && btn.dataset.action === "add") {
    addToCart(id, 1);
  } else if (btn && btn.dataset.action === "buy") {
    buyDirect(product);
  } else if (!btn) {
    openProductModal(product);
  }
});

// ==== BUSCA (LUPA) ====
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    if (searchClear) searchClear.hidden = !searchQuery;
    renderProducts();
  });
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchQuery = "";
    searchInput.value = "";
    searchClear.hidden = true;
    renderProducts();
    searchInput.focus();
  });
}

// ==== FILTRO DE CATEGORIA (dinâmico) ====
function renderCategoryChips() {
  if (!categoryBarInner) return;
  const chips = CATEGORIES.length > 1 ? [{ id: "", label: "Tudo" }, ...CATEGORIES] : CATEGORIES;
  categoryBarInner.innerHTML = chips.map(c => `
    <button class="category-chip${c.id === currentCategory ? " active" : ""}" type="button" data-category="${escapeHtml(c.id)}">${escapeHtml((c.label || "").toUpperCase())}</button>
  `).join("");

  categoryBarInner.querySelectorAll(".category-chip[data-category]").forEach(chip => {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.category;
      if (searchQuery) {
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        if (searchClear) searchClear.hidden = true;
      }
      if (cat === currentCategory) { renderProducts(); return; }
      currentCategory = cat;
      categoryBarInner.querySelectorAll(".category-chip").forEach(c => c.classList.toggle("active", c === chip));
      renderProducts();
      window.scrollTo({ top: document.querySelector(".category-bar").offsetTop - 10, behavior: "smooth" });
    });
  });

  if (footerCategories) {
    footerCategories.innerHTML = CATEGORIES.map(c => `<p>${escapeHtml(c.label)}</p>`).join("");
  }
}

// ==== WHATSAPP ====
function whatsappLink(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buyDirect(product, variant = null) {
  const tpl = SETTINGS.whatsapp_msg_buy || DEFAULT_MSG_BUY;
  const message = fillTemplate(tpl, {
    produto: itemName(product, variant),
    preco: formatBRL(product.price),
    total: formatBRL(product.price)
  });
  window.open(whatsappLink(message), "_blank");
}

function checkoutCart() {
  const items = Object.entries(cart);
  if (items.length === 0) return;

  let itensText = "";
  items.forEach(([key, qty]) => {
    const { p, v, ok } = parseKey(key);
    if (!ok) return;
    itensText += `${qty}x ${itemName(p, v)} - ${formatBRL(p.price * qty)}\n`;
  });

  const tpl = SETTINGS.whatsapp_msg_cart || DEFAULT_MSG_CART;
  const message = fillTemplate(tpl, {
    loja: CONFIG.storeName,
    itens: itensText.trim(),
    total: formatBRL(cartTotal())
  });

  window.open(whatsappLink(message), "_blank");
}

// ==== RENDER CARRINHO ====
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartFooterEl = document.getElementById("cartFooter");

function renderCart() {
  const entries = Object.entries(cart);
  cartCountEl.textContent = cartCount();

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty" id="cartEmpty">Seu carrinho está vazio.<br>Adicione produtos para continuar.</p>`;
    cartFooterEl.style.display = "none";
    return;
  }

  cartFooterEl.style.display = "block";
  cartItemsEl.innerHTML = entries.map(([id, qty]) => {
    const { p, v, ok } = parseKey(id);
    if (!ok) return "";
    return `
      <div class="cart-item" data-id="${escapeHtml(id)}">
        <img src="${p.img}" alt="${escapeHtml(p.name)}">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(p.name)}</div>
          ${v ? `<div class="cart-item-opt">${escapeHtml(v.name)}</div>` : ""}
          <div class="cart-item-price">${formatBRL(p.price)}</div>
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" data-id="${escapeHtml(id)}" aria-label="Menos">−</button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${escapeHtml(id)}" aria-label="Mais">+</button>
            <button class="cart-item-remove" data-action="remove" data-id="${escapeHtml(id)}">Remover</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartTotalEl.textContent = formatBRL(cartTotal());
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const current = cart[id] || 0;

  if (btn.dataset.action === "inc") setQty(id, current + 1);
  else if (btn.dataset.action === "dec") setQty(id, current - 1);
  else if (btn.dataset.action === "remove") removeFromCart(id);
});

// ==== ABRIR/FECHAR CARRINHO ====
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const checkoutBtn = document.getElementById("checkoutBtn");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
checkoutBtn.addEventListener("click", checkoutCart);

// ==== MODAL DE DETALHES DO PRODUTO ====
const productModalOverlay = document.getElementById("productModalOverlay");
const productModalClose = document.getElementById("productModalClose");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalBadges = document.getElementById("modalBadges");
const modalDetails = document.getElementById("modalDetails");
const modalAddBtn = document.getElementById("modalAddBtn");
const modalBuyBtn = document.getElementById("modalBuyBtn");
const modalDesc = document.getElementById("modalDesc");
const modalOptionsWrap = document.getElementById("modalOptionsWrap");
const modalOptions = document.getElementById("modalOptions");
let modalProductId = null;
let modalVariantId = null;

function extractDetails(name) {
  const details = {};
  const sizeMatch = name.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
  if (sizeMatch) details.tamanho = `${sizeMatch[1]}ml`;

  if (/eau de parfum|\bedp\b/i.test(name)) details.tipo = "Eau de Parfum";
  else if (/eau de toilette|\bedt\b/i.test(name)) details.tipo = "Eau de Toilette";
  else if (/\bparfum\b/i.test(name)) details.tipo = "Parfum";

  if (/feminin/i.test(name)) details.genero = "Feminino";
  else if (/masculin/i.test(name)) details.genero = "Masculino";
  else if (/unissex/i.test(name)) details.genero = "Unissex";

  return details;
}

function openProductModal(product, { needPick = false } = {}) {
  modalProductId = product.id;
  modalVariantId = null;
  if (modalDesc) {
    modalDesc.textContent = product.description || "";
    modalDesc.hidden = !product.description;
  }
  if (modalOptionsWrap) {
    const opts = product.variants || [];
    modalOptionsWrap.hidden = !opts.length;
    modalOptionsWrap.classList.toggle("is-missing", false);
    modalOptions.innerHTML = opts.map(v => `<button type="button" class="opt-chip" role="radio" aria-checked="false" data-vid="${v.id}">${escapeHtml(v.name)}</button>`).join("");
    if (opts.length === 1) { modalVariantId = opts[0].id; modalOptions.firstElementChild.setAttribute("aria-checked", "true"); }
    if (needPick && opts.length > 1) setTimeout(() => showToast("Escolha a opção antes"), 150);
  }
  modalImg.src = product.img;
  modalImg.alt = product.name;
  modalName.textContent = product.name;
  modalPrice.textContent = formatBRL(product.price);

  const details = extractDetails(product.name);
  const badges = [];
  if (details.genero) badges.push(details.genero);
  if (details.tipo) badges.push(details.tipo);
  const cat = CATEGORIES.find(c => c.id === product.category);
  if (cat) badges.push(cat.label);
  modalBadges.innerHTML = badges.map(b => `<span class="modal-badge">${escapeHtml(b)}</span>`).join("");

  const rows = [];
  if (details.tamanho) rows.push(`<div><span>Tamanho</span><span>${escapeHtml(details.tamanho)}</span></div>`);
  if (details.tipo) rows.push(`<div><span>Tipo</span><span>${escapeHtml(details.tipo)}</span></div>`);
  if (details.genero) rows.push(`<div><span>Gênero</span><span>${escapeHtml(details.genero)}</span></div>`);
  if (cat) rows.push(`<div><span>Categoria</span><span>${escapeHtml(cat.label)}</span></div>`);
  modalDetails.innerHTML = rows.join("");

  productModalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  productModalOverlay.classList.remove("open");
  document.body.style.overflow = "";
  modalProductId = null;
}

if (productModalClose) productModalClose.addEventListener("click", closeProductModal);
if (productModalOverlay) {
  productModalOverlay.addEventListener("click", (e) => {
    if (e.target === productModalOverlay) closeProductModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && productModalOverlay && productModalOverlay.classList.contains("open")) {
    closeProductModal();
  }
});

if (modalOptions) {
  modalOptions.addEventListener("click", (e) => {
    const b = e.target.closest(".opt-chip");
    if (!b || b.disabled) return;
    modalVariantId = b.dataset.vid;
    modalOptions.querySelectorAll(".opt-chip").forEach(c => c.setAttribute("aria-checked", c === b ? "true" : "false"));
    modalOptionsWrap.classList.remove("is-missing");
  });
}
// produto com opção só segue depois de escolher
function modalPick() {
  const product = findProduct(modalProductId);
  if (!product) return null;
  if (!hasOptions(product)) return { product, variant: null };
  const variant = product.variants.find(v => v.id === modalVariantId);
  if (!variant) {
    modalOptionsWrap.classList.add("is-missing");
    showToast("Escolha a opção antes");
    return null;
  }
  return { product, variant };
}
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    const pick = modalPick();
    if (pick) addToCart(pick.product.id, 1, pick.variant ? pick.variant.id : null);
  });
}
if (modalBuyBtn) {
  modalBuyBtn.addEventListener("click", () => {
    const pick = modalPick();
    if (pick) buyDirect(pick.product, pick.variant);
  });
}

// ==== TOAST ====
let toastTimer;
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ==== AJUSTE DE ALTURA DO HEADER (para o menu de categorias grudar certo) ====
function updateHeaderHeight() {
  const header = document.querySelector(".site-header");
  if (header) {
    document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
  }
}

// ==== APLICAR CONFIGURAÇÕES (logo, nome, whatsapp, instagram) ====
function applySettings() {
  if (SETTINGS.whatsapp_number) CONFIG.whatsappNumber = SETTINGS.whatsapp_number;
  if (SETTINGS.store_name) CONFIG.storeName = SETTINGS.store_name;

  if (SETTINGS.logo_url) {
    document.querySelectorAll(".brand-logo, .footer-logo").forEach(img => img.src = SETTINGS.logo_url);
  }
  document.querySelectorAll(".brand-name").forEach(el => el.textContent = CONFIG.storeName);
  document.title = `${CONFIG.storeName} | Catálogo`;
  if (SETTINGS.store_tagline) {
    document.querySelectorAll("[data-tagline]").forEach(el => el.textContent = SETTINGS.store_tagline);
  }
  // faixa de promoção: some quando está vazia
  const promoStrip = document.getElementById("promoStrip");
  const promoText = document.getElementById("promoText");
  const promo = (SETTINGS.promo_text || "").trim();
  if (promoStrip && promoText) {
    promoStrip.hidden = !promo;
    const cut = promo.indexOf(" — ");
    promoText.innerHTML = cut > 0
      ? `<strong>${escapeHtml(promo.slice(0, cut))}</strong>${escapeHtml(promo.slice(cut))}`
      : escapeHtml(promo);
  }

  const footerWhatsLink = document.getElementById("footerWhatsLink");
  if (footerWhatsLink) {
    footerWhatsLink.href = whatsappLink(`Olá! Vim pelo catálogo da ${CONFIG.storeName}.`);
    footerWhatsLink.textContent = CONFIG.whatsappNumber === "5500000000000"
      ? "(configurar número)"
      : CONFIG.whatsappNumber;
  }
  const footerInsta = document.getElementById("footerInsta");
  if (footerInsta && SETTINGS.instagram) {
    footerInsta.textContent = `@${SETTINGS.instagram}`;
  }
}

// ==== BANNER CAROUSEL ====
function renderBannerSlides() {
  const track = document.getElementById("bannerTrack");
  if (!track) return;
  if (!BANNERS.length) {
    track.innerHTML = "";
    return;
  }
  track.innerHTML = BANNERS.map(b => `
    <div class="banner-slide" style="background-image: url('${b.image_url}')">
      ${b.badge_text ? `<span class="banner-badge">${escapeHtml(b.badge_text)}</span>` : ""}
    </div>
  `).join("");
}

function initBannerCarousel() {
  const track = document.getElementById("bannerTrack");
  const dotsWrap = document.getElementById("bannerDots");
  const prevBtn = document.getElementById("bannerPrev");
  const nextBtn = document.getElementById("bannerNext");
  if (!track) return;

  renderBannerSlides();

  const slides = Array.from(track.children);
  if (dotsWrap) dotsWrap.innerHTML = "";
  if (slides.length === 0) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "banner-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Ir para slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
    resetTimer();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function resetTimer() {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(next, 5000);
  }

  const multi = slides.length > 1;
  if (prevBtn) prevBtn.style.display = multi ? "" : "none";
  if (nextBtn) nextBtn.style.display = multi ? "" : "none";
  if (dotsWrap) dotsWrap.style.display = multi ? "" : "none";

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  update();
  resetTimer();
}

// ==== CARREGAR DADOS DO SUPABASE ====
async function loadStoreData() {
  try {
    const [prodRes, catRes, settRes, bannerRes, varRes] = await Promise.all([
      sb.from("products").select("*").eq("active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      sb.from("categories").select("*").order("sort_order", { ascending: true }),
      sb.from("settings").select("*"),
      sb.from("banners").select("*").order("sort_order", { ascending: true }),
      sb.from("product_variants").select("id,product_id,name,stock,sort_order").order("sort_order", { ascending: true })
    ]);

    // Ajustes > "Mostrar no site só o que tem em estoque"
    const onlyInStock = (settRes.data || []).some(s => s.key === "site_only_in_stock" && s.value === "true");
    // sem preço nunca aparece (evita "R$ 0,00" no site)
    // opções (tamanho, voltagem...): com "só estoque" ligado, a opção zerada some
    const VARS = {};
    (varRes.data || []).forEach(v => {
      if (onlyInStock && Number(v.stock) <= 0) return;
      (VARS[v.product_id] = VARS[v.product_id] || []).push({ id: v.id, name: v.name });
    });
    PRODUCTS = (prodRes.data || []).filter(p => Number(p.price) > 0 && (!onlyInStock || Number(p.stock) > 0)).map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      img: p.img,
      category: p.category,
      description: (p.description || "").trim(),
      variants: VARS[p.id] || []
    }));
    // só mostra categorias que têm produto aparecendo no site
    const usedCategories = new Set(PRODUCTS.map(p => p.category));
    CATEGORIES = (catRes.data || []).filter(c => usedCategories.has(c.id));
    SETTINGS = {};
    (settRes.data || []).forEach(s => { SETTINGS[s.key] = s.value; });
    BANNERS = bannerRes.data || [];

    currentCategory = CATEGORIES.length === 1 ? CATEGORIES[0].id : "";
    pruneCart();

    applySettings();
    renderCategoryChips();
    renderProducts();
    renderCart();
    initBannerCarousel();
  } catch (err) {
    console.error("Erro ao carregar dados da loja:", err);
    productGrid.innerHTML = `<p style="padding:24px;text-align:center;color:#888;">Não foi possível carregar os produtos agora. Tente recarregar a página.</p>`;
  }
}

// ==== INIT ====
loadStoreData();
updateHeaderHeight();
window.addEventListener("resize", updateHeaderHeight);
