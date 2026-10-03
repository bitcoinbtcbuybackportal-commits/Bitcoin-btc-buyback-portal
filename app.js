/* Trust Wallet compatibility wrapper.
   The original portal logic is preserved unchanged in app-base.js.
*/

function setTrustWalletPending() {
  const button = document.getElementById("connectWallet");
  if (!button) return;

  button.dataset.previousText = button.textContent || "Connect Wallet";
  button.setAttribute("aria-busy", "true");
  button.textContent = "Opening Trust Wallet...";
}

function clearTrustWalletPending() {
  const button = document.getElementById("connectWallet");
  if (!button) return;

  button.removeAttribute("aria-busy");

  if (button.textContent === "Opening Trust Wallet...") {
    button.textContent = button.dataset.previousText || "Connect Wallet";
  }

  delete button.dataset.previousText;
}

(function loadOriginalPortal() {
  const script = document.createElement("script");
  script.src = "app-base.js";
  script.async = false;

  script.onload = function () {
    if (document.readyState !== "loading" && typeof window.startPortal === "function") {
      window.startPortal();
    }
  };

  script.onerror = function () {
    console.error("Unable to load the original portal JavaScript.");
  };

  document.head.appendChild(script);
})();
