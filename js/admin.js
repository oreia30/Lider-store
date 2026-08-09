// ==== ESTADO ====
let ADMIN_PRODUCTS = [];
let ADMIN_CATEGORIES = [];
let ADMIN_SETTINGS = {};

// ==== ELEMENTOS ====
const loginWrap = document.getElementById("loginWrap");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// ==== TOAST ====
let toastTimer;
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
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

function formatBRL(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ==== AUTENTICAÇÃO ====
async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    showDashboard(data.session.user);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginWrap.hidden = false;
  dashboard.hidden = true;
}

async function showDashboard(user) {
  loginWrap.hidden = true;
  dashboard.hidden = false;
  userEmailEl.textContent = user.email;
  await loadAllData();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = error.message === "Email not confirmed"
      ? "Confirme seu e-mail antes de entrar (verifique sua caixa de entrada)."
      : "E-mail ou senha inválidos.";
    return;
  }
  showDashboard(data.user);
});

logoutBtn.addEventListener("click", async () => {
  await sb.auth.signOut();
  showLogin();
});

// ==== ABAS ====
document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.toggle("active", t === tab));
    document.querySelectorAll(".admin-panel").forEach(p => p.hidden = true);
    document.getElementById(`panel-${tab.dataset.tab}`).hidden = false;
  });
});

// ==== CARREGAR DADOS ====
async function loadAllData() {
  const [prodRes, catRes, settRes] = await Promise.all([
    sb.from("products").select("*").order("created_at", { ascending: true }),
    sb.from("categories").select("*").order("sort_order", { ascending: true }),
    sb.from("settings").select("*")
  ]);
  ADMIN_PRODUCTS = prodRes.data || [];
  ADMIN_CATEGORIES = catRes.data || [];
  ADMIN_SETTINGS = {};
  (settRes.data || []).forEach(s => { ADMIN_SETTINGS[s.key] = s.value; });

  renderCategoryFilterOptions();
  renderProductsTable();
  renderCategoriesTable();
  fillSettingsForm();
  loadAdmins();
}

function categoryLabel(id) {
  const c = ADMIN_CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
}

// ==== PRODUTOS: TABELA ====
const productsTableBody = document.getElementById("productsTableBody");
const productSearch = document.getElementById("productSearch");
const productCategoryFilter = document.getElementById("productCategoryFilter");

function renderCategoryFilterOptions() {
  productCategoryFilter.innerHTML = `<option value="">Todas as categorias</option>` +
    ADMIN_CATEGORIES.map(c => `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join("");
}

function renderProductsTable() {
  const search = productSearch.value.trim().toLowerCase();
  const catFilter = productCategoryFilter.value;

  const filtered = ADMIN_PRODUCTS.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search);
    const matchesCat = !catFilter || p.category === catFilter;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    productsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:24px;">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  productsTableBody.innerHTML = filtered.map(p => `
    <tr data-id="${p.id}">
      <td><img class="admin-table-thumb" src="${p.img}" alt=""></td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(categoryLabel(p.category))}</td>
      <td>${formatBRL(p.price)}</td>
      <td>
        <div class="admin-table-actions">
          <button class="btn-admin-small" data-action="edit-product" data-id="${p.id}">Editar</button>
          <button class="btn-admin-danger" data-action="delete-product" data-id="${p.id}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join("");
}

productSearch.addEventListener("input", renderProductsTable);
productCategoryFilter.addEventListener("change", renderProductsTable);

productsTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "edit-product") openProductModal(id);
  if (btn.dataset.action === "delete-product") deleteProduct(id);
});

// ==== PRODUTOS: MODAL ====
const productModalOverlay = document.getElementById("productModalOverlay");
const productForm = document.getElementById("productForm");
const productModalTitle = document.getElementById("productModalTitle");
const productIdInput = document.getElementById("productId");
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const productCategorySelect = document.getElementById("productCategory");
const productImageFile = document.getElementById("productImageFile");
const productImagePreview = document.getElementById("productImagePreview");
const productSaveMsg = document.getElementById("productSaveMsg");
const productSaveBtn = document.getElementById("productSaveBtn");

document.getElementById("newProductBtn").addEventListener("click", () => openProductModal(null));
document.getElementById("productCancelBtn").addEventListener("click", closeProductModal);

function openProductModal(id) {
  productForm.reset();
  productSaveMsg.textContent = "";
  productCategorySelect.innerHTML = ADMIN_CATEGORIES.map(c => `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join("");

  if (id) {
    const p = ADMIN_PRODUCTS.find(p => p.id === id);
    productModalTitle.textContent = "Editar produto";
    productIdInput.value = p.id;
    productNameInput.value = p.name;
    productPriceInput.value = p.price;
    productCategorySelect.value = p.category;
    productImagePreview.src = p.img;
  } else {
    productModalTitle.textContent = "Novo produto";
    productIdInput.value = "";
    productImagePreview.src = "";
  }
  productModalOverlay.hidden = false;
}

function closeProductModal() {
  productModalOverlay.hidden = true;
}

productImageFile.addEventListener("change", () => {
  const file = productImageFile.files[0];
  if (file) productImagePreview.src = URL.createObjectURL(file);
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  productSaveBtn.disabled = true;
  productSaveMsg.classList.remove("error");
  productSaveMsg.textContent = "Salvando...";

  try {
    const id = productIdInput.value;
    let imgUrl = id ? ADMIN_PRODUCTS.find(p => p.id === id).img : "";

    const file = productImageFile.files[0];
    if (file) {
      imgUrl = await uploadImage(file, "produtos");
    }

    const payload = {
      name: productNameInput.value.trim(),
      price: Number(productPriceInput.value),
      category: productCategorySelect.value,
      img: imgUrl
    };

    if (!payload.img) {
      productSaveMsg.textContent = "Escolha uma foto para o produto.";
      productSaveMsg.classList.add("error");
      productSaveBtn.disabled = false;
      return;
    }

    let error;
    if (id) {
      ({ error } = await sb.from("products").update(payload).eq("id", id));
    } else {
      ({ error } = await sb.from("products").insert(payload));
    }
    if (error) throw error;

    closeProductModal();
    showToast(id ? "Produto atualizado" : "Produto criado");
    await loadAllData();
  } catch (err) {
    productSaveMsg.textContent = "Erro ao salvar: " + err.message;
    productSaveMsg.classList.add("error");
  } finally {
    productSaveBtn.disabled = false;
  }
});

async function deleteProduct(id) {
  const p = ADMIN_PRODUCTS.find(p => p.id === id);
  if (!confirm(`Excluir o produto "${p ? p.name : ""}"? Essa ação não pode ser desfeita.`)) return;
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) {
    showToast("Erro ao excluir: " + error.message);
    return;
  }
  showToast("Produto excluído");
  await loadAllData();
}

// ==== UPLOAD DE IMAGEM ====
async function uploadImage(file, folder) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeBase = slugify(file.name.replace(/\.[^.]+$/, "")) || "img";
  const path = `${folder}/${Date.now()}-${safeBase}.${ext}`;

  const { error: uploadError } = await sb.storage.from(STORE_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (uploadError) throw uploadError;

  const { data } = sb.storage.from(STORE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ==== CATEGORIAS: TABELA ====
const categoriesTableBody = document.getElementById("categoriesTableBody");

function renderCategoriesTable() {
  if (ADMIN_CATEGORIES.length === 0) {
    categoriesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#999;padding:24px;">Nenhuma categoria.</td></tr>`;
    return;
  }
  categoriesTableBody.innerHTML = ADMIN_CATEGORIES.map(c => `
    <tr data-id="${c.id}">
      <td>${escapeHtml(c.label)}</td>
      <td><code>${escapeHtml(c.id)}</code></td>
      <td>${c.sort_order}</td>
      <td>
        <div class="admin-table-actions">
          <button class="btn-admin-small" data-action="edit-category" data-id="${c.id}">Editar</button>
          <button class="btn-admin-danger" data-action="delete-category" data-id="${c.id}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join("");
}

categoriesTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "edit-category") openCategoryModal(id);
  if (btn.dataset.action === "delete-category") deleteCategory(id);
});

// ==== CATEGORIAS: MODAL ====
const categoryModalOverlay = document.getElementById("categoryModalOverlay");
const categoryForm = document.getElementById("categoryForm");
const categoryModalTitle = document.getElementById("categoryModalTitle");
const categoryOriginalIdInput = document.getElementById("categoryOriginalId");
const categoryLabelInput = document.getElementById("categoryLabel");
const categoryIdInput = document.getElementById("categoryId");
const categorySortInput = document.getElementById("categorySort");
const categorySaveMsg = document.getElementById("categorySaveMsg");

document.getElementById("newCategoryBtn").addEventListener("click", () => openCategoryModal(null));
document.getElementById("categoryCancelBtn").addEventListener("click", () => categoryModalOverlay.hidden = true);

let categoryIdManuallyEdited = false;
categoryIdInput.addEventListener("input", () => { categoryIdManuallyEdited = true; });
categoryLabelInput.addEventListener("input", () => {
  if (!categoryIdManuallyEdited) categoryIdInput.value = slugify(categoryLabelInput.value);
});

function openCategoryModal(id) {
  categoryForm.reset();
  categorySaveMsg.textContent = "";
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
  categoryModalOverlay.hidden = false;
}

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  categorySaveMsg.classList.remove("error");
  categorySaveMsg.textContent = "Salvando...";

  const originalId = categoryOriginalIdInput.value;
  const newId = slugify(categoryIdInput.value);
  const payload = {
    id: newId,
    label: categoryLabelInput.value.trim(),
    sort_order: Number(categorySortInput.value) || 0
  };

  try {
    let error;
    if (originalId) {
      // Se o identificador mudou, atualiza id (products.category segue via FK on update cascade)
      ({ error } = await sb.from("categories").update(payload).eq("id", originalId));
    } else {
      ({ error } = await sb.from("categories").insert(payload));
    }
    if (error) throw error;

    categoryModalOverlay.hidden = true;
    showToast("Categoria salva");
    await loadAllData();
  } catch (err) {
    categorySaveMsg.textContent = "Erro ao salvar: " + err.message;
    categorySaveMsg.classList.add("error");
  }
});

async function deleteCategory(id) {
  const inUse = ADMIN_PRODUCTS.some(p => p.category === id);
  if (inUse) {
    alert("Essa categoria tem produtos vinculados. Mova ou exclua os produtos antes de remover a categoria.");
    return;
  }
  const c = ADMIN_CATEGORIES.find(c => c.id === id);
  if (!confirm(`Excluir a categoria "${c ? c.label : ""}"?`)) return;
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) {
    showToast("Erro ao excluir: " + error.message);
    return;
  }
  showToast("Categoria excluída");
  await loadAllData();
}

// ==== CONFIGURAÇÕES ====
const settingsForm = document.getElementById("settingsForm");
const settingStoreName = document.getElementById("settingStoreName");
const settingWhatsapp = document.getElementById("settingWhatsapp");
const settingInstagram = document.getElementById("settingInstagram");
const settingLogoFile = document.getElementById("settingLogoFile");
const settingLogoPreview = document.getElementById("settingLogoPreview");
const settingsSaveMsg = document.getElementById("settingsSaveMsg");
const settingMsgBuy = document.getElementById("settingMsgBuy");
const settingMsgCart = document.getElementById("settingMsgCart");

const DEFAULT_MSG_BUY = "Olá! Tenho interesse em comprar:\n\n1x {produto} - {preco}\n\nTotal: {total}";
const DEFAULT_MSG_CART = "Olá! Gostaria de fazer o seguinte pedido na {loja}:\n\n{itens}\n\nTotal: {total}";

function fillSettingsForm() {
  settingStoreName.value = ADMIN_SETTINGS.store_name || "";
  settingWhatsapp.value = ADMIN_SETTINGS.whatsapp_number || "";
  settingInstagram.value = ADMIN_SETTINGS.instagram || "";
  settingLogoPreview.src = ADMIN_SETTINGS.logo_url || "assets/logo/logo.png";
  settingMsgBuy.value = ADMIN_SETTINGS.whatsapp_msg_buy || DEFAULT_MSG_BUY;
  settingMsgCart.value = ADMIN_SETTINGS.whatsapp_msg_cart || DEFAULT_MSG_CART;
}

settingLogoFile.addEventListener("change", () => {
  const file = settingLogoFile.files[0];
  if (file) settingLogoPreview.src = URL.createObjectURL(file);
});

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  settingsSaveMsg.classList.remove("error");
  settingsSaveMsg.textContent = "Salvando...";

  try {
    let logoUrl = ADMIN_SETTINGS.logo_url || "";
    const file = settingLogoFile.files[0];
    if (file) {
      logoUrl = await uploadImage(file, "logo");
    }

    const rows = [
      { key: "store_name", value: settingStoreName.value.trim() },
      { key: "whatsapp_number", value: settingWhatsapp.value.trim() },
      { key: "instagram", value: settingInstagram.value.trim() },
      { key: "logo_url", value: logoUrl },
      { key: "whatsapp_msg_buy", value: settingMsgBuy.value.trim() || DEFAULT_MSG_BUY },
      { key: "whatsapp_msg_cart", value: settingMsgCart.value.trim() || DEFAULT_MSG_CART }
    ];

    const { error } = await sb.from("settings").upsert(rows);
    if (error) throw error;

    settingsSaveMsg.textContent = "Configurações salvas!";
    await loadAllData();
  } catch (err) {
    settingsSaveMsg.textContent = "Erro ao salvar: " + err.message;
    settingsSaveMsg.classList.add("error");
  }
});

// ==== ADMINISTRADORES ====
const adminsTableBody = document.getElementById("adminsTableBody");
const adminsListMsg = document.getElementById("adminsListMsg");
const adminModalOverlay = document.getElementById("adminModalOverlay");
const adminForm = document.getElementById("adminForm");
const adminEmailInput = document.getElementById("adminEmail");
const adminPasswordInput = document.getElementById("adminPassword");
const adminSaveMsg = document.getElementById("adminSaveMsg");
const adminSaveBtn = document.getElementById("adminSaveBtn");

let currentAdminUserId = null;

async function callAdminUsersFn(payload) {
  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");

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

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

async function loadAdmins() {
  adminsListMsg.textContent = "Carregando...";
  adminsListMsg.classList.remove("error");
  try {
    const { data: sessionData } = await sb.auth.getSession();
    currentAdminUserId = sessionData?.session?.user?.id || null;

    const { users } = await callAdminUsersFn({ action: "list" });
    renderAdminsTable(users || []);
    adminsListMsg.textContent = "";
  } catch (err) {
    adminsListMsg.textContent = "Erro ao carregar administradores: " + err.message;
    adminsListMsg.classList.add("error");
  }
}

function renderAdminsTable(users) {
  if (users.length === 0) {
    adminsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#999;padding:24px;">Nenhum administrador.</td></tr>`;
    return;
  }
  adminsTableBody.innerHTML = users.map(u => `
    <tr data-id="${u.id}">
      <td>${escapeHtml(u.email)}${u.id === currentAdminUserId ? " <em>(você)</em>" : ""}</td>
      <td>${formatDateTime(u.created_at)}</td>
      <td>${formatDateTime(u.last_sign_in_at)}</td>
      <td>
        <div class="admin-table-actions">
          ${u.id === currentAdminUserId ? "" : `<button class="btn-admin-danger" data-action="delete-admin" data-id="${u.id}" data-email="${escapeHtml(u.email)}">Remover</button>`}
        </div>
      </td>
    </tr>
  `).join("");
}

adminsTableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='delete-admin']");
  if (!btn) return;
  const id = btn.dataset.id;
  const email = btn.dataset.email;
  if (!confirm(`Remover o acesso de "${email}"? Essa pessoa não poderá mais entrar no painel.`)) return;
  try {
    await callAdminUsersFn({ action: "delete", userId: id });
    showToast("Administrador removido");
    await loadAdmins();
  } catch (err) {
    showToast("Erro ao remover: " + err.message);
  }
});

document.getElementById("newAdminBtn").addEventListener("click", () => {
  adminForm.reset();
  adminSaveMsg.textContent = "";
  adminSaveMsg.classList.remove("error");
  adminModalOverlay.hidden = false;
});

document.getElementById("adminCancelBtn").addEventListener("click", () => {
  adminModalOverlay.hidden = true;
});

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  adminSaveBtn.disabled = true;
  adminSaveMsg.classList.remove("error");
  adminSaveMsg.textContent = "Salvando...";

  try {
    await callAdminUsersFn({
      action: "create",
      email: adminEmailInput.value.trim(),
      password: adminPasswordInput.value
    });
    adminModalOverlay.hidden = true;
    showToast("Administrador adicionado");
    await loadAdmins();
  } catch (err) {
    adminSaveMsg.textContent = "Erro ao salvar: " + err.message;
    adminSaveMsg.classList.add("error");
  } finally {
    adminSaveBtn.disabled = false;
  }
});

// ==== INIT ====
checkSession();
