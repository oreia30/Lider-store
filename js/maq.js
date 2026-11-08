// ==== MAQUININHA: taxas, cálculo e simulador ====

const DEFAULT_RATES = { pix: 0, debito: 1.99, credito: [3.49, 5.39, 6.19, 6.99, 7.79, 8.59, 9.39, 10.19, 10.99, 11.79, 12.59, 13.39], clientePagaPadrao: true };

function getRates() {
  try {
    const r = JSON.parse(ADMIN_SETTINGS.card_rates || "null");
    if (r && Array.isArray(r.credito)) return { ...DEFAULT_RATES, ...r };
  } catch {}
  return { ...DEFAULT_RATES, credito: [...DEFAULT_RATES.credito] };
}
function rateFor(method, n = 1) {
  const r = getRates();
  if (method === "credito") return Number(r.credito[Math.min(Math.max(n, 1), 12) - 1]) || 0;
  if (method === "debito") return Number(r.debito) || 0;
  return 0;
}
// quanto cobrar para receber "valor" limpo / quanto recebe cobrando "valor"
const cobrarPara = (v, pct) => (pct > 0 ? round2(v / (1 - pct / 100)) : round2(v));
const recebeDe = (v, pct) => round2(v * (1 - pct / 100));
const pctText = (p) => `${String(round2(p)).replace(".", ",")}%`;

// ---------- simulador ----------
let simMode = "receber";
function renderSim() {
  const v = parsePrice($("simValue").value);
  const r = getRates();
  const rows = [["Pix", Number(r.pix) || 0, 1], ["Débito", Number(r.debito) || 0, 1], ...r.credito.map((p, i) => [`Crédito ${i + 1}x`, Number(p) || 0, i + 1])];
  $("simColHead").textContent = simMode === "receber" ? "Cobrar" : "Você recebe";
  $("simHint").textContent = simMode === "receber"
    ? "Quanto passar na maquininha para cair o valor certo (o cliente paga a taxa)."
    : "Quanto cai para você depois da taxa.";
  $("simBody").innerHTML = rows.map(([name, pct, n]) => {
    const ok = Number.isFinite(v) && v > 0;
    const res = ok ? (simMode === "receber" ? cobrarPara(v, pct) : recebeDe(v, pct)) : 0;
    const charged = simMode === "receber" ? res : v;
    return `<tr><td>${name}</td><td>${pctText(pct)}</td><td>${ok ? formatBRL(res) : "—"}</td><td>${ok && n > 1 ? `${n}x ${formatBRL(charged / n)}` : ""}</td></tr>`;
  }).join("");
}
$("simValue").addEventListener("input", renderSim);
$("simMode").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  simMode = b.dataset.mode;
  $("simMode").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
  renderSim();
});
HOOKS.view.push((v) => { if (v === "maquininha") renderSim(); });
HOOKS.data.push(() => { if (currentView === "maquininha") renderSim(); });

// ---------- editar taxas ----------
const toInput = (n) => String(n).replace(".", ",");
$("ratesEditBtn").addEventListener("click", () => {
  const r = getRates();
  $("rateDebit").value = toInput(r.debito);
  $("ratePix").value = toInput(r.pix);
  $("rateClientPays").checked = r.clientePagaPadrao !== false;
  $("ratesCredit").innerHTML = r.credito.map((p, i) => `<label><span>${i + 1}x</span><input type="text" inputmode="decimal" data-i="${i}" value="${toInput(p)}"></label>`).join("");
  clearMsg($("ratesMsg"));
  openSheet($("ratesOverlay"));
});
$("ratesForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const num = (s) => { const n = parsePrice(s); return Number.isFinite(n) ? n : NaN; };
  const credito = [...$("ratesCredit").querySelectorAll("input")].map(i => num(i.value));
  const rates = { pix: num($("ratePix").value || "0"), debito: num($("rateDebit").value), credito, clientePagaPadrao: $("rateClientPays").checked };
  if ([rates.pix, rates.debito, ...credito].some(n => !Number.isFinite(n) || n < 0 || n >= 100)) {
    return formError($("ratesMsg"), "Alguma taxa está inválida. Use só números, por exemplo 3,49.");
  }
  const value = JSON.stringify(rates);
  const { error } = await sb.from("settings").upsert({ key: "card_rates", value });
  if (error) return formError($("ratesMsg"), "Não deu para salvar: " + error.message);
  ADMIN_SETTINGS.card_rates = value;
  closeSheet($("ratesOverlay"));
  showToast("Taxas salvas");
  renderSim();
  if (typeof refreshCheckout === "function") refreshCheckout();
});
