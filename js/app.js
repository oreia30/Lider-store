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

function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
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
  return Object.entries(cart).reduce((sum, [id, q]) => {
    const p = findProduct(id);
    return p ? sum + p.price * q : sum;
  }, 0);
}

// ==== DADOS DA LOJA (Supabase) ====
let PRODUCTS = [];
let CATEGORIES = [];
let SETTINGS = {};
let currentCategory = null;
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
  return PRODUCTS.filter(p => p.category === currentCategory);
}

function categoryLabel(id) {
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

  if (btn && btn.dataset.action === "add") {
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
  categoryBarInner.innerHTML = CATEGORIES.map(c => `
    <button class="category-chip${c.id === currentCategory ? " active" : ""}" type="button" data-category="${c.id}">${escapeHtml((c.label || "").toUpperCase())}</button>
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

function buyDirect(product) {
  const tpl = SETTINGS.whatsapp_msg_buy || DEFAULT_MSG_BUY;
  const message = fillTemplate(tpl, {
    produto: product.name,
    preco: formatBRL(product.price),
    total: formatBRL(product.price)
  });
  window.open(whatsappLink(message), "_blank");
}

function checkoutCart() {
  const items = Object.entries(cart);
  if (items.length === 0) return;

  let itensText = "";
  items.forEach(([id, qty]) => {
    const p = findProduct(id);
    if (!p) return;
    itensText += `${qty}x ${p.name} - ${formatBRL(p.price * qty)}\n`;
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
    const p = findProduct(id);
    if (!p) return "";
    return `
      <div class="cart-item" data-id="${id}">
        <img src="${p.img}" alt="${escapeHtml(p.name)}">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(p.name)}</div>
          <div class="cart-item-price">${formatBRL(p.price)}</div>
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" data-id="${id}">−</button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${id}">+</button>
            <button class="cart-item-remove" data-action="remove" data-id="${id}">Remover</button>
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
let modalProductId = null;

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

function openProductModal(product) {
  modalProductId = product.id;
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

if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    if (!modalProductId) return;
    addToCart(modalProductId, 1);
  });
}
if (modalBuyBtn) {
  modalBuyBtn.addEventListener("click", () => {
    if (!modalProductId) return;
    const product = findProduct(modalProductId);
    if (product) buyDirect(product);
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
  document.title = `${CONFIG.storeName} | Catálogo de Perfumes`;

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
function initBannerCarousel() {
  const track = document.getElementById("bannerTrack");
  const dotsWrap = document.getElementById("bannerDots");
  const prevBtn = document.getElementById("bannerPrev");
  const nextBtn = document.getElementById("bannerNext");
  if (!track) return;

  const slides = Array.from(track.children);
  let index = 0;
  let timer;

  dotsWrap.innerHTML = "";
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
    timer = setInterval(next, 5000);
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  update();
  resetTimer();
}

// ==== CARREGAR DADOS DO SUPABASE ====
async function loadStoreData() {
  try {
    const [prodRes, catRes, settRes] = await Promise.all([
      sb.from("products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      sb.from("categories").select("*").order("sort_order", { ascending: true }),
      sb.from("settings").select("*")
    ]);

    PRODUCTS = (prodRes.data || []).map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      img: p.img,
      category: p.category
    }));
    CATEGORIES = catRes.data || [];
    SETTINGS = {};
    (settRes.data || []).forEach(s => { SETTINGS[s.key] = s.value; });

    currentCategory = CATEGORIES[0] ? CATEGORIES[0].id : null;

    applySettings();
    renderCategoryChips();
    renderProducts();
    renderCart();
  } catch (err) {
    console.error("Erro ao carregar dados da loja:", err);
    productGrid.innerHTML = `<p style="padding:24px;text-align:center;color:#888;">Não foi possível carregar os produtos agora. Tente recarregar a página.</p>`;
  }
}

// ==== INIT ====
loadStoreData();
initBannerCarousel();
updateHeaderHeight();
window.addEventListener("resize", updateHeaderHeight);
