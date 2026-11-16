/**
 * Portfolio Return Helper for Luxore Watches
 * Direct navigation to developer portfolio (Main Page Only)
 */

export const PORTFOLIO_URL = "https://my-portfolio-ten-zeta-3wnea5nse7.vercel.app";

export function initPortfolioNavigation() {
  const path = window.location.pathname;
  const isMainPage =
    path === "/" ||
    path === "/index.html" ||
    path === "" ||
    path.endsWith("/index.html") ||
    path.endsWith("/");

  if (!isMainPage) return;

  // Ensure portfolio buttons link directly to developer's portfolio
  document
    .querySelectorAll(".portfolio-back-btn, [data-action='back-to-portfolio']")
    .forEach((btn) => {
      btn.setAttribute("href", PORTFOLIO_URL);
      btn.onclick = (e) => {
        e.preventDefault();
        window.location.href = PORTFOLIO_URL;
      };
    });
}

// Auto initialize on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioNavigation);
} else {
  initPortfolioNavigation();
}
