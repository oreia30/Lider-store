// ==== PDV: início, entrada, vender, vendas ====

const PAY_INFO = {
  pix: { label: "Pix", cls: "pay-pix", icon: "p-pix" },
  dinheiro: { label: "Dinheiro", cls: "pay-cash", icon: "p-cash" },
  debito: { label: "Débito", cls: "pay-debit", icon: "p-debit" },
  credito: { label: "Crédito", cls: "pay-credit", icon: "p-credit" },
  prazo: { label: "A prazo", cls: "pay-prazo", icon: "p-prazo" },
  cartao: { label: "Cartão", cls: "pay-debit", icon: "p-debit" },
  outro: { label: "Outro", cls: "pay-other", icon: "p-other" }
};
const payMini = (m) => { const p = PAY_INFO[m] || PAY_INFO.outro; return `<span class="pay-mini ${p.cls}" title="${p.label}"><svg class="i"><use href="#${p.icon}"/></svg></span>`; };
const payLabel = (s) => `${(PAY_INFO[s.payment] || PAY_INFO.outro).label}${(s.payment === "credito" || s.payment === "prazo") && s.installments > 1 ? ` ${s.installments}x` : ""}`;
const profitOf = (s) => Number(s.total) - Number(s.card_fee || 0) - Number(s.cost_total || 0);
function compactBRL(v) {
  if (v >= 1000) return `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return Math.round(v).toLocaleString("pt-BR");
}

// =========================================================
// INÍCIO
// =========================================================
async function renderInicio() {
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6);
  const { data } = await sb.from("sales").select("total,card_fee,cost_total,created_at,status").gte("created_at", start.toISOString()).eq("status", "ok");
  const sales = data || [];
  const t = todayIso();
  const today = sales.filter(s => isoDate(new Date(s.created_at)) === t);
  const total = today.reduce((n, s) => n + Number(s.total), 0);
  $("heroTotal").textContent = formatBRL(total);
  $("heroCount").textContent = today.length;
  $("heroTicket").textContent = formatBRL(today.length ? total / today.length : 0);
  $("heroProfit").textContent = formatBRL(today.reduce((n, s) => n + profitOf(s), 0));
  const y = addDays(t, -1);
  const yTotal = sales.filter(s => isoDate(new Date(s.created_at)) === y).reduce((n, s) => n + Number(s.total), 0);
  $("heroSub").textContent = yTotal > 0 ? `vendido hoje · ontem ${formatBRL(yTotal)}` : "vendido hoje";

  // 7 dias com os números
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
  const sums = days.map(d => sales.filter(s => isoDate(new Date(s.created_at)) === d).reduce((n, s) => n + Number(s.total), 0));
  const max = Math.max(...sums, 1);
  const wk = ["D", "S", "T", "Q", "Q", "S", "S"];
  $("weekChart").innerHTML = days.map((d, i) => `<div class="wk${d === t ? " today" : ""}">
    <span class="wk-val">${sums[i] > 0 ? compactBRL(sums[i]) : ""}</span>
    <span class="wk-bar" style="height:${Math.max(4, (sums[i] / max) * 120)}px"></span>
    <span class="wk-day">${d === t ? "Hoje" : wk[parseIso(d).getDay()]}</span></div>`).join("");
  renderAttention();
}
function renderAttention() {
  const items = [];
  const t = todayIso();
  // parcelas vencidas / vencendo
  const ids = [...new Set(OPEN_RECV.map(r => r.customer_id))];
  ids.map(id => ({ c: customerById(id), s: debtSummary(id) })).filter(x => x.c).forEach(({ c, s }) => {
    if (s.late > 0) items.push({ kind: "bad", icon: "i-alert", title: `Parcela vencida · ${c.name}`, sub: `${formatBRL(s.late)} · ${dueText(s.oldestLate.due)}`, act: `cust:${c.id}`, ord: 0 });
    else if (s.next && daysBetween(t, s.next.due) <= 1) items.push({ kind: "warn", icon: "i-cal", title: `${daysBetween(t, s.next.due) === 0 ? "Vence hoje" : "Vence amanhã"} · ${c.name}`, sub: formatBRL(Number(s.next.amount) - Number(s.next.paid)), act: `cust:${c.id}`, ord: 1 });
  });
  const active = ADMIN_PRODUCTS.filter(isActive);
  const low = active.filter(p => stockOf(p) > 0 && stockOf(p) <= LOW_STOCK);
  low.slice(0, 3).forEach(p => items.push({ kind: "warn", icon: "i-bottle", title: `Acabando · ${p.name}`, sub: `Resta${stockOf(p) === 1 ? "" : "m"} ${stockOf(p)}`, act: `prod:${p.id}`, ord: 2 }));
  if (low.length > 3) items.push({ kind: "warn", icon: "i-bottle", title: `Mais ${low.length - 3} acabando`, sub: "Ver a lista", act: "filter:low", ord: 2 });
  const noPrice = active.filter(p => !hasPrice(p)).length;
  if (noPrice) items.push({ kind: "bad", icon: "i-tag", title: `${plural(noPrice, "produto", "produtos")} de Trabalho sem preço`, sub: "Não aparece no site nem dá para vender", act: "filter:noprice", ord: 3 });
  const noStock = active.filter(p => stockOf(p) <= 0).length;
  if (noStock) items.push({ kind: "warn", icon: "i-box-in", title: `${plural(noStock, "produto", "produtos")} de Trabalho sem estoque`, sub: "Chegou mercadoria? Dê entrada", act: "filter:nostock", ord: 4 });
  items.sort((a, b) => a.ord - b.ord);
  $("attnList").innerHTML = (items.length ? items : [{ kind: "ok", icon: "i-check", title: "Tudo em dia", sub: "Nada precisa da sua atenção agora", act: "" }]).slice(0, 7).map(it => `
    <li><button type="button" class="attn-item" data-act="${it.act}">
      <span class="attn-ic ${it.kind}"><svg class="i"><use href="#${it.icon}"/></svg></span>
      <span class="attn-text"><strong>${escapeHtml(it.title)}</strong><small>${escapeHtml(it.sub)}</small></span>
      ${it.act ? `<svg class="i sm"><use href="#i-chev"/></svg>` : ""}
    </button></li>`).join("");
}
$("attnList").addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b || !b.dataset.act) return;
  const [k, v] = b.dataset.act.split(":");
  if (k === "cust") openCustomerView(v);
  if (k === "prod") { showView("produtos"); openProductModal(v); }
  if (k === "filter") { showView("produtos"); setStatusFilter(v); }
});
document.querySelector(".quick").addEventListener("click", (e) => {
  const b = e.target.closest("[data-quick]");
  if (!b) return;
  if (b.dataset.quick === "entrada") openEntry([]);
  if (b.dataset.quick === "novo") { showView("produtos"); openProductModal(null); }
});
HOOKS.view.push((v) => { if (v === "inicio") renderInicio(); });
HOOKS.data.push(() => { if (currentView === "inicio") renderAttention(); });

// =========================================================
// ENTRADA DE MERCADORIA
// =========================================================
// produto sem opção: 1 linha; com opção (tamanho, voltagem...): uma quantidade por opção
const entryState = new Map(); // product_id -> { cost, qty: { [variant_id | ""]: "n" } }
function entryAdd(id) {
  const vs = variantsOf(id);
  const qty = {};
  if (vs.length) vs.forEach(v => { qty[v.id] = vs.length === 1 ? "1" : "0"; });
  else qty[""] = "1";
  entryState.set(id, { cost: COSTS[id] != null ? priceToInput(COSTS[id]) : "", qty });
}
function openEntry(ids) {
  entryState.clear();
  ids.filter(productById).forEach(entryAdd);
  $("entryForm").reset();
  clearMsg($("entryMsg"));
  $("entryAddWrap").hidden = ids.length > 0;
  $("entryResults").innerHTML = "";
  renderEntry();
  openSheet($("entryOverlay"));
  if (!ids.length) setTimeout(() => $("entrySearch").focus(), 60);
}
const entryStepper = (val, label) => `<div class="stepper"><button type="button" data-step="-1" aria-label="Menos"><svg class="i sm"><use href="#i-minus"/></svg></button>
  <input type="number" class="qty" value="${escapeHtml(val)}" min="0" step="1" inputmode="numeric" aria-label="${escapeHtml(label)}">
  <button type="button" data-step="1" aria-label="Mais"><svg class="i sm"><use href="#i-plus"/></svg></button></div>`;
function renderEntry() {
  const ids = [...entryState.keys()];
  $("entryTitle").textContent = ids.length > 1 ? `Entrada de ${ids.length} produtos` : "Chegou mercadoria";
  $("entryHint").hidden = ids.length === 0;
  $("entryList").innerHTML = ids.length ? ids.map(id => {
    const p = productById(id), st = entryState.get(id);
    const vs = variantsOf(id);
    const cost = `<div class="money"><span>R$</span><input type="text" class="unit-cost" inputmode="decimal" placeholder="custo/un" value="${escapeHtml(st.cost)}" aria-label="Custo por unidade"></div>`;
    if (!vs.length) {
      return `<li class="line" data-id="${id}">
        <img src="${escapeHtml(p.img)}" alt="" loading="lazy">
        <div class="line-name">${escapeHtml(p.name)}<small>Tem ${stockOf(p)} agora${isActive(p) ? "" : " · Não trabalho"}</small></div>
        <div class="line-ctl" data-vid="">${entryStepper(st.qty[""], "Quantidade que chegou")}${cost}</div></li>`;
    }
    return `<li class="line" data-id="${id}">
      <img src="${escapeHtml(p.img)}" alt="" loading="lazy">
      <div class="line-name">${escapeHtml(p.name)}<small>Tem ${stockOf(p)} agora${isActive(p) ? "" : " · Não trabalho"} · quanto chegou de cada</small></div>
      <div class="line-ctl">${cost}</div>
      <ul class="vlines">${vs.map(v => `<li class="vline" data-vid="${v.id}">
        <span class="vline-name">${escapeHtml(v.name)}<small>tem ${v.stock}</small></span>
        ${entryStepper(st.qty[v.id] ?? "0", `Quantidade que chegou de ${v.name}`)}</li>`).join("")}</ul></li>`;
  }).join("") : `<li class="list-empty">Busque acima os produtos que chegaram.</li>`;
  updateEntryTotal();
}
$("entrySearch").addEventListener("input", () => {
  const q = normalizeText($("entrySearch").value.trim());
  if (!q) { $("entryResults").innerHTML = ""; return; }
  const res = ADMIN_PRODUCTS.filter(p => normalizeText(p.name).includes(q) && !entryState.has(p.id))
    .sort((a, b) => isActive(b) - isActive(a)).slice(0, 8);
  $("entryResults").innerHTML = res.map(p => `<li><button type="button" data-id="${p.id}"><img src="${escapeHtml(p.img)}" alt=""><span>${escapeHtml(p.name)}<br><small class="muted">tem ${stockOf(p)}${hasVariants(p.id) ? ` · ${variantsOf(p.id).length} opções` : ""}${isActive(p) ? "" : " · Não trabalho"}</small></span><svg class="i sm"><use href="#i-plus"/></svg></button></li>`).join("")
    || `<li class="muted small">Nenhum produto com esse nome. Cadastre em Produtos.</li>`;
});
$("entryResults").addEventListener("click", (e) => {
  const b = e.target.closest("[data-id]");
  if (!b) return;
  entryAdd(b.dataset.id);
  $("entrySearch").value = "";
  $("entryResults").innerHTML = "";
  renderEntry();
  $("entrySearch").focus();
});
function stepInput(input, delta, min = 0, max = Infinity) {
  input.value = Math.max(min, Math.min(max, Math.floor(Number(input.value) || 0) + delta));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
$("entryList").addEventListener("click", (e) => {
  const b = e.target.closest("[data-step]");
  if (b) stepInput(b.closest(".stepper").querySelector("input"), Number(b.dataset.step));
});
$("entryList").addEventListener("input", (e) => {
  const li = e.target.closest(".line");
  if (!li) return;
  const st = entryState.get(li.dataset.id);
  if (e.target.classList.contains("qty")) st.qty[e.target.closest("[data-vid]").dataset.vid] = e.target.value;
  if (e.target.classList.contains("unit-cost")) st.cost = e.target.value;
  updateEntryTotal();
});
function entryLines() {
  const out = [];
  entryState.forEach((st, product_id) => {
    const costTxt = String(st.cost || "").trim();
    const unit_cost = costTxt ? parsePrice(costTxt) : null;
    Object.entries(st.qty).forEach(([vid, q]) => out.push({ product_id, variant_id: vid || null, qty: Math.floor(Number(q) || 0), unit_cost, costTxt }));
  });
  return out;
}
function updateEntryTotal() {
  const lines = entryLines();
  const total = lines.reduce((s, l) => s + (Number.isFinite(l.unit_cost) ? l.unit_cost * Math.max(0, l.qty) : 0), 0);
  const units = lines.reduce((s, l) => s + Math.max(0, l.qty), 0);
  $("entryTotal").textContent = formatBRL(total);
  $("entrySaveBtn").textContent = units > 0 ? `Lançar ${plural(units, "unidade", "unidades")}` : "Lançar entrada";
}
$("entryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg($("entryMsg"));
  const lines = entryLines();
  if (lines.some(l => l.costTxt && (!Number.isFinite(l.unit_cost) || l.unit_cost < 0))) return formError($("entryMsg"), "Algum custo está inválido. Escreva só o valor, por exemplo 45,00.");
  const items = lines.filter(l => l.qty > 0).map(({ product_id, variant_id, qty, unit_cost }) => ({ product_id, variant_id, qty, unit_cost }));
  if (!items.length) return formError($("entryMsg"), "Coloque a quantidade que chegou.");
  $("entrySaveBtn").disabled = true;
  const { error } = await sb.rpc("pdv_entrada", { p_items: items, p_note: $("entryNote").value.trim() || null });
  $("entrySaveBtn").disabled = false;
  if (error) return formError($("entryMsg"), "Não deu para lançar: " + error.message);
  // quem chegou e estava em "Não trabalho" passa a Trabalho
  const wake = [...new Set(items.map(i => i.product_id))].filter(id => !isActive(productById(id)));
  if (wake.length) await sb.from("products").update({ active: true }).in("id", wake);
  const units = items.reduce((s, i) => s + i.qty, 0);
  closeSheet($("entryOverlay"));
  if (selecting) setSelecting(false);
  showToast(`Entrada lançada: ${plural(units, "unidade", "unidades")}${wake.length ? ` · ${plural(wake.length, "produto voltou", "produtos voltaram")} para Trabalho` : ""}`);
  await reloadProducts();
});

// ---------- corrigir estoque ----------
let adjustId = null;
function adjustCurrent() {
  const vid = $("adjustVariant").value;
  return vid ? Number((variantById(vid) || {}).stock || 0) : stockOf(productById(adjustId));
}
function syncAdjust() {
  const p = productById(adjustId);
  const vid = $("adjustVariant").value;
  const v = vid ? variantById(vid) : null;
  $("adjustName").textContent = `${p.name}${v ? ` (${v.name})` : ""} · o painel diz ${adjustCurrent()}`;
  $("adjustQty").value = adjustCurrent();
}
function openAdjust(id, vid = null) {
  const p = productById(id);
  if (!p) return;
  adjustId = id;
  $("adjustForm").reset();
  clearMsg($("adjustMsg"));
  const vs = variantsOf(id);
  $("adjustVariantWrap").hidden = !vs.length;
  $("adjustVariant").innerHTML = vs.map(v => `<option value="${v.id}">${escapeHtml(v.name)} · tem ${v.stock}</option>`).join("");
  if (vs.length) $("adjustVariant").value = vid && vs.some(v => v.id === vid) ? vid : vs[0].id;
  syncAdjust();
  openSheet($("adjustOverlay"));
}
$("adjustVariant").addEventListener("change", syncAdjust);
$("adjustForm").addEventListener("click", (e) => { const b = e.target.closest("[data-step]"); if (b) stepInput($("adjustQty"), Number(b.dataset.step)); });
$("adjustForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const n = Math.floor(Number($("adjustQty").value));
  if (!Number.isFinite(n) || n < 0) return formError($("adjustMsg"), "Quantidade inválida.", $("adjustQty"));
  $("adjustSaveBtn").disabled = true;
  const { error } = await sb.rpc("pdv_ajustar", { p_product: adjustId, p_stock: n, p_note: $("adjustNote").value.trim() || null, p_variant: $("adjustVariant").value || null });
  $("adjustSaveBtn").disabled = false;
  if (error) return formError($("adjustMsg"), "Não deu para salvar: " + error.message);
  closeSheet($("adjustOverlay"));
  showToast("Estoque corrigido");
  await reloadProducts();
});

// =========================================================
// VENDER
// =========================================================
const CART = new Map(); // "product_id|variant_id" -> qtd
let sellCat = "";
const ckey = (pid, vid) => `${pid}|${vid || ""}`;
const csplit = (k) => { const [pid, vid] = k.split("|"); return { pid, vid: vid || null }; };
function lineStock(pid, vid) {
  if (vid) { const v = variantById(vid); return v ? Number(v.stock) : 0; }
  const p = productById(pid);
  return p ? stockOf(p) : 0;
}
function cartQtyOf(pid) { let n = 0; CART.forEach((q, k) => { if (csplit(k).pid === pid) n += q; }); return n; }
const sale = { pay: null, inst: 1, clientPays: null, prazoN: 1, prazoFirst: null, customer: null };

function sellable(p) { return isActive(p); }
function renderSellCats() {
  const used = new Set(ADMIN_PRODUCTS.filter(sellable).map(p => p.category));
  const cats = ADMIN_CATEGORIES.filter(c => used.has(c.id));
  if (sellCat && !used.has(sellCat)) sellCat = "";
  $("sellCats").innerHTML = `<button class="chip${sellCat ? "" : " active"}" data-cat="">Tudo</button>` +
    cats.map(c => `<button class="chip${sellCat === c.id ? " active" : ""}" data-cat="${escapeHtml(c.id)}">${escapeHtml(c.label)}</button>`).join("");
}
$("sellCats").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  sellCat = b.dataset.cat;
  setChip($("sellCats"), b);
  renderSellGrid();
});
function renderSellGrid() {
  const q = normalizeText($("sellSearch").value.trim());
  const list = ADMIN_PRODUCTS.filter(p => sellable(p) && (!sellCat || p.category === sellCat) && (!q || normalizeText(p.name).includes(q)))
    .sort((a, b) => (stockOf(b) > 0) - (stockOf(a) > 0));
  $("sellGrid").innerHTML = list.length ? list.map(p => {
    const inCart = cartQtyOf(p.id);
    const s = stockOf(p);
    return `<button type="button" class="pcard${inCart ? " is-picked" : ""}${s <= 0 || !hasPrice(p) ? " is-out" : ""}" data-id="${p.id}">
      <span class="pcard-img"><img src="${escapeHtml(p.img)}" alt="" loading="lazy" decoding="async"></span>
      ${inCart ? `<span class="pcard-qty">${inCart}</span>` : ""}
      <span class="pcard-stock${s <= 0 ? " zero" : s <= LOW_STOCK ? " low" : ""}">${s <= 0 ? "sem estoque" : `${s} un`}</span>
      <span class="pcard-body"><span class="pcard-name">${escapeHtml(p.name)}</span>
        <span class="pcard-price">${hasPrice(p) ? formatBRL(p.price) : "sem preço"}</span></span>
    </button>`;
  }).join("") : `<p class="list-empty" style="grid-column:1/-1">${q ? "<strong>Nada encontrado</strong>Aqui aparecem só os produtos de Trabalho." : `<strong>Nenhum produto em "Trabalho"</strong>Marque em Produtos os que você vende.`}</p>`;
  updateCartBar();
}
$("sellSearch").addEventListener("input", renderSellGrid);
$("sellGrid").addEventListener("click", (e) => {
  const b = e.target.closest(".pcard");
  if (!b) return;
  const p = productById(b.dataset.id);
  if (!hasPrice(p)) return showToast("Esse produto está sem preço. Coloque o preço em Produtos.");
  if (stockOf(p) <= 0) return showToast("Sem estoque. Toque em \"Chegou mercadoria\" para dar entrada.");
  if (hasVariants(p.id)) return openVariantPick(p.id);
  addToSale(p.id, null);
});
function addToSale(pid, vid) {
  const k = ckey(pid, vid);
  const have = CART.get(k) || 0;
  const max = lineStock(pid, vid);
  if (have >= max) { showToast(`Só tem ${max} em estoque.`); return false; }
  CART.set(k, have + 1);
  if (navigator.vibrate) navigator.vibrate(8);
  renderSellGrid();
  renderSale();
  return true;
}
// produto com tamanho/opção: escolhe qual
let variantPid = null;
function renderVariantPick() {
  const p = productById(variantPid);
  if (!p) return;
  $("variantImg").src = p.img || "";
  $("variantProd").textContent = p.name;
  $("variantPrice").textContent = `${formatBRL(p.price)} · toque na opção`;
  $("variantGrid").innerHTML = variantsOf(p.id).map(v => {
    const inCart = CART.get(ckey(p.id, v.id)) || 0;
    return `<button type="button" class="vopt${inCart ? " has" : ""}" data-vid="${v.id}" ${v.stock <= 0 ? "disabled" : ""}>
      <strong>${escapeHtml(v.name)}</strong><small>${v.stock <= 0 ? "sem estoque" : inCart ? `${inCart} na venda · tem ${v.stock}` : `tem ${v.stock}`}</small></button>`;
  }).join("");
}
function openVariantPick(pid) {
  variantPid = pid;
  renderVariantPick();
  openSheet($("variantOverlay"));
}
$("variantGrid").addEventListener("click", (e) => {
  const b = e.target.closest(".vopt");
  if (!b || b.disabled) return;
  if (addToSale(variantPid, b.dataset.vid)) closeSheet($("variantOverlay"));
});

function cartUnits() { let n = 0; CART.forEach(q => n += q); return n; }
function cartSubtotal() { let s = 0; CART.forEach((q, k) => { const p = productById(csplit(k).pid); if (p) s += Number(p.price) * q; }); return round2(s); }
function updateCartBar() {
  const units = cartUnits();
  const show = currentView === "vender" && units > 0 && !document.body.classList.contains("sale-open");
  $("cartBar").hidden = !show;
  document.body.classList.toggle("has-cart", currentView === "vender" && units > 0);
  $("cartBarCount").textContent = plural(units, "produto", "produtos");
  $("cartBarTotal").textContent = formatBRL(saleCalc().total);
  $("sellCount").hidden = units === 0;
  $("sellCount").textContent = units;
}

// painel "Venda atual": no celular é uma folha; no computador fica do lado
function openSalePanel() {
  document.body.classList.add("sale-open");
  lockScroll();
  updateCartBar();
}
function closeSalePanel() {
  if (!document.body.classList.contains("sale-open")) return;
  document.body.classList.remove("sale-open");
  unlockScrollIfIdle();
  updateCartBar();
}
$("cartOpenBtn").addEventListener("click", openSalePanel);
$("saleCloseBtn").addEventListener("click", closeSalePanel);
$("saleBackdrop").addEventListener("click", closeSalePanel);

function saleCalc() {
  const sub = cartSubtotal();
  const d = parsePrice($("checkoutDiscount").value);
  const disc = Number.isFinite(d) && d > 0 ? Math.min(round2(d), sub) : 0;
  const base = round2(sub - disc);
  let total = base, surcharge = 0, fee = 0, pct = 0;
  if (sale.pay === "credito" || sale.pay === "debito") {
    pct = rateFor(sale.pay, sale.pay === "credito" ? sale.inst : 1);
    if (sale.clientPays) { total = cobrarPara(base, pct); surcharge = round2(total - base); fee = surcharge; }
    else { fee = round2(base * pct / 100); }
  }
  return { sub, disc, base, total, surcharge, fee, pct, net: round2(total - fee) };
}
function prazoParcels(total) {
  const n = sale.prazoN;
  const each = Math.floor((total / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) => ({
    due: addMonths(sale.prazoFirst, i),
    amount: i === n - 1 ? round2(total - each * (n - 1)) : each
  }));
}

function renderSale() {
  // itens
  $("cartList").innerHTML = CART.size ? [...CART.entries()].map(([k, qty]) => {
    const { pid, vid } = csplit(k);
    const p = productById(pid);
    if (!p) return "";
    const v = vid ? variantById(vid) : null;
    const max = lineStock(pid, vid);
    return `<li class="line" data-key="${k}">
      <img src="${escapeHtml(p.img)}" alt="" loading="lazy">
      <div class="line-name">${escapeHtml(p.name)}${v ? ` <span class="pill pill-mute">${escapeHtml(v.name)}</span>` : ""}<small>${formatBRL(p.price)} cada · tem ${max}</small></div>
      <div class="line-ctl">
        <div class="stepper">
          <button type="button" data-cart-step="-1" aria-label="${qty === 1 ? "Tirar da venda" : "Menos"}"><svg class="i sm"><use href="#${qty === 1 ? "i-trash" : "i-minus"}"/></svg></button>
          <input type="number" value="${qty}" readonly tabindex="-1" aria-label="Quantidade">
          <button type="button" data-cart-step="1" aria-label="Mais" ${qty >= max ? "disabled" : ""}><svg class="i sm"><use href="#i-plus"/></svg></button>
        </div>
        <span class="line-sub">${formatBRL(Number(p.price) * qty)}</span>
      </div></li>`;
  }).join("") : `<li class="list-empty">Toque num produto para adicionar à venda.</li>`;
  $("cartClearBtn").hidden = CART.size === 0;
  refreshCheckout();
}
function refreshCheckout() {
  const c = saleCalc();
  $("saleSubtotal").textContent = formatBRL(c.sub);
  $("payGrid").querySelectorAll(".pay").forEach(b => b.setAttribute("aria-checked", b.dataset.pay === sale.pay));

  // maquininha
  const card = sale.pay === "credito" || sale.pay === "debito";
  $("cardBox").hidden = !card;
  if (card) {
    const r = getRates();
    if (sale.clientPays === null) sale.clientPays = r.clientePagaPadrao !== false;
    $("cardClientPays").checked = sale.clientPays;
    $("cardInstallments").hidden = sale.pay !== "credito";
    $("cardRateText").hidden = sale.pay === "credito";
    $("cardRateText").textContent = `taxa ${pctText(c.pct)}`;
    if (sale.pay === "credito") {
      const want = r.credito.map((p, i) => `<option value="${i + 1}">${i + 1}x · taxa ${pctText(p)}</option>`).join("");
      if ($("cardInstallments").dataset.sig !== want) { $("cardInstallments").innerHTML = want; $("cardInstallments").dataset.sig = want; }
      $("cardInstallments").value = String(sale.inst);
    }
    $("cardCharge").textContent = formatBRL(c.total);
    $("cardParcel").textContent = sale.pay === "credito" && sale.inst > 1 ? `${sale.inst}x de ${formatBRL(c.total / sale.inst)}` : "";
    $("cardNet").textContent = formatBRL(c.net);
    $("cardFeeText").textContent = `taxa ${formatBRL(c.fee)}`;
  }

  // prazo
  const prazo = sale.pay === "prazo";
  $("prazoBox").hidden = !prazo;
  if (prazo) {
    if (!sale.prazoFirst) sale.prazoFirst = addDays(todayIso(), 30);
    if (!$("prazoParcels").options.length) $("prazoParcels").innerHTML = Array.from({ length: 6 }, (_, i) => `<option value="${i + 1}">${i === 0 ? "1x (de uma vez)" : `${i + 1}x`}</option>`).join("");
    $("prazoParcels").value = String(sale.prazoN);
    $("prazoFirstDue").querySelector("span").textContent = dmy(sale.prazoFirst);
    $("prazoPreview").innerHTML = c.total > 0 ? prazoParcels(c.total).map((p, i) => `<div><span>${sale.prazoN > 1 ? `${i + 1}ª` : "Única"} · ${dmy(p.due)}</span><b>${formatBRL(p.amount)}</b></div>`).join("") : "";
  }

  // cliente
  const cust = sale.customer;
  $("clientChosen").hidden = !cust;
  $("clientActions").hidden = !!cust;
  $("checkoutCustomer").hidden = !!cust || prazo;
  if (cust) {
    $("clientAvatar").textContent = initials(cust.name);
    $("clientName").textContent = cust.name;
    $("clientMeta").textContent = [cust.cpf ? fmtCpf(cust.cpf) : "sem CPF", cust.phone ? fmtPhone(cust.phone) : ""].filter(Boolean).join(" · ");
  }
  $("clientLabel").innerHTML = prazo ? `Cliente <span class="muted">(com CPF)</span>` : `Cliente <span class="muted">(opcional)</span>`;

  const parts = [];
  if (c.disc > 0) parts.push(`${formatBRL(c.disc)} de desconto`);
  if (c.surcharge > 0) parts.push(`${formatBRL(c.surcharge)} de taxa`);
  $("checkoutSubLine").textContent = parts.length ? parts.join(" · ") : `Total · ${plural(cartUnits(), "produto", "produtos")}`;
  $("checkoutTotal").textContent = formatBRL(c.total);
  $("checkoutSaveBtn").disabled = CART.size === 0;
  updateCartBar();
}

$("cartList").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cart-step]");
  if (!b) return;
  const k = b.closest(".line").dataset.key;
  const { pid, vid } = csplit(k);
  const next = (CART.get(k) || 0) + Number(b.dataset.cartStep);
  if (next <= 0) CART.delete(k); else CART.set(k, Math.min(next, lineStock(pid, vid)));
  renderSale();
  renderSellGrid();
  if (CART.size === 0) closeSalePanel();
});
$("cartClearBtn").addEventListener("click", async () => {
  if (!await askConfirm({ title: "Limpar a venda?", text: "Os itens marcados saem da venda. Nada é registrado.", yes: "Limpar" })) return;
  resetSale();
  closeSalePanel();
});
function resetSale() {
  CART.clear();
  Object.assign(sale, { pay: null, inst: 1, clientPays: null, prazoN: 1, prazoFirst: null, customer: null });
  $("checkoutDiscount").value = "";
  $("checkoutCustomer").value = "";
  clearMsg($("checkoutMsg"));
  renderSale();
  renderSellGrid();
}
$("payGrid").addEventListener("click", (e) => {
  const b = e.target.closest(".pay");
  if (!b) return;
  sale.pay = b.dataset.pay;
  clearMsg($("checkoutMsg"));
  if (sale.pay === "prazo" && sale.customer && !sale.customer.cpf) sale.customer = null;
  refreshCheckout();
});
$("checkoutDiscount").addEventListener("input", refreshCheckout);
$("cardInstallments").addEventListener("change", () => { sale.inst = Number($("cardInstallments").value) || 1; refreshCheckout(); });
$("cardClientPays").addEventListener("change", () => { sale.clientPays = $("cardClientPays").checked; refreshCheckout(); });
$("prazoParcels").addEventListener("change", () => { sale.prazoN = Number($("prazoParcels").value) || 1; refreshCheckout(); });
$("prazoFirstDue").addEventListener("click", () => {
  const t = todayIso();
  openCalendar({
    value: sale.prazoFirst, min: addDays(t, 1), title: "1º vencimento",
    quick: [["7 dias", addDays(t, 7)], ["15 dias", addDays(t, 15)], ["30 dias", addDays(t, 30)]],
    onPick: (iso) => { sale.prazoFirst = iso; refreshCheckout(); }
  });
});
$("clientFindBtn").addEventListener("click", () => openCustomerPicker({ requireCpf: sale.pay === "prazo", onPick: (c) => { sale.customer = c; refreshCheckout(); } }));
$("clientNewBtn").addEventListener("click", () => openCustomerForm(null, { requireCpf: sale.pay === "prazo", prefillName: $("checkoutCustomer").value.trim(), onSaved: (c) => { sale.customer = c; refreshCheckout(); } }));
$("clientChosen").addEventListener("click", () => { sale.customer = null; refreshCheckout(); });

$("checkoutSaveBtn").addEventListener("click", async () => {
  const msg = $("checkoutMsg");
  clearMsg(msg);
  if (CART.size === 0) return;
  if (!sale.pay) return formError(msg, "Escolha a forma de pagamento.");
  const dTxt = $("checkoutDiscount").value.trim();
  if (dTxt && !Number.isFinite(parsePrice(dTxt))) return formError(msg, "Desconto inválido.", $("checkoutDiscount"));
  if (sale.pay === "prazo" && (!sale.customer || !sale.customer.cpf)) return formError(msg, "A prazo precisa do cliente com CPF. Toque em \"Já tem cadastro\" ou \"Cliente novo\".");
  const c = saleCalc();
  const items = [...CART.entries()].map(([k, qty]) => { const { pid, vid } = csplit(k); return { product_id: pid, variant_id: vid, qty, unit_price: Number(productById(pid).price) }; });
  const btn = $("checkoutSaveBtn");
  btn.disabled = true; btn.textContent = "Registrando…";
  const { data: saleId, error } = await sb.rpc("pdv_vender", {
    p_items: items, p_payment: sale.pay, p_discount: c.disc,
    p_customer: sale.customer ? null : ($("checkoutCustomer").value.trim() || null),
    p_customer_id: sale.customer ? sale.customer.id : null, p_phone: null,
    p_installments: sale.pay === "credito" ? sale.inst : sale.pay === "prazo" ? sale.prazoN : 1,
    p_surcharge: c.surcharge, p_card_fee: c.fee,
    p_prazo: sale.pay === "prazo" ? prazoParcels(c.total) : null, p_note: null
  });
  btn.disabled = false; btn.textContent = "Finalizar venda";
  if (error) {
    formError(msg, error.message.startsWith("Estoque insuficiente") || error.message.includes("prazo") ? error.message : "Não deu para registrar: " + error.message);
    await reloadProducts();
    renderSale();
    return;
  }
  const wasPrazo = sale.pay === "prazo";
  resetSale();
  closeSalePanel();
  salesCache = null;
  await reloadProducts();
  if (wasPrazo) loadPrazoData();
  const full = await fetchSale(saleId);
  if (full) openDone(full, { fresh: true });
});

// ---------- venda registrada + comprovante ----------
async function fetchSale(id) {
  const { data } = await sb.from("sales").select("*, sale_items(*), receivables(n,of_n,due,amount)").eq("id", id).single();
  return data;
}
function receiptText(s) {
  const when = new Date(s.created_at).toLocaleDateString("pt-BR");
  const lines = (s.sale_items || []).map(i => `${i.qty}x ${i.name}${i.variant_name ? ` (${i.variant_name})` : ""} — ${formatBRL(i.qty * i.unit_price)}`);
  const out = [`*${storeName()}*`, `Comprovante da compra nº ${s.number} · ${when}`, "", ...lines, ""];
  if (Number(s.discount) > 0) out.push(`Desconto: −${formatBRL(s.discount)}`);
  if (Number(s.surcharge) > 0) out.push(`Taxa do cartão: ${formatBRL(s.surcharge)}`);
  out.push(`*Total: ${formatBRL(s.total)}*`, `Pagamento: ${payLabel(s)}`);
  const rv = (s.receivables || []).sort((a, b) => a.n - b.n);
  if (rv.length) { out.push("", "Parcelas:"); rv.forEach(r => out.push(`${r.of_n > 1 ? `${r.n}/${r.of_n}` : "Única"} · ${dmy(r.due)} · ${formatBRL(r.amount)}`)); }
  out.push("", "Obrigado pela compra!");
  return out.join("\n");
}
let doneSale = null;
function openDone(s, { fresh = false } = {}) {
  doneSale = s;
  $("doneTitle").textContent = fresh ? "Venda registrada" : "Comprovante";
  $("doneTotal").textContent = formatBRL(s.total);
  $("doneMeta").textContent = [`nº ${s.number}`, payLabel(s), s.customer || ""].filter(Boolean).join(" · ");
  const cust = s.customer_id ? customerById(s.customer_id) : null;
  $("donePhone").value = s.phone ? fmtPhone(s.phone) : cust && cust.phone ? fmtPhone(cust.phone) : "";
  document.querySelector("#doneOverlay [data-close]").textContent = fresh ? "Nova venda" : "Fechar";
  document.querySelector("#doneOverlay .done-ic").hidden = !fresh;
  openSheet($("doneOverlay"));
}
$("doneWaBtn").addEventListener("click", async () => {
  if (!doneSale) return;
  const phone = onlyDigits($("donePhone").value);
  if (phone && phone.length < 10) return showToast("WhatsApp incompleto. Coloque com DDD.");
  if (phone && phone !== onlyDigits(doneSale.phone)) {
    sb.from("sales").update({ phone }).eq("id", doneSale.id).then(() => {});
    if (doneSale.customer_id) { const c = customerById(doneSale.customer_id); if (c && !c.phone) sb.from("customers").update({ phone }).eq("id", c.id).then(() => { c.phone = phone; }); }
  }
  const text = receiptText(doneSale);
  window.open(phone ? waLink(phone, text) : `https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
});

HOOKS.view.push((v) => {
  if (v === "vender") { renderSellCats(); renderSellGrid(); renderSale(); }
  updateCartBar();
});
HOOKS.data.push(() => {
  CART.forEach((q, k) => {
    const { pid, vid } = csplit(k);
    const p = productById(pid);
    const max = lineStock(pid, vid);
    if (!p || !isActive(p) || max <= 0 || (vid && !variantById(vid)) || (!vid && hasVariants(pid))) CART.delete(k);
    else if (q > max) CART.set(k, max);
  });
  if (!$("variantOverlay").hidden) renderVariantPick();
  if (currentView === "vender") { renderSellCats(); renderSellGrid(); renderSale(); }
});

// =========================================================
// VENDAS
// =========================================================
let salesPeriod = "today";
let salesCache = null;
let salesTicket = 0;
function periodRange(p) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (p === "today") return [d, null];
  if (p === "7") { d.setDate(d.getDate() - 6); return [d, null]; }
  if (p === "30") { d.setDate(d.getDate() - 29); return [d, null]; }
  if (p === "month") { d.setDate(1); return [d, null]; }
  if (p === "lastmonth") { const end = new Date(d.getFullYear(), d.getMonth(), 1); return [new Date(d.getFullYear(), d.getMonth() - 1, 1), end]; }
  return [null, null];
}
wireChips($("salesPeriod"), "period", (p) => { salesPeriod = p; loadSales(); });
async function loadSales() {
  const t = ++salesTicket;
  skeleton($("salesList"), 3);
  let q = sb.from("sales").select("*, sale_items(name,variant_name,qty,unit_price)").order("created_at", { ascending: false }).limit(800);
  const [a, b] = periodRange(salesPeriod);
  if (a) q = q.gte("created_at", a.toISOString());
  if (b) q = q.lt("created_at", b.toISOString());
  const { data, error } = await q;
  if (t !== salesTicket) return;
  if (error) { $("salesList").innerHTML = `<li class="list-empty"><strong>Não consegui carregar</strong>${escapeHtml(error.message)}</li>`; return; }
  salesCache = data || [];
  renderSales();
}
function renderSales() {
  const all = salesCache || [];
  const ok = all.filter(s => s.status === "ok");
  const total = ok.reduce((n, s) => n + Number(s.total), 0);
  const profit = ok.reduce((n, s) => n + profitOf(s), 0);
  $("sumTotal").textContent = formatBRL(total);
  $("sumProfit").textContent = formatBRL(profit);
  $("sumProfit").className = profit > 0 ? "is-profit" : "";
  $("sumCount").textContent = ok.length;
  $("sumTicket").textContent = formatBRL(ok.length ? total / ok.length : 0);

  const byPay = {};
  ok.forEach(s => { byPay[s.payment] = (byPay[s.payment] || 0) + Number(s.total); });
  const payRows = Object.entries(byPay).sort((a, b) => b[1] - a[1]);
  const pmax = Math.max(...payRows.map(r => r[1]), 1);
  $("payBreakdown").innerHTML = payRows.length ? payRows.map(([m, v]) => `<li>${payMini(m)}<span class="bar-name">${(PAY_INFO[m] || PAY_INFO.outro).label}</span><span class="bar-val">${formatBRL(v)}</span><span class="bar-track"><span class="bar-fill" style="width:${(v / pmax) * 100}%"></span></span></li>`).join("") : `<li class="muted small">Sem vendas no período.</li>`;

  const byItem = {};
  ok.forEach(s => (s.sale_items || []).forEach(i => { const n = i.variant_name ? `${i.name} (${i.variant_name})` : i.name; byItem[n] = (byItem[n] || 0) + i.qty; }));
  const top = Object.entries(byItem).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $("topItems").innerHTML = top.length ? top.map(([n, q]) => `<li><span class="t-name">${escapeHtml(n)}</span><span class="t-qty">${q} un</span></li>`).join("") : `<li class="muted small" style="counter-increment:none">Sem vendas no período.</li>`;

  $("salesList").innerHTML = all.length ? all.map(s => {
    const when = new Date(s.created_at);
    const time = when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const dt = salesPeriod === "today" ? time : `${when.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${time}`;
    const items = s.sale_items || [];
    const units = items.reduce((n, i) => n + i.qty, 0);
    return `<li class="row${s.status === "cancelada" ? " is-canceled" : ""}" data-id="${s.id}">
      <button type="button" class="row-main">${payMini(s.payment)}
        <span class="row-text"><span class="row-name">${escapeHtml(items[0] ? items[0].name : "Venda")}${items.length > 1 ? ` <span class="pill pill-mute">+${items.length - 1}</span>` : ""}</span>
          <span class="row-meta">${dt} · ${payLabel(s)}${s.customer ? ` · ${escapeHtml(s.customer)}` : ""}${s.status === "cancelada" ? " · cancelada" : ""}</span></span>
      </button>
      <span class="row-right">${formatBRL(s.total)}<small>${units} un</small></span></li>`;
  }).join("") : `<li class="list-empty"><strong>Nenhuma venda nesse período</strong>As vendas feitas em "Vender" aparecem aqui.</li>`;
}
$("salesList").addEventListener("click", (e) => { const r = e.target.closest(".row"); if (r) openSaleById(r.dataset.id); });
HOOKS.view.push((v) => { if (v === "vendas") loadSales(); });

// detalhe
let openSale = null;
async function openSaleById(id) {
  const s = await fetchSale(id);
  if (!s) return showToast("Venda não encontrada.");
  openSale = s;
  const when = new Date(s.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const profit = profitOf(s);
  const rv = (s.receivables || []).sort((a, b) => a.n - b.n);
  $("saleTitle").textContent = `Venda nº ${s.number}`;
  $("saleBody").innerHTML = `
    <div class="sale-detail">
      ${s.status === "cancelada" ? `<span class="pill pill-bad" style="align-self:flex-start">Cancelada · voltou ao estoque</span>` : ""}
      <span>${when}</span><span>${payLabel(s)}${s.customer ? ` · ${escapeHtml(s.customer)}` : ""}</span>
    </div>
    <ul class="lines">${(s.sale_items || []).map(i => `<li class="line"><img src="${escapeHtml(i.img || "")}" alt="" loading="lazy">
      <div class="line-name">${escapeHtml(i.name)}${i.variant_name ? ` <span class="pill pill-mute">${escapeHtml(i.variant_name)}</span>` : ""}<small>${i.qty} × ${formatBRL(i.unit_price)}</small></div>
      <div class="line-ctl"><span class="line-sub">${formatBRL(i.qty * i.unit_price)}</span></div></li>`).join("")}</ul>
    <div class="totals">
      ${Number(s.discount) > 0 || Number(s.surcharge) > 0 ? `<div><span>Subtotal</span><span>${formatBRL(s.subtotal)}</span></div>` : ""}
      ${Number(s.discount) > 0 ? `<div><span>Desconto</span><span>− ${formatBRL(s.discount)}</span></div>` : ""}
      ${Number(s.surcharge) > 0 ? `<div><span>Taxa repassada ao cliente</span><span>+ ${formatBRL(s.surcharge)}</span></div>` : ""}
      <div class="grand"><span>Total</span><span>${formatBRL(s.total)}</span></div>
      ${Number(s.card_fee) > 0 ? `<div><span>Taxa da maquininha</span><span>− ${formatBRL(s.card_fee)}</span></div><div><span>Você recebe</span><span>${formatBRL(Number(s.total) - Number(s.card_fee))}</span></div>` : ""}
      ${Number(s.cost_total) > 0 ? `<div class="profit"><span>Lucro</span><span>${formatBRL(profit)}</span></div>` : `<div><span>Lucro</span><span class="muted">sem custo cadastrado</span></div>`}
    </div>
    ${rv.length ? `<p class="kicker"><svg class="i xs"><use href="#i-spark"/></svg>Parcelas</p><div class="parcels">${rv.map(r => `<div class="parcel"><span>${r.of_n > 1 ? `${r.n}/${r.of_n}` : "Única"}</span><span>${dmy(r.due)}</span><b>${formatBRL(r.amount)}</b></div>`).join("")}</div>` : ""}`;
  $("saleCancelBtn").hidden = s.status === "cancelada";
  openSheet($("saleOverlay"));
}
$("saleWaBtn").addEventListener("click", () => { if (openSale) { closeSheet($("saleOverlay")); openDone(openSale); } });
$("saleCancelBtn").addEventListener("click", async () => {
  const s = openSale;
  if (!s) return;
  const units = (s.sale_items || []).reduce((n, i) => n + i.qty, 0);
  if (!await askConfirm({ title: `Cancelar a venda nº ${s.number}?`, text: `${plural(units, "O item volta", "Os itens voltam")} para o estoque e a venda sai das contas.${s.payment === "prazo" ? " As parcelas em aberto também são canceladas." : ""}`, yes: "Cancelar venda" })) return;
  const { error } = await sb.rpc("pdv_cancelar_venda", { p_sale: s.id });
  if (error) return showToast(error.message);
  closeSheet($("saleOverlay"));
  showToast("Venda cancelada e estoque devolvido");
  await Promise.all([reloadProducts(), loadPrazoData()]);
  if (currentView === "vendas") loadSales();
  if (currentView === "inicio") renderInicio();
});
