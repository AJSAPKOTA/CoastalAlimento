/**
 * THE COASTAL TABLE — Ordering System
 * ====================================
 * Cart + order placement using localStorage.
 * No online payment — pay at counter only.
 */

const CART_KEY = "coastalTable_cart";
const ORDERS_KEY = "coastalTable_orders";
const ORDER_COUNTER_KEY = "coastalTable_orderCounter";

const Ordering = {
  // ---------- Cart ----------
  getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    this.updateCartUI();
  },

  addItem(itemId, quantity = 1, notes = "") {
    const item = getItemById(itemId);
    if (!item || !item.available) return false;

    const cart = this.getCart();
    const existing = cart.find(c => c.id === itemId && c.notes === notes);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        notes,
        preparationTime: item.preparationTime || 0,
        readyNow: !!item.readyNow,
        category: item.category
      });
    }

    this.saveCart(cart);
    this.showToast(`${item.name} added to order`);
    return true;
  },

  updateQuantity(itemId, notes, newQty) {
    const cart = this.getCart();
    const idx = cart.findIndex(c => c.id === itemId && c.notes === (notes || ""));
    if (idx === -1) return;

    if (newQty <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = newQty;
    }
    this.saveCart(cart);
  },

  removeItem(itemId, notes = "") {
    const cart = this.getCart().filter(c => !(c.id === itemId && c.notes === notes));
    this.saveCart(cart);
  },

  clearCart() {
    localStorage.removeItem(CART_KEY);
    this.updateCartUI();
  },

  getSubtotal() {
    return this.getCart().reduce((sum, c) => sum + c.price * c.quantity, 0);
  },

  getItemCount() {
    return this.getCart().reduce((sum, c) => sum + c.quantity, 0);
  },

  getEstimatedPrepMinutes() {
    const cart = this.getCart();
    if (!cart.length) return 0;
    // Take the longest prep time + small buffer for multiple items
    const maxPrep = Math.max(...cart.map(c => c.preparationTime || 0));
    const extra = cart.length > 1 ? Math.min(5, (cart.length - 1) * 2) : 0;
    return maxPrep + extra;
  },

  // ---------- UI updates ----------
  updateCartUI() {
    const count = this.getItemCount();
    const badges = document.querySelectorAll("[data-cart-count]");
    badges.forEach(el => {
      el.textContent = count;
      el.hidden = count === 0;
    });

    const sticky = document.getElementById("sticky-order-bar");
    if (sticky) {
      sticky.classList.toggle("visible", count > 0);
      const countEl = sticky.querySelector(".sticky-count");
      const totalEl = sticky.querySelector(".sticky-total");
      if (countEl) countEl.textContent = count;
      if (totalEl) totalEl.textContent = this.formatPrice(this.getSubtotal());
    }

    // If on order page, re-render cart
    if (document.getElementById("cart-items")) {
      this.renderCartPage();
    }
  },

  formatPrice(amount) {
    const symbol = (window.restaurantConfig && restaurantConfig.ordering.currencySymbol) || "$";
    return symbol + amount.toFixed(2);
  },

  showToast(message) {
    let toast = document.getElementById("order-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "order-toast";
      toast.className = "order-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  },

  // ---------- Render cart on order.html ----------
  renderCartPage() {
    const container = document.getElementById("cart-items");
    const empty = document.getElementById("cart-empty");
    const summary = document.getElementById("cart-summary");
    const form = document.getElementById("order-form");

    if (!container) return;

    const cart = this.getCart();

    if (cart.length === 0) {
      container.innerHTML = "";
      if (empty) empty.hidden = false;
      if (summary) summary.hidden = true;
      if (form) form.hidden = true;
      return;
    }

    if (empty) empty.hidden = true;
    if (summary) summary.hidden = false;
    if (form) form.hidden = false;

    container.innerHTML = cart.map(c => `
      <article class="cart-item" data-id="${c.id}" data-notes="${this.escapeAttr(c.notes || "")}">
        <div class="cart-item-info">
          <h3 class="cart-item-name">${this.escapeHtml(c.name)}</h3>
          ${c.notes ? `<p class="cart-item-notes">Note: ${this.escapeHtml(c.notes)}</p>` : ""}
          <p class="cart-item-price">${this.formatPrice(c.price)} each</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button type="button" class="qty-btn" aria-label="Decrease quantity" data-action="decrease">−</button>
            <span class="qty-value" aria-live="polite">${c.quantity}</span>
            <button type="button" class="qty-btn" aria-label="Increase quantity" data-action="increase">+</button>
          </div>
          <p class="cart-item-line-total">${this.formatPrice(c.price * c.quantity)}</p>
          <button type="button" class="btn-remove" data-action="remove" aria-label="Remove ${this.escapeAttr(c.name)}">Remove</button>
        </div>
      </article>
    `).join("");

    // Bind controls
    container.querySelectorAll(".cart-item").forEach(row => {
      const id = Number(row.dataset.id);
      const notes = row.dataset.notes || "";
      row.querySelector('[data-action="decrease"]')?.addEventListener("click", () => {
        const item = this.getCart().find(c => c.id === id && c.notes === notes);
        if (item) this.updateQuantity(id, notes, item.quantity - 1);
      });
      row.querySelector('[data-action="increase"]')?.addEventListener("click", () => {
        const item = this.getCart().find(c => c.id === id && c.notes === notes);
        if (item) this.updateQuantity(id, notes, item.quantity + 1);
      });
      row.querySelector('[data-action="remove"]')?.addEventListener("click", () => {
        this.removeItem(id, notes);
      });
    });

    // Summary
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const prepEl = document.getElementById("cart-prep");
    const formatted = this.formatPrice(this.getSubtotal());
    if (subtotalEl) subtotalEl.textContent = formatted;
    if (totalEl) totalEl.textContent = formatted;
    if (prepEl) {
      const mins = this.getEstimatedPrepMinutes();
      prepEl.textContent = mins <= 0 ? "Ready now / a few minutes" : `Approx. ${mins}–${mins + 5} minutes`;
    }
  },

  // ---------- Place order ----------
  placeOrder(customerName, mobile, orderNotes = "") {
    const cart = this.getCart();
    if (!cart.length) {
      alert("Your order is empty.");
      return null;
    }
    if (!customerName.trim() || !mobile.trim()) {
      alert("Please enter your name and mobile number.");
      return null;
    }

    const orderNumber = this.nextOrderNumber();
    const order = {
      orderNumber,
      name: customerName.trim(),
      mobile: mobile.trim(),
      notes: orderNotes.trim(),
      items: cart,
      subtotal: this.getSubtotal(),
      estimatedPrep: this.getEstimatedPrepMinutes(),
      status: "received",
      createdAt: new Date().toISOString(),
      payment: "PAY AT COUNTER",
      collection: "RESTAURANT COUNTER"
    };

    // Persist order
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    this.clearCart();
    return order;
  },

  nextOrderNumber() {
    let n = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "1047", 10);
    n += 1;
    localStorage.setItem(ORDER_COUNTER_KEY, String(n));
    return n;
  },

  getOrders() {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getOrderByNumber(num) {
    return this.getOrders().find(o => o.orderNumber === Number(num));
  },

  updateOrderStatus(orderNumber, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderNumber === Number(orderNumber));
    if (order) {
      order.status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
};

if (typeof window !== "undefined") {
  window.Ordering = Ordering;
}
