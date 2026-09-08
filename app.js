/* ==========================================================
   BTC / BNB BUYBACK PORTAL
   Complete app.js replacement
   Network: BNB Smart Chain
   Contract: 0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
   ========================================================== */

(() => {
  "use strict";

  const CONTRACT_ADDRESS =
    "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

  const CHAIN_ID = 56;
  const CHAIN_HEX = "0x38";

  const FALLBACK_MIN_BNB = 5;
  const FALLBACK_MAX_BNB = 1000;
  const FALLBACK_BONUS = 11;

  const RPC_URLS = [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.binance.org/",
    "https://bsc-dataseed2.binance.org/"
  ];

  const CONTRACT_ABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "buyer",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "bnbAmount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "baseBTCAmount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "bonusBTCAmount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "totalBTCAmount",
          type: "uint256"
        }
      ],
      name: "BTCPurchased",
      type: "event"
    },

    {
      inputs: [],
      name: "BONUS_PERCENT",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },

    {
      inputs: [],
      name: "availableBTC",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },

    {
      inputs: [],
      name: "buyBTC",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },

    {
      inputs: [
        {
          internalType: "uint256",
          name: "bnbAmount",
          type: "uint256"
        }
      ],
      name: "calculateBTC",
      outputs: [
        {
          internalType: "uint256",
          name: "baseAmount",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "bonusAmount",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "totalAmount",
          type: "uint256"
        }
      ],
      stateMutability: "pure",
      type: "function"
    },

    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },

    {
      inputs: [],
      name: "referenceMaximumBNB",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },

    {
      inputs: [],
      name: "referenceMinimumBNB",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ];

  let readProvider = null;
  let walletProvider = null;
  let signer = null;
  let contract = null;
  let connectedAddress = null;

  let btcDecimals = 8;
  let minBNB = FALLBACK_MIN_BNB;
  let maxBNB = FALLBACK_MAX_BNB;
  let bonusPercent = FALLBACK_BONUS;

  let activityEntries = [];
  let activityIndex = 0;
  let activityTimer = null;

  const discoveredWallets = new Map();

  const $ = id => document.getElementById(id);

  /* ==========================================================
     BASIC HELPERS
     ========================================================== */

  function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
  }

  function numberText(value, decimals = 8) {
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: decimals
    });
  }

  function money(value) {
    return Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    });
  }

  function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function toast(message) {
    let toastElement = $("portalToast");

    if (!toastElement) {
      toastElement = document.createElement("div");
      toastElement.id = "portalToast";
      toastElement.className = "portal-toast";
      document.body.appendChild(toastElement);
    }

    toastElement.textContent = message;
    toastElement.classList.add("show");

    clearTimeout(window.__btcToastTimer);

    window.__btcToastTimer = setTimeout(() => {
      toastElement.classList.remove("show");
    }, 3000);
  }

  /* ==========================================================
     EXTRA STYLES
     ========================================================== */

  function injectStyles() {
    if ($("btcPortalExtraStyles")) return;

    const style = document.createElement("style");

    style.id = "btcPortalExtraStyles";

    style.textContent = `
      .portal-toast {
        position: fixed;
        left: 50%;
        bottom: 24px;
        transform: translate(-50%, 20px);
        z-index: 100000;
        padding: 12px 18px;
        border-radius: 12px;
        background: #111827;
        color: #fff;
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 20px 60px rgba(0,0,0,.4);
        opacity: 0;
        pointer-events: none;
        transition: .25s ease;
        font: 600 14px/1.4 system-ui,sans-serif;
      }

      .portal-toast.show {
        opacity: 1;
        transform: translate(-50%, 0);
      }

      .wallet-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(3,7,18,.82);
        backdrop-filter: blur(12px);
      }

      .wallet-overlay.hidden {
        display: none;
      }

      .wallet-picker {
        width: min(460px,100%);
        max-height: 92vh;
        overflow-y: auto;
        padding: 24px;
        border-radius: 24px;
        background: #0b1020;
        border: 1px solid rgba(129,140,248,.25);
        box-shadow: 0 30px 100px rgba(0,0,0,.6);
      }

      .wallet-picker-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }

      .wallet-picker h2 {
        margin: 0;
        color: #fff;
        font-size: 24px;
      }

      .wallet-picker p {
        margin: 8px 0 18px;
        color: #8e9ab3;
        font-size: 14px;
      }

      .wallet-close {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,.1);
        background: #151c2d;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
      }

      .wallet-option {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 9px;
        padding: 13px 14px;
        border-radius: 15px;
        border: 1px solid rgba(255,255,255,.08);
        background: #101728;
        color: #fff;
        text-align: left;
        cursor: pointer;
        transition: .18s ease;
      }

      .wallet-option:hover {
        transform: translateY(-1px);
        border-color: rgba(129,140,248,.55);
        background: #141d31;
      }

      .wallet-logo {
        width: 42px;
        height: 42px;
        flex: 0 0 42px;
        border-radius: 11px;
        object-fit: contain;
        background: #fff;
        padding: 4px;
      }

      .wallet-name {
        min-width: 0;
      }

      .wallet-name strong {
        display: block;
        font-size: 15px;
      }

      .wallet-name small {
        display: block;
        margin-top: 3px;
        color: #8d99b0;
      }

      .wallet-state {
        margin-left: auto;
        font-size: 11px;
        white-space: nowrap;
      }

      .wallet-available {
        color: #5de4a1;
      }

      .wallet-unavailable {
        color: #7f8aa1;
      }

      .activity-feed {
        overflow: hidden;
      }

      .activity-row {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 17px 20px;
        border-bottom: 1px solid rgba(255,255,255,.08);
      }

      .activity-row:last-child {
        border-bottom: 0;
      }

      .activity-icon {
        width: 46px;
        height: 46px;
        flex: 0 0 46px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: rgba(100,110,255,.13);
        color: #9ba5ff;
        font-size: 23px;
      }

      .activity-main strong {
        display: block;
        color: #f4f7ff;
        font-size: 18px;
        font-weight: 800;
      }

      .activity-main small {
        display: block;
        margin-top: 4px;
        color: #78849d;
        font-size: 12px;
      }

      .activity-empty {
        opacity: .8;
      }

      .activity-item {
        animation: btcActivityIn .45s ease both;
      }

      @keyframes btcActivityIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media(max-width:600px) {
        .wallet-picker {
          padding: 18px;
          border-radius: 20px;
        }

        .wallet-logo {
          width: 38px;
          height: 38px;
          flex-basis: 38px;
        }

        .wallet-option {
          padding: 11px;
        }

        .activity-row {
          padding: 15px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ==========================================================
     READ PROVIDER
     ========================================================== */

  function getReadProvider() {
    if (readProvider) return readProvider;

    try {
      readProvider = new ethers.JsonRpcProvider(
        RPC_URLS[0],
        56,
        { staticNetwork: true }
      );

      return readProvider;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function getReadContract() {
    const provider = getReadProvider();

    if (!provider) {
      throw new Error("BNB Smart Chain provider unavailable.");
    }

    return new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );
  }

  /* ==========================================================
     CONTRACT SETTINGS
     ========================================================== */

  async function loadContractSettings() {
    try {
      const c = getReadContract();

      const results = await Promise.allSettled([
        c.decimals(),
        c.referenceMinimumBNB(),
        c.referenceMaximumBNB(),
        c.BONUS_PERCENT()
      ]);

      if (results[0].status === "fulfilled") {
        btcDecimals = Number(results[0].value);
      }

      if (results[1].status === "fulfilled") {
        minBNB = Number(
          ethers.formatEther(results[1].value)
        );
      }

      if (results[2].status === "fulfilled") {
        maxBNB = Number(
          ethers.formatEther(results[2].value)
        );
      }

      if (results[3].status === "fulfilled") {
        bonusPercent = Number(results[3].value);
      }

      updateLimitsUI();

    } catch (error) {
      console.warn(
        "Contract settings unavailable:",
        error
      );

      updateLimitsUI();
    }
  }

  function updateLimitsUI() {
    const range = `${numberText(minBNB,2)}–${numberText(maxBNB,2)} BNB`;

    const input = $("bnbAmount");

    if (input) {
      input.min = String(minBNB);
      input.max = String(maxBNB);

      if (!input.value) {
        input.placeholder = String(minBNB);
      }
    }

    setText(
      "calculatorMessage",
      `Minimum ${numberText(minBNB,2)} BNB · Maximum ${numberText(maxBNB,2)} BNB`
    );

    document
      .querySelectorAll("[data-min-bnb]")
      .forEach(el => {
        el.textContent = numberText(minBNB,2);
      });

    document
      .querySelectorAll("[data-max-bnb]")
      .forEach(el => {
        el.textContent = numberText(maxBNB,2);
      });

    document
      .querySelectorAll(".program-range,.range-label")
      .forEach(el => {
        el.textContent = range;
      });
  }

  /* ==========================================================
     CALCULATOR
     ========================================================== */

  function resetCalculator() {
    setText("baseBTC", "0 BTC");
    setText("bonusBTC", "0 BTC");
    setText("totalBTC", "0 BTC");
  }

  async function calculateBTC() {
    const input = $("bnbAmount");

    if (!input) return;

    const amount = Number(input.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      resetCalculator();
      setText(
        "calculatorMessage",
        "Enter a valid BNB amount."
      );
      return;
    }

    if (amount < minBNB) {
      resetCalculator();
      setText(
        "calculatorMessage",
        `Minimum participation is ${numberText(minBNB,2)} BNB.`
      );
      return;
    }

    if (amount > maxBNB) {
      resetCalculator();
      setText(
        "calculatorMessage",
        `Maximum participation is ${numberText(maxBNB,2)} BNB.`
      );
      return;
    }

    try {
      const c = getReadContract();

      const result = await c.calculateBTC(
        ethers.parseEther(amount.toString())
      );

      setText(
        "baseBTC",
        `${numberText(
          ethers.formatUnits(result.baseAmount,btcDecimals),
          8
        )} BTC`
      );

      setText(
        "bonusBTC",
        `${numberText(
          ethers.formatUnits(result.bonusAmount,btcDecimals),
          8
        )} BTC`
      );

      setText(
        "totalBTC",
        `${numberText(
          ethers.formatUnits(result.totalAmount,btcDecimals),
          8
        )} BTC`
      );

      setText(
        "calculatorMessage",
        `Calculation completed · ${bonusPercent}% bonus`
      );

    } catch (error) {
      console.error("Calculator:",error);

      resetCalculator();

      setText(
        "calculatorMessage",
        "Unable to read the contract calculation right now."
      );
    }
  }

  function setupCalculator() {
    const input = $("bnbAmount");
    const button = $("calculateButton");

    if (input) {
      input.addEventListener("input",() => {
        clearTimeout(window.__btcCalcTimer);

        window.__btcCalcTimer = setTimeout(
          calculateBTC,
          250
        );
      });
    }

    if (button) {
      button.addEventListener(
        "click",
        calculateBTC
      );
    }
  }

  /* ==========================================================
     MARKET DATA
     ========================================================== */

  async function fetchJSON(url) {
    const response = await fetch(
      url,
      { cache:"no-store" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async function loadMarket(symbol,priceId,changeId) {
    const urls = [
      `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`,
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    ];

    let data = null;

    for (const url of urls) {
      try {
        data = await fetchJSON(url);
        break;
      } catch (_) {}
    }

    if (!data) {
      setText(priceId,"Unavailable");
      setText(changeId,"Market data unavailable");
      return;
    }

    const price = Number(data.lastPrice);
    const change = Number(data.priceChangePercent);

    if (!Number.isFinite(price)) {
      setText(priceId,"Unavailable");
      setText(changeId,"Market data unavailable");
      return;
    }

    setText(priceId,money(price));

    setText(
      changeId,
      `${Number.isFinite(change) ? change.toFixed(2) : "0.00"}% today`
    );
  }

  async function loadMarketData() {
    await Promise.allSettled([
      loadMarket(
        "BTCUSDT",
        "btcPrice",
        "btcChange"
      ),

      loadMarket(
        "BNBUSDT",
        "bnbPrice",
        "bnbChange"
      )
    ]);
  }

  /* ==========================================================
     ACTIVITY
     ========================================================== */

  function getActivityContainer() {
    let feed = $("activityFeed");

    if (feed) {
      feed.classList.add("activity-feed");
      return feed;
    }

    const section = $("activity");

    if (!section) return null;

    feed = section.querySelector(
      ".activity-grid,.activity-list"
    );

    if (feed) {
      feed.id = "activityFeed";
      feed.classList.add("activity-feed");
      return feed;
    }

    feed = document.createElement("div");
    feed.id = "activityFeed";
    feed.className = "activity-feed";

    section.appendChild(feed);

    return feed;
  }

  function createActivityRow(entry) {
    const item = document.createElement("div");

    item.className = "activity-item";

    item.innerHTML = `
      <div class="activity-row">
        <div class="activity-icon">↗</div>

        <div class="activity-main">
          <strong>
            ${numberText(entry.totalBTC,8)} BTC
          </strong>

          <small>
            ${shortAddress(entry.buyer)}
          </small>
        </div>
      </div>
    `;

    return item;
  }

  function renderActivity() {
    const feed = getActivityContainer();

    if (!feed) return;

    feed.innerHTML = "";

    /*
      IMPORTANT:
      We do not create fake blockchain transactions.

      If there are no confirmed BTCPurchased events yet,
      the section still remains visible instead of being blank.
    */

    if (!activityEntries.length) {
      const empty = document.createElement("div");

      empty.className =
        "activity-row activity-empty";

      empty.innerHTML = `
        <div class="activity-icon">↗</div>

        <div class="activity-main">
          <strong>No confirmed activity yet</strong>

          <small>
            New BTCPurchased transactions will appear here automatically.
          </small>
        </div>
      `;

      feed.appendChild(empty);

      return;
    }

    const maxVisible =
      Math.min(3,activityEntries.length);

    const visible = [];

    for (let i = 0; i < maxVisible; i++) {
      visible.push(
        activityEntries[
          (activityIndex + i) %
          activityEntries.length
        ]
      );
    }

    visible.forEach(entry => {
      feed.appendChild(
        createActivityRow(entry)
      );
    });

    clearTimeout(activityTimer);

    if (activityEntries.length > 3) {
      activityTimer = setTimeout(() => {
        activityIndex =
          (activityIndex + 1) %
          activityEntries.length;

        renderActivity();
      },4800);
    }
  }

  async function loadActivity() {
    if (!window.ethers) return;

    const feed = getActivityContainer();

    if (!feed) return;

    try {
      const c = getReadContract();

      const filter =
        c.filters.BTCPurchased();

      /*
        Query recent blocks.

        If the RPC rejects the range, the catch block
        keeps the Activity section visible.
      */

      const events =
        await c.queryFilter(
          filter,
          -5000,
          "latest"
        );

      const entries = [];

      for (
        let i = events.length - 1;
        i >= 0 && entries.length < 12;
        i--
      ) {
        const event = events[i];

        try {
          const args = event.args;

          if (!args) continue;

          entries.push({
            buyer: args.buyer,
            totalBTC: Number(
              ethers.formatUnits(
                args.totalBTCAmount,
                btcDecimals
              )
            ),
            transactionHash:
              event.transactionHash,
            blockNumber:
              event.blockNumber
          });

        } catch (error) {
          console.warn(
            "Invalid activity event:",
            error
          );
        }
      }

      activityEntries = entries;
      activityIndex = 0;

      renderActivity();

    } catch (error) {
      console.warn(
        "Activity RPC query failed:",
        error
      );

      /*
        Do NOT leave the Activity section empty.
      */

      activityEntries = [];
      activityIndex = 0;

      renderActivity();
    }
  }

  /* ==========================================================
     WALLET DISCOVERY
     ========================================================== */

  const WALLET_DEFINITIONS = [
    {
      name:"MetaMask",
      key:"metamask",
      match:/metamask/i,
      logo:"https://metamask.io/favicon.ico"
    },

    {
      name:"Trust Wallet",
      key:"trust",
      match:/trust/i,
      logo:"https://trustwallet.com/favicon.ico"
    },

    {
      name:"Binance Wallet",
      key:"binance",
      match:/binance/i,
      logo:"https://www.binance.com/favicon.ico"
    },

    {
      name:"OKX Wallet",
      key:"okx",
      match:/okx/i,
      logo:"https://www.okx.com/favicon.ico"
    },

    {
      name:"Bitget Wallet",
      key:"bitget",
      match:/bitget/i,
      logo:"https://www.bitget.com/favicon.ico"
    },

    {
      name:"SafePal",
      key:"safepal",
      match:/safepal/i,
      logo:"https://www.safepal.com/favicon.ico"
    },

    {
      name:"Rabby",
      key:"rabby",
      match:/rabby/i,
      logo:"https://rabby.io/favicon.ico"
    }
  ];

  /*
    Guaranteed image fallback.

    The fallback is embedded directly into the JavaScript,
    so a broken external image can NEVER leave a broken-image
    box in the wallet selector.
  */

  function fallbackLogo(name) {
    const letters = {
      "MetaMask":"M",
      "Trust Wallet":"T",
      "Binance Wallet":"B",
      "OKX Wallet":"OKX",
      "Bitget Wallet":"B",
      "SafePal":"SP",
      "Rabby":"R"
    };

    const text = letters[name] || "?";

    return "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 96 96"
        >
          <rect
            width="96"
            height="96"
            rx="22"
            fill="#ffffff"
          />

          <circle
            cx="48"
            cy="48"
            r="34"
            fill="#111827"
          />

          <text
            x="48"
            y="56"
            text-anchor="middle"
            font-family="Arial,Helvetica,sans-serif"
            font-size="${text.length > 2 ? 17 : 28}"
            font-weight="700"
            fill="#ffffff"
          >${text}</text>
        </svg>
      `);
  }

  function discoverWallets() {
    if (!window.addEventListener) return;

    window.addEventListener(
      "eip6963:announceProvider",
      event => {
        const detail = event.detail;

        if (
          !detail ||
          !detail.provider ||
          !detail.info
        ) {
          return;
        }

        const key =
          detail.info.rdns ||
          detail.info.uuid ||
          detail.info.name;

        discoveredWallets.set(
          key,
          detail
        );

        renderWalletOptions();
      }
    );

    window.dispatchEvent(
      new Event(
        "eip6963:requestProvider"
      )
    );

    if (window.ethereum) {
      discoveredWallets.set(
        "injected",
        {
          info:{
            name:"Browser Wallet",
            rdns:"injected"
          },
          provider:window.ethereum
        }
      );
    }
  }

  function findWalletProvider(definition) {
    for (
      const wallet
      of discoveredWallets.values()
    ) {
      const info =
        wallet.info || {};

      const text =
        `${info.name || ""} ${info.rdns || ""}`
          .toLowerCase();

      if (
        definition.match.test(text)
      ) {
        return wallet.provider;
      }
    }

    /*
      If there is only one injected provider,
      allow that provider to handle the connection.
    */

    if (
      discoveredWallets.size === 1
    ) {
      return [
        ...discoveredWallets.values()
      ][0].provider;
    }

    return null;
  }

  /* ==========================================================
     WALLET MODAL
     ========================================================== */

  function createWalletModal() {
    if ($("walletModalFinal")) {
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.id =
      "walletModalFinal";

    overlay.className =
      "wallet-overlay hidden";

    overlay.innerHTML = `
      <div
        class="wallet-picker"
        role="dialog"
        aria-modal="true"
      >

        <div class="wallet-picker-head">
          <h2>Connect Wallet</h2>

          <button
            class="wallet-close"
            id="walletPickerClose"
            type="button"
            aria-label="Close"
          >×</button>
        </div>

        <p>
          Choose your preferred BNB Smart Chain wallet.
        </p>

        <div id="walletOptions"></div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    $("walletPickerClose")
      .addEventListener(
        "click",
        closeWalletModal
      );

    overlay.addEventListener(
      "click",
      event => {
        if (
          event.target === overlay
        ) {
          closeWalletModal();
        }
      }
    );

    renderWalletOptions();
  }

  function renderWalletOptions() {
    const box =
      $("walletOptions");

    if (!box) return;

    box.innerHTML =
      WALLET_DEFINITIONS
        .map((wallet,index) => {

          const provider =
            findWalletProvider(
              wallet
            );

          return `
            <button
              class="wallet-option"
              type="button"
              data-wallet-index="${index}"
            >

              <img
                class="wallet-logo"
                src="${wallet.logo}"
                alt="${wallet.name} logo"
              >

              <span class="wallet-name">
                <strong>
                  ${wallet.name}
                </strong>

                <small>
                  BNB Smart Chain
                </small>
              </span>

              <span
                class="wallet-state ${
                  provider
                    ? "wallet-available"
                    : "wallet-unavailable"
                }"
              >
                ${
                  provider
                    ? "Available"
                    : "Select"
                }
              </span>

            </button>
          `;
        })
        .join("");

    /*
      If any external wallet logo fails,
      immediately replace it with the embedded fallback.
    */

    box
      .querySelectorAll(".wallet-logo")
      .forEach((image,index) => {

        image.addEventListener(
          "error",
          () => {

            const wallet =
              WALLET_DEFINITIONS[index];

            image.onerror = null;

            image.src =
              fallbackLogo(
                wallet.name
              );
          },
          { once:true }
        );

      });

    box
      .querySelectorAll(".wallet-option")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.walletIndex
              );

            const wallet =
              WALLET_DEFINITIONS[index];

            connectWallet(
              wallet
            );
          }
        );

      });
  }

  function openWalletModal() {
    createWalletModal();

    renderWalletOptions();

    const modal =
      $("walletModalFinal");

    if (modal) {
      modal.classList.remove(
        "hidden"
      );
    }
  }

  function closeWalletModal() {
    const modal =
      $("walletModalFinal");

    if (modal) {
      modal.classList.add(
        "hidden"
      );
    }
  }

  /* ==========================================================
     BSC NETWORK
     ========================================================== */

  async function ensureBSC(provider) {
    const currentChain =
      await provider.request({
        method:"eth_chainId"
      });

    if (
      currentChain.toLowerCase() ===
      CHAIN_HEX
    ) {
      return;
    }

    try {
      await provider.request({
        method:
          "wallet_switchEthereumChain",

        params:[
          {
            chainId:CHAIN_HEX
          }
        ]
      });

    } catch (error) {

      if (
        error &&
        error.code === 4902
      ) {

        await provider.request({
          method:
            "wallet_addEthereumChain",

          params:[
            {
              chainId:CHAIN_HEX,
              chainName:
                "BNB Smart Chain",

              nativeCurrency:{
                name:"BNB",
                symbol:"BNB",
                decimals:18
              },

              rpcUrls:[
                "https://bsc-dataseed.binance.org/"
              ],

              blockExplorerUrls:[
                "https://bscscan.com/"
              ]
            }
          ]
        });

      } else {
        throw error;
      }
    }
  }

  /* ==========================================================
     CONNECT WALLET
     ========================================================== */

  async function connectWallet(definition) {
    let provider =
      findWalletProvider(
        definition
      );

    /*
      On mobile, some wallets expose only window.ethereum.
      Use it as a fallback rather than refusing the connection.
    */

    if (
      !provider &&
      window.ethereum
    ) {
      provider =
        window.ethereum;
    }

    if (!provider) {
      toast(
        `${definition.name} is not available in this browser.`
      );

      return;
    }

    try {
      await ensureBSC(
        provider
      );

      walletProvider =
        new ethers.BrowserProvider(
          provider
        );

      await walletProvider.send(
        "eth_requestAccounts",
        []
      );

      signer =
        await walletProvider.getSigner();

      connectedAddress =
        await signer.getAddress();

      contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

      updateWalletButton();

      closeWalletModal();

      toast(
        `${definition.name} connected.`
      );

    } catch (error) {

      console.error(
        "Wallet connection:",
        error
      );

      if (
        error?.code === 4001 ||
        error?.code ===
          "ACTION_REJECTED"
      ) {
        toast(
          "Wallet connection cancelled."
        );
      } else {
        toast(
          error?.shortMessage ||
          "Unable to connect wallet."
        );
      }
    }
  }

  function updateWalletButton() {
    const button =
      $("connectWallet");

    if (!button) return;

    button.textContent =
      connectedAddress
        ? shortAddress(
            connectedAddress
          )
        : "Connect Wallet";
  }

  function setupWallet() {
    createWalletModal();

    discoverWallets();

    const button =
      $("connectWallet");

    if (button) {
      button.addEventListener(
        "click",
        openWalletModal
      );
    }

    if (
      window.ethereum &&
      window.ethereum.on
    ) {

      window.ethereum.on(
        "accountsChanged",
        accounts => {

          connectedAddress =
            accounts?.[0] ||
            null;

          if (
            !connectedAddress
          ) {
            signer = null;
            contract = null;
          }

          updateWalletButton();
        }
      );

      window.ethereum.on(
        "chainChanged",
        () => {

          if (
            connectedAddress
          ) {
            window.location.reload();
          }

        }
      );
    }
  }

  /* ==========================================================
     BUY BTC
     ========================================================== */

  async function buyBTC() {
    const input =
      $("bnbAmount");

    if (!input) return;

    const amount =
      Number(input.value);

    if (
      !Number.isFinite(amount) ||
      amount < minBNB ||
      amount > maxBNB
    ) {
      toast(
        `Enter an amount between ${numberText(minBNB,2)} and ${numberText(maxBNB,2)} BNB.`
      );

      return;
    }

    if (
      !signer ||
      !contract
    ) {
      openWalletModal();
      return;
    }

    try {
      const network =
        await walletProvider.getNetwork();

      if (
        Number(network.chainId) !==
        CHAIN_ID
      ) {
        await ensureBSC(
          walletProvider.provider
        );

        walletProvider =
          new ethers.BrowserProvider(
            walletProvider.provider
          );

        signer =
          await walletProvider.getSigner();

        connectedAddress =
          await signer.getAddress();

        contract =
          new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
      }

      const value =
        ethers.parseEther(
          amount.toString()
        );

      const transaction =
        await contract.buyBTC({
          value:value
        });

      toast(
        "Transaction submitted. Waiting for confirmation."
      );

      await transaction.wait();

      toast(
        "BTC purchase confirmed."
      );

      await loadActivity();

    } catch (error) {

      console.error(
        "buyBTC:",
        error
      );

      if (
        error?.code === 4001 ||
        error?.code ===
          "ACTION_REJECTED"
      ) {
        toast(
          "Transaction cancelled."
        );
      } else {
        toast(
          error?.shortMessage ||
          "Transaction could not be completed."
        );
      }
    }
  }

  function setupBuyButton() {
    const button =
      $("buyBTCButton") ||
      $("buyButton");

    if (button) {
      button.addEventListener(
        "click",
        buyBTC
      );
    }
  }

  /* ==========================================================
     COPY CONTRACT
     ========================================================== */

  function setupCopyButton() {
    const button =
      $("copyContract");

    const address =
      $("contractAddress");

    if (!button || !address) {
      return;
    }

    address.textContent =
      CONTRACT_ADDRESS;

    button.addEventListener(
      "click",
      async () => {

        try {

          await navigator.clipboard
            .writeText(
              CONTRACT_ADDRESS
            );

          button.textContent =
            "Copied";

          toast(
            "Contract address copied."
          );

          setTimeout(() => {
            button.textContent =
              "Copy";
          },1800);

        } catch (_) {

          toast(
            "Unable to copy automatically."
          );

        }
      }
    );
  }

  /* ==========================================================
     REFRESH
     ========================================================== */

  function setupRefresh() {
    const button =
      $("refreshMarket") ||
      $("refreshButton");

    if (button) {
      button.addEventListener(
        "click",
        loadMarketData
      );
    }
  }

  /* ==========================================================
     ACTIVITY HEADING
     ========================================================== */

  function setupActivityHeading() {
    const section =
      $("activity");

    if (!section) return;

    const heading =
      section.querySelector(
        ".section-heading"
      );

    if (!heading) return;

    const h2 =
      heading.querySelector("h2");

    if (h2) {
      h2.textContent =
        "Recent activity.";
    }

    const kicker =
      heading.querySelector(
        ".section-kicker"
      );

    if (kicker) {
      kicker.textContent =
        "ACTIVITY";
    }

    let status =
      heading.querySelector(
        ".activity-status,.live-pill"
      );

    if (!status) {

      status =
        document.createElement(
          "span"
        );

      status.className =
        "activity-status";

      heading.appendChild(
        status
      );
    }

    status.innerHTML = `
      <i
        style="
          display:inline-block;
          width:9px;
          height:9px;
          border-radius:50%;
          background:#46e39b;
          margin-right:8px;
          box-shadow:0 0 12px rgba(70,227,155,.8);
        "
      ></i>
      LIVE
    `;
  }

  /* ==========================================================
     START
     ========================================================== */

  async function startPortal() {
    /*
      Check that ethers is actually available.
    */

    if (!window.ethers) {
      console.error(
        "ethers.js is not loaded. Make sure index.html loads ethers before app.js."
      );

      return;
    }

    injectStyles();

    setupActivityHeading();

    setupCalculator();

    setupWallet();

    setupCopyButton();

    setupBuyButton();

    setupRefresh();

    await loadContractSettings();

    await loadMarketData();

    /*
      This is deliberately called on startup so
      Activity is NEVER left blank.
    */

    await loadActivity();

    setInterval(
      loadMarketData,
      30000
    );

    setInterval(
      loadActivity,
      60000
    );
  }

  document.addEventListener(
    "DOMContentLoaded",
    startPortal
  );

})();
