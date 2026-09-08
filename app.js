/* ==========================================================
   BTC / BNB PORTAL
   BNB Smart Chain
   Contract:
   0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
   ========================================================== */

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;
const CHAIN_HEX = "0x38";

const FALLBACK_MIN_BNB = 5;
const FALLBACK_MAX_BNB = 1000;
const FALLBACK_BONUS = 11;


/* ----------------------------------------------------------
   CONTRACT ABI
   ---------------------------------------------------------- */

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


/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */

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


/* ----------------------------------------------------------
   HELPERS
   ---------------------------------------------------------- */

const $ = id => document.getElementById(id);

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}


function money(value) {
  return Number(value).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }
  );
}


function numberText(value, decimals = 8) {
  return Number(value).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: decimals
    }
  );
}


function shortAddress(address) {
  if (!address) return "";

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );
}


function showToast(message) {

  let toast = $("portalToast");

  if (!toast) {

    toast = document.createElement("div");

    toast.id = "portalToast";

    toast.style.cssText = `
      position:fixed;
      left:50%;
      bottom:25px;
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
      font:600 14px Inter,Arial,sans-serif;
      box-shadow:0 20px 60px rgba(0,0,0,.4);
    `;

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.style.opacity = "1";
  toast.style.transform = "translate(-50%,0)";

  clearTimeout(window.__toastTimer);

  window.__toastTimer =
    setTimeout(() => {

      toast.style.opacity = "0";
      toast.style.transform =
        "translate(-50%,20px)";

    }, 3000);
}


/* ----------------------------------------------------------
   READ PROVIDER
   ---------------------------------------------------------- */

function getReadProvider() {

  if (readProvider) {
    return readProvider;
  }

  const rpc =
    "https://bsc-dataseed.binance.org/";

  readProvider =
    new ethers.JsonRpcProvider(
      rpc,
      CHAIN_ID,
      {
        staticNetwork: true
      }
    );

  return readProvider;
}


function getReadContract() {

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    getReadProvider()
  );
}


/* ----------------------------------------------------------
   CONTRACT SETTINGS
   ---------------------------------------------------------- */

async function loadContractSettings() {

  try {

    const c = getReadContract();

    const results =
      await Promise.allSettled([

        c.decimals(),

        c.referenceMinimumBNB(),

        c.referenceMaximumBNB(),

        c.BONUS_PERCENT()

      ]);


    if (results[0].status === "fulfilled") {

      btcDecimals =
        Number(results[0].value);
    }


    if (results[1].status === "fulfilled") {

      minBNB =
        Number(
          ethers.formatEther(
            results[1].value
          )
        );
    }


    if (results[2].status === "fulfilled") {

      maxBNB =
        Number(
          ethers.formatEther(
            results[2].value
          )
        );
    }


    if (results[3].status === "fulfilled") {

      bonusPercent =
        Number(results[3].value);
    }


    updateLimits();

  } catch (error) {

    console.error(
      "Contract settings:",
      error
    );

    updateLimits();
  }
}


function updateLimits() {

  const input = $("bnbAmount");

  if (input) {

    input.min = String(minBNB);
    input.max = String(maxBNB);

    if (!input.value) {
      input.placeholder =
        String(minBNB);
    }
  }


  setText(
    "calculatorMessage",
    `Minimum ${numberText(minBNB, 2)} BNB · Maximum ${numberText(maxBNB, 2)} BNB`
  );


  setText(
    "minimumStat",
    `${numberText(minBNB, 2)} BNB`
  );


  setText(
    "maximumStat",
    `${numberText(maxBNB, 2)} BNB`
  );


  setText(
    "bonusStat",
    `${bonusPercent}%`
  );


  setText(
    "bonusBadge",
    `+${bonusPercent}%`
  );
}


/* ----------------------------------------------------------
   CALCULATOR
   ---------------------------------------------------------- */

async function calculateBTC() {

  const input = $("bnbAmount");

  const amount =
    Number(input?.value);


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


  if (amount < minBNB) {

    resetCalculator();

    setText(
      "calculatorMessage",
      `Minimum participation is ${minBNB} BNB.`
    );

    return;
  }


  if (amount > maxBNB) {

    resetCalculator();

    setText(
      "calculatorMessage",
      `Maximum participation is ${maxBNB} BNB.`
    );

    return;
  }


  try {

    const c =
      getReadContract();


    const bnb =
      ethers.parseEther(
        amount.toString()
      );


    const result =
      await c.calculateBTC(bnb);


    const base =
      ethers.formatUnits(
        result.baseAmount,
        btcDecimals
      );


    const bonus =
      ethers.formatUnits(
        result.bonusAmount,
        btcDecimals
      );


    const total =
      ethers.formatUnits(
        result.totalAmount,
        btcDecimals
      );


    setText(
      "baseBTC",
      `${numberText(base)} BTC`
    );


    setText(
      "bonusBTC",
      `${numberText(bonus)} BTC`
    );


    setText(
      "totalBTC",
      `${numberText(total)} BTC`
    );


    setText(
      "calculatorMessage",
      `Calculation completed · ${bonusPercent}% bonus`
    );

  } catch (error) {

    console.error(
      "Calculator error:",
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


/* ----------------------------------------------------------
   MARKET DATA
   ---------------------------------------------------------- */

async function fetchJSON(url) {

  const response =
    await fetch(
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


async function loadMarketSymbol(
  symbol,
  priceId,
  changeId
) {

  const endpoints = [

    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`,

    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`

  ];


  let data = null;


  for (const endpoint of endpoints) {

    try {

      data =
        await fetchJSON(
          endpoint
        );

      break;

    } catch (error) {

      console.warn(
        `${symbol} endpoint failed`
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
    Number(data.lastPrice);


  const change =
    Number(data.priceChangePercent);


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
    `${Number.isFinite(change) ? change.toFixed(2) : "0.00"}% today`
  );
}


async function loadMarketData() {

  await Promise.allSettled([

    loadMarketSymbol(
      "BTCUSDT",
      "btcPrice",
      "btcChange"
    ),

    loadMarketSymbol(
      "BNBUSDT",
      "bnbPrice",
      "bnbChange"
    )

  ]);
}


/* ----------------------------------------------------------
   ACTIVITY
   ---------------------------------------------------------- */

function ensureActivityFeed() {

  let feed =
    $("activityFeed");


  if (!feed) {

    const section =
      $("activity");


    if (!section) {
      return null;
    }


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


  return feed;
}


function createActivityItem(entry) {

  const item =
    document.createElement(
      "div"
    );


  item.className =
    "activity-item";


  item.innerHTML = `

    <div class="activity-row">

      <div class="activity-icon">
        ↗
      </div>

      <div class="activity-main">

        <strong>
          ${numberText(entry.totalBTC)} BTC
        </strong>

        <small>
          ${shortAddress(entry.buyer)}
        </small>

      </div>

    </div>

  `;


  item.style.opacity = "0";
  item.style.transform =
    "translateY(15px)";
  item.style.transition =
    "opacity .5s ease, transform .5s ease";


  requestAnimationFrame(() => {

    item.style.opacity = "1";
    item.style.transform =
      "translateY(0)";
  });


  return item;
}


function renderActivity() {

  const feed =
    ensureActivityFeed();


  if (!feed) {
    return;
  }


  feed.innerHTML = "";


  if (!activityEntries.length) {

    feed.innerHTML = `

      <div class="activity-row">

        <div class="activity-icon">
          ↗
        </div>

        <div class="activity-main">

          <strong>
            Waiting for confirmed activity
          </strong>

          <small>
            BTCPurchased events will appear here automatically.
          </small>

        </div>

      </div>

    `;

    return;
  }


  const amountToShow =
    Math.min(
      3,
      activityEntries.length
    );


  for (
    let i = 0;
    i < amountToShow;
    i++
  ) {

    const index =
      (
        activityIndex + i
      ) %
      activityEntries.length;


    feed.appendChild(
      createActivityItem(
        activityEntries[index]
      )
    );
  }


  clearTimeout(
    activityTimer
  );


  if (
    activityEntries.length > 1
  ) {

    activityTimer =
      setTimeout(
        () => {

          activityIndex =
            (
              activityIndex + 1
            ) %
            activityEntries.length;

          renderActivity();

        },
        4800
      );
  }
}


async function loadActivity() {

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


    activityEntries =
      events
        .slice(-12)
        .reverse()
        .map(event => ({

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

        }));


    activityIndex = 0;

    renderActivity();

  } catch (error) {

    console.error(
      "Activity error:",
      error
    );

    renderActivity();
  }
}


/* ----------------------------------------------------------
   WALLET DISCOVERY
   ---------------------------------------------------------- */

const WALLET_LIST = [

  {
    name: "MetaMask",
    match: /metamask/i,
    icon: "https://cdn.simpleicons.org/metamask"
  },

  {
    name: "Trust Wallet",
    match: /trust/i,
    icon: "https://cdn.simpleicons.org/trustwallet"
  },

  {
    name: "Binance Wallet",
    match: /binance/i,
    icon: "https://cdn.simpleicons.org/binance"
  },

  {
    name: "OKX Wallet",
    match: /okx/i,
    icon: "https://cdn.simpleicons.org/okx"
  },

  {
    name: "Bitget Wallet",
    match: /bitget/i,
    icon: "https://cdn.simpleicons.org/bitget"
  },

  {
    name: "SafePal",
    match: /safepal/i,
    icon: "https://cdn.simpleicons.org/safepal"
  },

  {
    name: "Rabby",
    match: /rabby/i,
    icon: "https://cdn.simpleicons.org/rabby"
  }

];


function discoverWallets() {

  window.addEventListener(
    "eip6963:announceProvider",
    event => {

      const detail =
        event.detail;


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
        info: {
          name: "Browser Wallet",
          rdns: "injected"
        },

        provider:
          window.ethereum
      }
    );
  }
}


function getWalletProvider(wallet) {

  for (
    const item
    of discoveredWallets.values()
  ) {

    const info =
      item.info || {};


    const name =
      `${info.name || ""} ${info.rdns || ""}`;


    if (
      wallet.match.test(name)
    ) {

      return item.provider;
    }
  }


  if (
    discoveredWallets.size === 1
  ) {

    return [
      ...discoveredWallets.values()
    ][0].provider;
  }


  return null;
}


/* ----------------------------------------------------------
   WALLET MODAL
   ---------------------------------------------------------- */

function createWalletModal() {

  if ($("walletModalFinal")) {
    return;
  }


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "walletModalFinal";


  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:9999;
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(3,7,18,.82);
    backdrop-filter:blur(12px);
  `;


  overlay.innerHTML = `

    <div
      style="
        width:min(450px,100%);
        max-height:90vh;
        overflow:auto;
        padding:24px;
        border-radius:22px;
        background:#0b1020;
        border:1px solid rgba(255,255,255,.1);
        box-shadow:0 30px 90px rgba(0,0,0,.6);
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:15px;
        "
      >

        <h2
          style="
            margin:0;
            color:white;
            font-size:23px;
          "
        >
          Connect Wallet
        </h2>

        <button
          id="walletClose"
          type="button"
          style="
            width:38px;
            height:38px;
            border-radius:50%;
            border:1px solid rgba(255,255,255,.1);
            background:#151b2b;
            color:white;
            font-size:24px;
            cursor:pointer;
          "
        >
          ×
        </button>

      </div>


      <p
        style="
          color:#8f9bb0;
          font-size:13px;
          line-height:1.6;
          margin:9px 0 18px;
        "
      >
        Choose your preferred wallet for BNB Smart Chain.
      </p>


      <div id="walletOptions"></div>

    </div>
  `;


  document.body.appendChild(
    overlay
  );


  $("walletClose")
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


  if (!box) {
    return;
  }


  box.innerHTML =
    WALLET_LIST.map(
      (wallet, index) => `

        <button
          type="button"
          data-wallet="${index}"
          style="
            width:100%;
            display:flex;
            align-items:center;
            gap:13px;
            margin-top:9px;
            padding:12px;
            border-radius:14px;
            border:1px solid rgba(255,255,255,.08);
            background:#101728;
            color:white;
            cursor:pointer;
            text-align:left;
          "
        >

          <img
            src="${wallet.icon}"
            alt=""
            width="40"
            height="40"
            style="
              width:40px;
              height:40px;
              border-radius:10px;
              background:white;
              padding:4px;
              object-fit:contain;
            "
          >

          <span>
            <strong
              style="
                display:block;
                font-size:14px;
              "
            >
              ${wallet.name}
            </strong>

            <small
              style="
                display:block;
                margin-top:3px;
                color:#7f8ba0;
              "
            >
              BNB Smart Chain
            </small>
          </span>

        </button>

      `
    ).join("");


  box
    .querySelectorAll(
      "[data-wallet]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const wallet =
            WALLET_LIST[
              Number(
                button.dataset.wallet
              )
            ];


          connectSelectedWallet(
            wallet
          );
        }
      );
    });
}


function openWalletModal() {

  createWalletModal();

  renderWalletOptions();

  $("walletModalFinal")
    .style.display = "flex";
}


function closeWalletModal() {

  const modal =
    $("walletModalFinal");


  if (modal) {
    modal.style.display =
      "none";
  }
}


/* ----------------------------------------------------------
   NETWORK
   ---------------------------------------------------------- */

async function ensureBSC(provider) {

  const chain =
    await provider.request({
      method: "eth_chainId"
    });


  if (
    chain === CHAIN_HEX
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
      error?.code === 4902
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

            nativeCurrency:
              {
                name: "BNB",
                symbol: "BNB",
                decimals: 18
              },

            rpcUrls:
              [
                "https://bsc-dataseed.binance.org/"
              ],

            blockExplorerUrls:
              [
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


/* ----------------------------------------------------------
   CONNECT SELECTED WALLET
   ---------------------------------------------------------- */

async function connectSelectedWallet(
  wallet
) {

  const selectedProvider =
    getWalletProvider(
      wallet
    );


  if (!selectedProvider) {

    showToast(
      `${wallet.name} is not available in this browser.`
    );

    return;
  }


  try {

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

    closeWalletModal();


    showToast(
      `${wallet.name} connected.`
    );


  } catch (error) {

    console.error(
      "Wallet error:",
      error
    );


    if (
      error?.code === 4001 ||
      error?.code === "ACTION_REJECTED"
    ) {

      showToast(
        "Wallet connection cancelled."
      );

    } else {

      showToast(
        error?.shortMessage ||
        "Unable to connect wallet."
      );
    }
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


function setupWallet() {

  discoverWallets();

  createWalletModal();


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


        if (!connectedAddress) {

          signer = null;
          contract = null;
        }


        updateWalletButton();
      }
    );
  }
}


/* ----------------------------------------------------------
   BUY BTC
   ---------------------------------------------------------- */

async function buyBTC() {

  const input =
    $("bnbAmount");


  const amount =
    Number(input?.value);


  if (
    !Number.isFinite(amount) ||
    amount < minBNB ||
    amount > maxBNB
  ) {

    showToast(
      `Enter an amount between ${minBNB} and ${maxBNB} BNB.`
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
      Number(
        network.chainId
      ) !== CHAIN_ID
    ) {

      const rawProvider =
        walletProvider.provider;


      await ensureBSC(
        rawProvider
      );


      walletProvider =
        new ethers.BrowserProvider(
          rawProvider
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
        value
      });


    showToast(
      "Transaction submitted. Waiting for confirmation."
    );


    await transaction.wait();


    showToast(
      "BTC purchase confirmed."
    );


    await loadActivity();

  } catch (error) {

    console.error(
      "Buy BTC error:",
      error
    );


    if (
      error?.code === 4001 ||
      error?.code === "ACTION_REJECTED"
    ) {

      showToast(
        "Transaction cancelled."
      );

    } else {

      showToast(
        error?.shortMessage ||
        "Transaction could not be completed."
      );
    }
  }
}


/* ----------------------------------------------------------
   COPY CONTRACT
   ---------------------------------------------------------- */

function setupCopyContract() {

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


        showToast(
          "Contract address copied."
        );


        setTimeout(
          () => {
            button.textContent =
              "Copy";
          },
          1800
        );

      } catch {

        showToast(
          "Unable to copy automatically."
        );
      }
    }
  );
}


/* ----------------------------------------------------------
   BUY BUTTON
   ---------------------------------------------------------- */

function setupBuyButton() {

  const button =
    $("buyBTCButton");


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    buyBTC
  );
}


/* ----------------------------------------------------------
   START
   ---------------------------------------------------------- */

async function startPortal() {

  setupCalculator();

  setupWallet();

  setupCopyContract();

  setupBuyButton();

  await loadContractSettings();

  await loadMarketData();

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
