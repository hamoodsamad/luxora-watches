import { getCatalog } from "./productsData.js";
import { setupTilt, initCustomCursor } from "./uiAnimations.js";

// Optional Welcome / Login Modal Engine
function setupWelcomeLogin() {
  const modal = document.getElementById("welcome-login-modal");
  const skipBtn = document.getElementById("btn-skip-login");
  const form = document.getElementById("client-login-form");
  const greeting = document.getElementById("nav-user-greeting");

  const storedMember = localStorage.getItem("luxore_logged_member");
  if (storedMember) {
    const member = JSON.parse(storedMember);
    if (greeting) greeting.textContent = `Welcome, ${member.name}`;
    if (modal) modal.classList.add("hidden");
  } else {
    // Show on first visit, allow skip
    skipBtn?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("member-name").value.trim();
      const email = document.getElementById("member-email").value.trim();
      if (name && email) {
        localStorage.setItem(
          "luxore_logged_member",
          JSON.stringify({ name, email }),
        );
        if (greeting) greeting.textContent = `Welcome, ${name}`;
      }
      modal.classList.add("hidden");
    });
  }
}

function applyStoreDataUI() {
  const raw = localStorage.getItem("luxore_store_data");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const headline = document.getElementById("store-display-headline");
    const heading = document.getElementById("store-story-heading");
    const desc = document.getElementById("store-story-desc");
    const img = document.getElementById("store-display-img");
    const y = document.getElementById("stat-years");
    const d = document.getElementById("stat-delivered");
    const cr = document.getElementById("stat-craftsmen");
    const co = document.getElementById("stat-countries");

    if (headline) headline.innerHTML = data.headline;
    if (heading) heading.innerHTML = data.storyHeading;
    if (desc) desc.textContent = data.storyDesc;
    if (img) img.src = data.img;
    if (y) y.textContent = data.statYears;
    if (d) d.textContent = data.statDelivered;
    if (cr) cr.textContent = data.statCraftsmen;
    if (co) co.textContent = data.statCountries;
  } catch (err) {
    console.warn("Store sync fallback:", err);
  }
}

function renderCatalogUI() {
  const catalog = getCatalog();

  // 1. Signature Pieces Section
  const sigContainer = document.getElementById("sg");
  if (sigContainer) {
    sigContainer.innerHTML = catalog.slice(0, 3).map(buildCardHTML).join("");
  }

  // 2. Full Collection Grid
  renderCollectionFiltered("all");

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
    `,
      )
      .join("");
  }

  // 4. Apply Store Updates
  applyStoreDataUI();

  // 5. Footers Injection
  renderFooters();

  // 6. Attach Events
  attachNavigationEvents();
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
      <button class="btn">Inspect & Order</button>
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

function renderCollectionFiltered(category) {
  const catalog = getCatalog();
  const cg = document.getElementById("cg");
  if (!cg) return;

  const filtered =
    category === "all"
      ? catalog
      : catalog.filter((w) => w.category === category);
  cg.innerHTML = filtered.map(buildCardHTML).join("");
  attachNavigationEvents();
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
    </div>
    <div>
      <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Visit</h4>
      <p>12 Gold Street, Main Boulevard<br>Mon–Sat, 10am – 8pm</p>
    </div>
    <div>
      <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Contact</h4>
      <p>hello@luxore.example<br>+00 000 0000000</p>
    </div>
    <div style="grid-column: 1 / -1; border-top: 1px solid var(--bd); padding-top: 20px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--mut);">
      <span>© 2026 Luxore Watches. All rights reserved.</span>
      <a href="admin.html" target="_blank" title="Authorized Access" style="color:#2a2417; text-decoration:none; font-size:0.9rem;">🔒</a>
    </div>
  `;
  ["f1", "f2", "f3", "f4"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = footerContent;
  });
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    window.open("admin.html", "_blank");
  }
});

document.getElementById("tb")?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document
    .querySelectorAll("#tb button")
    .forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
  renderCollectionFiltered(btn.dataset.f);
});

document
  .querySelector(".open-tourbillon-btn")
  ?.addEventListener("click", () => {
    window.location.href = `product-detail.html?id=imperium-tourbillon`;
  });

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

window.addEventListener("hashchange", switchView);

setupTilt(".stage", "#hw", 25);
setupTilt(".best .bw", "#tourbillon-watch", 20);
initCustomCursor();

setupWelcomeLogin();
renderCatalogUI();
switchView();
