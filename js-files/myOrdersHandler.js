function renderMyOrdersPage() {
  const mount = document.getElementById("my-orders-mount");
  const allOrdersRaw = localStorage.getItem("luxore_all_orders");
  const orders = allOrdersRaw ? JSON.parse(allOrdersRaw) : [];

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
        <div style="display:flex; justify-content:space-between; align-items:center;">
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
          ${order.settlementTrx !== "None" ? `<span class="badge-item" style="border:1px solid #555; color:#aaa;">Merchant TRX: ${order.settlementTrx}</span>` : ""}
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
  `,
    )
    .join("");

  // Attach Cancellation / Refund Claim Listener
  mount.querySelectorAll(".btn-cancel-order-client").forEach((btn) => {
    btn.onclick = (e) => {
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
          alert(
            isOnline
              ? "Refund request registered! The merchant treasury will credit your account."
              : "Order successfully aborted.",
          );
          renderMyOrdersPage();
        }
      }
    };
  });
}

renderMyOrdersPage();
