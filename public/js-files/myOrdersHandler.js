import { showLuxToast } from "./toastHelper.js";

async function fetchOrders() {
  let orders = [];

  // Try API first
  try {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const apiOrders = await res.json();
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        orders = apiOrders;
        localStorage.setItem("luxore_all_orders", JSON.stringify(orders));
        return orders;
      }
    }
  } catch (e) {
    // API offline
  }

  // Fallback to local
  const allOrdersRaw = localStorage.getItem("luxore_all_orders");
  return allOrdersRaw ? JSON.parse(allOrdersRaw) : [];
}

async function renderMyOrdersPage() {
  const mount = document.getElementById("my-orders-mount");
  if (!mount) return;

  const orders = await fetchOrders();

  if (orders.length === 0) {
    mount.innerHTML = `
      <div style="text-align:center; padding: 60px 0; background:var(--s); border:1px solid var(--bd); border-radius:8px;">
        <h3>No Timepiece Acquisitions Found</h3>
        <p style="color:var(--mut); margin: 15px 0 25px;">You have not acquired any luxury timepieces yet.</p>
        <a href="index.html#collection" class="btn f">Browse the Vault Collection</a>
      </div>
    `;
    return;
  }

  mount.innerHTML = orders
    .map(
      (order) => `
    <div class="client-order-card">
      <div class="client-order-img-box">
        <img src="${order.watchImg}" alt="${order.watchName}" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'" />
      </div>

      <div class="client-order-details">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h3>${order.watchName}</h3>
          <span style="font-family:serif; font-size:1.4rem; color:var(--g); font-weight:600;">${order.watchPrice}</span>
        </div>

        <div class="order-badges-bar">
          <span class="badge-item ${order.status === "Cancelled" ? "badge-cancelled" : "badge-paid"}">
            Status: ${order.status || "Confirmed"}
          </span>
          <span class="badge-item ${order.isOnlinePayment ? "badge-paid" : "badge-cod"}">
            ${order.paymentStatus}
          </span>
          ${order.settlementTrx && order.settlementTrx !== "None" ? `<span class="badge-item" style="border:1px solid #555; color:#aaa;">Merchant TRX: ${order.settlementTrx}</span>` : ""}
        </div>

        <div class="order-meta-info">
          <div>Tracking Number: <b>${order.orderId}</b></div>
          <div>Acquisition Date: <b>${order.orderDate}</b></div>
          <div>Armored Courier: <b>Direct Air Handover (Tracked)</b></div>
          <div>Destination: <b>${order.shippingAddress}</b></div>
        </div>
      </div>

      <div class="client-order-actions">
        ${
          order.status !== "Cancelled"
            ? `
            <button class="btn-cancel-order-client" data-order-id="${order.orderId}" data-is-online="${order.isOnlinePayment}">
              Cancel & ${order.isOnlinePayment ? "Request Full Refund" : "Abort Order"}
            </button>
          `
            : `
            <span style="color:#ff6b6b; font-size:0.85rem; font-weight:600;">
              ${order.isOnlinePayment ? "Refund Claim Processed ✔" : "Order Cancelled"}
            </span>
          `
        }
      </div>
    </div>
  `
    )
    .join("");

  // Attach Cancellation / Refund Claim Listener
  mount.querySelectorAll(".btn-cancel-order-client").forEach((btn) => {
    btn.onclick = async (e) => {
      const orderId = e.target.dataset.orderId;
      const isOnline = e.target.dataset.isOnline === "true";

      const promptMsg = isOnline
        ? `Cancel order ${orderId}? Since you paid online, a full refund settlement will be credited back to your funding account.`
        : `Cancel order ${orderId}? Cash on Delivery parcel will be stopped.`;

      if (confirm(promptMsg)) {
        const order = orders.find((o) => o.orderId === orderId);
        if (order) {
          order.status = "Cancelled";
          order.paymentStatus = isOnline
            ? "CANCELLED (Refund Requested / Reversing to Client)"
            : "CANCELLED (COD Aborted)";

          localStorage.setItem("luxore_all_orders", JSON.stringify(orders));

          // Sync with API
          try {
            await fetch("/api/orders", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.orderId,
                status: order.status,
                paymentStatus: order.paymentStatus,
              }),
            });
          } catch (err) {}

          showLuxToast(
            isOnline
              ? "Refund request registered! Treasury will reverse settlement."
              : "Order aborted successfully.",
            "info"
          );

          renderMyOrdersPage();
        }
      }
    };
  });
}

function setupPageExtras() {
  const toggleBtn = document.getElementById("nav-toggle-btn");
  const navLinks = document.getElementById("main-nav-links");
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });
  }

  const footerEl = document.getElementById("myorders-footer");
  if (footerEl) {
    footerEl.innerHTML = `
      <div>
        <div class="logo gold">LUXORE</div>
        <p style="margin-top:8px">Timeless watches for those who value every second.</p>
      </div>
      <div>
        <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Navigation</h4>
        <a href="index.html#home" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">Home</a>
        <a href="index.html#collection" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">Collection</a>
        <a href="index.html#store" style="color:var(--mut); text-decoration:none; display:block; margin-bottom:4px;">Our Store</a>
      </div>
      <div>
        <h4 style="color:var(--tx); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:10px;">Support</h4>
        <p>concierge@luxore.com<br>Mon–Sat, 10am – 8pm</p>
      </div>
      <div style="grid-column: 1 / -1; border-top: 1px solid var(--bd); padding-top: 20px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--mut); flex-wrap:wrap; gap:10px;">
        <span>© 2026 Luxore Watches. All rights reserved.</span>
        <a href="#" class="portfolio-back-btn" data-action="back-to-portfolio" style="font-size:0.7rem;">← Back to Portfolio</a>
      </div>
    `;
  }
}

renderMyOrdersPage();
setupPageExtras();
