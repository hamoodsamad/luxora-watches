export function placeCustomerOrder(orderData) {
  const orderId = "LX-" + Math.floor(100000 + Math.random() * 900000);

  const toast = document.getElementById("email-toast");
  const messageBox = document.getElementById("toast-message");

  if (toast && messageBox) {
    messageBox.innerHTML = `
      Confirmation email sent to <b>${orderData.customerEmail}</b>.<br>
      Order ID: <b>${orderId}</b><br>
      Watch: <b>${orderData.watchName}</b> (${orderData.watchPrice})<br>
      Express delivery registered to: ${orderData.customerAddress}
    `;

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 7000);
  }
}
