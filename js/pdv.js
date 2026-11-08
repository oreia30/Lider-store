// ==== PDV: entrada, correção, vender e vendas ====

// ---------- ENTRADA DE MERCADORIA ----------
const entryOverlay = $("entryOverlay");
const entryForm = $("entryForm");
const entryList = $("entryList");
const entryMsg = $("entryMsg");
const entrySaveBtn = $("entrySaveBtn");
let entryIds = [];

function openEntry(ids) {
  entryIds = ids.filter(id => productById(id));
  if (entryIds.length === 0) return;
  entryForm.reset();
  entryMsg.textContent = "";
  entryMsg.classList.remove("error");
  $("entryTitle").textContent = entryIds.length === 1 ? "Entrada de mercadoria" : `Entrada de ${entryIds.length} perfumes`;
  entryList.innerHTML = entryIds.map(id => {
    const p = productById(id);
    return `
    <li class="line-item" data-id="${id}">
      <img src="${escapeHtml(p.img)}" alt="" loading="lazy">
      <div class="line-name">${escapeHtml(p.name)}<small>Tem ${stockOf(p)} agora</small></div>
      <div class="line-controls">
        <div class="stepper">
          <button type="button" class="btn-icon" data-step="-1" aria-label="Menos"><svg class="icon"><use href="#i-minus"/></svg></button>
          <input type="number" class="qty" value="1" min="0" step="1" inputmode="numeric" aria-label="Quantidade que chegou">
          <button type="button" class="btn-icon" data-step="1" aria-label="Mais"><svg class="icon"><use href="#i-plus"/></svg></button>
        </div>
        <div class="money-input"><span>R$</span><input type="text" class="unit-cost" inputmode="decimal" placeholder="custo/un" value="${COSTS[id] != null ? priceToInput(COSTS[id]) : ""}" aria-label="Custo por unidade"></div>
      </div>
    </li>`;
  }).join("");
  updateEntryTotal();
  openSheet(entryOverlay);
}

function stepInput(input, delta, min = 0, max = Infinity) {
  const v = Math.floor(Number(input.value) || 0) + delta;
  input.value = Math.max(min, Math.min(max, v));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

entryList.addEventListener("click", (e) => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  stepInput(b.closest(".stepper").querySelector("input"), Number(b.dataset.step));
});
entryList.addEventListener("input", updateEntryTotal);

function readEntryLines() {
  return [...entryList.querySelectorAll(".line-item")].map(li => {
    const qty = Math.floor(Number(li.querySelector(".qty").value) || 0);
    const costTxt = li.querySelector(".unit-cost").value.trim();
    const cost = costTxt ? parsePrice(costTxt) : null;
    return { product_id: li.dataset.id, qty, unit_cost: cost, costTxt };
  });
}

function updateEntryTotal() {
  const lines = readEntryLines();
  const total = lines.reduce((s, l) => s + (Number.isFinite(l.unit_cost) ? l.unit_cost * l.qty : 0), 0);
  const units = lines.reduce((s, l) => s + Math.max(0, l.qty), 0);
  $("entryTotal").textContent = formatBRL(total);
  entrySaveBtn.textContent = units > 0 ? `Lançar ${plural(units, "unidade", "unidades")}` : "Lançar entrada";
}

entryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  entryMsg.classList.remove("error");
  entryMsg.textContent = "";
  const lines = readEntryLines();
  if (lines.some(l => l.costTxt && (!Number.isFinite(l.unit_cost) || l.unit_cost < 0))) {
    return formError(entryMsg, "Algum custo está inválido. Escreva só o valor, por exemplo 45,00.");
  }
  const items = lines.filter(l => l.qty > 0).map(({ product_id, qty, unit_cost }) => ({ product_id, qty, unit_cost }));
  if (items.length === 0) return formError(entryMsg, "Coloque a quantidade que chegou.");

  entrySaveBtn.disabled = true;
  const { error } = await sb.rpc("pdv_entrada", { p_items: items, p_note: $("entryNote").value.trim() || null });
  entrySaveBtn.disabled = false;
  if (error) return formError(entryMsg, "Não deu para lançar: " + error.message);

  const units = items.reduce((s, i) => s + i.qty, 0);
  closeSheet(entryOverlay);
  if (selecting) setSelecting(false);
  showToast(`Entrada lançada: ${plural(units, "unidade", "unidades")}`);
  await reloadProducts();
});

// ---------- CORRIGIR ESTOQUE ----------
const adjustOverlay = $("adjustOverlay");
const adjustForm = $("adjustForm");
const adjustQty = $("adjustQty");
let adjustId = null;

function openAdjust(id) {
  const p = productById(id);
  if (!p) return;
  adjustId = id;
  adjustForm.reset();
  $("adjustMsg").textContent = "";
  $("adjustMsg").classList.remove("error");
  $("adjustName").textContent = `${p.name} · hoje o painel diz ${stockOf(p)}`;
  adjustQty.value = stockOf(p);
  openSheet(adjustOverlay);
}

adjustForm.addEventListener("click", (e) => {
  const b = e.target.closest("[data-step]");
  if (b) stepInput(adjustQty, Number(b.dataset.step));
});

adjustForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const n = Math.floor(Number(adjustQty.value));
  if (!Number.isFinite(n) || n < 0) return formError($("adjustMsg"), "Quantidade inválida.", adjustQty);
  $("adjustSaveBtn").disabled = true;
  const { error } = await sb.rpc("pdv_ajustar", { p_product: adjustId, p_stock: n, p_note: $("adjustNote").value.trim() || null });
  $("adjustSaveBtn").disabled = false;
  if (error) return formError($("adjustMsg"), "Não deu para salvar: " + error.message);
  closeSheet(adjustOverlay);
  showToast("Estoque corrigido");
  await reloadProducts();
});

// ---------- VENDER ----------
const sellList = $("sellList");
const sellSearch = $("sellSearch");
const cartBar = $("cartBar");
const CART = new Map();          // product_id -> quantidade
let checkoutPayment = null;

function cartUnits() { let n = 0; CART.forEach(q => n += q); return n; }
function cartSubtotal() {
  let s = 0;
  CART.forEach((q, id) => { const p = productById(id); if (p) s += Number(p.price) * q; });
  return s;
}

function renderSellList() {
  const q = normalizeText(sellSearch.value.trim());
  // só os perfumes que você trabalha
  const list = ADMIN_PRODUCTS
    .filter(p => isActive(p) && (!q || normalizeText(p.name).includes(q)))
    .sort((a, b) => (stockOf(b) > 0) - (stockOf(a) > 0));

  if (list.length === 0) {
    sellList.innerHTML = q
      ? `<li class="list-empty"><strong>Nada encontrado</strong>Tente outro nome. Aqui só aparecem os perfumes marcados como Trabalho.</li>`
      : `<li class="list-empty"><strong>Nenhum perfume em "Trabalho"</strong>Marque em Perfumes os que você trabalha.</li>`;
  } else {
    sellList.innerHTML = list.map(p => {
      const inCart = CART.get(p.id) || 0;
      const out = stockOf(p) <= 0;
      return `
      <li class="product-row${out ? " is-out" : ""}${inCart ? " is-picked" : ""}" data-id="${p.id}">
        <button type="button" class="row-main" data-action="add">
          <img class="row-thumb" src="${escapeHtml(p.img)}" alt="" loading="lazy" decoding="async">
          <span class="row-text">
            <span class="row-name">${escapeHtml(p.name)}</span>
            <span class="row-meta"><span class="row-price">${formatBRL(p.price)}</span>${stockPill(p)}</span>
          </span>
        </button>
        <span class="row-toggle" aria-hidden="true">${inCart ? `<span class="in-cart">${inCart}</span>` : `<span class="add-dot"><svg class="icon"><use href="#i-plus"/></svg></span>`}</span>
      </li>`;
    }).join("");
  }
  updateCartBar();
}

sellSearch.addEventListener("input", renderSellList);

sellList.addEventListener("click", (e) => {
  const row = e.target.closest(".product-row");
  if (!row) return;
  const p = productById(row.dataset.id);
  if (!p) return;
  const have = CART.get(p.id) || 0;
  if (!(Number(p.price) > 0)) { showToast("Esse perfume está sem preço. Coloque o preço em Perfumes."); return; }
  if (stockOf(p) <= 0) { showToast("Sem estoque. Dê entrada antes de vender."); return; }
  if (have >= stockOf(p)) { showToast(`Só tem ${stockOf(p)} em estoque.`); return; }
  CART.set(p.id, have + 1);
  if (navigator.vibrate) navigator.vibrate(8);
  renderSellList();
});

function updateCartBar() {
  const units = cartUnits();
  const show = currentTab === "vender" && units > 0;
  cartBar.hidden = !show;
  document.body.classList.toggle("has-cart", show);
  $("cartBarCount").textContent = plural(units, "perfume", "perfumes");
  $("cartBarTotal").textContent = formatBRL(cartSubtotal());
}

// ---------- FECHAR VENDA ----------
const checkoutOverlay = $("checkoutOverlay");
const checkoutForm = $("checkoutForm");
const cartList = $("cartList");
const checkoutMsg = $("checkoutMsg");
const checkoutSaveBtn = $("checkoutSaveBtn");
const checkoutDiscount = $("checkoutDiscount");

$("cartOpenBtn").addEventListener("click", openCheckout);

function openCheckout() {
  if (cartUnits() === 0) return;
  checkoutMsg.textContent = "";
  checkoutMsg.classList.remove("error");
  renderCartList();
  setPayment(checkoutPayment);
  openSheet(checkoutOverlay);
}

function renderCartList() {
  if (CART.size === 0) {
    cartList.innerHTML = `<li class="list-empty">A venda está vazia.</li>`;
  } else {
    cartList.innerHTML = [...CART.entries()].map(([id, qty]) => {
      const p = productById(id);
      if (!p) return "";
      return `
      <li class="line-item" data-id="${id}">
        <img src="${escapeHtml(p.img)}" alt="" loading="lazy">
        <div class="line-name">${escapeHtml(p.name)}<small>${formatBRL(p.price)} cada · tem ${stockOf(p)}</small></div>
        <div class="line-controls">
          <div class="stepper">
            <button type="button" class="btn-icon" data-cart-step="-1" aria-label="${qty === 1 ? "Tirar da venda" : "Menos"}"><svg class="icon"><use href="#${qty === 1 ? "i-trash" : "i-minus"}"/></svg></button>
            <input type="number" value="${qty}" readonly tabindex="-1" aria-label="Quantidade">
            <button type="button" class="btn-icon" data-cart-step="1" aria-label="Mais" ${qty >= stockOf(p) ? "disabled" : ""}><svg class="icon"><use href="#i-plus"/></svg></button>
          </div>
          <span class="line-sub">${formatBRL(Number(p.price) * qty)}</span>
        </div>
      </li>`;
    }).join("");
  }
  updateCheckoutTotal();
}

cartList.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cart-step]");
  if (!b) return;
  const id = b.closest(".line-item").dataset.id;
  const p = productById(id);
  const next = (CART.get(id) || 0) + Number(b.dataset.cartStep);
  if (next <= 0) CART.delete(id);
  else CART.set(id, Math.min(next, stockOf(p)));
  renderCartList();
  renderSellList();
  if (CART.size === 0) closeSheet(checkoutOverlay);
});

$("cartClearBtn").addEventListener("click", async () => {
  const ok = await askConfirm({ title: "Limpar a venda?", text: "Os perfumes marcados saem da venda. Nada é registrado.", yes: "Limpar" });
  if (!ok) return;
  CART.clear();
  checkoutPayment = null;
  checkoutForm.reset();
  closeSheet(checkoutOverlay);
  renderSellList();
});

function setPayment(pay) {
  checkoutPayment = pay;
  $("payGrid").querySelectorAll(".pay-tile").forEach(t => t.setAttribute("aria-checked", t.dataset.pay === pay));
}
$("payGrid").addEventListener("click", (e) => {
  const t = e.target.closest(".pay-tile");
  if (t) { setPayment(t.dataset.pay); checkoutMsg.textContent = ""; }
});

checkoutDiscount.addEventListener("input", updateCheckoutTotal);

function checkoutDiscountValue() {
  const d = parsePrice(checkoutDiscount.value);
  return Number.isFinite(d) && d > 0 ? Math.min(d, cartSubtotal()) : 0;
}

function updateCheckoutTotal() {
  const sub = cartSubtotal();
  const disc = checkoutDiscountValue();
  $("checkoutSubLine").textContent = disc > 0 ? `${formatBRL(sub)} − ${formatBRL(disc)} de desconto` : `Total · ${plural(cartUnits(), "perfume", "perfumes")}`;
  $("checkoutTotal").textContent = formatBRL(sub - disc);
}

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  checkoutMsg.classList.remove("error");
  if (CART.size === 0) return;
  if (!checkoutPayment) return formError(checkoutMsg, "Escolha a forma de pagamento.");
  const discTxt = checkoutDiscount.value.trim();
  if (discTxt && !Number.isFinite(parsePrice(discTxt))) return formError(checkoutMsg, "Desconto inválido.", checkoutDiscount);

  const items = [...CART.entries()].map(([product_id, qty]) => ({ product_id, qty, unit_price: Number(productById(product_id).price) }));
  const total = cartSubtotal() - checkoutDiscountValue();

  checkoutSaveBtn.disabled = true;
  checkoutSaveBtn.textContent = "Registrando…";
  const { error } = await sb.rpc("pdv_vender", {
    p_items: items,
    p_payment: checkoutPayment,
    p_discount: checkoutDiscountValue(),
    p_customer: $("checkoutCustomer").value.trim() || null,
    p_note: null
  });
  checkoutSaveBtn.disabled = false;
  checkoutSaveBtn.textContent = "Registrar venda";
  if (error) {
    formError(checkoutMsg, error.message.startsWith("Estoque insuficiente") ? error.message : "Não deu para registrar: " + error.message);
    await reloadProducts();
    renderCartList();
    return;
  }

  CART.clear();
  checkoutPayment = null;
  checkoutForm.reset();
  sellSearch.value = "";
  closeSheet(checkoutOverlay);
  showToast(`Venda registrada · ${formatBRL(total)}`);
  salesCache = null;
  await reloadProducts();
});

// ---------- VENDAS ----------
const salesList = $("salesList");
let salesPeriod = "today";
let salesCache = null;
let salesLoading = 0;

const PAY = {
  pix: { label: "Pix", cls: "pay-pix", icon: "p-pix" },
  dinheiro: { label: "Dinheiro", cls: "pay-cash", icon: "p-cash" },
  cartao: { label: "Cartão", cls: "pay-card", icon: "p-card" },
  outro: { label: "Outro", cls: "pay-other", icon: "p-other" }
};

function periodStart(period) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "today") return d;
  if (period === "7") { d.setDate(d.getDate() - 6); return d; }
  if (period === "30") { d.setDate(d.getDate() - 29); return d; }
  if (period === "month") { d.setDate(1); return d; }
  return null;
}

wireChips($("salesPeriod"), "period", (p) => { salesPeriod = p; loadSales(); });

async function loadSales() {
  const ticket = ++salesLoading;
  salesList.innerHTML = Array.from({ length: 3 }, () => `<li class="skeleton-row"><i></i><i></i></li>`).join("");
  let query = sb.from("sales").select("*, sale_items(*)").order("created_at", { ascending: false }).limit(500);
  const start = periodStart(salesPeriod);
  if (start) query = query.gte("created_at", start.toISOString());
  const { data, error } = await query;
  if (ticket !== salesLoading) return;
  if (error) {
    salesList.innerHTML = `<li class="list-empty"><strong>Não consegui carregar</strong>${escapeHtml(error.message)}</li>`;
    return;
  }
  salesCache = data || [];
  renderSales();
}

function saleUnits(s) { return (s.sale_items || []).reduce((n, i) => n + i.qty, 0); }

function renderSales() {
  const sales = salesCache || [];
  const ok = sales.filter(s => s.status === "ok");
  const total = ok.reduce((n, s) => n + Number(s.total), 0);
  const profit = ok.reduce((n, s) => n + Number(s.total) - Number(s.cost_total), 0);
  $("sumTotal").textContent = formatBRL(total);
  $("sumProfit").textContent = formatBRL(profit);
  $("sumProfit").classList.toggle("is-profit", profit > 0);
  $("sumCount").textContent = ok.length.toLocaleString("pt-BR");
  $("sumItems").textContent = ok.reduce((n, s) => n + saleUnits(s), 0).toLocaleString("pt-BR");

  if (sales.length === 0) {
    salesList.innerHTML = `<li class="list-empty"><strong>Nenhuma venda nesse período</strong>As vendas registradas em "Vender" aparecem aqui.</li>`;
    return;
  }
  salesList.innerHTML = sales.map(s => {
    const pay = PAY[s.payment] || PAY.outro;
    const when = new Date(s.created_at);
    const dateTxt = salesPeriod === "today"
      ? when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : when.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const first = (s.sale_items || [])[0];
    const more = (s.sale_items || []).length - 1;
    return `
    <li class="simple-row sale-row${s.status === "cancelada" ? " is-canceled" : ""}" data-id="${s.id}">
      <button type="button" class="row-main" data-action="open-sale">
        <span class="pay-mini ${pay.cls}" title="${pay.label}"><svg class="icon"><use href="#${pay.icon}"/></svg></span>
        <span class="row-text">
          <span class="row-name">${escapeHtml(first ? first.name : "Venda")}${more > 0 ? ` <span class="row-badge">+${more}</span>` : ""}</span>
          <span class="row-meta"><span>${dateTxt}</span>${s.customer ? `<span>${escapeHtml(s.customer)}</span>` : ""}${s.status === "cancelada" ? `<span>Cancelada</span>` : ""}</span>
        </span>
      </button>
      <span class="sale-amount">${formatBRL(s.total)}<small>${plural(saleUnits(s), "un", "un")}</small></span>
    </li>`;
  }).join("");
}

// detalhe
const saleOverlay = $("saleOverlay");
let openSaleId = null;

salesList.addEventListener("click", (e) => {
  const row = e.target.closest(".sale-row");
  if (row) openSale(row.dataset.id);
});

function openSale(id) {
  const s = (salesCache || []).find(x => x.id === id);
  if (!s) return;
  openSaleId = id;
  const pay = PAY[s.payment] || PAY.outro;
  const when = new Date(s.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const profit = Number(s.total) - Number(s.cost_total);
  $("saleTitle").textContent = `Venda nº ${s.number}`;
  $("saleBody").innerHTML = `
    <div class="sale-detail-head">
      ${s.status === "cancelada" ? `<span class="canceled-tag">Cancelada · voltou ao estoque</span>` : ""}
      <span>${when}</span>
      <span>${pay.label}${s.customer ? ` · ${escapeHtml(s.customer)}` : ""}</span>
    </div>
    <ul class="line-list">
      ${(s.sale_items || []).map(i => `
        <li class="line-item">
          <img src="${escapeHtml(i.img || "")}" alt="" loading="lazy">
          <div class="line-name">${escapeHtml(i.name)}<small>${i.qty} × ${formatBRL(i.unit_price)}</small></div>
          <div class="line-controls"><span class="line-sub">${formatBRL(i.qty * i.unit_price)}</span></div>
        </li>`).join("")}
    </ul>
    <div class="sale-totals">
      ${Number(s.discount) > 0 ? `<div><span>Subtotal</span><span>${formatBRL(s.subtotal)}</span></div><div><span>Desconto</span><span>− ${formatBRL(s.discount)}</span></div>` : ""}
      <div class="grand"><span>Total</span><span>${formatBRL(s.total)}</span></div>
      ${Number(s.cost_total) > 0 ? `<div class="profit"><span>Lucro</span><span>${formatBRL(profit)}</span></div>` : `<div><span>Lucro</span><span>sem custo cadastrado</span></div>`}
    </div>`;
  $("saleFoot").hidden = s.status === "cancelada";
  openSheet(saleOverlay);
}

$("saleCancelBtn").addEventListener("click", async () => {
  const s = (salesCache || []).find(x => x.id === openSaleId);
  if (!s) return;
  const ok = await askConfirm({
    title: `Cancelar a venda nº ${s.number}?`,
    text: `Os ${plural(saleUnits(s), "perfume volta", "perfumes voltam")} para o estoque e a venda sai das contas.`,
    yes: "Cancelar venda", no: "Voltar"
  });
  if (!ok) return;
  const { error } = await sb.rpc("pdv_cancelar_venda", { p_sale: s.id });
  if (error) { showToast("Não deu para cancelar: " + error.message); return; }
  closeSheet(saleOverlay);
  showToast("Venda cancelada e estoque devolvido");
  await Promise.all([loadSales(), reloadProducts()]);
});

// ---------- LIGAÇÕES COM O RESTO DO PAINEL ----------
function onPdvTab(name) {
  if (name === "vender") renderSellList();
  if (name === "vendas") loadSales();
  updateCartBar();
}

function onPdvDataLoaded() {
  // tira do carrinho o que sumiu ou ficou sem estoque
  CART.forEach((q, id) => {
    const p = productById(id);
    if (!p || !isActive(p) || stockOf(p) <= 0) CART.delete(id);
    else if (q > stockOf(p)) CART.set(id, stockOf(p));
  });
  if (currentTab === "vender") renderSellList(); else updateCartBar();
  updateOnlyStockHint();
  if (!productModalOverlay.hidden && productIdInput.value) refreshProductStockBox(productIdInput.value);
}
