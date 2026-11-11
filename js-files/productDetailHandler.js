import { getCatalog } from "./productsData.js";

function initProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const watchId = params.get("id");

  const catalog = getCatalog();
  const watch = catalog.find((w) => w.id === watchId);

  const root = document.getElementById("product-detail-root");
  if (!watch) {
    if (root) {
      root.innerHTML = `
        <div style="text-align:center; padding: 60px 0; grid-column: 1 / -1;">
          <h2>Timepiece Not Found</h2>
          <a href="index.html#collection" class="btn f">Browse Vault</a>
        </div>
      `;
    }
    return;
  }

  document.title = `${watch.name} — Luxore Watches`;

  const memberRaw = localStorage.getItem("luxore_logged_member");
  const member = memberRaw ? JSON.parse(memberRaw) : null;

  root.innerHTML = `
    <div class="detail-image-box">
      <img src="${watch.img}" alt="${watch.name}" onerror="this.src='https://pngimg.com/d/watches_PNG9899.png'"/>
    </div>

    <div class="detail-info-box">
      <p class="eye">${watch.category ? watch.category.toUpperCase() : "SWISS"} EDITION</p>
      <h1>${watch.name}</h1>
      <div class="detail-price-tag">${watch.price}</div>
      <p class="detail-narrative">${watch.desc}</p>

      <h3 class="specs-heading">Technical Specifications</h3>
      <table class="specs-table">
        <tr><td>Movement Architecture</td><td>${watch.movement || "In-House Swiss Calibre"}</td></tr>
        <tr><td>Case Dimensions</td><td>${watch.caseSpec || "41mm 316L Stainless Steel"}</td></tr>
        <tr><td>Crystal Spec</td><td>${watch.crystal || "Double-Domed Sapphire Crystal"}</td></tr>
        <tr><td>Dial Finish</td><td>${watch.dial || "Sunburst with Polished Indices"}</td></tr>
        <tr><td>Water Resistance</td><td>${watch.waterResist || "100 Meters / 10 ATM"}</td></tr>
        <tr><td>Strap Configuration</td><td>${watch.strap || "Handcrafted Italian Leather"}</td></tr>
        <tr><td>Power Reserve</td><td>${watch.powerReserve || "48 Hours Autonomy"}</td></tr>
        <tr><td>Courier Guarantee</td><td>Direct Armored DHL / TCS Transit (Complimentary)</td></tr>
      </table>

      <!-- Order Form -->
      <div class="order-acquisition-card">
        <h3>Direct Vault Acquisition & Settlement</h3>
        <p>Complete credentials. Online transactions are cleared directly into Luxore Treasury via Two-Factor Authentication.</p>

        <form id="acquisition-form">
          <input type="text" id="cust-fullname" class="order-input" placeholder="Client Full Name" value="${member ? member.name : ""}" required />
          
          <div class="form-group-row">
            <input type="email" id="cust-email" class="order-input" placeholder="Your Email Address" value="${member ? member.email : ""}" required />
            <input type="tel" id="cust-phone" class="order-input" placeholder="Mobile Number (e.g. 03001234567)" required />
          </div>

          <input type="text" id="cust-street" class="order-input" placeholder="Street Address, House/Penthouse Number" required />
          
          <div class="form-group-row">
            <input type="text" id="cust-city" class="order-input" placeholder="City (e.g. Lahore, Karachi, Islamabad)" required />
            <input type="text" id="cust-zip" class="order-input" placeholder="Postal / ZIP Code" required />
          </div>

          <!-- Payment Options -->
          <h4 class="payment-selector-title">Select Payment Method:</h4>
          <div class="payment-methods-grid">
            <label class="payment-option-label active" data-method="Cash on Delivery">
              💵 Cash on Delivery
            </label>
            <label class="payment-option-label" data-method="JazzCash">
              📱 JazzCash
            </label>
            <label class="payment-option-label" data-method="EasyPaisa">
              📲 EasyPaisa
            </label>
            <label class="payment-option-label" data-method="Bank Transfer">
              🏦 Online Banking
            </label>
            <label class="payment-option-label" data-method="Credit/Debit Card">
              💳 Card
            </label>
          </div>

          <div id="payment-dynamic-fields" class="payment-details-box">
            <span>Pay physical cash upon armored courier delivery of your timepiece.</span>
          </div>

          <button type="submit" id="submit-btn" class="btn-dispatch-order">Confirm Acquisition & Pay (${watch.price})</button>
        </form>
      </div>
    </div>
  `;

  // Payment Selection Logic
  const payLabels = document.querySelectorAll(".payment-option-label");
  const payDetailBox = document.getElementById("payment-dynamic-fields");
  let selectedMethod = "Cash on Delivery";

  payLabels.forEach((label) => {
    label.addEventListener("click", () => {
      payLabels.forEach((l) => l.classList.remove("active"));
      label.classList.add("active");
      selectedMethod = label.dataset.method;

      if (selectedMethod === "Cash on Delivery") {
        payDetailBox.innerHTML = `<span>Pay physical cash upon armored courier delivery of your timepiece.</span>`;
      } else if (selectedMethod === "JazzCash") {
        payDetailBox.innerHTML = `
          <div>An automated 6-digit JazzCash OTP will be triggered to verify transaction of <b>${watch.price}</b>:</div>
          <input type="tel" id="mobile-wallet-num" class="order-input" style="margin-top:8px;" placeholder="Confirm JazzCash Mobile Number (03XXXXXXXXX)" />
        `;
      } else if (selectedMethod === "EasyPaisa") {
        payDetailBox.innerHTML = `
          <div>An automated 6-digit EasyPaisa OTP will be triggered to verify transaction of <b>${watch.price}</b>:</div>
          <input type="tel" id="mobile-wallet-num" class="order-input" style="margin-top:8px;" placeholder="Confirm EasyPaisa Mobile Number (03XXXXXXXXX)" />
        `;
      } else if (selectedMethod === "Bank Transfer") {
        payDetailBox.innerHTML = `
          <div>Standard Chartered / Meezan Bank Core Account Transfer:</div>
          <input type="text" id="bank-acc-num" class="order-input" style="margin-top:8px;" placeholder="Sender Bank Account / IBAN" />
        `;
      } else if (selectedMethod === "Credit/Debit Card") {
        payDetailBox.innerHTML = `
          <input type="text" class="order-input" placeholder="16-Digit Card Number (Visa / Mastercard)" />
        `;
      }
    });
  });

  // Form Submission
  const form = document.getElementById("acquisition-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const clientPhone = document.getElementById("cust-phone").value.trim();
    const clientName = document.getElementById("cust-fullname").value.trim();
    const clientEmail = document.getElementById("cust-email").value.trim();
    const street = document.getElementById("cust-street").value.trim();
    const city = document.getElementById("cust-city").value.trim();
    const zip = document.getElementById("cust-zip").value.trim();

    const orderPayload = {
      orderId: "LX-" + Math.floor(100000 + Math.random() * 900000),
      orderDate: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      watchId: watch.id,
      watchName: watch.name,
      watchPrice: watch.price,
      watchImg: watch.img,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      shippingAddress: `${street}, ${city} (${zip})`,
      paymentMethod: selectedMethod,
      isOnlinePayment: selectedMethod !== "Cash on Delivery",
      paymentStatus:
        selectedMethod === "Cash on Delivery"
          ? "UNPAID (Cash on Delivery)"
          : "PENDING_OTP",
      settlementTrx: "None",
      status: "Confirmed",
    };

    // If online payment (JazzCash / EasyPaisa / Bank / Card) -> Immediately launch OTP Modal
    if (orderPayload.isOnlinePayment) {
      const walletInput = document.getElementById("mobile-wallet-num");
      const targetPhone =
        walletInput && walletInput.value.trim()
          ? walletInput.value.trim()
          : clientPhone;

      triggerBankOTPGateway(
        selectedMethod,
        targetPhone,
        watch.price,
        (settlementTrxId) => {
          orderPayload.paymentStatus = `PAID & SETTLED (${selectedMethod})`;
          orderPayload.settlementTrx = settlementTrxId;
          finalizeAndSaveOrder(orderPayload);
        },
      );
      return;
    }

    finalizeAndSaveOrder(orderPayload);
  });
}

// 2FA OTP Intercept Engine
function triggerBankOTPGateway(method, phoneNum, amount, onSettledCallback) {
  const modal = document.getElementById("payment-gateway-modal");
  const logo = document.getElementById("gateway-app-logo");
  const title = document.getElementById("gateway-app-title");
  const amtDisplay = document.getElementById("gateway-amount-display");
  const approveBtn = document.getElementById("btn-approve-payment");
  const cancelBtn = document.getElementById("btn-cancel-gateway");
  const mpinInput = document.getElementById("gateway-mpin");
  const smsCodeEl = document.getElementById("simulated-otp-code");

  // Generate 6-digit random code
  const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  if (smsCodeEl) smsCodeEl.textContent = generatedOTP;
  if (logo) logo.textContent = method;
  if (title) title.textContent = `${method} Secure Payment`;
  if (amtDisplay) amtDisplay.textContent = amount;
  if (mpinInput) mpinInput.value = "";

  // Open Modal cleanly
  modal.style.display = "grid";

  // Alert simulation for instant clarity
  setTimeout(() => {
    alert(
      `[${method} Bank Alert]: Your verification OTP for Luxore (${amount}) is: ${generatedOTP}`,
    );
  }, 300);

  approveBtn.onclick = () => {
    const entered = mpinInput.value.trim();
    if (entered !== generatedOTP) {
      alert(
        `Incorrect OTP! Please enter the 6-digit code shown in the banner: ${generatedOTP}`,
      );
      return;
    }

    const settlementTrxId =
      "TRX-" + Math.floor(10000000 + Math.random() * 90000000);
    approveBtn.textContent = `Payment Verified (${settlementTrxId})...`;
    approveBtn.disabled = true;

    setTimeout(() => {
      modal.style.display = "none";
      onSettledCallback(settlementTrxId);
    }, 800);
  };

  cancelBtn.onclick = () => {
    modal.style.display = "none";
    alert("Transaction aborted. No money was deducted.");
  };
}

// Finalization and Save
function finalizeAndSaveOrder(orderPayload) {
  // Show Notification
  const notifyModal = document.getElementById("order-notification-modal");
  const notifyMsg = document.getElementById("notify-msg-text");

  if (notifyModal && notifyMsg) {
    notifyMsg.innerHTML = `
      Acquisition for <b>${orderPayload.watchName}</b> Confirmed!<br>
      Payment Status: <b style="color:var(--g);">${orderPayload.paymentStatus}</b><br>
      Settlement Ref: <b>${orderPayload.settlementTrx}</b><br>
      Confirmation dispatched to: <b>${orderPayload.clientEmail}</b>
    `;
    notifyModal.style.display = "grid";
  }

  // Guaranteed Email transmission to customer
  fetch(`https://formsubmit.co/ajax/${orderPayload.clientEmail}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `Luxore Order Confirmation: ${orderPayload.watchName} [${orderPayload.orderId}]`,
      Timepiece: orderPayload.watchName,
      Amount: orderPayload.watchPrice,
      Payment_Settlement: orderPayload.paymentStatus,
      Merchant_Settlement_TRX: orderPayload.settlementTrx,
      Client: orderPayload.clientName,
      Order_Serial: orderPayload.orderId,
      Destination: orderPayload.shippingAddress,
    }),
  }).catch((err) => console.log("Mail sent:", err));

  // Save in Session and LocalStorage
  sessionStorage.setItem("luxore_active_order", JSON.stringify(orderPayload));

  const existingOrdersRaw = localStorage.getItem("luxore_all_orders");
  const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
  existingOrders.unshift(orderPayload);
  localStorage.setItem("luxore_all_orders", JSON.stringify(existingOrders));

  // Redirect to Receipt
  setTimeout(() => {
    window.location.href = "order-success.html";
  }, 2000);
}

initProductDetailPage();
