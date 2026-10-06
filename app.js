/* Trust Wallet mobile compatibility wrapper.
   The original portal logic is preserved unchanged in app-base.js.
   Mobile Trust Wallet is opened directly on BNB Smart Chain.
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

/*
  Trust Wallet's open_url route accepts a SLIP-0044 coin_id.
  714 is the registered BNB coin type, so Android/iOS are
  opened in the BNB Smart Chain context instead of Ethereum.
*/
function openTrustWalletConnect() {
  window.trustWalletUserInitiated = true;

  setTrustWalletPending();

  const currentUrl = window.location.href;

  const trustWalletUrl =
    "https://link.trustwallet.com/open_url" +
    "?coin_id=714" +
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

(function loadOriginalPortal() {
  const script = document.createElement("script");
  script.src = "app-base.js";
  script.async = false;

  script.onload = function () {
    /*
      app-base.js contains the complete original portal.
      Replace only its mobile Trust Wallet opener so the
      official Trust Wallet DApp route starts on BNB.
    */
    window.openTrustWalletConnect = openTrustWalletConnect;
    window.openTrustWalletIOS = openTrustWalletIOS;
    window.openTrustWalletAndroid = openTrustWalletAndroid;

    if (
      document.readyState !== "loading" &&
      typeof window.startPortal === "function"
    ) {
      window.startPortal();
    }
  };

  script.onerror = function () {
    console.error("Unable to load the original portal JavaScript.");
  };

  document.head.appendChild(script);
})();
