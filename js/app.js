/**
 * THE COASTAL TABLE — Application Logic
 * ======================================
 * Time-based service periods, open/closed status,
 * dynamic homepage sections, testing panel.
 */

const App = {
  // ---------- Time helpers (restaurant timezone) ----------
  getRestaurantNow() {
    const cfg = window.restaurantConfig;
    if (cfg.features.showTestingPanel && cfg.testing.forcedTime) {
      const [h, m] = cfg.testing.forcedTime.split(":").map(Number);
      const d = new Date();
      // Build a date in restaurant TZ conceptually; we only need hours/minutes
      d.setHours(h, m, 0, 0);
      return d;
    }

    // Real time in configured timezone
    try {
      const formatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: cfg.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      const parts = formatter.formatToParts(new Date());
      const get = type => parts.find(p => p.type === type)?.value;
      const year = Number(get("year"));
      const month = Number(get("month")) - 1;
      const day = Number(get("day"));
      const hour = Number(get("hour"));
      const minute = Number(get("minute"));
      return new Date(year, month, day, hour, minute, 0, 0);
    } catch {
      return new Date();
    }
  },

  parseTime(str) {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  },

  minutesNow() {
    const d = this.getRestaurantNow();
    return d.getHours() * 60 + d.getMinutes();
  },

  isKitchenOpen() {
    const cfg = restaurantConfig.kitchen;
    const now = this.minutesNow();
    return now >= this.parseTime(cfg.open) && now < this.parseTime(cfg.close);
  },

  isBreakfastTime() {
    const cfg = restaurantConfig.breakfast;
    const now = this.minutesNow();
    return now >= this.parseTime(cfg.open) && now < this.parseTime(cfg.close);
  },

  isAfternoonTime() {
    const cfg = restaurantConfig.afternoon;
    const now = this.minutesNow();
    return now >= this.parseTime(cfg.open) && now < this.parseTime(cfg.close);
  },

  isCabinetAvailable() {
    const cfg = restaurantConfig.cabinet;
    const now = this.minutesNow();
    return now >= this.parseTime(cfg.open) && now < this.parseTime(cfg.close);
  },

  isDessertAvailable() {
    const cfg = restaurantConfig.dessert;
    const now = this.minutesNow();
    return now >= this.parseTime(cfg.open) && now < this.parseTime(cfg.close);
  },

  getServicePeriod() {
    if (!this.isKitchenOpen()) return "closed";
    if (this.isBreakfastTime()) return "breakfast";
    if (this.isAfternoonTime()) return "afternoon";
    // Early morning before breakfast
    if (this.minutesNow() < this.parseTime(restaurantConfig.breakfast.open)) return "early";
    return "afternoon";
  },

  formatTime12(str) {
    const [h, m] = str.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  },

  // ---------- Time-based hero atmosphere ----------
  updateHeroMood() {
    const bg = document.getElementById("hero-bg");
    const mood = document.getElementById("hero-mood");
    const eyebrow = document.getElementById("hero-eyebrow");
    if (!bg && !mood) return;

    const period = this.getServicePeriod();
    const scenes = {
      early: {
        image: "images/atmosphere/sunrise-warm.jpg",
        text: "Sunrise on the coast — coffee is on, cabinet is filling, kitchen is open.",
        eyebrow: "Good morning · East coast"
      },
      breakfast: {
        image: "images/atmosphere/brunch-table.jpg",
        text: "Breakfast is being served — eggs, sourdough, and a proper coffee.",
        eyebrow: "Breakfast service · Until midday"
      },
      afternoon: {
        image: "images/hero/main-food.jpg",
        text: "Afternoon plates, fresh cabinet food, and coffee for the road.",
        eyebrow: "Afternoon dining · Order ahead"
      },
      closed: {
        image: "images/atmosphere/evening-dining.jpg",
        text: "Kitchen is closed for the night — we open again at 6:00 AM.",
        eyebrow: "See you in the morning"
      }
    };
    const scene = scenes[period] || scenes.afternoon;
    if (bg) bg.style.backgroundImage = `url('${scene.image}')`;
    if (mood) mood.textContent = scene.text;
    if (eyebrow) eyebrow.textContent = scene.eyebrow;
  },

  // ---------- Status banner ----------
  updateStatusBanner() {
    const open = this.isKitchenOpen();
    const banner = document.getElementById("status-banner");
    const label = document.getElementById("status-label");
    const detail = document.getElementById("status-detail");
    const service = document.getElementById("current-service");

    this.updateHeroMood();

    if (!banner) return;

    banner.classList.toggle("is-open", open);
    banner.classList.toggle("is-closed", !open);

    if (label) {
      label.textContent = open ? "OPEN NOW" : "CLOSED NOW";
    }

    if (detail) {
      if (open) {
        detail.textContent = `Kitchen open until ${this.formatTime12(restaurantConfig.kitchen.close)}`;
      } else {
        detail.textContent = `Kitchen opens tomorrow at ${this.formatTime12(restaurantConfig.kitchen.open)}`;
      }
    }

    if (service) {
      const period = this.getServicePeriod();
      const messages = {
        early: "☀️ GOOD MORNING — Kitchen Open · Cabinet, Coffee & Tea available",
        breakfast: "🍳 BREAKFAST IS BEING SERVED",
        afternoon: "🍽️ AFTERNOON MENU IS SERVED",
        closed: "🔴 KITCHEN CLOSED"
      };
      service.textContent = messages[period] || "";
      service.hidden = false;
    }
  },

  // ---------- Render helpers ----------
  createDishCard(item, options = {}) {
    const { compact = false, showOrderBtn = true } = options;
    const price = Ordering.formatPrice(item.price);
    const prep = item.readyNow
      ? `<span class="badge ready">READY NOW</span>`
      : item.preparationTime
        ? `<span class="badge prep">${item.preparationTime}–${item.preparationTime + 5} min</span>`
        : "";
    const dietary = (item.dietary || [])
      .map(d => `<span class="dietary-tag">${d}</span>`)
      .join("");
    const specialBadge = item.todaysSpecial
      ? `<span class="badge special">TODAY'S SPECIAL</span>`
      : "";
    const favouriteBadge = item.tags && item.tags.includes("house-favourite")
      ? `<span class="badge favourite">House Favourite</span>`
      : "";

    const imgHtml = this.getDishImage(item);

    return `
      <article class="dish-card ${compact ? "compact" : ""}" data-id="${item.id}">
        <div class="dish-image-wrap">
          ${imgHtml}
          ${specialBadge || favouriteBadge ? `<div class="dish-badges">${specialBadge}${favouriteBadge}</div>` : ""}
        </div>
        <div class="dish-body">
          <h3 class="dish-name">${Ordering.escapeHtml(item.name)}</h3>
          <p class="dish-desc">${Ordering.escapeHtml(item.description)}</p>
          <div class="dish-meta">
            <span class="dish-price">${price}</span>
            ${prep}
          </div>
          ${dietary ? `<div class="dish-dietary">${dietary}</div>` : ""}
          ${showOrderBtn && item.available ? `
            <button type="button" class="btn btn-primary btn-add" data-add="${item.id}">
              Add to Order
            </button>
          ` : !item.available ? `<p class="sold-out">Currently unavailable</p>` : ""}
        </div>
      </article>
    `;
  },

  getDishImage(item) {
    const colours = {
      breakfast: "#c4a574",
      afternoon: "#8b7355",
      dessert: "#b07a7a",
      cabinet: "#7a8b6e",
      coffee: "#5c4033",
      tea: "#6b8e6b",
      specials: "#c4a574"
    };
    const bg = colours[item.category] || "#8b7355";
    const alt = Ordering.escapeAttr(item.name);
    const src = Ordering.escapeAttr(item.image || "");
    return `
      <img
        class="dish-img"
        src="${src}"
        alt="${alt}"
        loading="lazy"
        width="800"
        height="600"
        data-fallback-bg="${bg}"
        onerror="this.classList.add('img-failed');this.style.background='linear-gradient(145deg,'+this.dataset.fallbackBg+',#1c1c1c)';this.alt='${alt}';"
      />
    `;
  },


  renderSection(containerId, items, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = `<p class="empty-section">No items available in this section right now.</p>`;
      return;
    }
    el.innerHTML = items.map(item => this.createDishCard(item, options)).join("");
    this.bindAddButtons(el);
  },

  bindAddButtons(root = document) {
    root.querySelectorAll("[data-add]").forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.add);
        Ordering.addItem(id, 1);
      });
    });
  },

  // ---------- Homepage sections ----------
  renderHomepage() {
    this.updateStatusBanner();

    const period = this.getServicePeriod();
    const kitchenOpen = this.isKitchenOpen();

    // Today's Specials (always show if any available and kitchen open)
    const specials = getTodaysSpecials().filter(s => {
      if (s.category === "breakfast") return this.isBreakfastTime();
      if (s.category === "afternoon" || s.category === "dessert") return this.isAfternoonTime() || period === "afternoon";
      return kitchenOpen;
    });
    // Fallback: show specials that match current period or all-day
    let displaySpecials = getTodaysSpecials();
    if (period === "breakfast") {
      displaySpecials = displaySpecials.filter(s => s.category === "breakfast" || s.category === "cabinet" || s.category === "coffee");
    } else if (period === "afternoon" || period === "early") {
      displaySpecials = displaySpecials.filter(s => s.category !== "breakfast");
    }
    if (!kitchenOpen) displaySpecials = [];
    this.renderSection("specials-grid", displaySpecials.slice(0, 4), { showOrderBtn: kitchenOpen });

    // Quick Grab & Go
    let grab = getGrabAndGoItems();
    if (!this.isCabinetAvailable() && !kitchenOpen) grab = [];
    else if (!kitchenOpen) grab = grab.filter(i => i.category === "cabinet" || i.category === "coffee" || i.category === "tea");
    this.renderSection("grab-grid", grab.slice(0, 8), { compact: true, showOrderBtn: kitchenOpen || this.isCabinetAvailable() });

    // Cabinet & Café
    if (this.isCabinetAvailable() || kitchenOpen) {
      const cabinet = [
        ...getItemsByCategory("cabinet"),
        ...getItemsByCategory("coffee"),
        ...getItemsByCategory("tea")
      ];
      this.renderSection("cabinet-grid", cabinet.slice(0, 12), { compact: true });
      this.showSection("section-cabinet", true);
    } else {
      this.showSection("section-cabinet", false);
    }

    // Current kitchen menu
    const kitchenEl = document.getElementById("kitchen-grid");
    const kitchenTitle = document.getElementById("kitchen-title");
    if (period === "breakfast") {
      if (kitchenTitle) kitchenTitle.textContent = "🍳 Breakfast Menu";
      this.renderSection("kitchen-grid", getItemsByCategory("breakfast"));
      this.showSection("section-kitchen", true);
    } else if (period === "afternoon") {
      if (kitchenTitle) kitchenTitle.textContent = "🍽️ Afternoon Menu";
      this.renderSection("kitchen-grid", getItemsByCategory("afternoon"));
      this.showSection("section-kitchen", true);
    } else if (period === "early") {
      if (kitchenTitle) kitchenTitle.textContent = "☀️ Early Morning";
      this.renderSection("kitchen-grid", getItemsByCategory("cabinet").slice(0, 6), { compact: true });
      this.showSection("section-kitchen", true);
    } else {
      this.showSection("section-kitchen", false);
    }

    // Desserts
    if (this.isDessertAvailable() && kitchenOpen) {
      this.renderSection("dessert-grid", getItemsByCategory("dessert"));
      this.showSection("section-desserts", true);
    } else {
      this.showSection("section-desserts", false);
    }

    // Local favourites
    const favs = getFeaturedItems().filter(i => {
      if (i.category === "breakfast") return period === "breakfast";
      if (i.category === "afternoon") return period === "afternoon" || period === "early";
      return true;
    }).slice(0, 4);
    this.renderSection("favourites-grid", favs);

    // This week (items tagged this-week)
    const thisWeek = menuItems.filter(i => i.tags && i.tags.includes("this-week") && i.available);
    this.renderSection("this-week-grid", thisWeek);

    // Hours display
    this.renderHours();
  },

  showSection(id, show) {
    const el = document.getElementById(id);
    if (el) el.hidden = !show;
  },

  renderHours() {
    const el = document.getElementById("hours-list");
    if (!el) return;
    const cfg = restaurantConfig;
    el.innerHTML = `
      <li><strong>Kitchen</strong> ${this.formatTime12(cfg.kitchen.open)} – ${this.formatTime12(cfg.kitchen.close)}</li>
      <li><strong>Breakfast</strong> ${this.formatTime12(cfg.breakfast.open)} – ${this.formatTime12(cfg.breakfast.close)}</li>
      <li><strong>Afternoon Menu</strong> ${this.formatTime12(cfg.afternoon.open)} – ${this.formatTime12(cfg.afternoon.close)}</li>
      <li><strong>Cabinet &amp; Café</strong> ${this.formatTime12(cfg.cabinet.open)} – ${this.formatTime12(cfg.cabinet.close)}</li>
    `;
  },

  // ---------- Menu page filters ----------
  renderMenuPage(filter = "all") {
    this.updateStatusBanner();
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    let items = menuItems.filter(i => i.available);
    const period = this.getServicePeriod();
    const kitchenOpen = this.isKitchenOpen();

    if (filter !== "all") {
      items = items.filter(i => i.category === filter);
    }

    // Soft-disable out-of-period kitchen items visually but still list them
    grid.innerHTML = items.map(item => {
      let availableNow = item.available;
      if (item.category === "breakfast" && !this.isBreakfastTime()) availableNow = false;
      if (item.category === "afternoon" && !this.isAfternoonTime()) availableNow = false;
      if ((item.category === "dessert") && !this.isDessertAvailable()) availableNow = false;
      if (!kitchenOpen && !["cabinet", "coffee", "tea"].includes(item.category)) availableNow = false;

      const card = this.createDishCard({ ...item, available: availableNow });
      return availableNow ? card : card.replace("btn-add", "btn-add disabled").replace("Add to Order", "Not available now");
    }).join("");

    this.bindAddButtons(grid);

    // Filter chip active state
    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
      btn.setAttribute("aria-pressed", btn.dataset.filter === filter ? "true" : "false");
    });
  },

  // ---------- Testing panel ----------
  initTestingPanel() {
    if (!restaurantConfig.features.showTestingPanel) return;

    const panel = document.createElement("div");
    panel.id = "testing-panel";
    panel.className = "testing-panel";
    panel.innerHTML = `
      <button type="button" class="testing-toggle" aria-expanded="false" aria-controls="testing-body">⏱ Test Time</button>
      <div id="testing-body" class="testing-body" hidden>
        <p class="testing-label">Simulate restaurant time (Australia/Hobart)</p>
        <div class="testing-times">
          ${["06:00","08:00","09:00","10:00","11:59","12:00","14:00","17:00","19:29","19:30","20:00"].map(t =>
            `<button type="button" class="test-time-btn" data-time="${t}">${t}</button>`
          ).join("")}
        </div>
        <button type="button" class="test-time-btn reset" data-time="">Use real time</button>
        <p class="testing-current">Current: <span id="test-current-time">—</span></p>
      </div>
    `;
    document.body.appendChild(panel);

    const toggle = panel.querySelector(".testing-toggle");
    const body = panel.querySelector("#testing-body");
    toggle.addEventListener("click", () => {
      const open = body.hidden;
      body.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    panel.querySelectorAll("[data-time]").forEach(btn => {
      btn.addEventListener("click", () => {
        restaurantConfig.testing.forcedTime = btn.dataset.time || null;
        this.refreshAll();
        this.updateTestDisplay();
      });
    });

    this.updateTestDisplay();
  },

  updateTestDisplay() {
    const el = document.getElementById("test-current-time");
    if (!el) return;
    const d = this.getRestaurantNow();
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const forced = restaurantConfig.testing.forcedTime;
    el.textContent = forced ? `${forced} (forced)` : `${h}:${m} (live)`;
  },

  refreshAll() {
    this.updateStatusBanner();
    if (document.getElementById("specials-grid")) this.renderHomepage();
    if (document.getElementById("menu-grid")) {
      const active = document.querySelector("[data-filter].active");
      this.renderMenuPage(active ? active.dataset.filter : "all");
    }
    Ordering.updateCartUI();
  },

  // ---------- Navigation ----------
  initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
      });
    }

    // Close on link click (mobile)
    document.querySelectorAll(".main-nav a").forEach(a => {
      a.addEventListener("click", () => {
        nav?.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  },

  // ---------- Init ----------
  async init() {
    // Load dynamic menu (localStorage preview → data/menu.json → menu.js)
    if (window.MenuLoader) {
      await MenuLoader.init();
    }

    this.initNav();
    this.initTestingPanel();
    Ordering.updateCartUI();

    const page = document.body.dataset.page;

    if (page === "home") {
      this.renderHomepage();
    } else if (page === "menu") {
      this.renderMenuPage("all");
      document.querySelectorAll("[data-filter]").forEach(btn => {
        btn.addEventListener("click", () => this.renderMenuPage(btn.dataset.filter));
      });
    } else if (page === "order") {
      this.updateStatusBanner();
      Ordering.renderCartPage();
      this.initOrderForm();
    } else {
      this.updateStatusBanner();
    }

    // Sticky bar click
    document.getElementById("sticky-order-bar")?.addEventListener("click", () => {
      window.location.href = "order.html";
    });
  },


  initOrderForm() {
    const form = document.getElementById("order-form");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = form.querySelector("#customer-name")?.value || "";
      const mobile = form.querySelector("#customer-mobile")?.value || "";
      const notes = form.querySelector("#order-notes")?.value || "";

      const order = Ordering.placeOrder(name, mobile, notes);
      if (!order) return;

      // Show confirmation
      const conf = document.getElementById("order-confirmation");
      const cartSection = document.getElementById("order-cart-section");
      if (cartSection) cartSection.hidden = true;
      if (conf) {
        conf.hidden = false;
        conf.innerHTML = `
          <div class="confirmation-card">
            <p class="conf-icon" aria-hidden="true">✅</p>
            <h2>Order Received</h2>
            <p class="conf-number">Order #${order.orderNumber}</p>
            <ul class="conf-details">
              <li><strong>Estimated preparation:</strong> ${order.estimatedPrep <= 0 ? "Ready shortly" : `${order.estimatedPrep}–${order.estimatedPrep + 5} minutes`}</li>
              <li><strong>Payment:</strong> PAY AT COUNTER</li>
              <li><strong>Collection:</strong> RESTAURANT COUNTER</li>
              <li><strong>Name:</strong> ${Ordering.escapeHtml(order.name)}</li>
              <li><strong>Mobile:</strong> ${Ordering.escapeHtml(order.mobile)}</li>
            </ul>
            <p class="conf-message">We'll start preparing your order. Please come to the counter, pay, and collect when ready.</p>
            <a href="index.html" class="btn btn-primary">Back to Home</a>
            <button type="button" class="btn btn-secondary" id="view-status-btn">View Order Status</button>
          </div>
        `;
        document.getElementById("view-status-btn")?.addEventListener("click", () => {
          this.showOrderStatus(order.orderNumber);
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  },

  showOrderStatus(orderNumber) {
    const order = Ordering.getOrderByNumber(orderNumber);
    if (!order) return;
    const conf = document.getElementById("order-confirmation");
    if (!conf) return;

    const statuses = ["received", "preparing", "ready", "collected"];
    const labels = {
      received: "Order Received",
      preparing: "Preparing",
      ready: "Ready for Collection",
      collected: "Collected"
    };

    conf.innerHTML = `
      <div class="confirmation-card">
        <h2>Order #${order.orderNumber}</h2>
        <div class="status-tracker">
          ${statuses.map(s => `
            <div class="status-step ${order.status === s ? "current" : ""} ${statuses.indexOf(s) <= statuses.indexOf(order.status) ? "done" : ""}">
              <span class="step-dot"></span>
              <span class="step-label">${labels[s]}</span>
            </div>
          `).join("")}
        </div>
        <p class="conf-message">Prototype: status is stored in localStorage. In production this would update from the kitchen.</p>
        <div class="status-dev-controls">
          <p>Simulate status (dev):</p>
          ${statuses.map(s => `<button type="button" class="btn btn-small" data-status="${s}">${labels[s]}</button>`).join("")}
        </div>
        <a href="index.html" class="btn btn-primary">Back to Home</a>
      </div>
    `;

    conf.querySelectorAll("[data-status]").forEach(btn => {
      btn.addEventListener("click", () => {
        Ordering.updateOrderStatus(orderNumber, btn.dataset.status);
        this.showOrderStatus(orderNumber);
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
