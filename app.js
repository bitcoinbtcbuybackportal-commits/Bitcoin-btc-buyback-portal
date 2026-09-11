/* ==========================================================
   BTC / BNB PORTAL — GitHub Pages final client logic
   Contract: 0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
   Network: BNB Smart Chain (chainId 56)
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

let minBNB =
  FALLBACK_MIN_BNB;

let maxBNB =
  FALLBACK_MAX_BNB;

let bonusPercent =
  FALLBACK_BONUS;

let activityEntries = [];
let activityIndex = 0;
let activityTimer = null;

const discoveredWallets =
  new Map();

const $ =
  (id) =>
    document.getElementById(id);

function setText(
  id,
  value
) {
  const el =
    $(id);

  if (el) {
    el.textContent =
      value;
  }
}

function money(
  value
) {
  return Number(
    value
  ).toLocaleString(
    "en-US",
    {
      style:
        "currency",
      currency:
        "USD",
      maximumFractionDigits:
        2
    }
  );
}

function numberText(
  value,
  max = 8
) {
  return Number(
    value
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits:
        max
    }
  );
}

function shortAddress(
  address
) {
  return `${address.slice(
    0,
    6
  )}...${address.slice(-4)}`;
}

function toast(
  message
) {
  let el =
    $("portalToast");

  if (!el) {
    el =
      document.createElement(
        "div"
      );

    el.id =
      "portalToast";

    el.className =
      "portal-toast";

    document.body.appendChild(
      el
    );
  }

  el.textContent =
    message;

  el.classList.add(
    "show"
  );

  clearTimeout(
    window.__portalToastTimer
  );

  window.__portalToastTimer =
    setTimeout(
      () =>
        el.classList.remove(
          "show"
        ),
      3000
    );
}

function injectStyles() {
  if (
    $("finalPortalStyles")
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "finalPortalStyles";

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

    /* ================= ACTIVITY ================= */

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

      .activity-row{
        padding:16px
      }

      .activity-main strong{
        font-size:17px
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function createReadProvider() {
  if (
    readProvider
  ) {
    return readProvider;
  }

  for (
    const url of RPC_URLS
  ) {
    try {
      readProvider =
        new ethers.JsonRpcProvider(
          url,
          56,
          {
            staticNetwork:
              true
          }
        );

      return readProvider;

    } catch (e) {}
  }

  return null;
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

async function loadContractSettings() {
  try {
    const c =
      getReadContract();

    const values =
      await Promise.allSettled([
        c.decimals(),
        c.referenceMinimumBNB(),
        c.referenceMaximumBNB(),
        c.BONUS_PERCENT()
      ]);

    if (
      values[0].status ===
      "fulfilled"
    ) {
      btcDecimals =
        Number(
          values[0].value
        );
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
        Number(
          values[3].value
        );
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
    `${numberText(
      minBNB,
      2
    )}–${numberText(
      maxBNB,
      2
    )} BNB`;

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
      String(
        minBNB
      );

    input.max =
      String(
        maxBNB
      );

    if (!input.value) {
      input.placeholder =
        String(
          minBNB
        );
    }
  }

  const message =
    $("calculatorMessage");

  if (message) {

    message.textContent =
      `Minimum ${numberText(
        minBNB,
        2
      )} BNB · Maximum ${numberText(
        maxBNB,
        2
      )} BNB`;
  }

  document
    .querySelectorAll(
      "[data-min-bnb]"
    )
    .forEach(
      el =>
        el.textContent =
          numberText(
            minBNB,
            2
          )
    );

  document
    .querySelectorAll(
      "[data-max-bnb]"
    )
    .forEach(
      el =>
        el.textContent =
          numberText(
            maxBNB,
            2
          )
    );

  document
    .querySelectorAll(
      ".program-range,.range-label"
    )
    .forEach(
      el =>
        el.textContent =
          rangeText
    );
}

async function calculateBTC() {

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
    amount < 0.1
  ) {

    resetCalculator();

    setText(
      "calculatorMessage",
      "Minimum amount is 0.1 BNB."
    );

    return;
  }

  if (
    amount > maxBNB
  ) {

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

  } catch (e) {

    console.error(
      "calculateBTC:",
      e
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

async function fetchJSON(
  url
) {

  const response =
    await fetch(
      url,
      {
        cache:
          "no-store"
      }
    );

  if (
    !response.ok
  ) {

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

  /*
    Binance live market endpoints.
    The first endpoint is preferred.
    The second endpoint is a fallback.
  */

  const urls = [

    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${encodeURIComponent(
      symbol
    )}`,

    `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(
      symbol
    )}`

  ];

  let data =
    null;

  for (
    const url of urls
  ) {

    try {

      data =
        await fetchJSON(
          url
        );

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

  const price =
    Number(
      data.lastPrice
    );

  const change =
    Number(
      data.priceChangePercent
    );

  if (
    !Number.isFinite(
      price
    )
  ) {

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
    money(
      price
    )
  );

  setText(
    changeId,
    `${
      Number.isFinite(
        change
      )
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



/* ==========================================================
   ACTIVITY
   Animated recent preview feed
   ========================================================== */

const RECENT_ACTIVITY_PREVIEW = [

  {
    amount:
      "0.042",
    wallet:
      "0xA73C...91B4"
  },

  {
    amount:
      "0.018",
    wallet:
      "0x31F7...E204"
  },

  {
    amount:
      "0.067",
    wallet:
      "0x8C42...A91D"
  },

  {
    amount:
      "0.025",
    wallet:
      "0xF24B...7C19"
  },

  {
    amount:
      "0.051",
    wallet:
      "0x6D91...B582"
  },

  {
    amount:
      "0.033",
    wallet:
      "0x49AC...D731"
  },

  {
    amount:
      "0.074",
    wallet:
      "0xB82E...4FA6"
  },

  {
    amount:
      "0.021",
    wallet:
      "0x17C9...A204"
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

  /*
    If there are no confirmed contract
    events, use the animated preview feed
    rather than leaving Activity empty.
  */

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

  } catch (e) {

    console.warn(
      "Activity RPC unavailable; showing animated preview.",
      e
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

  renderPreviewActivity();
}



/* ==========================================================
   EIP-6963 WALLET DISCOVERY
   ========================================================== */

function discoverWallets() {

  if (
    !window.addEventListener
  ) {
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

  if (
    window.ethereum
  ) {

    const fallback = {

      info: {
        name:
          "Browser Wallet",

        rdns:
          "injected"
      },

      provider:
        window.ethereum
    };

    discoveredWallets.set(
      "injected",
      fallback
    );
  }
}

const WALLET_DEFINITIONS = [

  {
    name:
      "MetaMask",

    slug:
      "metamask",

    match:
      /metamask/i
  },

  {
    name:
      "Trust Wallet",

    slug:
      "trustwallet",

    match:
      /trust/i
  },

  {
    name:
      "Binance Wallet",

    slug:
      "binance",

    match:
      /binance/i
  },

  {
    name:
      "OKX Wallet",

    slug:
      "okx",

    match:
      /okx/i
  },

  {
    name:
      "Bitget Wallet",

    slug:
      "bitget",

    match:
      /bitget/i
  },

  {
    name:
      "SafePal",

    slug:
      "safepal",

    match:
      /safepal/i
  },

  {
    name:
      "Rabby",

    slug:
      "rabby",

    match:
      /rabby/i
  }

];

function findWalletProvider(
  def
) {

  for (
    const item of
    discoveredWallets.values()
  ) {

    const info =
      item.info || {};

    const haystack =
      `${info.name || ""} ${info.rdns || ""}`
        .toLowerCase();

    if (
      def.match.test(
        haystack
      )
    ) {

      return item.provider;
    }
  }

  /*
    If only one injected provider exists,
    allow the browser wallet to handle
    the connection.
  */

  if (
    discoveredWallets.size ===
    1
  ) {

    return [
      ...discoveredWallets.values()
    ][0].provider;
  }

  return null;
}



/* ==========================================================
   WALLET LOGOS
   ========================================================== */

const WALLET_LOGO_SOURCES = {

  metamask: [
    "https://metamask.io/favicon.ico",
    "https://metamask.io/assets/icon-256.png"
  ],

  trustwallet: [
    "https://trustwallet.com/favicon.ico",
    "https://trustwallet.com/assets/images/favicon.png"
  ],

  binance: [
    "https://www.binance.com/favicon.ico",
    "https://bin.bnbstatic.com/static/images/common/favicon.ico"
  ],

  okx: [
    "https://www.okx.com/favicon.ico",
    "https://static.okx.com/cdn/assets/imgs/221/4D7A9A9E2A2B7A1A.png"
  ],

  bitget: [
    "https://www.bitget.com/favicon.ico",
    "https://web3.bitget.com/favicon.ico"
  ],

  safepal: [
    "https://www.safepal.com/favicon.ico",
    "https://s1.safepal.io/website/favicon.ico"
  ],

  rabby: [
    "https://rabby.io/favicon.ico",
    "https://rabby.io/favicon.png"
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

function walletFallbackLogo(
  name
) {

  const initials =
    name ===
    "MetaMask"
      ? "M"
      : name ===
        "Trust Wallet"
      ? "T"
      : name ===
        "Binance Wallet"
      ? "B"
      : name ===
        "OKX Wallet"
      ? "OKX"
      : name ===
        "Bitget Wallet"
      ? "BG"
      : name ===
        "SafePal"
      ? "SP"
      : "R";

  return `
    data:image/svg+xml;charset=UTF-8,
    ${encodeURIComponent(`
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
          font-size="${
            initials.length > 2
              ? 17
              : 25
          }"
          font-weight="700"
          fill="#ffffff"
        >
          ${initials}
        </text>

      </svg>
    `)}
  `;
}

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
          Connect Wallet
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
        Choose your preferred BSC wallet.
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
    e => {

      if (
        e.target ===
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
            walletFallbackLogo(
              wallet.name
            );

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
                data-fallback="${walletFallbackLogo(
                  wallet.name
                )}"
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
                class="wallet-state ${
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
      img => {

        img.addEventListener(
          "error",
          () => {

            const sources =
              JSON.parse(
                img.dataset.logoSources ||
                "[]"
              );

            const nextIndex =
              Number(
                img.dataset.logoIndex ||
                0
              ) + 1;

            if (
              nextIndex <
              sources.length
            ) {

              img.dataset.logoIndex =
                String(
                  nextIndex
                );

              img.src =
                sources[
                  nextIndex
                ];

            } else {

              img.src =
                img.dataset.fallback;
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
    .classList.remove(
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
    chainId ===
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

  } catch (
    error
  ) {

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
              "https://bsc-dataseed.binance.org/"
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

async function selectWallet(
  definition
) {

  const selectedProvider =
    findWalletProvider(
      definition
    );

  /*
    If the wallet is already injected into
    this browser, connect directly.
  */

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
        `${definition.name} connected.`
      );

      /* ===== PENDING BUY BTC CORRECTION ===== */
      if (window.__pendingBuyBTC) {
        window.__pendingBuyBTC = false;
        await buyBTC();
      }

      return;

    } catch (
      error
    ) {

      console.error(
        "Wallet connection:",
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
          "Unable to connect wallet."
        );
      }

      return;
    }
  }

  /*
    On mobile, try to open the selected wallet's
    app/DApp browser when an official deep link
    is available.
  */

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  if (
    isMobile
  ) {

    const currentUrl =
      window.location.href;

    const encodedUrl =
      encodeURIComponent(
        currentUrl
      );

    let walletUrl =
      null;

    switch (
      definition.slug
    ) {

      case "metamask":

        walletUrl =
          `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}`;

        break;

      case "trustwallet":

        walletUrl =
          `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`;

        break;

      case "bitget":

        walletUrl =
          `https://bkcode.vip?action=dapp&url=${encodedUrl}&_needChain=bnb`;

        break;

      default:

        walletUrl =
          null;
    }

    if (
      walletUrl
    ) {

      closeWalletModal();

      window.location.href =
        walletUrl;

      return;
    }

    toast(
      `${definition.name} is not detected. Open this page in the ${definition.name} mobile app's DApp browser.`
    );

    return;
  }

  /*
    Desktop/browser fallback.
  */

  toast(
    `${definition.name} is not available in this browser. Install the wallet extension or open this page in the wallet's browser.`
  );
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
}



/* ==========================================================
   BUY BTC
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
    amount < 0.1
  ) {

    toast(
      "Minimum amount is 0.1 BNB."
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
    !contract
  ) {

    /* ===== PENDING BUY BTC CORRECTION ===== */
    window.__pendingBuyBTC = true;

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
    }

    const value =
      ethers.parseEther(
        amount.toString()
      );

    const tx =
      await contract.buyBTC({
        value
      });

    toast(
      "Transaction submitted. Waiting for confirmation."
    );

    await tx.wait();

    toast(
      "BTC purchase confirmed."
    );

    await loadActivity();

  } catch (
    error
  ) {

    console.error(
      "buyBTC:",
      error
    );

    if (
      error?.code ===
        4001 ||
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

  setupBuyButton();

  setupRefresh();

  await loadContractSettings();

  /*
    Start the animated Activity immediately.
    This is intentionally before market loading
    so the Activity animation is visible without
    waiting for external market APIs.
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
