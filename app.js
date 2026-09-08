(() => {
  "use strict";

  /* =========================================================
     BTC / BNB ALLOCATION PORTAL
     ========================================================= */

  const CONTRACT_ADDRESS =
    "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

  const BSC_CHAIN_ID = 56;
  const BSC_CHAIN_HEX = "0x38";

  const BSC_EXPLORER = "https://bscscan.com";

  const FALLBACK_MIN_BNB = 5;
  const FALLBACK_MAX_BNB = 1000;
  const FALLBACK_BONUS = 11;
  const FALLBACK_DECIMALS = 18;

  const RPC_URLS = [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
    "https://bsc.publicnode.com"
  ];

  const PRICE_ENDPOINTS = {
    BTC: [
      "https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BTCUSDT",
      "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
    ],

    BNB: [
      "https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BNBUSDT",
      "https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT"
    ]
  };

  const ABI = [
    "function buyBTC() payable",
    "function calculateBTC(uint256) view returns (uint256 baseAmount, uint256 bonusAmount, uint256 totalAmount)",
    "function availableBTC() view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function referenceMaximumBNB() view returns (uint256)",
    "function referenceMinimumBNB() view returns (uint256)",
    "function BONUS_PERCENT() view returns (uint256)",
    "event BTCPurchased(address indexed buyer,uint256 bnbAmount,uint256 baseBTCAmount,uint256 bonusBTCAmount,uint256 totalBTCAmount)"
  ];

  /* =========================================================
     STATE
     ========================================================= */

  let readProvider = null;
  let readContract = null;

  let walletProvider = null;
  let walletSigner = null;
  let walletContract = null;

  let connectedAddress = null;

  let tokenDecimals = FALLBACK_DECIMALS;
  let minimumBNB = FALLBACK_MIN_BNB;
  let maximumBNB = FALLBACK_MAX_BNB;
  let bonusPercent = FALLBACK_BONUS;

  let discoveredProviders = [];

  /* =========================================================
     DOM
     ========================================================= */

  const $ = (id) => document.getElementById(id);

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  }

  function formatNumber(value, decimals = 2) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function shortAddress(address) {
    if (!address) {
      return "Wallet";
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatBTC(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0 BTC";
    }

    return `${number.toLocaleString("en-US", {
      maximumFractionDigits: number >= 1 ? 4 : 8
    })} BTC`;
  }

  /* =========================================================
     BSC READ PROVIDER
     ========================================================= */

  function createReadProvider() {
    for (const rpc of RPC_URLS) {
      try {
        return new ethers.JsonRpcProvider(rpc, {
          name: "bnb-smart-chain",
          chainId: BSC_CHAIN_ID
        });
      } catch (error) {
        console.warn("RPC unavailable:", rpc);
      }
    }

    return null;
  }

  async function getReadContract() {
    if (!readProvider) {
      readProvider = createReadProvider();
    }

    if (!readProvider) {
      return null;
    }

    if (!readContract) {
      readContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        readProvider
      );
    }

    return readContract;
  }

  /* =========================================================
     CONTRACT SETTINGS
     ========================================================= */

  async function loadContractSettings() {
    const contract = await getReadContract();

    if (!contract) {
      updateLimits();
      return;
    }

    const results = await Promise.allSettled([
      contract.decimals(),
      contract.referenceMinimumBNB(),
      contract.referenceMaximumBNB(),
      contract.BONUS_PERCENT()
    ]);

    if (results[0].status === "fulfilled") {
      tokenDecimals = Number(results[0].value);
    }

    if (results[1].status === "fulfilled") {
      try {
        minimumBNB = Number(
          ethers.formatEther(results[1].value)
        );
      } catch {
        minimumBNB = FALLBACK_MIN_BNB;
      }
    }

    if (results[2].status === "fulfilled") {
      try {
        maximumBNB = Number(
          ethers.formatEther(results[2].value)
        );
      } catch {
        maximumBNB = FALLBACK_MAX_BNB;
      }
    }

    if (results[3].status === "fulfilled") {
      bonusPercent = Number(results[3].value);
    }

    updateLimits();
  }

  function updateLimits() {
    const input = $("bnbAmount");

    if (input) {
      input.min = String(minimumBNB);
      input.max = String(maximumBNB);
      input.step = "0.01";
    }

    setText(
      "minimumStat",
      `${formatNumber(minimumBNB, 0)} BNB`
    );

    setText(
      "maximumStat",
      `${formatNumber(maximumBNB, 0)} BNB`
    );

    setText(
      "bonusStat",
      `${formatNumber(bonusPercent, 0)}%`
    );

    setText(
      "bonusBadge",
      `+${formatNumber(bonusPercent, 0)}% BONUS`
    );
  }

  /* =========================================================
     CALCULATOR
     ========================================================= */

  async function calculateBTCAmount() {
    const input = $("bnbAmount");
    const message = $("calculatorMessage");

    if (!input) {
      return;
    }

    const raw = input.value.trim();

    if (!raw) {
      setText("baseBTC", "0 BTC");
      setText("bonusBTC", "0 BTC");
      setText("totalBTC", "0 BTC");

      if (message) {
        message.textContent =
          "Enter a BNB amount to calculate.";
      }

      return;
    }

    const amount = Number(raw);

    if (!Number.isFinite(amount) || amount <= 0) {
      if (message) {
        message.textContent =
          "Enter a valid BNB amount.";
      }

      return;
    }

    if (amount < minimumBNB) {
      setText("baseBTC", "0 BTC");
      setText("bonusBTC", "0 BTC");
      setText("totalBTC", "0 BTC");

      if (message) {
        message.textContent =
          `Minimum purchase is ${formatNumber(
            minimumBNB,
            0
          )} BNB.`;
      }

      return;
    }

    if (amount > maximumBNB) {
      setText("baseBTC", "0 BTC");
      setText("bonusBTC", "0 BTC");
      setText("totalBTC", "0 BTC");

      if (message) {
        message.textContent =
          `Maximum purchase is ${formatNumber(
            maximumBNB,
            0
          )} BNB.`;
      }

      return;
    }

    const contract = await getReadContract();

    if (!contract) {
      if (message) {
        message.textContent =
          "Unable to connect to BNB Smart Chain.";
      }

      return;
    }

    try {
      const bnbWei = ethers.parseEther(raw);

      const result =
        await contract.calculateBTC(bnbWei);

      const base =
        ethers.formatUnits(
          result[0],
          tokenDecimals
        );

      const bonus =
        ethers.formatUnits(
          result[1],
          tokenDecimals
        );

      const total =
        ethers.formatUnits(
          result[2],
          tokenDecimals
        );

      setText(
        "baseBTC",
        formatBTC(base)
      );

      setText(
        "bonusBTC",
        formatBTC(bonus)
      );

      setText(
        "totalBTC",
        formatBTC(total)
      );

      if (message) {
        message.textContent =
          `Includes a ${bonusPercent}% bonus.`;
      }
    } catch (error) {
      console.error(
        "Calculator error:",
        error
      );

      if (message) {
        message.textContent =
          "Unable to calculate the BTC amount.";
      }
    }
  }

  /* =========================================================
     LIVE BTC / BNB PRICES
     ========================================================= */

  async function fetchPrice(endpoints) {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          cache: "no-store"
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();

        if (data && data.lastPrice) {
          return data;
        }
      } catch {
        // Try next endpoint.
      }
    }

    return null;
  }

  async function updateBTCPrice() {
    const data =
      await fetchPrice(PRICE_ENDPOINTS.BTC);

    if (!data) {
      setText("btcPrice", "—");
      setText(
        "btcChange",
        "Live price unavailable"
      );
      return;
    }

    const price =
      Number(data.lastPrice);

    const change =
      Number(data.priceChangePercent);

    setText(
      "btcPrice",
      `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    );

    setText(
      "btcChange",
      `${change >= 0 ? "+" : ""}${change.toFixed(2)}% today`
    );
  }

  async function updateBNBPrice() {
    const data =
      await fetchPrice(PRICE_ENDPOINTS.BNB);

    if (!data) {
      setText("bnbPrice", "—");
      setText(
        "bnbChange",
        "Live price unavailable"
      );
      return;
    }

    const price =
      Number(data.lastPrice);

    const change =
      Number(data.priceChangePercent);

    setText(
      "bnbPrice",
      `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    );

    setText(
      "bnbChange",
      `${change >= 0 ? "+" : ""}${change.toFixed(2)}% today`
    );
  }

  async function updateMarketPrices() {
    await Promise.allSettled([
      updateBTCPrice(),
      updateBNBPrice()
    ]);
  }

  /* =========================================================
     ACTIVITY SECTION
     
     Visual activity rows matching the ATOM-style design.
     
     These are SAMPLE / ILLUSTRATIVE entries and are not
     represented as confirmed blockchain transactions.
     ========================================================= */

  const SAMPLE_ACTIVITY = [
    {
      amount: "2,100 BTC",
      address: "0xA73C...91B4"
    },
    {
      amount: "580 BTC",
      address: "0x31F7...E204"
    },
    {
      amount: "1,250 BTC",
      address: "0x8C42...A91D"
    }
  ];

  function injectActivityStyles() {
    if (
      document.getElementById(
        "btcActivityStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "btcActivityStyles";

    style.textContent = `
      #activityFeed {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: hidden;
      }

      #activityFeed .activity-item {
        display: flex;
        align-items: center;
        gap: 18px;
        width: 100%;
        min-height: 88px;
        padding: 18px 20px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255,255,255,.08);
        animation: btcActivityEnter .55s ease both;
      }

      #activityFeed .activity-item:last-child {
        border-bottom: none;
      }

      #activityFeed .activity-icon {
        width: 48px;
        height: 48px;
        min-width: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(67,95,180,.18);
        border: 1px solid rgba(124,140,255,.16);
        color: #8ea0ff;
        font-size: 24px;
        font-weight: 700;
      }

      #activityFeed .activity-details {
        min-width: 0;
      }

      #activityFeed .activity-amount {
        color: #f4f7fb;
        font-size: 17px;
        line-height: 1.25;
        font-weight: 700;
        letter-spacing: .01em;
      }

      #activityFeed .activity-address {
        margin-top: 5px;
        color: #8e9bb0;
        font-size: 13px;
        line-height: 1.25;
        font-family:
          ui-monospace,
          SFMono-Regular,
          Menlo,
          Monaco,
          Consolas,
          monospace;
      }

      #activityFeed .activity-label {
        display: inline-flex;
        align-items: center;
        margin-left: 8px;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(255,255,255,.055);
        color: #8e9bb0;
        font-size: 9px;
        line-height: 1;
        letter-spacing: .08em;
        text-transform: uppercase;
        vertical-align: middle;
      }

      @keyframes btcActivityEnter {
        0% {
          opacity: 0;
          transform: translateY(12px);
        }

        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 600px) {
        #activityFeed .activity-item {
          min-height: 78px;
          padding: 15px 14px;
          gap: 13px;
        }

        #activityFeed .activity-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 12px;
          font-size: 20px;
        }

        #activityFeed .activity-amount {
          font-size: 15px;
        }

        #activityFeed .activity-address {
          font-size: 11px;
        }

        #activityFeed .activity-label {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function renderActivity() {
    const feed =
      $("activityFeed");

    if (!feed) {
      return;
    }

    injectActivityStyles();

    feed.innerHTML =
      SAMPLE_ACTIVITY.map(
        (item, index) => `
          <div
            class="activity-item"
            style="animation-delay:${index * 120}ms"
          >
            <div class="activity-icon">
              <span>↗</span>
            </div>

            <div class="activity-details">
              <div class="activity-amount">
                ${item.amount}
                <span class="activity-label">
                  Sample
                </span>
              </div>

              <div class="activity-address">
                ${item.address}
              </div>
            </div>
          </div>
        `
      ).join("");
  }

/* =========================================================
   WALLET DEFINITIONS
   ========================================================= */

const wallets = [
  {
    key: "metamask",
    name: "MetaMask",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/metamask.svg"
  },
  {
    key: "trustwallet",
    name: "Trust Wallet",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/trustwallet.svg"
  },
  {
    key: "binance",
    name: "Binance Wallet",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/binance.svg"
  },
  {
    key: "okx",
    name: "OKX Wallet",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/okx.svg"
  },
  {
    key: "bitget",
    name: "Bitget Wallet",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bitget.svg"
  },
  {
    key: "safepal",
    name: "SafePal",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/safepal.svg"
  },
  {
    key: "rabby",
    name: "Rabby",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/rabby.svg"
  }
];

  /* =========================================================
     EIP-6963 WALLET DISCOVERY
     ========================================================= */

  function discoverProviders() {
    discoveredProviders = [];

    if (!window.dispatchEvent) {
      return;
    }

    const handler =
      (event) => {
        if (
          event.detail &&
          event.detail.provider
        ) {
          discoveredProviders.push(
            event.detail
          );
        }
      };

    window.addEventListener(
      "eip6963:announceProvider",
      handler
    );

    window.dispatchEvent(
      new Event(
        "eip6963:requestProvider"
      )
    );

    setTimeout(() => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handler
      );
    }, 500);
  }

  function findProvider(walletKey) {
    const found =
      discoveredProviders.find(
        (entry) => {
          const info =
            entry.info || {};

          const name =
            `${info.name || ""} ${
              info.rdns || ""
            }`.toLowerCase();

          if (
            walletKey ===
            "metamask"
          ) {
            return name.includes(
              "metamask"
            );
          }

          if (
            walletKey ===
            "trustwallet"
          ) {
            return name.includes(
              "trust"
            );
          }

          if (
            walletKey ===
            "binance"
          ) {
            return name.includes(
              "binance"
            );
          }

          if (
            walletKey ===
            "okx"
          ) {
            return name.includes(
              "okx"
            );
          }

          if (
            walletKey ===
            "bitget"
          ) {
            return name.includes(
              "bitget"
            );
          }

          if (
            walletKey ===
            "safepal"
          ) {
            return name.includes(
              "safepal"
            );
          }

          if (
            walletKey ===
            "rabby"
          ) {
            return name.includes(
              "rabby"
            );
          }

          return false;
        }
      );

    return (
      found?.provider ||
      window.ethereum ||
      null
    );
  }

 /* =========================================================
   WALLET MODAL
   ========================================================= */

function createWalletModal() {
  let modal = document.getElementById("walletModal");

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");
  modal.id = "walletModal";

  modal.innerHTML = `
    <div class="wallet-modal-backdrop"></div>

    <div class="wallet-modal">

      <div class="wallet-modal-header">
        <div>
          <div class="wallet-modal-title">
            Connect wallet
          </div>

          <div class="wallet-modal-subtitle">
            Choose your preferred wallet for BNB Smart Chain.
          </div>
        </div>

        <button
          type="button"
          class="wallet-modal-close"
          id="walletModalClose"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div
        class="wallet-list"
        id="walletList"
      ></div>

    </div>
  `;

  document.body.appendChild(modal);

  const walletList =
    document.getElementById("walletList");

  wallets.forEach((wallet) => {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "wallet-option";

    button.innerHTML = `
      <span class="wallet-logo-box">
        <img
          src="${wallet.icon}"
          alt="${wallet.name}"
          class="wallet-logo"
          width="42"
          height="42"
        >
      </span>

      <span class="wallet-name">
        ${wallet.name}
        <small>BNB Smart Chain</small>
      </span>

      <span class="wallet-arrow">→</span>
    `;

    button.addEventListener("click", () => {
      connectSelectedWallet(wallet.key);
    });

    walletList.appendChild(button);
  });

  const closeButton =
    document.getElementById("walletModalClose");

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeWalletModal
    );
  }

  const backdrop =
    modal.querySelector(
      ".wallet-modal-backdrop"
    );

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeWalletModal
    );
  }

  return modal;
}


/* =========================================================
   OPEN WALLET MODAL
   ========================================================= */

function openWalletModal() {
  const modal =
    createWalletModal();

  modal.classList.add("open");

  document.body.classList.add(
    "wallet-modal-open"
  );
}


/* =========================================================
   CLOSE WALLET MODAL
   ========================================================= */

function closeWalletModal() {
  const modal =
    document.getElementById(
      "walletModal"
    );

  if (modal) {
    modal.classList.remove("open");
  }

  document.body.classList.remove(
    "wallet-modal-open"
  );
}

  /* =========================================================
     BSC NETWORK
     ========================================================= */

  async function ensureBSC(provider) {
    try {
      const chainId =
        await provider.request({
          method:
            "eth_chainId"
        });

      if (
        chainId?.toLowerCase() ===
        BSC_CHAIN_HEX
      ) {
        return true;
      }

      try {
        await provider.request({
          method:
            "wallet_switchEthereumChain",
          params: [
            {
              chainId:
                BSC_CHAIN_HEX
            }
          ]
        });

        return true;
      } catch (error) {
        if (
          error?.code ===
          4902
        ) {
          await provider.request({
            method:
              "wallet_addEthereumChain",
            params: [
              {
                chainId:
                  BSC_CHAIN_HEX,

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
                  BSC_EXPLORER
                ]
              }
            ]
          });

          return true;
        }

        throw error;
      }
    } catch (error) {
      console.error(
        "BSC network error:",
        error
      );

      return false;
    }
  }

  /* =========================================================
     CONNECT WALLET
     ========================================================= */

  async function connectSelectedWallet(
    walletKey
  ) {
    closeWalletModal();

    const provider =
      findProvider(
        walletKey
      );

    if (!provider) {
      alert(
        "No compatible wallet was detected."
      );

      return;
    }

    try {
      const correctNetwork =
        await ensureBSC(
          provider
        );

      if (!correctNetwork) {
        return;
      }

      const accounts =
        await provider.request({
          method:
            "eth_requestAccounts"
        });

      if (
        !accounts ||
        !accounts.length
      ) {
        throw new Error(
          "No wallet account returned."
        );
      }

      connectedAddress =
        accounts[0];

      walletProvider =
        new ethers.BrowserProvider(
          provider
        );

      walletSigner =
        await walletProvider.getSigner();

      walletContract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          ABI,
          walletSigner
        );

      updateWalletButton();

      if (
        typeof provider.on ===
        "function"
      ) {
        provider.on(
          "accountsChanged",
          handleAccountsChanged
        );

        provider.on(
          "chainChanged",
          handleChainChanged
        );
      }
    } catch (error) {
      console.error(
        "Wallet connection error:",
        error
      );

      alert(
        error?.message ||
          "Unable to connect wallet."
      );
    }
  }

  function updateWalletButton() {
    const button =
      $("connectWallet");

    if (!button) {
      return;
    }

    button.textContent =
      connectedAddress
        ? shortAddress(
            connectedAddress
          )
        : "Connect Wallet";
  }

  function handleAccountsChanged(
    accounts
  ) {
    connectedAddress =
      accounts?.[0] || null;

    if (!connectedAddress) {
      walletProvider = null;
      walletSigner = null;
      walletContract = null;
    }

    updateWalletButton();
  }

  function handleChainChanged() {
    connectedAddress = null;
    walletProvider = null;
    walletSigner = null;
    walletContract = null;

    updateWalletButton();
  }

  /* =========================================================
     BUY BTC
     ========================================================= */

  async function buyBTC() {
    const input =
      $("bnbAmount");

    if (!input) {
      return;
    }

    const raw =
      input.value.trim();

    const amount =
      Number(raw);

    if (
      !raw ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert(
        "Enter a valid BNB amount."
      );

      return;
    }

    if (amount < minimumBNB) {
      alert(
        `Minimum purchase is ${minimumBNB} BNB.`
      );

      return;
    }

    if (amount > maximumBNB) {
      alert(
        `Maximum purchase is ${maximumBNB} BNB.`
      );

      return;
    }

    if (
      !walletContract ||
      !connectedAddress
    ) {
      openWalletModal();
      return;
    }

    const button =
      $("buyBTCButton");

    try {
      if (button) {
        button.disabled = true;
        button.textContent =
          "Confirm in wallet...";
      }

      const transaction =
        await walletContract.buyBTC({
          value:
            ethers.parseEther(
              raw
            )
        });

      if (button) {
        button.textContent =
          "Waiting for confirmation...";
      }

      await transaction.wait();

      if (button) {
        button.disabled = false;
        button.textContent =
          "Buy BTC with BNB";
      }

      alert(
        "Purchase confirmed successfully."
      );
    } catch (error) {
      console.error(
        "Purchase error:",
        error
      );

      if (button) {
        button.disabled = false;
        button.textContent =
          "Buy BTC with BNB";
      }

      alert(
        error?.shortMessage ||
          error?.message ||
          "Transaction failed."
      );
    }
  }

  /* =========================================================
     COPY CONTRACT
     ========================================================= */

  async function copyContractAddress() {
    try {
      await navigator.clipboard.writeText(
        CONTRACT_ADDRESS
      );

      const button =
        $("copyContract");

      if (button) {
        const oldText =
          button.textContent;

        button.textContent =
          "Copied";

        setTimeout(() => {
          button.textContent =
            oldText;
        }, 1500);
      }
    } catch {
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        CONTRACT_ADDRESS;

      document.body.appendChild(
        textarea
      );

      textarea.select();

      document.execCommand(
        "copy"
      );

      textarea.remove();
    }
  }

  /* =========================================================
     EVENT LISTENERS
     ========================================================= */

  function setupEvents() {
    $("connectWallet")
      ?.addEventListener(
        "click",
        openWalletModal
      );

    $("calculateButton")
      ?.addEventListener(
        "click",
        calculateBTCAmount
      );

    $("bnbAmount")
      ?.addEventListener(
        "input",
        () => {
          const input =
            $("bnbAmount");

          clearTimeout(
            input._timer
          );

          input._timer =
            setTimeout(
              calculateBTCAmount,
              250
            );
        }
      );

    $("buyBTCButton")
      ?.addEventListener(
        "click",
        buyBTC
      );

    $("copyContract")
      ?.addEventListener(
        "click",
        copyContractAddress
      );
  }

  /* =========================================================
     INITIALIZE
     ========================================================= */

  async function initialize() {
    if (
      typeof ethers ===
      "undefined"
    ) {
      console.error(
        "Ethers.js is not loaded."
      );

      return;
    }

    /*
     Put contract address into the HTML.
    */

    setText(
      "contractAddress",
      CONTRACT_ADDRESS
    );

    /*
     Set up buttons.
    */

    setupEvents();

    /*
     Load contract settings.
    */

    await loadContractSettings();

    /*
     Load live BTC and BNB prices.
    */

    await updateMarketPrices();

    /*
     IMPORTANT:
     Render the Activity section
     immediately.
    */

    renderActivity();

    /*
     Refresh market prices every 30 seconds.
    */

    setInterval(
      updateMarketPrices,
      30000
    );
  }

  /* =========================================================
     START
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );
  } else {
    initialize();
  }

})();
