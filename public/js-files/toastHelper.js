/**
 * Luxore Luxury Toast Notification Engine
 */

let toastContainer = null;

export function showLuxToast(message, type = "info", duration = 4000) {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "lux-toast-portal";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `lux-toast lux-toast-${type}`;
  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:1.1rem;">${type === "success" ? "✓" : type === "error" ? "⚠" : "✦"}</span>
      <span>${message}</span>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, duration);
}
