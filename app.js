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
  function applyTheme(mode) {
    document.body.classList.toggle("light", mode === "light");

    const button = document.getElementById("themeToggle");
    if (button) {
      button.textContent = mode === "light" ? "☀" : "☾";
      button.setAttribute(
        "aria-label",
        mode === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
      button.setAttribute(
        "title",
        mode === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
    }
  }

  function initThemeToggle() {
    const saved = localStorage.getItem("btcPortalTheme");
    applyTheme(saved === "light" ? "light" : "dark");

    const button = document.getElementById("themeToggle");
    if (!button || button.dataset.themeReady === "true") return;

    button.dataset.themeReady = "true";

    button.addEventListener("click", function () {
      const next =
        document.body.classList.contains("light") ? "dark" : "light";

      localStorage.setItem("btcPortalTheme", next);
      applyTheme(next);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
  } else {
    initThemeToggle();
  }
})();

