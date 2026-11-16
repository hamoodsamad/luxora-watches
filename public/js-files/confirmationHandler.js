function renderConfirmationPage() {
  const activeOrderRaw = sessionStorage.getItem("luxore_active_order");
  const mount = document.getElementById("receipt-mount");

  if (!activeOrderRaw) {
    mount.innerHTML = `
      <div style="text-align:center; padding: 40px;">
        <h3>No Recent Order Found</h3>
        <p style="color:var(--mut); margin: 10px 0 20px;">Your session does not contain an active order invoice.</p>
        <a href="index.html#collection" class="btn f">Visit Boutique</a>
      </div>
    `;
    return;
  }

  const order = JSON.parse(activeOrderRaw);

  mount.innerHTML = `
    <div class="invoice-box">
      <div class="invoice-header">
        <div>
          <span>Order ID:</span>
          <b style="color:var(--g); font-size:1.1rem;">${order.orderId}</b>
        </div>
        <div>
          <span>Payment Status:</span>
          <b style="color:#5cd65c; font-weight:bold;">${order.paymentStatus || "PAID"}</b>
        </div>
      </div>

      <div class="invoice-product-row">
        <img src="${order.watchImg}" alt="${order.watchName}" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'" />
        <div>
          <h2 style="font-size:1.6rem;">${order.watchName}</h2>
          <div style="font-size:1.3rem; color:var(--g); font-family:serif;">${order.watchPrice}</div>
          <small style="color:var(--mut);">Includes 5-Year Global Warranty & Official Certificate of Authenticity</small>
        </div>
      </div>

      <div class="invoice-grid">
        <div><span>Recipient Client:</span><b>${order.clientName}</b></div>
        <div><span>Confirmation Sent To:</span><b>${order.clientEmail}</b></div>
        <div><span>Contact Phone:</span><b>${order.clientPhone}</b></div>
        <div><span>Payment Authorization:</span><b style="color:var(--g);">${order.paymentStatus}</b></div>
        <div><span>Destination Address:</span><b>${order.shippingAddress}</b></div>
        <div><span>Estimated Courier Handover:</span><b style="color:var(--g);">2 - 4 Business Days</b></div>
      </div>
    </div>
  `;

  // Cancellation Handler
  const cancelBtn = document.getElementById("btn-cancel-my-order");
  if (cancelBtn) {
    if (order.status === "Cancelled") {
      cancelBtn.textContent = "Order Cancelled";
      cancelBtn.disabled = true;
      cancelBtn.style.opacity = "0.5";
    }

    cancelBtn.onclick = async () => {
      if (confirm("Are you sure you want to cancel this order?")) {
        order.status = "Cancelled";
        order.paymentStatus = "Refund Initiated / Cancelled";
        sessionStorage.setItem("luxore_active_order", JSON.stringify(order));

        const allOrdersRaw = localStorage.getItem("luxore_all_orders");
        if (allOrdersRaw) {
          const allOrders = JSON.parse(allOrdersRaw);
          const found = allOrders.find((o) => o.orderId === order.orderId);
          if (found) {
            found.status = "Cancelled";
            found.paymentStatus = "Cancelled";
          }
          localStorage.setItem("luxore_all_orders", JSON.stringify(allOrders));
        }

        // Sync with API
        try {
          await fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.orderId,
              status: "Cancelled",
              paymentStatus: "Cancelled",
            }),
          });
        } catch (e) {}

        cancelBtn.textContent = "Order Cancelled";
        cancelBtn.disabled = true;
        alert("Your order cancellation request has been logged.");
        location.reload();
      }
    };
  }
}

function setupMobileNav() {
  const toggleBtn = document.getElementById("nav-toggle-btn");
  const drawer = document.getElementById("luxury-menu-drawer");
  const overlay = document.getElementById("nav-drawer-overlay");
  const closeBtn = document.getElementById("drawer-close-btn");
  const desktopLinks = document.getElementById("main-nav-links");

  function closeMenu() {
    toggleBtn?.classList.remove("active");
    drawer?.classList.remove("open");
    overlay?.classList.remove("open");
    desktopLinks?.classList.remove("mobile-open");
    document.body.style.overflow = "";
  }

  function openMenu() {
    toggleBtn?.classList.add("active");
    drawer?.classList.add("open");
    overlay?.classList.add("open");
    desktopLinks?.classList.add("mobile-open");
    document.body.style.overflow = "hidden";
  }

  function toggleMenu(e) {
    if (e) e.stopPropagation();
    const isOpen =
      drawer?.classList.contains("open") ||
      desktopLinks?.classList.contains("mobile-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  toggleBtn?.addEventListener("click", toggleMenu);
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);

  document
    .querySelectorAll(".drawer-link, #main-nav-links a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

renderConfirmationPage();
setupMobileNav();
