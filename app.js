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

  const RPC_URL =
    "https://bsc-dataseed.binance.org/";

  /* =========================================================
     CONTRACT ABI
     ========================================================= */

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
     WALLET DEFINITIONS
     ========================================================= */

  const WALLETS = [
    {
      key: "metamask",
      name: "MetaMask",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/metamask.svg"
    },
    {
      key: "trustwallet",
      name: "Trust Wallet",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/trustwallet.svg"
    },
    {
      key: "binance",
      name: "Binance Wallet",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/binance.svg"
    },
    {
      key: "okx",
      name: "OKX Wallet",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/okx.svg"
    },
    {
      key: "bitget",
      name: "Bitget Wallet",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bitget.svg"
    },
    {
      key: "safepal",
      name: "SafePal",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/safepal.svg"
    },
    {
      key: "rabby",
      name: "Rabby",
      icon:
        "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/rabby.svg"
    }
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

  let walletProviders = [];

  let tokenDecimals = FALLBACK_DECIMALS;
  let minimumBNB = FALLBACK_MIN_BNB;
  let maximumBNB = FALLBACK_MAX_BNB;
  let bonusPercent = FALLBACK_BONUS;

  /* =========================================================
     DOM HELPER
     ========================================================= */

  const $ = (id) =>
    document.getElementById(id);

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  }

  function shortAddress(address) {
    if (!address) {
      return "";
    }

    return (
      address.slice(0, 6) +
      "..." +
      address.slice(-4)
    );
  }

  function formatBTC(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0 BTC";
    }

    return (
      number.toLocaleString("en-US", {
        maximumFractionDigits:
          number >= 1 ? 4 : 8
      }) + " BTC"
    );
  }

  function formatNumber(
    value,
    decimals = 2
  ) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:
          decimals,
        maximumFractionDigits:
          decimals
      }
    );
  }

  /* =========================================================
     READ-ONLY BSC CONNECTION
     ========================================================= */

  function getReadProvider() {
    if (!readProvider) {
      readProvider =
        new ethers.JsonRpcProvider(
          RPC_URL,
          {
            name: "bnb-smart-chain",
            chainId: BSC_CHAIN_ID
          }
        );
    }

    return readProvider;
  }

  function getReadContract() {
    if (!readContract) {
      readContract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          ABI,
          getReadProvider()
        );
    }

    return readContract;
  }

  /* =========================================================
     CONTRACT SETTINGS
     ========================================================= */

  async function loadContractSettings() {
    const contract =
      getReadContract();

    const results =
      await Promise.allSettled([
        contract.decimals(),
        contract.referenceMinimumBNB(),
        contract.referenceMaximumBNB(),
        contract.BONUS_PERCENT()
      ]);

    if (
      results[0].status ===
      "fulfilled"
    ) {
      tokenDecimals =
        Number(results[0].value);
    }

    if (
      results[1].status ===
      "fulfilled"
    ) {
      try {
        minimumBNB =
          Number(
            ethers.formatEther(
              results[1].value
            )
          );
      } catch {}
    }

    if (
      results[2].status ===
      "fulfilled"
    ) {
      try {
        maximumBNB =
          Number(
            ethers.formatEther(
              results[2].value
            )
          );
      } catch {}
    }

    if (
      results[3].status ===
      "fulfilled"
    ) {
      bonusPercent =
        Number(results[3].value);
    }

    updateLimits();
  }

  function updateLimits() {
    const input =
      $("bnbAmount");

    if (input) {
      input.min =
        String(minimumBNB);

      input.max =
        String(maximumBNB);

      input.step = "0.01";
    }

    setText(
      "minimumStat",
      `${formatNumber(
        minimumBNB,
        0
      )} BNB`
    );

    setText(
      "maximumStat",
      `${formatNumber(
        maximumBNB,
        0
      )} BNB`
    );

    setText(
      "bonusStat",
      `${formatNumber(
        bonusPercent,
        0
      )}%`
    );

    setText(
      "bonusBadge",
      `+${formatNumber(
        bonusPercent,
        0
      )}% BONUS`
    );
  }

  /* =========================================================
     CALCULATOR
     ========================================================= */

  async function calculateBTCAmount() {
    const input =
      $("bnbAmount");

    const message =
      $("calculatorMessage");

    if (!input) {
      return;
    }

    const raw =
      input.value.trim();

    if (!raw) {
      setText(
        "baseBTC",
        "0 BTC"
      );

      setText(
        "bonusBTC",
        "0 BTC"
      );

      setText(
        "totalBTC",
        "0 BTC"
      );

      if (message) {
        message.textContent =
          "Enter a BNB amount to calculate.";
      }

      return;
    }

    const amount =
      Number(raw);

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      if (message) {
        message.textContent =
          "Enter a valid BNB amount.";
      }

      return;
    }

    if (
      amount < minimumBNB
    ) {
      setText(
        "baseBTC",
        "0 BTC"
      );

      setText(
        "bonusBTC",
        "0 BTC"
      );

      setText(
        "totalBTC",
        "0 BTC"
      );

      if (message) {
        message.textContent =
          `Minimum purchase is ${minimumBNB} BNB.`;
      }

      return;
    }

    if (
      amount > maximumBNB
    ) {
      setText(
        "baseBTC",
        "0 BTC"
      );

      setText(
        "bonusBTC",
        "0 BTC"
      );

      setText(
        "totalBTC",
        "0 BTC"
      );

      if (message) {
        message.textContent =
          `Maximum purchase is ${maximumBNB} BNB.`;
      }

      return;
    }

    try {
      const contract =
        getReadContract();

      const bnbWei =
        ethers.parseEther(
          raw
        );

      const result =
        await contract.calculateBTC(
          bnbWei
        );

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

  async function fetchPrice(
    symbol
  ) {
    const urls = [
      `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}USDT`,
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`
    ];

    for (const url of urls) {
      try {
        const response =
          await fetch(
            url,
            {
              cache: "no-store"
            }
          );

        if (!response.ok) {
          continue;
        }

        const data =
          await response.json();

        if (data?.lastPrice) {
          return data;
        }
      } catch {}
    }

    return null;
  }

  async function updateBTCPrice() {
    const data =
      await fetchPrice(
        "BTC"
      );

    if (!data) {
      setText(
        "btcPrice",
        "—"
      );

      setText(
        "btcChange",
        "Live price unavailable"
      );

      return;
    }

    const price =
      Number(data.lastPrice);

    const change =
      Number(
        data.priceChangePercent
      );

    setText(
      "btcPrice",
      `$${price.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )}`
    );

    setText(
      "btcChange",
      `${change >= 0 ? "+" : ""}${change.toFixed(2)}% today`
    );
  }

  async function updateBNBPrice() {
    const data =
      await fetchPrice(
        "BNB"
      );

    if (!data) {
      setText(
        "bnbPrice",
        "—"
      );

      setText(
        "bnbChange",
        "Live price unavailable"
      );

      return;
    }

    const price =
      Number(data.lastPrice);

    const change =
      Number(
        data.priceChangePercent
      );

    setText(
      "bnbPrice",
      `$${price.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )}`
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
     ACTIVITY
     ========================================================= */

  const RECENT_ACTIVITY = [
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

  function addActivityStyles() {
    if (
      $("btcActivityStyles")
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "btcActivityStyles";

    style.textContent = `
      #activityFeed {
        width: 100%;
        overflow: hidden;
      }

      #activityFeed .btc-activity-row {
        display: flex;
        align-items: center;
        gap: 18px;
        min-height: 88px;
        padding: 18px 20px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255,255,255,.08);
        animation: btcActivityIn .55s ease both;
      }

      #activityFeed .btc-activity-row:last-child {
        border-bottom: none;
      }

      #activityFeed .btc-activity-icon {
        width: 48px;
        height: 48px;
        min-width: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(67,95,180,.18);
        border: 1px solid rgba(124,140,255,.18);
        color: #8ea0ff;
        font-size: 24px;
        font-weight: 700;
      }

      #activityFeed .btc-activity-info {
        min-width: 0;
      }

      #activityFeed .btc-activity-amount {
        color: #f4f7fb;
        font-size: 17px;
        font-weight: 700;
        line-height: 1.25;
      }

      #activityFeed .btc-activity-address {
        margin-top: 5px;
        color: #8e9bb0;
        font-size: 13px;
        font-family: monospace;
      }

      #activityFeed .btc-sample-label {
        display: inline-block;
        margin-left: 7px;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(255,255,255,.06);
        color: #8e9bb0;
        font-size: 9px;
        letter-spacing: .08em;
        text-transform: uppercase;
        vertical-align: middle;
      }

      @keyframes btcActivityIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 600px) {
        #activityFeed .btc-activity-row {
          min-height: 78px;
          padding: 15px 14px;
          gap: 13px;
        }

        #activityFeed .btc-activity-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 12px;
          font-size: 20px;
        }

        #activityFeed .btc-activity-amount {
          font-size: 15px;
        }

        #activityFeed .btc-activity-address {
          font-size: 11px;
        }

        #activityFeed .btc-sample-label {
          display: none;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function renderActivity() {
    const feed =
      $("activityFeed");

    if (!feed) {
      return;
    }

    addActivityStyles();

    feed.innerHTML =
      SAMPLE_ACTIVITY.map(
        (item, index) => `
          <div
            class="btc-activity-row"
            style="animation-delay:${index * 120}ms"
          >

            <div class="btc-activity-icon">
              ↗
            </div>

            <div class="btc-activity-info">

              <div class="btc-activity-amount">
                ${item.amount}

                <span class="btc-sample-label">
                  Sample
                </span>
              </div>

              <div class="btc-activity-address">
                ${item.address}
              </div>

            </div>

          </div>
        `
      ).join("");
  }

  /* =========================================================
     EIP-6963 WALLET DISCOVERY
     ========================================================= */

  function discoverWallets() {
    walletProviders = [];

    if (
      !window.addEventListener
    ) {
      return;
    }

    const handler =
      (event) => {
        const detail =
          event.detail;

        if (
          !detail ||
          !detail.provider ||
          !detail.info
        ) {
          return;
        }

        const alreadyFound =
          walletProviders.some(
            (item) =>
              item.info?.rdns ===
              detail.info?.rdns
          );

        if (!alreadyFound) {
          walletProviders.push(
            detail
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
    }, 1000);
  }

  function getWalletProvider(
    wallet
  ) {
    const found =
      walletProviders.find(
        (entry) => {
          const name =
            String(
              entry.info?.name ||
                ""
            ).toLowerCase();

          const rdns =
            String(
              entry.info?.rdns ||
                ""
            ).toLowerCase();

          const text =
            `${name} ${rdns}`;

          switch (wallet.key) {
            case "metamask":
              return text.includes(
                "metamask"
              );

            case "trustwallet":
              return text.includes(
                "trust"
              );

            case "binance":
              return text.includes(
                "binance"
              );

            case "okx":
              return text.includes(
                "okx"
              );

            case "bitget":
              return text.includes(
                "bitget"
              );

            case "safepal":
              return text.includes(
                "safepal"
              );

            case "rabby":
              return text.includes(
                "rabby"
              );

            default:
              return false;
          }
        }
      );

    if (
      found?.provider
    ) {
      return found.provider;
    }

    /*
     Multiple injected providers.
    */

    if (
      window.ethereum?.providers &&
      Array.isArray(
        window.ethereum.providers
      )
    ) {
      const providers =
        window.ethereum.providers;

      for (const provider of providers) {
        if (
          wallet.key ===
            "metamask" &&
          provider.isMetaMask
        ) {
          return provider;
        }

        if (
          wallet.key ===
            "trustwallet" &&
          provider.isTrust
        ) {
          return provider;
        }

        if (
          wallet.key ===
            "binance" &&
          provider.isBinance
        ) {
          return provider;
        }

        if (
          wallet.key ===
            "okx" &&
          provider.isOkxWallet
        ) {
          return provider;
        }

        if (
          wallet.key ===
            "rabby" &&
          provider.isRabby
        ) {
          return provider;
        }
      }
    }

    /*
     Single injected wallet fallback.
    */

    if (
      window.ethereum &&
      !window.ethereum.providers
    ) {
      return window.ethereum;
    }

    return null;
  }

  /* =========================================================
     WALLET MODAL STYLES
     ========================================================= */

  function addWalletModalStyles() {
    if (
      $("btcWalletModalStyles")
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "btcWalletModalStyles";

    style.textContent = `
      #walletModalFinal {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(0,0,0,.72);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        opacity: 1;
        visibility: visible;
      }

      #walletModalFinal.hidden {
        display: none !important;
      }

      #walletModalFinal .wallet-picker {
        width: min(440px, 100%);
        max-height: min(720px, 90vh);
        overflow-y: auto;
        padding: 24px;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 24px;
        background: #0b101a;
        box-shadow:
          0 30px 90px rgba(0,0,0,.55),
          0 0 0 1px rgba(124,140,255,.04);
      }

      #walletModalFinal .wallet-picker-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 8px;
      }

      #walletModalFinal .wallet-picker h2 {
        margin: 0;
        color: #f4f7fb;
        font-size: 24px;
        font-weight: 800;
      }

      #walletModalFinal .wallet-picker > p {
        margin: 0 0 20px;
        color: #8e9bb0;
        font-size: 13px;
        line-height: 1.5;
      }

      #walletModalFinal .wallet-close {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 50%;
        background: rgba(255,255,255,.05);
        color: #f4f7fb;
        font-size: 28px;
        line-height: 1;
        cursor: pointer;
      }

      #walletModalFinal .wallet-option {
        width: 100%;
        min-height: 72px;
        margin-bottom: 10px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 13px;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 16px;
        background: rgba(255,255,255,.025);
        color: #f4f7fb;
        cursor: pointer;
        text-align: left;
        transition:
          transform .18s ease,
          border-color .18s ease,
          background .18s ease;
      }

      #walletModalFinal .wallet-option:hover {
        transform: translateY(-1px);
        border-color: rgba(124,140,255,.35);
        background: rgba(124,140,255,.08);
      }

      #walletModalFinal .wallet-logo-wrap {
        width: 46px;
        height: 46px;
        min-width: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        background: #f2f5f9;
        overflow: hidden;
      }

      #walletModalFinal .wallet-logo {
        width: 34px;
        height: 34px;
        object-fit: contain;
        display: block;
      }

      #walletModalFinal .wallet-name {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      #walletModalFinal .wallet-name strong {
        color: #f4f7fb;
        font-size: 15px;
        font-weight: 700;
      }

      #walletModalFinal .wallet-name small {
        color: #7f8da4;
        font-size: 11px;
      }

      #walletModalFinal .wallet-state {
        color: #8ea0ff;
        font-size: 11px;
        font-weight: 600;
      }

      @media (max-width: 600px) {
        #walletModalFinal {
          padding: 12px;
        }

        #walletModalFinal .wallet-picker {
          padding: 18px;
          border-radius: 20px;
        }

        #walletModalFinal .wallet-picker h2 {
          font-size: 21px;
        }

        #walletModalFinal .wallet-option {
          min-height: 66px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /* =========================================================
     CREATE WALLET MODAL
     ========================================================= */

  function createWalletModal() {
    addWalletModalStyles();

    let modal =
      $("walletModalFinal");

    if (modal) {
      return modal;
    }

    modal =
      document.createElement(
        "div"
      );

    modal.id =
      "walletModalFinal";

    modal.className =
      "hidden";

    modal.innerHTML = `
      <div class="wallet-picker">

        <div class="wallet-picker-head">

          <h2>
            Connect Wallet
          </h2>

          <button
            type="button"
            class="wallet-close"
            id="walletPickerClose"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        <p>
          Choose your preferred wallet for BNB Smart Chain.
        </p>

        <div id="walletOptions"></div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    const options =
      $("walletOptions");

    /*
     IMPORTANT:
     Always render all seven wallets.
     Installation is checked only after
     the user selects one.
    */

    WALLETS.forEach(
      (wallet) => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "wallet-option";

        button.innerHTML = `
          <span class="wallet-logo-wrap">
            <img
              src="${wallet.icon}"
              alt="${wallet.name} logo"
              class="wallet-logo"
              width="34"
              height="34"
            >
          </span>

          <span class="wallet-name">
            <strong>
              ${wallet.name}
            </strong>

            <small>
              BNB Smart Chain
            </small>
          </span>

          <span class="wallet-state">
            Select
          </span>
        `;

        button.addEventListener(
          "click",
          () => {
            connectSelectedWallet(
              wallet
            );
          }
        );

        options.appendChild(
          button
        );
      }
    );

    const close =
      $("walletPickerClose");

    if (close) {
      close.addEventListener(
        "click",
        closeWalletModal
      );
    }

    /*
     Clicking outside the box closes it.
    */

    modal.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          modal
        ) {
          closeWalletModal();
        }
      }
    );

    return modal;
  }

  /* =========================================================
     OPEN WALLET MODAL
     ========================================================= */

  function openWalletModal() {
    /*
     Discover installed wallets in the background.
     This does NOT control whether the seven
     wallet buttons appear.
    */

    discoverWallets();

    const modal =
      createWalletModal();

    modal.classList.remove(
      "hidden"
    );
  }

  /* =========================================================
     CLOSE WALLET MODAL
     ========================================================= */

  function closeWalletModal() {
    const modal =
      $("walletModalFinal");

    if (modal) {
      modal.classList.add(
        "hidden"
      );
    }
  }

  /* =========================================================
     BSC NETWORK
     ========================================================= */

  async function ensureBSC(
    provider
  ) {
    try {
      const chainId =
        await provider.request({
          method:
            "eth_chainId"
        });

      if (
        String(chainId)
          .toLowerCase() ===
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
                  RPC_URL
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

      alert(
        "Please switch your wallet to BNB Smart Chain and try again."
      );

      return false;
    }
  }

  /* =========================================================
     CONNECT SELECTED WALLET
     ========================================================= */

  async function connectSelectedWallet(
    wallet
  ) {
    const provider =
      getWalletProvider(
        wallet
      );

    if (!provider) {
      alert(
        `${wallet.name} was not detected in this browser.`
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
        accounts.length === 0
      ) {
        throw new Error(
          "No wallet account was returned."
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

      closeWalletModal();

      updateWalletButton();

      if (
        typeof provider.on ===
        "function"
      ) {
        provider.on(
          "accountsChanged",
          (accounts) => {
            connectedAddress =
              accounts?.[0] ||
              null;

            updateWalletButton();
          }
        );

        provider.on(
          "chainChanged",
          () => {
            connectedAddress =
              null;

            walletProvider =
              null;

            walletSigner =
              null;

            walletContract =
              null;

            updateWalletButton();
          }
        );
      }

      console.log(
        "Connected:",
        connectedAddress
      );
    } catch (error) {
      console.error(
        "Wallet connection error:",
        error
      );

      if (
        error?.code ===
        4001
      ) {
        alert(
          "Connection was rejected in your wallet."
        );
      } else {
        alert(
          error?.shortMessage ||
            error?.message ||
            "Unable to connect wallet."
        );
      }
    }
  }

  /* =========================================================
     UPDATE CONNECT WALLET BUTTON
     ========================================================= */

  function updateWalletButton() {
    const button =
      $("connectWallet");

    if (!button) {
      return;
    }

    if (connectedAddress) {
      button.textContent =
        shortAddress(
          connectedAddress
        );

      button.classList.add(
        "wallet-connected"
      );
    } else {
      button.textContent =
        "Connect Wallet";

      button.classList.remove(
        "wallet-connected"
      );
    }
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
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      alert(
        "Enter a valid BNB amount."
      );

      return;
    }

    if (
      amount < minimumBNB
    ) {
      alert(
        `Minimum purchase is ${minimumBNB} BNB.`
      );

      return;
    }

    if (
      amount > maximumBNB
    ) {
      alert(
        `Maximum purchase is ${maximumBNB} BNB.`
      );

      return;
    }

    /*
     If no wallet is connected,
     open the seven-wallet chooser.
    */

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
        button.disabled =
          true;

        button.textContent =
          "Confirm in wallet...";
      }

      const tx =
        await walletContract.buyBTC(
          {
            value:
              ethers.parseEther(
                raw
              )
          }
        );

      if (button) {
        button.textContent =
          "Waiting for confirmation...";
      }

      await tx.wait();

      if (button) {
        button.disabled =
          false;

        button.textContent =
          "Buy BTC with BNB";
      }

      alert(
        "Purchase confirmed successfully."
      );
    } catch (error) {
      console.error(
        "Buy BTC error:",
        error
      );

      if (button) {
        button.disabled =
          false;

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
     COPY CONTRACT ADDRESS
     ========================================================= */

  async function copyContractAddress() {
    try {
      await navigator.clipboard.writeText(
        CONTRACT_ADDRESS
      );

      const button =
        $("copyContract");

      if (button) {
        const original =
          button.textContent;

        button.textContent =
          "Copied";

        setTimeout(() => {
          button.textContent =
            original;
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
     EVENT SETUP
     ========================================================= */

  function setupEvents() {
    const connect =
      $("connectWallet");

    if (connect) {
      connect.addEventListener(
        "click",
        openWalletModal
      );
    }

    const calculate =
      $("calculateButton");

    if (calculate) {
      calculate.addEventListener(
        "click",
        calculateBTCAmount
      );
    }

    const amount =
      $("bnbAmount");

    if (amount) {
      amount.addEventListener(
        "input",
        () => {
          clearTimeout(
            amount._btcTimer
          );

          amount._btcTimer =
            setTimeout(
              calculateBTCAmount,
              250
            );
        }
      );
    }

    const buy =
      $("buyBTCButton");

    if (buy) {
      buy.addEventListener(
        "click",
        buyBTC
      );
    }

    const copy =
      $("copyContract");

    if (copy) {
      copy.addEventListener(
        "click",
        copyContractAddress
      );
    }
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
        "Ethers.js was not loaded."
      );

      return;
    }

    /*
     Contract address.
    */

    setText(
      "contractAddress",
      CONTRACT_ADDRESS
    );

    /*
     Buttons.
    */

    setupEvents();

    /*
     Wallet modal is created immediately,
     so Connect Wallet always has the
     seven choices ready.
    */

    createWalletModal();

    /*
     Contract settings.
    */

    try {
      await loadContractSettings();
    } catch (error) {
      console.warn(
        "Contract settings unavailable:",
        error
      );

      updateLimits();
    }

    /*
     Live prices.
    */

    await updateMarketPrices();

    /*
     Activity.
    */

    renderActivity();

    /*
     Price refresh.
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
