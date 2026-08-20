/**
 * THE COASTAL TABLE — Restaurant Configuration
 * =============================================
 * Edit this file to change hours, timezone, contact details,
 * and feature flags. All time-based behaviour reads from here.
 */

const restaurantConfig = {
  name: "The Coastal Table",
  tagline: "Fresh Food. Good Coffee. Made for Every Journey.",

  // Timezone used for open/closed and menu periods (not the visitor's local time)
  timezone: "Australia/Hobart",

  // Kitchen service hours (24-hour format)
  kitchen: {
    open: "06:00",
    close: "19:30"
  },

  // Breakfast service window
  breakfast: {
    open: "09:00",
    close: "12:00"
  },

  // Afternoon / main kitchen menu window
  afternoon: {
    open: "12:00",
    close: "19:30"
  },

  // Cabinet & Café available during full kitchen hours
  cabinet: {
    open: "06:00",
    close: "19:30"
  },

  // Desserts available from lunch onwards (configurable)
  dessert: {
    open: "12:00",
    close: "19:30"
  },

  // Contact & location (fictional coastal Tasmanian location)
  contact: {
    address: "42 Marine Esplanade, Swansea TAS 7190",
    phone: "(03) 6257 8840",
    email: "hello@thecoastaltable.com.au",
    parking: "Free street parking along Marine Esplanade and rear car park behind the building."
  },

  // Map placeholder coordinates (Swansea, TAS area — fictional pin)
  map: {
    lat: -42.1234,
    lng: 148.0745,
    // Google Maps directions URL (fictional address encoded)
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Marine+Esplanade+Swansea+TAS+7190"
  },

  // Ordering
  ordering: {
    minOrder: 0,
    currency: "AUD",
    currencySymbol: "$",
    orderPrefix: "CT",
    estimatedPrepMessage: "Estimated preparation shown per item. Total time calculated at checkout."
  },

  // Feature flags for prototype
  features: {
    showTestingPanel: true,   // Set false for production / GitHub Pages public view
    enableOrderStatus: true,
    enableLocalStorageOrders: true
  },

  // Testing overrides — used only when testing panel is active
  // Leave null to use real restaurant time
  testing: {
    forcedTime: null  // e.g. "10:00", "14:00", "20:00" — set via testing panel
  }
};

// Export for modules / global use
if (typeof window !== "undefined") {
  window.restaurantConfig = restaurantConfig;
}
