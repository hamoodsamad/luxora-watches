import { getCatalog, addProduct, deleteProduct } from "./productsData.js";

function getAdminPasscode() {
  return localStorage.getItem("luxore_admin_pass") || "admin123";
}

function setAdminPasscode(newPass) {
  localStorage.setItem("luxore_admin_pass", newPass);
}

// Authentication
const authBtn = document.getElementById("auth-btn");
const passInput = document.getElementById("admin-passcode");
const authErr = document.getElementById("auth-err");
const lockScreen = document.getElementById("auth-lock");
const dashboard = document.getElementById("admin-dashboard");

if (authBtn) {
  authBtn.addEventListener("click", () => {
    if (passInput.value === getAdminPasscode()) {
      lockScreen.classList.add("hidden");
      dashboard.classList.remove("hidden");
      renderAdminInventory();
      renderOrdersLog();
      loadStoreEditorData();
    } else {
      authErr.textContent = "Invalid passcode. Access denied.";
    }
  });
}

// 1. Password Change Handler
document.getElementById("change-pass-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const oldPass = document.getElementById("old-passcode").value;
  const newPass = document.getElementById("new-passcode").value;
  const confirmPass = document.getElementById("confirm-passcode").value;

  if (oldPass !== getAdminPasscode()) {
    alert("Error: Current passcode is incorrect!");
    return;
  }
  if (newPass.length < 4) {
    alert("Error: Passcode must be at least 4 characters!");
    return;
  }
  if (newPass !== confirmPass) {
    alert("Error: Passcodes do not match!");
    return;
  }

  setAdminPasscode(newPass);
  alert("Success: Passcode updated successfully!");
  e.target.reset();
});

// 2. Render Orders Log with Merchant Fund Verification & Refund Approval
function renderOrdersLog() {
  const container = document.getElementById("orders-log-container");
  const countEl = document.getElementById("orders-count");
  if (!container) return;

  const raw = localStorage.getItem("luxore_all_orders");
  const orders = raw ? JSON.parse(raw) : [];

  if (countEl) countEl.textContent = orders.length;

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px; color:#888;">
        No customer purchase orders recorded yet.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Timepiece</th>
          <th>Merchant Settlement Verification</th>
          <th>Customer Details</th>
          <th>Status</th>
          <th>Dispatch Tools</th>
          <th>Treasury / Refund</th>
        </tr>
      </thead>
      <tbody>
        ${orders
          .map(
            (o) => `
          <tr>
            <td style="color:#b8923a; font-weight:600;">
              ${o.orderId}<br><small style="color:#777;">${o.orderDate}</small>
            </td>
            <td><b>${o.watchName}</b><br><span style="color:#e6c76f;">${o.watchPrice}</span></td>
            <td>
              <span class="status-badge ${o.paymentStatus && o.paymentStatus.includes("PAID") ? "status-active" : "status-cancelled"}">
                ${o.paymentStatus}
              </span>
              ${o.settlementTrx && o.settlementTrx !== "None" ? `<br><small style="color:#aaa;">Settlement: ${o.settlementTrx}</small>` : ""}
            </td>
            <td>
              <b>${o.clientName}</b><br>
              <small style="color:#aaa;">✉ ${o.clientEmail}</small><br>
              <small style="color:#aaa;">📞 ${o.clientPhone}</small><br>
              <small style="color:#888;">📍 ${o.shippingAddress}</small>
            </td>
            <td>
              <span class="status-badge ${o.status === "Cancelled" ? "status-cancelled" : "status-active"}">
                ${o.status || "Confirmed"}
              </span>
            </td>
            <td>
              <div style="display:flex; flex-direction:column; gap:5px;">
                <button class="action-btn-copy" data-copy-payload="Recipient: ${o.clientName}&#10;Phone: ${o.clientPhone}&#10;Address: ${o.shippingAddress}&#10;Order: ${o.watchName} (${o.watchPrice})&#10;Settlement: ${o.paymentStatus}">📋 Copy Address</button>
                <button class="action-btn-print" data-print-id="${o.orderId}">🖨 Print Slip</button>
              </div>
            </td>
            <td>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${
                  o.paymentStatus &&
                  o.paymentStatus.includes("Refund Requested")
                    ? `<button class="action-btn-refund" data-refund-id="${o.orderId}">Approve & Release Refund</button>`
                    : ""
                }
                <button class="action-btn-del" data-del-id="${o.orderId}" title="Delete order completely">Clear</button>
              </div>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  // Approve & Release Refund
  container.querySelectorAll(".action-btn-refund").forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.target.dataset.refundId;
      if (
        confirm(
          `Approve refund for order ${id}? Funds will be credited back to client.`,
        )
      ) {
        const order = orders.find((o) => o.orderId === id);
        if (order) {
          order.paymentStatus = "REFUNDED (Funds Returned to Client)";
          localStorage.setItem("luxore_all_orders", JSON.stringify(orders));
          alert(
            `Refund for order ${id} has been officially settled and marked.`,
          );
          renderOrdersLog();
        }
      }
    };
  });

  // Copy Address
  container.querySelectorAll(".action-btn-copy").forEach((btn) => {
    btn.onclick = (e) => {
      const textToCopy = e.target.getAttribute("data-copy-payload");
      navigator.clipboard.writeText(textToCopy).then(() => {
        const original = e.target.textContent;
        e.target.textContent = "✔ Copied!";
        setTimeout(() => (e.target.textContent = original), 2000);
      });
    };
  });

  // Print Slip
  container.querySelectorAll(".action-btn-print").forEach((btn) => {
    btn.onclick = (e) => {
      const targetId = e.target.dataset.printId;
      const order = orders.find((o) => o.orderId === targetId);
      if (order) printShippingSlip(order);
    };
  });

  // Clear Single
  container.querySelectorAll(".action-btn-del").forEach((btn) => {
    btn.onclick = (e) => {
      const idToClear = e.target.dataset.delId;
      if (confirm(`Clear order ${idToClear}?`)) {
        const updated = orders.filter((o) => o.orderId !== idToClear);
        localStorage.setItem("luxore_all_orders", JSON.stringify(updated));
        renderOrdersLog();
      }
    };
  });
}

function printShippingSlip(order) {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shipping Slip - ${order.orderId}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
        .slip-box { border: 2px dashed #000; padding: 25px; max-width: 500px; margin: auto; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 3px; }
        .row { margin: 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
        .badge { background: #eee; padding: 3px 8px; font-weight: bold; }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="logo">LUXORE</div>
          <div><b>SLIP #: ${order.orderId}</b></div>
        </div>
        <hr style="margin: 15px 0;">
        <div class="row"><b>Item:</b> ${order.watchName} (${order.watchPrice})</div>
        <div class="row"><b>Settlement Status:</b> <span class="badge">${order.paymentStatus}</span></div>
        <div class="row"><b>Recipient Name:</b> ${order.clientName}</div>
        <div class="row"><b>Contact Phone:</b> ${order.clientPhone}</div>
        <div class="row"><b>Email:</b> ${order.clientEmail}</div>
        <div class="row"><b>Delivery Address:</b><br>${order.shippingAddress}</div>
        <div style="font-size: 11px; color:#555; margin-top:20px; text-align:center;">
          Insured Courier Parcel · Direct Handover Signature Required
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Clear All Orders
document.getElementById("btn-clear-orders")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to CLEAR ALL customer orders at once?")) {
    localStorage.removeItem("luxore_all_orders");
    renderOrdersLog();
  }
});

// Render Inventory
function renderAdminInventory() {
  const container = document.getElementById("inventory-list");
  if (!container) return;

  const catalog = getCatalog();
  container.innerHTML = catalog
    .map(
      (w) => `
    <div class="inventory-item">
      <div>
        <b>${w.name}</b> (${w.price}) - <i>${w.category}</i>
      </div>
      <button class="del-btn" data-id="${w.id}">Delete</button>
    </div>
  `,
    )
    .join("");

  container.querySelectorAll(".del-btn").forEach((btn) => {
    btn.onclick = (e) => {
      deleteProduct(e.target.dataset.id);
      renderAdminInventory();
    };
  });
}

// "Our Store" Live Editor
const defaultStoreData = {
  headline: "A Legacy of Precision",
  storyHeading: "Made to be Inherited",
  storyDesc:
    "Every Luxore watch begins with a simple belief: a watch should outlive its owner. Our designers blend classic proportions with modern materials, and every movement is certified before delivery.",
  img: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
  statYears: "28",
  statDelivered: "120,000",
  statCraftsmen: "85+",
  statCountries: "40+",
};

function loadStoreEditorData() {
  const raw = localStorage.getItem("luxore_store_data");
  const data = raw ? JSON.parse(raw) : defaultStoreData;

  document.getElementById("adm-store-headline").value = data.headline;
  document.getElementById("adm-story-heading").value = data.storyHeading;
  document.getElementById("adm-story-desc").value = data.storyDesc;
  document.getElementById("adm-store-img").value = data.img;
  document.getElementById("adm-stat-years").value = data.statYears;
  document.getElementById("adm-stat-delivered").value = data.statDelivered;
  document.getElementById("adm-stat-craftsmen").value = data.statCraftsmen;
  document.getElementById("adm-stat-countries").value = data.statCountries;
}

document.getElementById("edit-store-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const updatedStoreData = {
    headline: document.getElementById("adm-store-headline").value.trim(),
    storyHeading: document.getElementById("adm-story-heading").value.trim(),
    storyDesc: document.getElementById("adm-story-desc").value.trim(),
    img: document.getElementById("adm-store-img").value.trim(),
    statYears: document.getElementById("adm-stat-years").value.trim(),
    statDelivered: document.getElementById("adm-stat-delivered").value.trim(),
    statCraftsmen: document.getElementById("adm-stat-craftsmen").value.trim(),
    statCountries: document.getElementById("adm-stat-countries").value.trim(),
  };
  localStorage.setItem("luxore_store_data", JSON.stringify(updatedStoreData));
  alert('"Our Store" details published live!');
});

// Add Watch Form
const addForm = document.getElementById("add-watch-form");
if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newWatch = {
      id: "watch-" + Date.now(),
      name: document.getElementById("watch-name").value,
      price: document.getElementById("watch-price").value,
      category: document.getElementById("watch-category").value,
      tag: document.getElementById("watch-tag").value,
      img: document.getElementById("watch-img").value,
      desc: document.getElementById("watch-desc").value,
      movement: "Calibre Swiss Automatic",
      caseSpec: "41mm Sapphire",
      waterResist: "100m",
      powerReserve: "50 Hours",
    };
    addProduct(newWatch);
    alert("Watch published to catalog!");
    addForm.reset();
    renderAdminInventory();
  });
}
