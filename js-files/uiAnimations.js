export function setupTilt(containerSelector, elementSelector, intensity = 30) {
  const container = document.querySelector(containerSelector);
  const element = document.querySelector(elementSelector);

  if (!container || !element) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `rotateY(${xRatio * intensity}deg) rotateX(${-yRatio * intensity * 0.7}deg)`;
  });

  container.addEventListener("mouseleave", () => {
    element.style.transform = "";
  });
}

export function initCustomCursor() {
  const ring = document.getElementById("cur");
  const dot = document.getElementById("dot");
  if (!ring || !dot) return;

  window.addEventListener("mousemove", (e) => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}
