/* =========================================================
   REPLACE THE CURRENT WALLET CONNECTION SECTION
   WITH THIS
   ========================================================= */

let provider = null;
let signer = null;
let connectedAddress = null;

const WALLET_OPTIONS = [
  {
    name: "MetaMask",
    icon: "🦊"
  },
  {
    name: "Trust Wallet",
    icon: "🛡️"
  },
  {
    name: "Binance Wallet",
    icon: "🟡"
  },
  {
    name: "OKX Wallet",
    icon: "⬛"
  },
  {
    name: "Bitget Wallet",
    icon: "🔵"
  },
  {
    name: "SafePal",
    icon: "🟢"
  },
  {
    name: "Coinbase Wallet",
    icon: "🔷"
  },
  {
    name: "Rabby Wallet",
    icon: "🐰"
  }
];

/* ---------------------------------------------------------
   WALLET SELECTOR
   --------------------------------------------------------- */

function createWalletSelector() {
  if (document.getElementById("walletSelector")) {
    return;
  }

  const overlay = document.createElement("div");

  overlay.id = "walletSelector";

  overlay.innerHTML = `
    <div class="wallet-modal">

      <div class="wallet-modal-header">
        <div>
          <small>CONNECT WALLET</small>
          <h3>Choose your wallet</h3>
          <p>
            Connect your preferred BSC-compatible wallet
            to participate.
          </p>
        </div>

        <button
          type="button"
          id="closeWalletSelector"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div class="wallet-options">

        ${WALLET_OPTIONS.map(
          (wallet, index) => `
            <button
              type="button"
              class="wallet-option"
              data-wallet-index="${index}"
            >
              <span class="wallet-option-icon">
                ${wallet.icon}
              </span>

              <span class="wallet-option-name">
                ${wallet.name}
              </span>

              <span class="wallet-option-arrow">
                →
              </span>
            </button>
          `
        ).join("")}

      </div>

      <div class="wallet-modal-footer">
        BNB Smart Chain • Chain ID 56
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  document
    .getElementById("closeWalletSelector")
    .addEventListener(
      "click",
      closeWalletSelector
    );

  overlay.addEventListener(
    "click",
    (event) => {
      if (event.target === overlay) {
        closeWalletSelector();
      }
    }
  );

  document
    .querySelectorAll(".wallet-option")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const index =
            Number(
              button.dataset.walletIndex
            );

          selectWallet(
            WALLET_OPTIONS[index]
          );
        }
      );
    });
}

/* ---------------------------------------------------------
   OPEN / CLOSE
   --------------------------------------------------------- */

function openWalletSelector() {
  createWalletSelector();

  const selector =
    document.getElementById(
      "walletSelector"
    );

  selector.classList.add("open");

  document.body.classList.add(
    "wallet-selector-open"
  );
}

function closeWalletSelector() {
  const selector =
    document.getElementById(
      "walletSelector"
    );

  if (!selector) return;

  selector.classList.remove("open");

  document.body.classList.remove(
    "wallet-selector-open"
  );
}

/* ---------------------------------------------------------
   WALLET SELECTION
   --------------------------------------------------------- */

async function selectWallet(wallet) {
  try {
    /*
      First use an injected provider when the selected
      wallet is already available inside the browser/wallet app.
    */

    if (!window.ethereum) {
      showToast(
        `${wallet.name} selected. Open this site inside your wallet app to connect.`
      );

      return;
    }

    provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    await provider.send(
      "eth_requestAccounts",
      []
    );

    const network =
      await provider.getNetwork();

    const chainId =
      Number(network.chainId);

    if (chainId !== 56) {
      try {
        await window.ethereum.request({
          method:
            "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0x38"
            }
          ]
        });
      } catch (switchError) {

        if (
          switchError.code === 4902
        ) {
          await window.ethereum.request({
            method:
              "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x38",
                chainName:
                  "BNB Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18
                },
                rpcUrls: [
                  "https://bsc-dataseed.binance.org/"
                ],
                blockExplorerUrls: [
                  "https://bscscan.com"
                ]
              }
            ]
          });
        } else {
          showToast(
            "Please switch to BNB Smart Chain."
          );

          return;
        }
      }

      provider =
        new ethers.BrowserProvider(
          window.ethereum
        );
    }

    signer =
      await provider.getSigner();

    connectedAddress =
      await signer.getAddress();

    updateWalletUI();

    closeWalletSelector();

    showToast(
      `${wallet.name} connected successfully.`
    );

  } catch (error) {
    console.error(
      "Wallet connection error:",
      error
    );

    showToast(
      "Wallet connection was cancelled."
    );
  }
}

/* ---------------------------------------------------------
   WALLET UI
   --------------------------------------------------------- */

function updateWalletUI() {
  const walletStatus =
    document.getElementById(
      "walletStatus"
    );

  const connectButton =
    document.getElementById(
      "connectWallet"
    );

  if (!walletStatus ||
      !connectButton) {
    return;
  }

  if (connectedAddress) {

    const shortened =
      connectedAddress.slice(0, 6) +
      "..." +
      connectedAddress.slice(-4);

    walletStatus.textContent =
      shortened;

    connectButton.textContent =
      shortened;

    connectButton.classList.add(
      "connected"
    );

  } else {

    walletStatus.textContent =
      "Not connected";

    connectButton.textContent =
      "Connect Wallet";

    connectButton.classList.remove(
      "connected"
    );
  }
}

/* ---------------------------------------------------------
   WALLET EVENTS
   --------------------------------------------------------- */

function setupWalletEvents() {

  if (!window.ethereum) {
    return;
  }

  window.ethereum.on(
    "accountsChanged",
    (accounts) => {

      if (!accounts.length) {

        connectedAddress = null;
        signer = null;
        provider = null;

        updateWalletUI();

        showToast(
          "Wallet disconnected."
        );

        return;
      }

      connectedAddress =
        accounts[0];

      updateWalletUI();
    }
  );

  window.ethereum.on(
    "chainChanged",
    () => {

      provider =
        new ethers.BrowserProvider(
          window.ethereum
        );

      if (connectedAddress) {
        updateWalletUI();
      }
    }
  );
}

/* ---------------------------------------------------------
   CONNECT BUTTON
   --------------------------------------------------------- */

const connectWalletButton =
  document.getElementById(
    "connectWallet"
  );

if (connectWalletButton) {

  connectWalletButton.onclick =
    () => {

      if (connectedAddress) {
        openWalletSelector();
        return;
      }

      openWalletSelector();
    };
}

/* ---------------------------------------------------------
   WALLET SELECTOR STYLES
   Added here so no CSS file change is required.
   --------------------------------------------------------- */

const walletSelectorStyle =
  document.createElement("style");

walletSelectorStyle.textContent = `

#walletSelector {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0,0,0,.72);
  backdrop-filter: blur(14px);
  opacity: 0;
  visibility: hidden;
  transition: opacity .25s ease,
              visibility .25s ease;
}

#walletSelector.open {
  opacity: 1;
  visibility: visible;
}

.wallet-modal {
  width: min(460px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 24px;
  background:
    linear-gradient(
      145deg,
      rgba(24,24,28,.98),
      rgba(10,10,12,.98)
    );
  box-shadow:
    0 30px 90px rgba(0,0,0,.55);
  transform: translateY(18px) scale(.97);
  transition: transform .25s ease;
}

#walletSelector.open .wallet-modal {
  transform: translateY(0) scale(1);
}

.wallet-modal-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.wallet-modal-header small {
  display: block;
  margin-bottom: 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  color: #ff9f1c;
}

.wallet-modal-header h3 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 24px;
}

.wallet-modal-header p {
  margin: 0;
  color: #9296a3;
  line-height: 1.5;
  font-size: 14px;
}

#closeWalletSelector {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 50%;
  background: rgba(255,255,255,.06);
  color: #fff;
  font-size: 25px;
  cursor: pointer;
}

.wallet-options {
  display: grid;
  gap: 10px;
}

.wallet-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 13px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px;
  background: rgba(255,255,255,.035);
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition:
    transform .18s ease,
    background .18s ease,
    border-color .18s ease;
}

.wallet-option:hover {
  transform: translateY(-2px);
  background: rgba(255,159,28,.08);
  border-color: rgba(255,159,28,.45);
}

.wallet-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-right: 13px;
  border-radius: 12px;
  background: rgba(255,255,255,.08);
  font-size: 22px;
}

.wallet-option-name {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
}

.wallet-option-arrow {
  color: #ff9f1c;
  font-size: 19px;
}

.wallet-modal-footer {
  margin-top: 18px;
  text-align: center;
  color: #676b76;
  font-size: 11px;
  letter-spacing: .08em;
}

body.wallet-selector-open {
  overflow: hidden;
}

`;

document.head.appendChild(
  walletSelectorStyle
);

/* ---------------------------------------------------------
   INITIALISE
   --------------------------------------------------------- */

createWalletSelector();
setupWalletEvents();
updateWalletUI();
