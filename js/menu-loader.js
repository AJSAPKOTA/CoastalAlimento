/**
 * THE COASTAL TABLE — Dynamic Menu Loader
 * ========================================
 * Load order (first success wins for public site data):
 * 1. localStorage override (owner preview after Admin edits)
 * 2. data/menu.json (published file on GitHub)
 * 3. Built-in menuItems from menu.js (fallback)
 *
 * Helpers stay the same: getItemsByCategory, getTodaysSpecials, etc.
 */

const MENU_STORAGE_KEY = "coastalTable_menu_override";
const MENU_VERSION_KEY = "coastalTable_menu_version";

const MenuLoader = {
  async init() {
    let items = null;

    // 1. Owner preview from Admin (same browser)
    try {
      const raw = localStorage.getItem(MENU_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          items = parsed;
          console.info("[MenuLoader] Using localStorage override (", items.length, "items)");
        }
      }
    } catch (e) {
      console.warn("[MenuLoader] localStorage read failed", e);
    }

    // 2. Published JSON on the site
    if (!items) {
      try {
        const res = await fetch("data/menu.json", { cache: "no-store" });
        if (res.ok) {
          const parsed = await res.json();
          if (Array.isArray(parsed) && parsed.length) {
            items = parsed;
            console.info("[MenuLoader] Using data/menu.json (", items.length, "items)");
          }
        }
      } catch (e) {
        console.info("[MenuLoader] data/menu.json not available, using built-in menu");
      }
    }

    // 3. Fallback: menu.js
    if (!items && typeof menuItems !== "undefined" && Array.isArray(menuItems)) {
      items = menuItems;
      console.info("[MenuLoader] Using built-in menu.js (", items.length, "items)");
    }

    if (!items) items = [];

    this.apply(items);
    return items;
  },

  apply(items) {
    window.menuItems = items;

    window.getItemsByCategory = function (category) {
      return menuItems.filter(item => item.category === category && item.available);
    };
    window.getTodaysSpecials = function () {
      return menuItems.filter(item => item.todaysSpecial && item.available);
    };
    window.getFeaturedItems = function () {
      return menuItems.filter(item => item.featured && item.available);
    };
    window.getGrabAndGoItems = function () {
      return menuItems.filter(
        item =>
          item.available &&
          (item.readyNow ||
            (item.preparationTime !== undefined && item.preparationTime <= 5) ||
            (item.tags && item.tags.includes("grab-and-go")))
      );
    };
    window.getItemById = function (id) {
      return menuItems.find(item => item.id === Number(id));
    };
  },

  /** Save override for instant preview (Admin) */
  saveOverride(items) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(MENU_VERSION_KEY, String(Date.now()));
    this.apply(items);
  },

  clearOverride() {
    localStorage.removeItem(MENU_STORAGE_KEY);
    localStorage.removeItem(MENU_VERSION_KEY);
  },

  hasOverride() {
    return !!localStorage.getItem(MENU_STORAGE_KEY);
  },

  /** Download menu.json for GitHub upload */
  downloadJson(items) {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  nextId(items) {
    const max = items.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0);
    return max + 1;
  }
};

if (typeof window !== "undefined") {
  window.MenuLoader = MenuLoader;
  window.MENU_STORAGE_KEY = MENU_STORAGE_KEY;
}
