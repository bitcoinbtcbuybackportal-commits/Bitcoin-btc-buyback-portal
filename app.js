const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;

const BONUS_PERCENT = 11;
const MIN_BNB = 5;
const MAX_BNB = 500;


/* Full ABI relevant to this portal */

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
    name: "contractBNBBalance",
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
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },

  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];


let provider = null;
let signer = null;
let contract = null;
let connectedAddress = null;


document.addEventListener(
  "DOMContentLoaded",
  startPortal
);


function startPortal() {

  createParticles();

  setupCalculator();

  setupWallet();

  setupBuyButton();

  setupCopyButton();

  startActivityFeed();

  loadMarketData();

  if (window.ethereum) {

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    window.ethereum.on(
      "chainChanged",
      () => {
        window.location.reload();
      }
    );
  }
}


/* =========================
   CALCULATOR
   ========================= */

function setupCalculator() {

  const input =
    document.getElementById("bnbAmount");

  const button =
    document.getElementById("calculateButton");

  if (!input || !button) return;

  input.addEventListener(
    "input",
    () => {

      if (!input.value) {
        resetCalculator();
        return;
      }

      calculateBTC(input.value);
    }
  );

  button.addEventListener(
    "click",
    () => {
      calculateBTC(input.value);
    }
  );
}


async function calculateBTC(value) {

  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    resetCalculator();

    showCalculatorMessage(
      "Enter a valid BNB amount."
    );

    return;
  }


  if (amount < MIN_BNB) {

    resetCalculator();

    showCalculatorMessage(
      `Minimum amount is ${MIN_BNB} BNB.`
    );

    return;
  }


  if (amount > MAX_BNB) {

    resetCalculator();

    showCalculatorMessage(
      `Maximum amount is ${MAX_BNB} BNB.`
    );

    return;
  }


  /*
   * The contract calculation does not require
   * a connected wallet.
   */

  try {

    const readProvider =
      new ethers.JsonRpcProvider(
        "https://bsc-dataseed.binance.org/"
      );

    const readContract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        readProvider
      );

    const rawAmount =
      ethers.parseEther(
        amount.toString()
      );

    const result =
      await readContract.calculateBTC(
        rawAmount
      );

    const decimals =
      await readContract.decimals();

    const base =
      Number(
        ethers.formatUnits(
          result.baseAmount,
          decimals
        )
      );

    const bonus =
      Number(
        ethers.formatUnits(
          result.bonusAmount,
          decimals
        )
      );

    const total =
      Number(
        ethers.formatUnits(
          result.totalAmount,
          decimals
        )
      );

    updateResults(
      base,
      bonus,
      total
    );

    showCalculatorMessage(
      "Allocation calculated from the contract."
    );

    return;

  } catch (error) {

    console.warn(
      "Contract read failed:",
      error
    );
  }


  /*
   * Interface fallback.
   */

  const base = amount;

  const bonus =
    base * BONUS_PERCENT / 100;

  const total =
    base + bonus;

  updateResults(
    base,
    bonus,
    total
  );

  showCalculatorMessage(
    "Allocation estimate calculated using the configured bonus."
  );
}


function updateResults(
  base,
  bonus,
  total
) {

  setText(
    "baseBTC",
    formatNumber(base) + " BTC"
  );

  setText(
    "bonusBTC",
    formatNumber(bonus) + " BTC"
  );

  setText(
    "totalBTC",
    formatNumber(total) + " BTC"
  );
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

  showCalculatorMessage(
    "Enter an amount to calculate."
  );
}


function showCalculatorMessage(message) {

  setText(
    "calculatorMessage",
    message
  );
}


/* =========================
   WALLET
   ========================= */

function setupWallet() {

  const button =
    document.getElementById(
      "connectWallet"
    );

  if (!button) return;

  button.addEventListener(
    "click",
    connectWallet
  );
}


async function connectWallet() {

  if (!window.ethereum) {

    showToast(
      "Please install MetaMask or another compatible Web3 wallet."
    );

    return false;
  }


  try {

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


    if (
      Number(network.chainId) !== CHAIN_ID
    ) {

      await switchToBSC();

      provider =
        new ethers.BrowserProvider(
          window.ethereum
        );
    }


    signer =
      await provider.getSigner();


    connectedAddress =
      await signer.getAddress();


    contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );


    updateWalletDisplay(
      connectedAddress
    );


    showToast(
      "Wallet connected."
    );


    return true;

  } catch (error) {

    console.error(error);

    showToast(
      "Wallet connection was cancelled or failed."
    );

    return false;
  }
}


async function switchToBSC() {

  try {

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: "0x38"
        }
      ]
    });

  } catch (error) {

    if (error.code === 4902) {

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            chainName: "BNB Smart Chain",
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18
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

      return;
    }

    throw error;
  }
}


function handleAccountsChanged(
  accounts
) {

  if (!accounts.length) {

    connectedAddress = null;
    signer = null;
    contract = null;

    updateWalletDisplay(null);

    return;
  }


  connectedAddress =
    accounts[0];

  updateWalletDisplay(
    connectedAddress
  );
}


function updateWalletDisplay(
  address
) {

  const button =
    document.getElementById(
      "connectWallet"
    );

  const status =
    document.getElementById(
      "walletStatus"
    );


  if (!address) {

    if (button) {
      button.textContent =
        "Connect Wallet";
    }

    if (status) {
      status.textContent =
        "Not connected";
    }

    return;
  }


  const shortened =
    `${address.slice(0, 6)}...${address.slice(-4)}`;


  if (button) {
    button.textContent =
      shortened;
  }

  if (status) {
    status.textContent =
      shortened;
  }
}


/* =========================
   BUY BTC
   ========================= */

function setupBuyButton() {

  const button =
    document.getElementById(
      "buyBTCButton"
    );

  if (!button) return;

  button.addEventListener(
    "click",
    buyBTC
  );
}


async function buyBTC() {

  const input =
    document.getElementById(
      "bnbAmount"
    );

  const amount =
    Number(input?.value);


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showToast(
      "Enter a BNB amount first."
    );

    return;
  }


  if (amount < MIN_BNB) {

    showToast(
      `Minimum amount is ${MIN_BNB} BNB.`
    );

    return;
  }


  if (amount > MAX_BNB) {

    showToast(
      `Maximum amount is ${MAX_BNB} BNB.`
    );

    return;
  }


  /*
   * Connect MetaMask first.
   */

  const connected =
    await connectWallet();

  if (!connected) return;


  try {

    /*
     * Refresh provider after network switch.
     */

    provider =
      new ethers.BrowserProvider(
        window.ethereum
      );


    signer =
      await provider.getSigner();


    const network =
      await provider.getNetwork();


    if (
      Number(network.chainId) !== CHAIN_ID
    ) {

      showToast(
        "Please switch MetaMask to BNB Smart Chain."
      );

      return;
    }


    contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );


    const value =
      ethers.parseEther(
        amount.toString()
      );


    /*
     * This calls the contract's actual payable
     * buyBTC() function.
     *
     * MetaMask receives the transaction and
     * the user must review/confirm it there.
     */

    showToast(
      "Opening MetaMask for transaction review..."
    );


    const tx =
      await contract.buyBTC({
        value
      });


    showToast(
      `Transaction submitted: ${tx.hash.slice(0, 10)}...`
    );


    await tx.wait();


    showToast(
      "Transaction confirmed on BNB Smart Chain."
    );


    addConfirmedActivity(
      amount,
      tx.hash
    );


  } catch (error) {

    console.error(
      "Purchase transaction failed:",
      error
    );


    if (
      error?.code === 4001 ||
      error?.code === "ACTION_REJECTED"
    ) {

      showToast(
        "Transaction rejected in MetaMask."
      );

    } else {

      showToast(
        error?.shortMessage ||
        "Transaction failed."
      );
    }
  }
}


/* =========================
   MARKET
   ========================= */

async function loadMarketData() {

  /*
   * Use CoinGecko's public API rather than the
   * malformed Markdown URLs that were in the
   * previous app.js.
   */

  try {

    const response =
      await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,binancecoin&vs_currencies=usd&include_24hr_change=true",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const data =
      await response.json();


    const btc =
      data.bitcoin;


    const bnb =
      data.binancecoin;


    if (btc) {

      setText(
        "btcPrice",
        money(btc.usd)
      );

      setText(
        "btcChange",
        `${Number(btc.usd_24h_change || 0).toFixed(2)}% today`
      );
    }


    if (bnb) {

      setText(
        "bnbPrice",
        money(bnb.usd)
      );

      setText(
        "bnbChange",
        `${Number(bnb.usd_24h_change || 0).toFixed(2)}% today`
      );
    }


  } catch (error) {

    console.warn(
      "Market API failed:",
      error
    );


    setText(
      "btcPrice",
      "Unavailable"
    );

    setText(
      "bnbPrice",
      "Unavailable"
    );

    setText(
      "btcChange",
      "Market data unavailable"
    );

    setText(
      "bnbChange",
      "Market data unavailable"
    );
  }


  /*
   * Refresh prices periodically.
   */

  setTimeout(
    loadMarketData,
    30000
  );
}


/* =========================
   ACTIVITY
   ========================= */

function startActivityFeed() {

  const feed =
    document.getElementById(
      "activityFeed"
    );

  if (!feed) return;


  const activities = [
    "Portal ready",
    "BTC allocation calculated",
    "BNB Smart Chain activity",
    "Wallet interaction ready"
  ];


  let index = 0;


  setTimeout(
    () => {

      addActivity(
        activities[index]
      );

      index++;

    },
    1200
  );


  setInterval(
    () => {

      addActivity(
        activities[
          index % activities.length
        ]
      );

      index++;

    },
    5000
  );
}


function addActivity(
  type
) {

  const feed =
    document.getElementById(
      "activityFeed"
    );

  if (!feed) return;


  const placeholder =
    feed.querySelector(
      ".activity-placeholder"
    );

  if (placeholder) {
    placeholder.remove();
  }


  const item =
    document.createElement(
      "div"
    );


  item.className =
    "activity-item";


  item.innerHTML = `
    <div class="activity-icon">₿</div>

    <div class="activity-main">
      <strong>${escapeHTML(type)}</strong>
      <span>Portal activity • BNB Smart Chain</span>
    </div>

    <div class="activity-amount">
      LIVE
    </div>
  `;


  feed.prepend(item);


  while (
    feed.children.length > 5
  ) {

    feed.lastElementChild.remove();
  }


  setTimeout(
    () => {

      if (
        item.parentElement
      ) {
        item.remove();
      }

    },
    11000
  );
}


function addConfirmedActivity(
  amount,
  hash
) {

  const feed =
    document.getElementById(
      "activityFeed"
    );

  if (!feed) return;


  const placeholder =
    feed.querySelector(
      ".activity-placeholder"
    );

  if (placeholder) {
    placeholder.remove();
  }


  const item =
    document.createElement(
      "div"
    );


  item.className =
    "activity-item";


  item.innerHTML = `
    <div class="activity-icon">₿</div>

    <div class="activity-main">
      <strong>Confirmed BTC purchase</strong>
      <span>TX ${escapeHTML(hash.slice(0, 14))}...</span>
    </div>

    <div class="activity-amount">
      ${formatNumber(amount)} BNB
    </div>
  `;


  feed.prepend(item);
}


/* =========================
   COPY
   ========================= */

function setupCopyButton() {

  const button =
    document.getElementById(
      "copyContract"
    );

  const address =
    document.getElementById(
      "contractAddress"
    );

  if (!button || !address) return;


  button.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          address.textContent.trim()
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


/* =========================
   HELPERS
   ========================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      value;
  }
}


function formatNumber(
  value
) {

  return Number(
    value
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 8
    }
  );
}


function money(
  value
) {

  return Number(
    value
  ).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }
  );
}


function showToast(
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );

  const text =
    document.getElementById(
      "toastMessage"
    );

  if (!toast || !text) return;


  text.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      4000
    );
}


function escapeHTML(
  value
) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
