/* Trust Wallet mobile compatibility wrapper.
   The original portal logic is preserved unchanged in app-base.js.
   Mobile Trust Wallet is opened directly on BNB Smart Chain.
*/

const PORTAL_CONTRACT_ADDRESS = "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

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

/* Trust Wallet BNB Smart Chain mobile deep-link. */
function openTrustWalletConnect() {
  window.trustWalletUserInitiated = true;

  setTrustWalletPending();

  const currentUrl = window.location.href;

  const trustWalletUrl =
    "https://link.trustwallet.com/open_url" +
    "?coin_id=20000714" +
    "&url=" +
    encodeURIComponent(currentUrl);

  console.log("Opening Trust Wallet on BNB Smart Chain:", trustWalletUrl);

  window.location.assign(trustWalletUrl);
}

async function openTrustWalletIOS() {
  return openTrustWalletConnect();
}

async function openTrustWalletAndroid() {
  return openTrustWalletConnect();
}

/* Keep the contract address and copy button visible. */
function showContractAddress() {
  const address = document.getElementById("contractAddress");
  const copy = document.getElementById("copyContract");

  if (address) {
    address.textContent = PORTAL_CONTRACT_ADDRESS;
    address.style.display = "";
  }

  if (copy) {
    copy.style.display = "";
  }

  /* Keep the contract-address label visible. */
  const card = document.querySelector(".contract-card");
  if (card) {
    const label = card.querySelector(".card-label");
    const heading = card.querySelector("h3");

    if (label) {
      label.style.display = "block";
    }

    if (heading) {
      heading.textContent = "Contract address";
    }
  }
}

(function loadOriginalPortal() {
  const script = document.createElement("script");
  script.src = "app-base.js";
  script.async = false;

  script.onload = function () {
    /* Preserve the original portal and replace only the mobile wallet opener. */
    window.openTrustWalletConnect = openTrustWalletConnect;
    window.openTrustWalletIOS = openTrustWalletIOS;
    window.openTrustWalletAndroid = openTrustWalletAndroid;

    /* Keep the contract address visible without changing other sections. */
    window.setHeaderContractVisibility = function () {
      showContractAddress();
    };

    showContractAddress();

    if (
      document.readyState !== "loading" &&
      typeof window.startPortal === "function"
    ) {
      window.startPortal();
      showContractAddress();
    }
  };

  script.onerror = function () {
    console.error("Unable to load the original portal JavaScript.");
  };

  document.head.appendChild(script);
})();


/* Light / dark mode toggle. Wallet functionality is unchanged. */
(function setupThemeToggle() {
  const LIGHT_STYLE_ID = "btc-light-theme-overrides";

  const lightOverrides = `
    body.light .wallet-picker,
    body.light .connected-wallet-panel {
      background: #ffffff !important;
      color: #111827 !important;
    }

    body.light .wallet-picker h2,
    body.light .connected-wallet-head strong {
      color: #111827 !important;
    }

    body.light .wallet-picker p,
    body.light .connected-wallet-row span {
      color: #64748b !important;
    }

    body.light .wallet-close,
    body.light .connected-wallet-actions button,
    body.light .wallet-option {
      background: #f8fafc !important;
      color: #111827 !important;
    }

    body.light .wallet-option small,
    body.light .wallet-unavailable {
      color: #64748b !important;
    }

    body.light .wallet-option strong,
    body.light .connected-wallet-row code {
      color: #111827 !important;
    }

    body.light .activity-row {
      background: #ffffff !important;
      border-color: rgba(17,24,39,.10) !important;
    }
  `;

  function ensureLightOverrides() {
    let style = document.getElementById(LIGHT_STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = LIGHT_STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = lightOverrides;
  }

  function applyTheme(mode) {
    const isLight = mode === "light";

    document.body.classList.toggle("light", isLight);
    ensureLightOverrides();

    const button = document.getElementById("themeToggle");

    if (button) {
      button.textContent = isLight ? "☀" : "☾";
      button.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
      );
      button.setAttribute(
        "title",
        isLight ? "Switch to dark mode" : "Switch to light mode"
      );
    }
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem("btcPortalTheme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  }

  function saveTheme(mode) {
    try {
      localStorage.setItem("btcPortalTheme", mode);
    } catch {}
  }

  function initialize() {
    applyTheme(getSavedTheme());

    /*
      app-base.js injects its own portal styles during startup.
      Re-apply the selected theme after those styles are injected.
    */
    setTimeout(() => applyTheme(getSavedTheme()), 0);
    setTimeout(() => applyTheme(getSavedTheme()), 500);
  }

  /*
    Use event delegation so the toggle continues working even if
    another portal script updates the header.
  */
  document.addEventListener("click", function (event) {
    const button = event.target.closest("#themeToggle");
    if (!button) return;

    const next =
      document.body.classList.contains("light") ? "dark" : "light";

    saveTheme(next);
    applyTheme(next);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  window.addEventListener("load", () => {
    applyTheme(getSavedTheme());
  });
})();

