import { getCatalog, syncCatalogWithAPI } from "./productsData.js";
import { setupTilt, initCustomCursor } from "./uiAnimations.js";
import { showLuxToast } from "./toastHelper.js";

// State for collection filtering and sorting
let currentCategory = "all";
let currentSearch = "";
let currentSort = "featured";

// Mobile & Universal Luxury Navigation Drawer Toggle
function setupMobileNav() {
  const toggleBtn = document.getElementById("nav-toggle-btn");
  const drawer = document.getElementById("luxury-menu-drawer");
  const overlay = document.getElementById("nav-drawer-overlay");
  const closeBtn = document.getElementById("drawer-close-btn");

  function closeMenu() {
    toggleBtn?.classList.remove("active");
    drawer?.classList.remove("open");
    overlay?.classList.remove("open");
    document.body.style.overflow = "";
  }

  function openMenu() {
    toggleBtn?.classList.add("active");
    drawer?.classList.add("open");
    overlay?.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function toggleMenu(e) {
    if (e) e.stopPropagation();
    const isOpen = drawer?.classList.contains("open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  toggleBtn?.addEventListener("click", toggleMenu);
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);

  // Close when clicking any link inside drawer
  document.querySelectorAll(".drawer-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

async function applyStoreDataUI() {
  let data = null;

  // Try API first
  try {
    const res = await fetch("/api/store");
    if (res.ok) {
      data = await res.json();
      localStorage.setItem("luxore_store_data", JSON.stringify(data));
    }
  } catch (e) {
    // Fallback to local
  }

  if (!data) {
    const raw = localStorage.getItem("luxore_store_data");
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (err) {}
    }
  }

  if (!data) return;

  const headline = document.getElementById("store-display-headline");
  const heading = document.getElementById("store-story-heading");
  const desc = document.getElementById("store-story-desc");
  const img = document.getElementById("store-display-img");
  const y = document.getElementById("stat-years");
  const d = document.getElementById("stat-delivered");
  const cr = document.getElementById("stat-craftsmen");
  const co = document.getElementById("stat-countries");

  if (headline && data.headline) headline.innerHTML = data.headline;
  if (heading && data.storyHeading) heading.innerHTML = data.storyHeading;
  if (desc && data.storyDesc) desc.textContent = data.storyDesc;
  if (img && data.img) img.src = data.img;
  if (y && data.statYears) y.textContent = data.statYears;
  if (d && data.statDelivered) d.textContent = data.statDelivered;
  if (cr && data.statCraftsmen) cr.textContent = data.statCraftsmen;
  if (co && data.statCountries) co.textContent = data.statCountries;
}

function parsePriceNum(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
}

function buildCardHTML(item) {
  return `
    <div class="card" data-id="${item.id}">
      ${item.tag ? `<span class="tag">${item.tag}</span>` : ""}
      <div class="img-wrap">
        <img src="${item.img}" alt="${item.name}" class="watch-img" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'">
      </div>
      <h3>${item.name}</h3>
      <div class="p">${item.price}</div>
      <small>${item.desc ? item.desc.substring(0, 75) : ""}...</small>
      <button class="btn" aria-label="Inspect ${item.name}">Inspect & Order</button>
    </div>
  `;
}

function attachNavigationEvents() {
  document.querySelectorAll(".card, .mi").forEach((element) => {
    element.onclick = () => {
      const selectedId = element.dataset.id;
      if (selectedId) {
        window.location.href = `product-detail.html?id=${selectedId}`;
      }
    };
  });
}

function renderCollection() {
  const cg = document.getElementById("cg");
  if (!cg) return;

  const catalog = getCatalog();
  let list = [...catalog];

  // 1. Filter by category
  if (currentCategory !== "all") {
    list = list.filter((w) => w.category === currentCategory);
  }

  // 2. Filter by search query
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.desc && w.desc.toLowerCase().includes(q)) ||
        (w.tag && w.tag.toLowerCase().includes(q)) ||
        (w.dial && w.dial.toLowerCase().includes(q)) ||
        (w.caseSpec && w.caseSpec.toLowerCase().includes(q))
    );
  }

  // 3. Sort
  if (currentSort === "price-asc") {
    list.sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price));
  } else if (currentSort === "price-desc") {
    list.sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price));
  } else if (currentSort === "name-asc") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 4. Render
  if (list.length === 0) {
    cg.innerHTML = `
      <div class="empty-catalog-state">
        <h3 style="font-size:1.4rem; margin-bottom:8px;">No Timepieces Found</h3>
        <p style="color:var(--mut); margin-bottom:20px;">No watches match "${currentSearch}". Try adjusting your keywords or category.</p>
        <button id="btn-clear-filter" class="btn f">Reset Filter & Show All</button>
      </div>
    `;

    document.getElementById("btn-clear-filter")?.addEventListener("click", () => {
      currentSearch = "";
      currentCategory = "all";
      const sInput = document.getElementById("collection-search");
      if (sInput) sInput.value = "";
      document.querySelectorAll("#tb button").forEach((b) => {
        b.classList.toggle("on", b.dataset.f === "all");
      });
      renderCollection();
    });
    return;
  }

  cg.innerHTML = list.map(buildCardHTML).join("");
  attachNavigationEvents();
}

function renderCatalogUI() {
  const catalog = getCatalog();

  // 1. Signature Pieces Section (Top 3)
  const sigContainer = document.getElementById("sg");
  if (sigContainer) {
    sigContainer.innerHTML = catalog.slice(0, 3).map(buildCardHTML).join("");
  }

  // 2. Full Collection Grid with search & sort
  renderCollection();

  // 3. Infinite Smooth Marquee
  const mqContainer = document.getElementById("mq");
  if (mqContainer) {
    mqContainer.innerHTML = catalog
      .concat(catalog)
      .map(
        (w) => `
      <div class="mi" data-id="${w.id}">
        <div class="mi-img-wrap">
          <img src="${w.img}" alt="${w.name}" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'">
        </div>
        <b>${w.name}</b>
        <span>${w.price}</span>
      </div>
    `
      )
      .join("");
  }

  // 4. Footers Injection
  renderFooters();

  // 5. Attach Navigation Events
  attachNavigationEvents();
}

function setupCollectionControls() {
  // Tabs
  document.getElementById("tb")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document
      .querySelectorAll("#tb button")
      .forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    currentCategory = btn.dataset.f || "all";
    renderCollection();
  });

  // Search input
  const searchInput = document.getElementById("collection-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.trim();
      renderCollection();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("collection-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderCollection();
    });
  }
}

// Contact Concierge Form Engine
function setupContactForm() {
  const form = document.getElementById("concierge-contact-form");
  const feedback = document.getElementById("contact-feedback");
  const submitBtn = document.getElementById("btn-submit-contact");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name")?.value.trim();
    const email = document.getElementById("contact-email")?.value.trim();
    const message = document.getElementById("contact-message")?.value.trim();

    if (!name || !email || !message) {
      if (feedback) {
        feedback.className = "contact-feedback-msg error show";
        feedback.textContent = "Please provide your full name, email address, and inquiry message.";
      }
      return;
    }

    if (submitBtn) {
      submitBtn.textContent = "Transmitting to Concierge...";
      submitBtn.disabled = true;
    }

    const payload = {
      name,
      email,
      message,
      subject: "Private Client Boutique Inquiry",
    };

    // Save locally
    try {
      const stored = localStorage.getItem("luxore_contact_messages");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift({
        ...payload,
        id: "MSG-" + Date.now(),
        date: new Date().toLocaleDateString(),
        status: "Unread",
      });
      localStorage.setItem("luxore_contact_messages", JSON.stringify(list));
    } catch (err) {}

    // Send to API
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (feedback) {
          feedback.className = "contact-feedback-msg success show";
          feedback.textContent = data.message || "Thank you. Your concierge inquiry has been registered. Our horology advisor will contact you shortly.";
        }
        showLuxToast("Concierge inquiry transmitted successfully.", "success");
        form.reset();
      } else {
        throw new Error("API response error");
      }
    } catch (err) {
      // Offline fallback
      if (feedback) {
        feedback.className = "contact-feedback-msg success show";
        feedback.textContent = "Thank you. Your concierge inquiry has been registered locally. Our horology advisor will reach out to you shortly.";
      }
      showLuxToast("Inquiry registered successfully.", "success");
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.textContent = "Send Message";
        submitBtn.disabled = false;
      }
    }
  });
}

function renderFooters() {
  const footerContent = `
    <div>
      <div class="logo gold">LUXORE</div>
      <p style="margin-top:8px">Timeless watches for those who value every second.</p>
    </div>
    <div>
      <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Explore</h4>
      <a href="#home" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">Home</a>
      <a href="#collection" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">Collection</a>
      <a href="#store" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">Our Store</a>
      <a href="my-orders.html" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">My Orders</a>
    </div>
    <div>
      <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Visit</h4>
      <p>12 Gold Street, Main Boulevard<br>Mon–Sat, 10am – 8pm</p>
    </div>
    <div>
      <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Contact</h4>
      <p>concierge@luxore.com<br>+00 000 0000000</p>
    </div>
    <div style="grid-column: 1 / -1; border-top: 1px solid var(--bd); padding-top: 20px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--mut); flex-wrap:wrap; gap:10px;">
      <span>© 2026 Luxore Watches. All rights reserved. Full-Stack Edition.</span>
      <div style="display:flex; align-items:center; gap:15px;">
        <a href="https://my-portfolio-ten-zeta-3wnea5nse7.vercel.app" class="portfolio-back-btn" data-action="back-to-portfolio" style="font-size:0.7rem;">← Back to Portfolio</a>
        <a href="admin.html" target="_blank" title="Authorized Administrative Access" style="color:#4a3f29; text-decoration:none; font-size:0.9rem;">🔒</a>
      </div>
    </div>
  `;
  ["f1", "f2", "f3", "f4"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = footerContent;
  });
}

function switchView() {
  let hash = window.location.hash.slice(1);
  if (!["home", "collection", "store", "contact"].includes(hash)) {
    hash = "home";
  }

  document.querySelectorAll(".v").forEach((view) => {
    view.classList.remove("on");
  });

  const activeSection = document.getElementById(hash);
  if (activeSection) {
    activeSection.classList.add("on");
  }

  document.querySelectorAll("nav a[data-n]").forEach((link) => {
    link.classList.toggle("gold", link.dataset.n === hash);
  });

  window.scrollTo(0, 0);
}

// Global Key Listener for Admin Access
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    window.open("admin.html", "_blank");
  }
});

// Imperium Tourbillon Button
document
  .querySelector(".open-tourbillon-btn")
  ?.addEventListener("click", () => {
    window.location.href = `product-detail.html?id=imperium-tourbillon`;
  });

window.addEventListener("hashchange", switchView);

// Initialize Page
async function initApp() {
  setupTilt(".stage", "#hw", 25);
  setupTilt(".best .bw", "#tourbillon-watch", 20);
  initCustomCursor();
  setupMobileNav();
  setupCollectionControls();
  setupContactForm();
  renderCatalogUI();
  applyStoreDataUI();
  switchView();

  // Async API sync in background
  await syncCatalogWithAPI();
  renderCatalogUI();
}

initApp();
