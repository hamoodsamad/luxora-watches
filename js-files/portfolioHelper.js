/**
 * Portfolio Return Helper for Luxore Watches
 * Allows recruiters & visitors from the developer's portfolio to return seamlessly.
 */

export function initPortfolioNavigation() {
  // Ensure floating portfolio button exists on the page
  injectFloatingPortfolioButton();

  // Attach click handler to all portfolio buttons
  document.addEventListener("click", (e) => {
    const target = e.target.closest(".portfolio-back-btn, .floating-portfolio-pill, [data-action='back-to-portfolio']");
    if (!target) return;

    e.preventDefault();
    handlePortfolioReturn();
  });
}

export function handlePortfolioReturn() {
  const savedUrl = localStorage.getItem("luxore_portfolio_url");

  // 1. If custom portfolio URL is saved, navigate there
  if (savedUrl && savedUrl.trim().length > 0 && savedUrl !== "#") {
    window.location.href = savedUrl;
    return;
  }

  // 2. If referrer is another site or page, go back
  if (document.referrer && !document.referrer.includes(window.location.host)) {
    window.location.href = document.referrer;
    return;
  }

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  // 3. Fallback: prompt or navigate to parent
  const promptUrl = prompt(
    "Return to Portfolio:\nNo previous portfolio session detected. Enter your portfolio URL to return (or click OK to go to parent directory):",
    "../"
  );
  if (promptUrl) {
    localStorage.setItem("luxore_portfolio_url", promptUrl);
    window.location.href = promptUrl;
  }
}

function injectFloatingPortfolioButton() {
  if (document.querySelector(".floating-portfolio-pill")) return;

  const pill = document.createElement("a");
  pill.href = "#";
  pill.className = "floating-portfolio-pill";
  pill.title = "Return to Developer Portfolio";
  pill.setAttribute("aria-label", "Back to Portfolio");
  pill.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
    </svg>
    <span>← Back to Portfolio</span>
  `;

  document.body.appendChild(pill);
}

// Auto initialize on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioNavigation);
} else {
  initPortfolioNavigation();
}
