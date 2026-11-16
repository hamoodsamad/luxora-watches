import { getCatalog } from "./productsData.js";

export function openFullProductPage(watchId) {
  const catalog = getCatalog();
  const watch = catalog.find((w) => w.id === watchId);
  if (!watch) return;

  // Switch View to Detail View
  document.querySelectorAll(".v").forEach((v) => v.classList.remove("on"));
  const detailView = document.getElementById("product-detail-view");
  detailView.classList.add("on");
  window.scrollTo(0, 0);

  const container = document.getElementById("product-detail-container");

  container.innerHTML = `
    <div class="product-detail-layout">
      <!-- Image Gallery -->
      <div class="detail-gallery">
        <div class="detail-gallery-main">
          <img src="${watch.img}" alt="${watch.name}" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'" />
        </div>
      </div>

      <!-- Information & Specs -->
      <div class="detail-info">
        <p class="eye">${watch.category ? watch.category.toUpperCase() : "LUXURY"} COLLECTION</p>
        <h1>${watch.name}</h1>
        <div class="detail-price">${watch.price}</div>
        <p class="detail-desc-text">${watch.desc}</p>

        <h3 class="specs-title">Horological Specifications</h3>
        <table class="detail-specs-table">
          <tr><td>Movement</td><td>${watch.movement || "Automatic Swiss"}</td></tr>
          <tr><td>Case Diameter</td><td>${watch.caseSpec || "41 mm"}</td></tr>
          <tr><td>Glass / Crystal</td><td>${watch.crystal || "Double-Coated Sapphire"}</td></tr>
          <tr><td>Dial Configuration</td><td>${watch.dial || "Custom Sunburst"}</td></tr>
          <tr><td>Water Resistance</td><td>${watch.waterResist || "100 Meters"}</td></tr>
          <tr><td>Strap & Clasp</td><td>${watch.strap || "Italian Leather"}</td></tr>
          <tr><td>Power Reserve</td><td>${watch.powerReserve || "48 Hours"}</td></tr>
          <tr><td>Worldwide Delivery</td><td>Complimentary Insured Courier (2–4 Days)</td></tr>
        </table>

        <!-- Checkout Form -->
        <div class="checkout-box">
          <h3>Secure Acquisition & Delivery</h3>
          <p>Please enter your contact details to reserve and dispatch this timepiece:</p>

          <input type="text" id="cust-name" class="checkout-field" placeholder="Full Legal Name" required />
          <input type="email" id="cust-email" class="checkout-field" placeholder="Email Address (for order tracking)" required />
          <input type="tel" id="cust-phone" class="checkout-field" placeholder="Contact Telephone Number" required />
          <input type="text" id="cust-address" class="checkout-field" placeholder="Full Street Delivery Address, City & Postcode" required />

          <button id="btn-place-order" class="checkout-submit-btn">Confirm Order (${watch.price})</button>
        </div>
      </div>
    </div>
  `;

  // Attach Order Trigger
  document.getElementById("btn-place-order").onclick = () => {
    const name = document.getElementById("cust-name").value.trim();
    const email = document.getElementById("cust-email").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();

    if (!name || !email || !phone || !address) {
      alert("Please complete all shipping fields to dispatch your order.");
      return;
    }

    // Process & Show Confirmation
    showOrderConfirmation({
      watch,
      customer: { name, email, phone, address },
    });
  };
}

function showOrderConfirmation({ watch, customer }) {
  const orderNumber = "LX-" + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Switch to confirmation page
  document.querySelectorAll(".v").forEach((v) => v.classList.remove("on"));
  const confirmView = document.getElementById("order-success-view");
  confirmView.classList.add("on");
  window.scrollTo(0, 0);

  const receiptBox = document.getElementById("receipt-details");
  receiptBox.innerHTML = `
    <div class="receipt-header">
      <div>
        <b>Order Tracking ID:</b> ${orderNumber}
      </div>
      <div>
        <b>Date:</b> ${orderDate}
      </div>
    </div>

    <div class="receipt-item-row">
      <img src="${watch.img}" alt="${watch.name}" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'" />
      <div>
        <h3 style="font-size:1.3rem;">${watch.name}</h3>
        <p style="color:var(--g); font-weight:600;">${watch.price}</p>
        <small style="color:var(--mut);">Includes 5-Year Global Warranty & Certificate of Authenticity</small>
      </div>
    </div>

    <div class="receipt-grid">
      <div>
        <span>Recipient:</span>
        <b>${customer.name}</b>
      </div>
      <div>
        <span>Notification Dispatched To:</span>
        <b>${customer.email}</b>
      </div>
      <div>
        <span>Contact Phone:</span>
        <b>${customer.phone}</b>
      </div>
      <div>
        <span>Delivery Address:</span>
        <b>${customer.address}</b>
      </div>
      <div>
        <span>Delivery Carrier:</span>
        <b>DHL Express Armored (Tracked)</b>
      </div>
      <div>
        <span>Estimated Delivery Window:</span>
        <b>2 – 4 Business Days</b>
      </div>
    </div>
  `;
}
