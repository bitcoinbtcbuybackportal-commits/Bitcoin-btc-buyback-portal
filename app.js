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
  Trust Wallet identifies BNB Smart Chain with the UAI/coin id
  20000714 for its mobile DApp deep-link route.

  The public deep-link documentation describes coin_id as the
  network's SLIP-44-style coin identifier. BNB Smart Chain's
  Trust Wallet asset identifier is c20000714.
*/
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

(function loadOriginalPortal() {
  const script = document.createElement("script");
  script.src = "app-base.js";
  script.async = false;

  script.onload = function () {
    /*
      app-base.js contains the complete original portal.
      Replace only the mobile Trust Wallet opener after the
      original script has loaded.
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
