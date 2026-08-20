/**
 * THE COASTAL TABLE — Owner Admin
 * ================================
 * Simple client-side admin for dishes, specials, photos.
 * Password is only a light gate (not real security on a static site).
 *
 * Publish path for all customers:
 * 1. Edit in Admin → Save preview
 * 2. Download menu.json
 * 3. Upload to repo as data/menu.json (GitHub web UI)
 * 4. Optional: upload new image files under images/
 */

const ADMIN_PASSWORD = "coastal2026"; // Change this in production
const ADMIN_SESSION_KEY = "coastalTable_admin_ok";

const Admin = {
  items: [],
  filter: "all",
  editingId: null,

  async init() {
    if (!this.isLoggedIn()) {
      document.getElementById("admin-login").hidden = false;
      document.getElementById("admin-app").hidden = true;
      document.getElementById("login-form")?.addEventListener("submit", e => {
        e.preventDefault();
        const pw = document.getElementById("admin-password")?.value || "";
        if (pw === ADMIN_PASSWORD) {
          sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
          this.showApp();
        } else {
          const err = document.getElementById("login-error");
          if (err) {
            err.hidden = false;
            err.textContent = "Incorrect password.";
          }
        }
      });
      return;
    }
    this.showApp();
  },

  isLoggedIn() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  },

  async showApp() {
    document.getElementById("admin-login").hidden = true;
    document.getElementById("admin-app").hidden = false;
    const logout = document.getElementById("btn-logout");
    if (logout) logout.hidden = false;

    await MenuLoader.init();
    this.items = JSON.parse(JSON.stringify(window.menuItems || []));
    this.bindUi();
    this.renderTable();
    this.updateBanner();
  },


  bindUi() {
    document.getElementById("btn-add-dish")?.addEventListener("click", () => this.openForm(null));
    document.getElementById("btn-save-preview")?.addEventListener("click", () => this.savePreview());
    document.getElementById("btn-download-json")?.addEventListener("click", () => this.download());
    document.getElementById("btn-clear-preview")?.addEventListener("click", () => this.clearPreview());
    document.getElementById("btn-logout")?.addEventListener("click", () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      location.reload();
    });

    document.querySelectorAll("[data-admin-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.filter = btn.dataset.adminFilter;
        document.querySelectorAll("[data-admin-filter]").forEach(b => b.classList.toggle("active", b === btn));
        this.renderTable();
      });
    });

    document.getElementById("dish-form")?.addEventListener("submit", e => {
      e.preventDefault();
      this.saveForm();
    });
    document.getElementById("btn-cancel-form")?.addEventListener("click", () => this.closeForm());
    document.getElementById("dish-image")?.addEventListener("input", () => this.previewImage());
  },

  updateBanner() {
    const el = document.getElementById("admin-status");
    if (!el) return;
    if (MenuLoader.hasOverride()) {
      el.innerHTML = `<strong>Preview mode:</strong> This browser is using your saved edits. Download <code>menu.json</code> and upload it to GitHub as <code>data/menu.json</code> so all visitors see the changes.`;
      el.className = "admin-banner preview";
    } else {
      el.innerHTML = `Editing the live data source. Save preview to test, then download JSON to publish.`;
      el.className = "admin-banner";
    }
  },

  renderTable() {
    const tbody = document.getElementById("admin-tbody");
    if (!tbody) return;

    let list = this.items;
    if (this.filter !== "all") {
      if (this.filter === "specials") list = list.filter(i => i.todaysSpecial);
      else if (this.filter === "featured") list = list.filter(i => i.featured);
      else list = list.filter(i => i.category === this.filter);
    }

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No dishes in this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map(item => {
        const img = item.image
          ? `<img src="${escapeAttr(item.image)}" alt="" class="admin-thumb" loading="lazy" onerror="this.style.display='none'">`
          : "";
        return `
        <tr data-id="${item.id}">
          <td class="col-img">${img}</td>
          <td>
            <strong>${escapeHtml(item.name)}</strong>
            <div class="admin-meta">${escapeHtml(item.category)} · #${item.id}</div>
          </td>
          <td>$${Number(item.price).toFixed(2)}</td>
          <td>${item.preparationTime ?? 0} min</td>
          <td>
            <label class="toggle"><input type="checkbox" data-field="available" ${item.available ? "checked" : ""}> On</label>
          </td>
          <td>
            <label class="toggle"><input type="checkbox" data-field="todaysSpecial" ${item.todaysSpecial ? "checked" : ""}> Special</label>
          </td>
          <td>
            <label class="toggle"><input type="checkbox" data-field="featured" ${item.featured ? "checked" : ""}> Fav</label>
          </td>
          <td class="col-actions">
            <button type="button" class="btn btn-small" data-edit="${item.id}">Edit</button>
            <button type="button" class="btn btn-small btn-danger" data-delete="${item.id}">Delete</button>
          </td>
        </tr>`;
      })
      .join("");

    tbody.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => this.openForm(Number(btn.dataset.edit)));
    });
    tbody.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => this.deleteItem(Number(btn.dataset.delete)));
    });
    tbody.querySelectorAll("input[data-field]").forEach(input => {
      input.addEventListener("change", () => {
        const id = Number(input.closest("tr").dataset.id);
        const field = input.dataset.field;
        const item = this.items.find(i => i.id === id);
        if (item) {
          item[field] = input.checked;
          this.toast(`${item.name}: ${field} updated (not saved yet — click Save preview)`);
        }
      });
    });
  },

  openForm(id) {
    const panel = document.getElementById("form-panel");
    const title = document.getElementById("form-title");
    this.editingId = id;
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });

    const item = id ? this.items.find(i => i.id === id) : null;
    title.textContent = item ? `Edit: ${item.name}` : "Add new dish";

    document.getElementById("dish-name").value = item?.name || "";
    document.getElementById("dish-category").value = item?.category || "afternoon";
    document.getElementById("dish-price").value = item?.price ?? "";
    document.getElementById("dish-description").value = item?.description || "";
    document.getElementById("dish-image").value = item?.image || "";
    document.getElementById("dish-prep").value = item?.preparationTime ?? 10;
    document.getElementById("dish-available").checked = item ? !!item.available : true;
    document.getElementById("dish-special").checked = item ? !!item.todaysSpecial : false;
    document.getElementById("dish-featured").checked = item ? !!item.featured : false;
    document.getElementById("dish-ready").checked = item ? !!item.readyNow : false;
    document.getElementById("dish-dietary").value = (item?.dietary || []).join(", ");
    document.getElementById("dish-tags").value = (item?.tags || []).join(", ");
    this.previewImage();
  },

  closeForm() {
    document.getElementById("form-panel").hidden = true;
    this.editingId = null;
  },

  previewImage() {
    const url = document.getElementById("dish-image")?.value?.trim();
    const img = document.getElementById("image-preview");
    if (!img) return;
    if (url) {
      img.src = url;
      img.hidden = false;
      img.onerror = () => {
        img.hidden = true;
      };
    } else {
      img.hidden = true;
    }
  },

  saveForm() {
    const name = document.getElementById("dish-name").value.trim();
    if (!name) {
      alert("Name is required.");
      return;
    }

    const dietary = document
      .getElementById("dish-dietary")
      .value.split(",")
      .map(s => s.trim())
      .filter(Boolean);
    const tags = document
      .getElementById("dish-tags")
      .value.split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name,
      category: document.getElementById("dish-category").value,
      price: parseFloat(document.getElementById("dish-price").value) || 0,
      description: document.getElementById("dish-description").value.trim(),
      image: document.getElementById("dish-image").value.trim(),
      preparationTime: parseInt(document.getElementById("dish-prep").value, 10) || 0,
      available: document.getElementById("dish-available").checked,
      todaysSpecial: document.getElementById("dish-special").checked,
      featured: document.getElementById("dish-featured").checked,
      readyNow: document.getElementById("dish-ready").checked,
      dietary,
      tags
    };

    if (this.editingId) {
      const idx = this.items.findIndex(i => i.id === this.editingId);
      if (idx >= 0) {
        this.items[idx] = { ...this.items[idx], ...payload };
      }
    } else {
      this.items.push({
        id: MenuLoader.nextId(this.items),
        ...payload
      });
    }

    this.closeForm();
    this.renderTable();
    this.toast("Dish saved in editor. Click “Save preview” then download JSON to publish.");
  },

  deleteItem(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    if (!confirm(`Delete “${item.name}”?`)) return;
    this.items = this.items.filter(i => i.id !== id);
    this.renderTable();
    this.toast("Deleted from editor. Save preview + download JSON to publish.");
  },

  savePreview() {
    MenuLoader.saveOverride(this.items);
    this.updateBanner();
    this.toast("Preview saved — open the public site in this browser to see changes.");
  },

  clearPreview() {
    if (!confirm("Clear local preview and reload published menu?")) return;
    MenuLoader.clearOverride();
    location.reload();
  },

  download() {
    MenuLoader.downloadJson(this.items);
    this.toast("Downloaded menu.json — upload it to your repo as data/menu.json");
  },

  toast(msg) {
    let el = document.getElementById("admin-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "admin-toast";
      el.className = "admin-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove("show"), 3500);
  }
};

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", () => Admin.init());
