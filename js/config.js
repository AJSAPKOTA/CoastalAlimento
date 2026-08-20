/**
 * THE COASTAL TABLE — Restaurant Configuration
 * =============================================
 * Edit hours, contact, Google link, and reviews here.
 */

const restaurantConfig = {
  name: "The Coastal Table",
  tagline: "Fresh Food. Good Coffee. Made for Every Journey.",

  timezone: "Australia/Hobart",

  kitchen: {
    open: "06:00",
    close: "19:30"
  },

  breakfast: {
    open: "09:00",
    close: "12:00"
  },

  afternoon: {
    open: "12:00",
    close: "19:30"
  },

  cabinet: {
    open: "06:00",
    close: "19:30"
  },

  dessert: {
    open: "12:00",
    close: "19:30"
  },

  contact: {
    address: "42 Marine Esplanade, Swansea TAS 7190",
    phone: "(03) 6257 8840",
    email: "hello@thecoastaltable.com.au",
    parking: "Free street parking along Marine Esplanade and rear car park behind the building."
  },

  map: {
    lat: -42.1234,
    lng: 148.0745,
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Marine+Esplanade+Swansea+TAS+7190"
  },

  // Your Google reviews / business link (Alimento Swansea)
  googleReviewsUrl:
    "https://www.google.com/search?q=alimento+swansea#lrd=0xaa71790018cbf9b3:0x334a38376fb93cab,1,,,,",

  /**
   * 5-star reviews only (public Google / Tripadvisor quotes for Alimento Swansea).
   * Only rating: 5 displays. Page load shuffles randomly.
   */
  reviews: [
    {
      rating: 5,
      text: "Absolutely delicious joint. We went here on our way to Hobart and what a hidden gem. The bacon breakfast was absolutely stunning — must visit!",
      author: "Emily L.",
      date: "Google"
    },
    {
      rating: 5,
      text: "Had a fantastic dining experience. The atmosphere is warm, welcoming and relaxing, with great music that perfectly complements the beautiful coastal setting.",
      author: "Lailani C.",
      date: "Google"
    },
    {
      rating: 5,
      text: "Been here a few times and it's always been great. Easy parking, very friendly staff, reasonably priced. Fast cabinet food or order from the menu — the veggie focaccia was tops.",
      author: "J.",
      date: "Google"
    },
    {
      rating: 5,
      text: "Beautiful decor! Love the way the place looks — so inviting. Great atmosphere to relax and enjoy. 5 stars for the decor alone, and delicious eats.",
      author: "Rajashree P.",
      date: "Google"
    },
    {
      rating: 5,
      text: "The food is absolutely delicious — the best I've had in Tassie so far. Staff are very friendly.",
      author: "Rhain B.",
      date: "Google"
    },
    {
      rating: 5,
      text: "OMG the FOOD! Walked in with no expectations — WOW. Decor, atmosphere, service and the seafood pasta and butter chicken were incredible. Great value.",
      author: "Donna V.",
      date: "Tripadvisor"
    },
    {
      rating: 5,
      text: "Best food on the island. Amazing ribs with fresh salad and awesome potatoes. Super friendly staff and manager.",
      author: "Robert R.",
      date: "Tripadvisor"
    },
    {
      rating: 5,
      text: "We love this place! The food is superb and well-priced. A real favourite when we're on the east coast.",
      author: "Catriona H.",
      date: "Tripadvisor"
    },
    {
      rating: 5,
      text: "Sensational dinner — went looking for food and it was a real surprise. Great chefs and the deli looked amazing. Thanks team!",
      author: "David W.",
      date: "Tripadvisor"
    },
    {
      rating: 5,
      text: "This bakery is a must! Fresh croissant with leg ham and cheese, chicken wrap, and carrot cakes — everything delicious and freshly made.",
      author: "Sandra W.",
      date: "Tripadvisor"
    }
  ],

  ordering: {
    minOrder: 0,
    currency: "AUD",
    currencySymbol: "$",
    orderPrefix: "CT",
    estimatedPrepMessage: "Estimated preparation shown per item. Total time calculated at checkout."
  },

  features: {
    showTestingPanel: true,
    enableOrderStatus: true,
    enableLocalStorageOrders: true
  },

  testing: {
    forcedTime: null
  }
};

if (typeof window !== "undefined") {
  window.restaurantConfig = restaurantConfig;
}
