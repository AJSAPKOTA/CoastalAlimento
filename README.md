# The Coastal Table

**Fresh Food. Good Coffee. Made for Every Journey.**

A professional frontend prototype for an Australian coastal café/restaurant website.  
Order ahead online — **pay at the counter**. No online payments.

Built for **GitHub Pages**: pure HTML, CSS and JavaScript. No backend required.

---

## Quick start

1. Upload this folder to a GitHub repository (or clone it).
2. Enable **GitHub Pages** (Settings → Pages → Deploy from branch → `/` or `/docs`).
3. Open the site URL on mobile and desktop.

Locally you can open `index.html` in a browser, or run a simple static server:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

---

## What’s included

| Feature | Description |
|--------|-------------|
| Live open/closed status | Uses restaurant timezone (`Australia/Hobart`) |
| Time-based service periods | Breakfast / Afternoon / Early morning / Closed |
| Today's Specials | Configurable via menu data |
| Quick Grab & Go | Ready-now and short-prep items |
| Cabinet & Café | All-day rolls, pastries, coffee, tea |
| Full menu with filters | Breakfast, afternoon, dessert, drinks |
| Cart & order flow | Name + mobile → place order → pay at counter |
| Order confirmation & status | Stored in `localStorage` (prototype) |
| Testing panel | Simulate times: 06:00, 10:00, 14:00, 20:00, etc. |
| Mobile-first UI | Sticky order bar, large touch targets |
| SEO basics | Title, meta, Open Graph, Restaurant JSON-LD |

---

## Project structure

```
the-coastal-table/
├── index.html          # Homepage
├── menu.html           # Full menu + filters
├── order.html          # Cart & place order
├── location.html       # Address, hours, directions
├── about.html
├── css/style.css
├── js/
│   ├── config.js       # Hours, timezone, contact — EDIT HERE
│   ├── menu.js         # All dishes — EDIT HERE to add/change items
│   ├── ordering.js     # Cart & localStorage orders
│   └── app.js          # Time logic, rendering, testing panel
├── images/             # Drop real photos here (see below)
├── README.md
└── .gitignore
```

---

## Editing configuration

**Hours, timezone, contact** → `js/config.js`

```js
kitchen: { open: "06:00", close: "19:30" },
breakfast: { open: "09:00", close: "12:00" },
afternoon: { open: "12:00", close: "19:30" },
timezone: "Australia/Hobart",
```

**Menu items, prices, specials** → `js/menu.js`

Add a dish by appending an object:

```js
{
  id: 509,
  name: "Margherita Pizza",
  category: "afternoon",   // cabinet | coffee | tea | breakfast | afternoon | dessert
  price: 21.00,
  description: "...",
  image: "images/afternoon/margherita.jpg",
  preparationTime: 18,
  available: true,
  featured: false,
  todaysSpecial: false,
  dietary: ["vegetarian"],
  readyNow: false,
  tags: []
}
```

Set `todaysSpecial: true` for the homepage specials section.  
Set `featured: true` or `tags: ["house-favourite"]` for Local Favourites.  
Set `readyNow: true` or low `preparationTime` for Grab & Go.

---

## Images

Place professional food photos in:

- `images/hero/`
- `images/breakfast/`
- `images/cabinet/`
- `images/coffee/`
- `images/tea/`
- `images/afternoon/`
- `images/desserts/`
- `images/specials/`

Update the `image` path on each menu item. Until real images are added, the site shows elegant category-coloured placeholders with the dish name.

Recommended: consistent aspect ratio (e.g. 4:3), WebP or optimised JPEG, lazy-load friendly sizes.

---

## Testing different times

A **Test Time** control appears at the bottom-right when `features.showTestingPanel` is `true` in `config.js`.

Use it to simulate:

- `06:00` / `08:00` — early morning  
- `10:00` / `11:59` — breakfast  
- `12:00` / `14:00` / `17:00` — afternoon  
- `19:29` / `19:30` / `20:00` — closing / closed  

Set `showTestingPanel: false` before a public production deploy.

---

## Ordering (prototype behaviour)

1. Customer adds items → cart in `localStorage`.
2. On **Order** page: name + mobile → **PLACE ORDER — PAY AT COUNTER**.
3. Order number is generated and stored in `localStorage`.
4. Confirmation shows prep estimate and “pay at counter”.
5. Status can be simulated (Received → Preparing → Ready → Collected).

There is **no** Stripe, PayPal, or card capture.

---

## Design notes

- Deep charcoal, warm cream, muted coastal accents  
- Libre Baskerville (headings) + Source Sans 3 (body)  
- Mobile-first, accessible focus states, semantic HTML  
- No payment gateways, no fake reviews, no scarcity timers  

---

## Future expansion

The data model and structure are ready for:

- Backend + database  
- Admin dashboard  
- Real-time kitchen display  
- Inventory / sold-out  
- SMS/email notifications  
- Loyalty and analytics  

---

## Licence / disclaimer

This is a **fictional restaurant** prototype for demonstration and learning.  
Address and phone numbers are not real businesses.  
Do not use for a live commercial site without replacing content, legal pages and real imagery.

---

## Owner Admin (update dishes & specials)

Open **`admin.html`** on your live site (or locally).

**Default password:** `coastal2026`  
Change it in `js/admin.js` (`ADMIN_PASSWORD`).

### What the owner can do
- Add, edit, delete dishes
- Toggle **Today’s special**, **House favourite**, **Available**, **Ready now**
- Set **image path** (`images/afternoon/my-dish.jpg`) or a **public image URL**
- **Save preview** — test on this browser only
- **Download menu.json** — publish for all visitors

### Publish so every customer sees the update
1. In Admin: edit → **Save preview** → **Download menu.json**
2. On GitHub: go to `data/menu.json` → pencil or **Upload files** → replace with your file → Commit
3. Wait 1–2 minutes for GitHub Pages to refresh

### New food photos
**Option A — GitHub folder**  
Upload JPG into `images/breakfast/` (etc.), then set Image to e.g. `images/breakfast/new-dish.jpg`

**Option B — External URL**  
Host on Imgur / Cloudinary / Google Drive (public link) and paste the full `https://…` URL in the Image field — no redeploy needed for the photo file.

The public site loads: localStorage preview (if any) → `data/menu.json` → built-in `menu.js`.
