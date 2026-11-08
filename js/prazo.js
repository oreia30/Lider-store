// ==== PRAZO E CLIENTES ====

let CUSTOMERS = [];
let OPEN_RECV = [];          // parcelas em aberto (todas as clientes)
let prazoSub = "receber";

// ---------- datas ----------
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayIso = () => isoDate(new Date());
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseIso(s); d.setDate(d.getDate() + n); return isoDate(d); };
function addMonths(s, n) {
  const d = parseIso(s);
  const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return isoDate(d);
}
const dm = (s) => { const d = parseIso(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const dmy = (s) => { const d = parseIso(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const daysBetween = (a, b) => Math.round((parseIso(b) - parseIso(a)) / 86400000);
function dueText(due) {
  const n = daysBetween(todayIso(), due);
  if (n === 0) return "vence hoje";
  if (n === 1) return "vence amanhã";
  if (n > 1) return `vence em ${n} dias`;
  return n === -1 ? "venceu ontem" : `venceu há ${-n} dias`;
}

// ---------- CPF e WhatsApp ----------
function cpfOk(v) {
  const c = onlyDigits(v);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
  let d = (s * 10) % 11; if (d === 10) d = 0;
  if (d !== +c[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i);
  d = (s * 10) % 11; if (d === 10) d = 0;
  return d === +c[10];
}
const fmtCpf = (v) => { const c = onlyDigits(v); return c.length === 11 ? `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}` : v || ""; };
const fmtPhone = (v) => {
  const c = onlyDigits(v).replace(/^55(?=\d{10,11}$)/, "");
  if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`;
  if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`;
  return v || "";
};
function waLink(phone, text) {
  let d = onlyDigits(phone);
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
const storeName = () => ADMIN_SETTINGS.store_name || "Líder Store";
const initials = (name) => (name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
document.querySelectorAll("#customerCpf").forEach(i => i.addEventListener("input", () => {
  const c = onlyDigits(i.value).slice(0, 11);
  i.value = c.length > 9 ? `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}` : c.length > 6 ? `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}` : c.length > 3 ? `${c.slice(0, 3)}.${c.slice(3)}` : c;
}));

// ---------- dados ----------
async function loadPrazoData() {
  const [c, r] = await Promise.all([
    sb.from("customers").select("*").order("name"),
    sb.from("receivables").select("*").eq("status", "aberta").order("due")
  ]);
  if (!c.error) CUSTOMERS = c.data || [];
  if (!r.error) OPEN_RECV = r.data || [];
  renderPrazo();
  HOOKS.data.forEach(fn => { if (fn !== loadPrazoData) fn(); });
}
const customerById = (id) => CUSTOMERS.find(c => c.id === id);

function debtSummary(customerId) {
  const t = todayIso();
  const items = OPEN_RECV.filter(r => r.customer_id === customerId);
  const open = round2(items.reduce((s, r) => s + Number(r.amount) - Number(r.paid), 0));
  const late = round2(items.filter(r => r.due < t).reduce((s, r) => s + Number(r.amount) - Number(r.paid), 0));
  const next = items.filter(r => r.due >= t).sort((a, b) => a.due.localeCompare(b.due))[0];
  const oldestLate = items.filter(r => r.due < t).sort((a, b) => a.due.localeCompare(b.due))[0];
  return { open, late, next, oldestLate, items };
}
function prazoTotals() {
  const t = todayIso();
  const total = round2(OPEN_RECV.reduce((s, r) => s + Number(r.amount) - Number(r.paid), 0));
  const late = round2(OPEN_RECV.filter(r => r.due < t).reduce((s, r) => s + Number(r.amount) - Number(r.paid), 0));
  const people = new Set(OPEN_RECV.map(r => r.customer_id));
  const latePeople = new Set(OPEN_RECV.filter(r => r.due < t).map(r => r.customer_id));
  return { total, late, people: people.size, latePeople: latePeople.size };
}

function renderPrazo() {
  const t = prazoTotals();
  $("prazoTotal").textContent = formatBRL(t.total);
  $("prazoLate").textContent = formatBRL(t.late);
  $("prazoLate").classList.toggle("is-bad", t.late > 0);
  $("prazoCount").textContent = t.people;
  $("tilePrazo").textContent = t.total > 0 ? `${formatBRL(t.total)} a receber` : "Ninguém devendo";
  document.querySelectorAll('[data-badge="prazo"]').forEach(b => { b.hidden = t.latePeople === 0; if (!b.classList.contains("bnav-dot")) b.textContent = t.latePeople; });

  // a receber, por cliente (vencidos primeiro)
  const ids = [...new Set(OPEN_RECV.map(r => r.customer_id))];
  const rows = ids.map(id => ({ c: customerById(id), s: debtSummary(id) })).filter(x => x.c)
    .sort((a, b) => (b.s.late > 0) - (a.s.late > 0) || (a.s.oldestLate || a.s.next || {}).due?.localeCompare((b.s.oldestLate || b.s.next || {}).due || "") || 0);
  $("receivableList").innerHTML = rows.length ? rows.map(({ c, s }) => `
    <li class="row" data-id="${c.id}">
      <button type="button" class="row-main"><span class="avatar">${escapeHtml(initials(c.name))}</span>
        <span class="row-text"><span class="row-name">${escapeHtml(c.name)}</span>
          <span class="row-meta">${s.late > 0 ? `<span class="pill pill-bad">${formatBRL(s.late)} vencido · ${dueText(s.oldestLate.due)}</span>` : s.next ? `<span class="pill ${daysBetween(todayIso(), s.next.due) <= 3 ? "pill-warn" : "pill-ok"}">Próxima ${dm(s.next.due)} · ${formatBRL(Number(s.next.amount) - Number(s.next.paid))}</span>` : ""}</span>
        </span>
      </button>
      <span class="row-right">${formatBRL(s.open)}<small>deve</small></span>
    </li>`).join("") : `<li class="list-empty"><strong>Ninguém devendo</strong>As vendas "A prazo" aparecem aqui com as parcelas.</li>`;

  renderCustomerList();
}
function renderCustomerList() {
  const q = normalizeText($("customerSearch").value.trim());
  const qd = onlyDigits(q);
  const list = CUSTOMERS.filter(c => !q || normalizeText(c.name).includes(q) || (qd && (onlyDigits(c.cpf).includes(qd) || onlyDigits(c.phone).includes(qd))));
  $("customerList").innerHTML = list.length ? list.map(c => {
    const s = debtSummary(c.id);
    return `<li class="row" data-id="${c.id}">
      <button type="button" class="row-main"><span class="avatar">${escapeHtml(initials(c.name))}</span>
        <span class="row-text"><span class="row-name">${escapeHtml(c.name)}</span>
          <span class="row-meta">${[c.cpf ? fmtCpf(c.cpf) : "sem CPF", c.phone ? fmtPhone(c.phone) : ""].filter(Boolean).join(" · ")}</span></span>
      </button>
      ${s.open > 0 ? `<span class="row-right ${s.late > 0 ? "is-bad" : ""}">${formatBRL(s.open)}<small>deve</small></span>` : ""}
    </li>`;
  }).join("") : `<li class="list-empty"><strong>${q ? "Ninguém encontrado" : "Nenhum cliente ainda"}</strong>${q ? "" : "Cadastre na hora da venda ou no botão Cliente."}</li>`;
}
$("customerSearch").addEventListener("input", renderCustomerList);
wireChips($("prazoTabs"), "sub", (s) => { prazoSub = s; $("sub-receber").hidden = s !== "receber"; $("sub-clientes").hidden = s !== "clientes"; });
$("receivableList").addEventListener("click", (e) => { const r = e.target.closest(".row"); if (r) openCustomerView(r.dataset.id); });
$("customerList").addEventListener("click", (e) => { const r = e.target.closest(".row"); if (r) openCustomerView(r.dataset.id); });
$("newCustomerBtn").addEventListener("click", () => openCustomerForm(null));

HOOKS.view.push((v) => { if (v === "prazo" || v === "inicio" || v === "mais") loadPrazoData(); });
let prazoFirstLoad = true;
HOOKS.data.push(() => { if (prazoFirstLoad) { prazoFirstLoad = false; loadPrazoData(); } });

// ---------- cadastro de cliente ----------
let customerSavedCb = null;
function openCustomerForm(id, { requireCpf = false, onSaved = null, prefillName = "" } = {}) {
  const c = id ? customerById(id) : null;
  $("customerForm").reset();
  clearMsg($("customerMsg"));
  $("customerTitle").textContent = c ? "Editar cliente" : "Cliente novo";
  $("customerId").value = c ? c.id : "";
  $("customerName").value = c ? c.name : prefillName;
  $("customerCpf").value = c && c.cpf ? fmtCpf(c.cpf) : "";
  $("customerPhone").value = c && c.phone ? fmtPhone(c.phone) : "";
  $("customerNotes").value = c ? (c.notes || "") : "";
  $("customerCpfOpt").textContent = requireCpf ? "(obrigatório para vender a prazo)" : "(opcional, só obrigatório no prazo)";
  $("customerForm").dataset.requireCpf = requireCpf ? "1" : "";
  customerSavedCb = onSaved;
  openSheet($("customerOverlay"));
  setTimeout(() => $("customerName").focus(), 50);
}
$("customerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("customerMsg");
  clearMsg(msg);
  const id = $("customerId").value;
  const cpf = onlyDigits($("customerCpf").value);
  if (cpf && !cpfOk(cpf)) return formError(msg, "Esse CPF não é válido. Confira os números.", $("customerCpf"));
  if (!cpf && $("customerForm").dataset.requireCpf) return formError(msg, "Para vender a prazo, o CPF é obrigatório.", $("customerCpf"));
  const phone = onlyDigits($("customerPhone").value);
  if (phone && phone.length < 10) return formError(msg, "WhatsApp incompleto. Coloque com DDD.", $("customerPhone"));
  const payload = { name: $("customerName").value.trim(), cpf: cpf || null, phone: phone || null, notes: $("customerNotes").value.trim() || null };
  $("customerSaveBtn").disabled = true;
  const res = id
    ? await sb.from("customers").update(payload).eq("id", id).select().single()
    : await sb.from("customers").insert(payload).select().single();
  $("customerSaveBtn").disabled = false;
  if (res.error) {
    return formError(msg, /customers_cpf_uq|duplicate/i.test(res.error.message) ? "Já tem um cliente com esse CPF. Use \"Já tem cadastro\"." : "Não deu para salvar: " + res.error.message);
  }
  const saved = res.data;
  const i = CUSTOMERS.findIndex(c => c.id === saved.id);
  if (i >= 0) CUSTOMERS[i] = saved; else CUSTOMERS.push(saved);
  CUSTOMERS.sort((a, b) => a.name.localeCompare(b.name));
  closeSheet($("customerOverlay"));
  showToast(id ? "Cliente atualizado" : "Cliente cadastrado");
  renderPrazo();
  if (customerSavedCb) { const cb = customerSavedCb; customerSavedCb = null; cb(saved); }
  if (!$("customerViewOverlay").hidden && openCustomerId === saved.id) openCustomerView(saved.id);
});

// ---------- escolher cliente ----------
let pickCb = null, pickRequireCpf = false;
function openCustomerPicker({ requireCpf = false, onPick }) {
  pickCb = onPick; pickRequireCpf = requireCpf;
  $("pickSearch").value = "";
  $("pickTitle").textContent = requireCpf ? "Cliente do prazo" : "Escolher cliente";
  renderPick();
  openSheet($("customerPickOverlay"));
  setTimeout(() => $("pickSearch").focus(), 50);
}
function renderPick() {
  const q = normalizeText($("pickSearch").value.trim());
  const qd = onlyDigits(q);
  const list = CUSTOMERS.filter(c => !q || normalizeText(c.name).includes(q) || (qd && (onlyDigits(c.cpf).includes(qd) || onlyDigits(c.phone).includes(qd)))).slice(0, 60);
  $("pickList").innerHTML = list.length ? list.map(c => {
    const s = debtSummary(c.id);
    const noCpf = pickRequireCpf && !c.cpf;
    return `<li class="row" data-id="${c.id}"><button type="button" class="row-main"><span class="avatar">${escapeHtml(initials(c.name))}</span>
      <span class="row-text"><span class="row-name">${escapeHtml(c.name)}</span>
      <span class="row-meta">${c.cpf ? fmtCpf(c.cpf) : `<span class="pill ${noCpf ? "pill-warn" : "pill-mute"}">sem CPF</span>`}${c.phone ? ` · ${fmtPhone(c.phone)}` : ""}${s.open > 0 ? ` · <span class="pill ${s.late > 0 ? "pill-bad" : "pill-warn"}">deve ${formatBRL(s.open)}</span>` : ""}</span></span></button></li>`;
  }).join("") : `<li class="list-empty"><strong>Ninguém encontrado</strong>Use "Cliente novo" para cadastrar.</li>`;
}
$("pickSearch").addEventListener("input", renderPick);
$("pickList").addEventListener("click", (e) => {
  const r = e.target.closest(".row");
  if (!r) return;
  const c = customerById(r.dataset.id);
  closeSheet($("customerPickOverlay"));
  if (pickRequireCpf && !c.cpf) {
    showToast("Esse cliente está sem CPF. Coloque o CPF para vender a prazo.");
    openCustomerForm(c.id, { requireCpf: true, onSaved: pickCb });
    return;
  }
  if (pickCb) pickCb(c);
});

// ---------- ficha do cliente ----------
let openCustomerId = null;
async function openCustomerView(id) {
  const c = customerById(id);
  if (!c) return;
  openCustomerId = id;
  $("cvTitle").textContent = c.name;
  $("cvBody").innerHTML = `<ul class="list"><li class="skeleton"><i></i><i></i></li></ul>`;
  openSheet($("customerViewOverlay"));
  const [rv, sl, rc] = await Promise.all([
    sb.from("receivables").select("*").eq("customer_id", id).neq("status", "cancelada").order("due"),
    sb.from("sales").select("id,number,created_at,total,payment,status,sale_items(name,qty)").eq("customer_id", id).order("created_at", { ascending: false }).limit(20),
    sb.from("receipts").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(10)
  ]);
  if (openCustomerId !== id) return;
  const s = debtSummary(id);
  const t = todayIso();
  const parcels = (rv.data || []).filter(r => r.status === "aberta" || daysBetween(r.due, t) < 120);
  const sales = (sl.data || []).filter(x => x.status === "ok");
  const spent = sales.reduce((n, x) => n + Number(x.total), 0);
  $("cvBody").innerHTML = `
    <div class="cv-head"><span class="avatar">${escapeHtml(initials(c.name))}</span>
      <div><strong>${escapeHtml(c.name)}</strong><small>${[c.cpf ? `CPF ${fmtCpf(c.cpf)}` : "sem CPF", c.phone ? fmtPhone(c.phone) : "sem WhatsApp"].join(" · ")}</small>${c.notes ? `<small>${escapeHtml(c.notes)}</small>` : ""}</div></div>
    <dl class="stats3">
      <div><dt>Deve</dt><dd>${formatBRL(s.open)}</dd></div>
      <div><dt>Vencido</dt><dd class="${s.late > 0 ? "is-bad" : ""}">${formatBRL(s.late)}</dd></div>
      <div><dt>Já comprou</dt><dd>${formatBRL(spent)}</dd></div>
    </dl>
    ${parcels.length ? `<p class="kicker"><svg class="i xs"><use href="#i-spark"/></svg>Parcelas</p><div class="parcels">${parcels.map(r => {
      const left = round2(Number(r.amount) - Number(r.paid));
      const late = r.status === "aberta" && r.due < t;
      return `<div class="parcel ${r.status === "paga" ? "paid" : late ? "late" : ""}"><span>${r.of_n > 1 ? `${r.n}/${r.of_n}` : "Única"}</span>
        <span>${dmy(r.due)} · ${r.status === "paga" ? "paga" : dueText(r.due)}${Number(r.paid) > 0 && r.status !== "paga" ? ` · pagou ${formatBRL(r.paid)}` : ""}</span>
        <b>${formatBRL(r.status === "paga" ? r.amount : left)}</b></div>`;
    }).join("")}</div>` : ""}
    ${(rc.data || []).length ? `<p class="kicker"><svg class="i xs"><use href="#i-spark"/></svg>Recebimentos</p><ul class="list">${rc.data.map(x => `<li class="row"><span class="row-main"><span class="row-text"><span class="row-name">${formatBRL(x.amount)}</span><span class="row-meta">${new Date(x.created_at).toLocaleDateString("pt-BR")} · ${PAY_INFO[x.method]?.label || x.method}</span></span></span></li>`).join("")}</ul>` : ""}
    <p class="kicker"><svg class="i xs"><use href="#i-spark"/></svg>Compras</p>
    ${sales.length ? `<ul class="list">${sales.map(x => `<li class="row" data-sale="${x.id}"><button type="button" class="row-main"><span class="row-text"><span class="row-name">${escapeHtml((x.sale_items || []).map(i => `${i.qty > 1 ? i.qty + "x " : ""}${i.name}`).join(", "))}</span><span class="row-meta">${new Date(x.created_at).toLocaleDateString("pt-BR")} · ${PAY_INFO[x.payment]?.label || x.payment}</span></span></button><span class="row-right">${formatBRL(x.total)}</span></li>`).join("")}</ul>` : `<p class="muted">Nenhuma compra registrada.</p>`}`;
  $("cvReceiveBtn").hidden = s.open <= 0;
  $("cvRemindBtn").hidden = s.open <= 0 || !c.phone;
}
$("cvEditBtn").addEventListener("click", () => { if (openCustomerId) openCustomerForm(openCustomerId); });
$("cvReceiveBtn").addEventListener("click", () => { if (openCustomerId) openReceive(openCustomerId); });
$("cvRemindBtn").addEventListener("click", () => {
  const c = customerById(openCustomerId);
  const s = debtSummary(openCustomerId);
  if (!c || !c.phone) return;
  const first = c.name.split(" ")[0];
  const text = s.late > 0
    ? `Oi, ${first}! Tudo bem? Aqui é da ${storeName()}. Passando para lembrar que tem ${formatBRL(s.late)} vencido da sua compra a prazo${s.oldestLate ? ` (desde ${dm(s.oldestLate.due)})` : ""}. Pode me mandar o Pix quando der? Obrigado!`
    : `Oi, ${first}! Tudo bem? Aqui é da ${storeName()}. Só lembrando da próxima parcela da sua compra: ${formatBRL(Number(s.next.amount) - Number(s.next.paid))} em ${dm(s.next.due)}. Obrigado!`;
  window.open(waLink(c.phone, text), "_blank");
});
$("cvBody").addEventListener("click", (e) => {
  const r = e.target.closest("[data-sale]");
  if (r && typeof openSaleById === "function") openSaleById(r.dataset.sale);
});

// ---------- receber ----------
let receiveCustomerId = null, receiveMethod = "pix";
function openReceive(id) {
  const c = customerById(id);
  const s = debtSummary(id);
  receiveCustomerId = id;
  $("receiveTitle").textContent = `Receber de ${c.name.split(" ")[0]}`;
  $("receiveInfo").textContent = `Deve ${formatBRL(s.open)}${s.late > 0 ? `, sendo ${formatBRL(s.late)} vencido` : ""}. O valor abate primeiro das parcelas mais antigas.`;
  const opts = [["Tudo", s.open]];
  if (s.late > 0 && s.late < s.open) opts.push(["Vencido", s.late]);
  const nextOpen = s.items.sort((a, b) => a.due.localeCompare(b.due))[0];
  if (nextOpen) { const v = round2(Number(nextOpen.amount) - Number(nextOpen.paid)); if (v < s.open && v !== s.late) opts.push(["Parcela", v]); }
  $("receiveQuick").innerHTML = opts.map(([l, v]) => `<button type="button" class="btn btn-ghost" data-v="${v}">${l} ${formatBRL(v)}</button>`).join("");
  $("receiveAmount").value = priceToInput(s.late > 0 ? s.late : (nextOpen ? round2(Number(nextOpen.amount) - Number(nextOpen.paid)) : s.open));
  clearMsg($("receiveMsg"));
  setReceiveMethod("pix");
  openSheet($("receiveOverlay"));
}
function setReceiveMethod(m) {
  receiveMethod = m;
  $("receiveMethod").querySelectorAll(".pay").forEach(b => b.setAttribute("aria-checked", b.dataset.pay === m));
}
$("receiveMethod").addEventListener("click", (e) => { const b = e.target.closest(".pay"); if (b) setReceiveMethod(b.dataset.pay); });
$("receiveQuick").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) $("receiveAmount").value = priceToInput(b.dataset.v); });
$("receiveForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = parsePrice($("receiveAmount").value);
  if (!Number.isFinite(v) || v <= 0) return formError($("receiveMsg"), "Coloque o valor recebido.", $("receiveAmount"));
  $("receiveSaveBtn").disabled = true;
  const { data, error } = await sb.rpc("pdv_receber", { p_customer: receiveCustomerId, p_amount: round2(v), p_method: receiveMethod, p_note: null });
  $("receiveSaveBtn").disabled = false;
  if (error) return formError($("receiveMsg"), error.message);
  closeSheet($("receiveOverlay"));
  showToast(Number(data) > 0.005 ? `Recebido ${formatBRL(v)}. Ainda deve ${formatBRL(data)}.` : `Recebido ${formatBRL(v)}. Quitado!`);
  await loadPrazoData();
  if (!$("customerViewOverlay").hidden) openCustomerView(receiveCustomerId);
});

// ---------- calendário próprio ----------
let calState = null;
function openCalendar({ value, min, title = "Escolher data", quick = [], onPick }) {
  const v = value || todayIso();
  const d = parseIso(v);
  calState = { y: d.getFullYear(), m: d.getMonth(), value: v, min, onPick };
  $("calTitle").textContent = title;
  $("calQuick").innerHTML = quick.map(([l, iso]) => `<button type="button" class="btn btn-ghost" data-iso="${iso}">${l}</button>`).join("");
  renderCal();
  openSheet($("calOverlay"));
}
function renderCal() {
  const { y, m, value, min } = calState;
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  $("calMonth").textContent = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const t = todayIso();
  let html = "";
  for (let i = 0; i < first.getDay(); i++) html += "<span></span>";
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${pad(m + 1)}-${pad(d)}`;
    const cls = [iso === t ? "today" : "", iso === value ? "sel" : ""].filter(Boolean).join(" ");
    html += `<button type="button" data-iso="${iso}" class="${cls}" ${min && iso < min ? "disabled" : ""}>${d}</button>`;
  }
  $("calGrid").innerHTML = html;
}
$("calPrev").addEventListener("click", () => { calState.m--; if (calState.m < 0) { calState.m = 11; calState.y--; } renderCal(); });
$("calNext").addEventListener("click", () => { calState.m++; if (calState.m > 11) { calState.m = 0; calState.y++; } renderCal(); });
function pickCal(e) {
  const b = e.target.closest("[data-iso]");
  if (!b || b.disabled) return;
  closeSheet($("calOverlay"));
  if (calState.onPick) calState.onPick(b.dataset.iso);
}
$("calGrid").addEventListener("click", pickCal);
$("calQuick").addEventListener("click", pickCal);
