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

/*
  Trust Wallet identifies BNB Smart Chain with the UAI/coin id
  20000714 for its mobile DApp deep-link route.
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

/*
  Keep the configured contract address visible in its contract section.
  The original app hides these elements until a wallet is connected;
  this override changes only that visibility behavior.
*/
function showConfiguredContractAddress() {
  const address = document.getElementById("contractAddress");
  const copy = document.getElementById("copyContract");

  if (address) {
    address.textContent = PORTAL_CONTRACT_ADDRESS;
    address.style.display = "";
  }

  if (copy) {
    copy.style.display = "";
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

    /* Override only the contract-section visibility behavior. */
    window.setHeaderContractVisibility = function () {
      showConfiguredContractAddress();
    };

    showConfiguredContractAddress();

    if (
      document.readyState !== "loading" &&
      typeof window.startPortal === "function"
    ) {
      window.startPortal();
      showConfiguredContractAddress();
    }
  };

  script.onerror = function () {
    console.error("Unable to load the original portal JavaScript.");
  };

  document.head.appendChild(script);
})();
