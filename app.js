/* ==========================================================
   BITCOIN BTC PORTAL
   Existing HTML/CSS preserved
   ========================================================== */

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;
const BONUS_PERCENT = 11;
const MIN_BNB = 1;

/* ==========================================================
   COMPLETE CONTRACT ABI
   ========================================================== */

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
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" }
    ],
    name: "ERC20InsufficientAllowance",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" }
    ],
    name: "ERC20InsufficientBalance",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "approver", type: "address" }
    ],
    name: "ERC20InvalidApprover",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "receiver", type: "address" }
    ],
    name: "ERC20InvalidReceiver",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" }
    ],
    name: "ERC20InvalidSender",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" }
    ],
    name: "ERC20InvalidSpender",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" }
    ],
    name: "OwnableInvalidOwner",
    type: "error"
  },

  {
    inputs: [
      { internalType: "address", name: "account", type: "address" }
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },

  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error"
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "BNBWithdrawn",
    type: "event"
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "minimumBNB",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maximumBNB",
        type: "uint256"
      }
    ],
    name: "ReferenceLimitsUpdated",
    type: "event"
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
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
    name: "TOTAL_SUPPLY",
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
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" }
    ],
    name: "allowance",
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
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
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
    inputs: [
      { internalType: "address", name: "account", type: "address" }
    ],
    name: "balanceOf",
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
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },

  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" }
    ],
    name: "recoverERC20",
    outputs: [],
    stateMutability: "nonpayable",
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
  },

  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [
      { internalType: "uint256", name: "minimumBNB", type: "uint256" },
      { internalType: "uint256", name: "maximumBNB", type: "uint256" }
    ],
    name: "setReferenceLimits",
    outputs: [],
    stateMutability: "nonpayable",
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
  },

  {
    inputs: [],
    name: "totalSupply",
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
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" }
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [
      { internalType: "address", name: "newOwner", type: "address" }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [],
    name: "withdrawAllBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "withdrawBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    stateMutability: "payable",
    type: "receive"
  }
];

/* ==========================================================
   STATE
   ========================================================== */

let provider = null;
let signer = null;
let contract = null;
let connectedAddress = null;
let activityTimer = null;

/* ==========================================================
   HELPERS
   ========================================================== */

const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 8
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
  if (!address) return "Unknown";

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showToast(message) {
  const toast = $("toast");
  const text = $("toastMessage");

  if (!toast || !text) return;

  text.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ==========================================================
   ACTIVITY ANIMATION
   ========================================================== */

function installActivityStyles() {
  if ($("activityAnimationStyles")) return;

  const style = document.createElement("style");

  style.id = "activityAnimationStyles";

  style.textContent = `
    .activity-feed {
      overflow: hidden;
    }

    .activity-item {
      animation: btcActivityFade 5s ease both;
    }

    .activity-text {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: .75rem;
      align-items: center;
    }

    .activity-text > span {
      grid-row: span 2;
      font-size: 1.35rem;
    }

    .activity-text strong,
    .activity-text small {
      display: block;
    }

    @keyframes btcActivityFade {
      0% {
        opacity: 0;
        transform: translateY(16px);
      }

      12% {
        opacity: 1;
        transform: translateY(0);
      }

      72% {
        opacity: 1;
        transform: translateY(0);
      }

      100% {
        opacity: 0;
        transform: translateY(-16px);
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================================
   PARTICLES
   ========================================================== */

function createParticles() {
  const container = $("particles");

  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const particle = document.createElement("span");

    particle.style.position = "absolute";
    particle.style.width = "2px";
    particle.style.height = "2px";
    particle.style.borderRadius = "50%";
    particle.style.background = "rgba(247,147,26,.5)";

    particle.style.left =
      `${Math.random() * 100}%`;

    particle.style.top =
      `${Math.random() * 100}%`;

    particle.style.opacity =
      `${Math.random() * 0.5 + 0.1}`;

    particle.style.animation =
      `particleFloat ${6 + Math.random() * 10}s linear infinite`;

    container.appendChild(particle);
  }
}

/* ==========================================================
   READ-ONLY CONTRACT
   ========================================================== */

async function getReadContract() {
  if (!window.ethers) {
    throw new Error("ethers.js is not loaded.");
  }

  if (!window.ethereum) {
    throw new Error("No Web3 wallet detected.");
  }

  if (!provider) {
    provider =
      new ethers.BrowserProvider(
        window.ethereum
      );
  }

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );
}

/* ==========================================================
   BTC CALCULATOR
   ========================================================== */

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
      `Minimum participation is ${MIN_BNB} BNB.`
    );

    return;
  }

  try {
    const readContract =
      await getReadContract();

    const rawAmount =
      ethers.parseEther(
        amount.toString()
      );

    const result =
      await readContract.calculateBTC(
        rawAmount
      );

    const decimals =
      Number(
        await readContract.decimals()
      );

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
      "Calculation completed from the configured contract."
    );

  } catch (error) {
    console.error(
      "Contract calculation unavailable:",
      error
    );

    resetCalculator();

    showCalculatorMessage(
      "Unable to read the contract calculation right now."
    );
  }
}

function updateResults(
  base,
  bonus,
  total
) {
  setText(
    "baseBTC",
    `${formatNumber(base)} BTC`
  );

  setText(
    "bonusBTC",
    `${formatNumber(bonus)} BTC`
  );

  setText(
    "totalBTC",
    `${formatNumber(total)} BTC`
  );
}

function resetCalculator() {
  updateResults(
    0,
    0,
    0
  );
}

function showCalculatorMessage(message) {
  const element =
    $("calculatorMessage");

  if (element) {
    element.textContent = message;
  }
}

function setupCalculator() {
  const input =
    $("bnbAmount");

  const button =
    $("calculateButton");

  if (input) {
    input.min =
      String(MIN_BNB);

    input.step =
      "0.01";

    /*
     * Deliberately no maximum is
     * imposed by the frontend.
     */

    input.removeAttribute("max");

    input.addEventListener(
      "input",
      () => {
        if (input.value) {
          calculateBTC(
            input.value
          );
        } else {
          resetCalculator();
        }
      }
    );
  }

  if (button) {
    button.addEventListener(
      "click",
      () => {
        calculateBTC(
          input?.value
        );
      }
    );
  }
}

/* ==========================================================
   BNB SMART CHAIN
   ========================================================== */

async function ensureBSC() {
  if (!window.ethereum) {
    throw new Error(
      "No compatible Web3 wallet detected."
    );
  }

  const chainId =
    await window.ethereum.request({
      method: "eth_chainId"
    });

  if (
    chainId.toLowerCase() === "0x38"
  ) {
    return true;
  }

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

    return true;

  } catch (error) {

    if (error.code === 4902) {

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
              "https://bscscan.com/"
            ]
          }
        ]
      });

      return true;
    }

    throw error;
  }
}

/* ==========================================================
   CONNECT WALLET
   ========================================================== */

async function connectWallet() {
  if (!window.ethereum) {
    showToast(
      "No compatible Web3 wallet detected."
    );

    return false;
  }

  try {
    await ensureBSC();

    provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    await provider.send(
      "eth_requestAccounts",
      []
    );

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
    console.error(
      "Wallet connection error:",
      error
    );

    if (
      error?.code === 4001 ||
      error?.code === "ACTION_REJECTED"
    ) {
      showToast(
        "Wallet connection was cancelled."
      );
    } else {
      showToast(
        "Unable to connect wallet."
      );
    }

    return false;
  }
}

function updateWalletDisplay(address) {
  const button =
    $("connectWallet");

  if (!button) return;

  button.textContent =
    address
      ? shortAddress(address)
      : "Connect Wallet";
}

/* ==========================================================
   BUY BTC WITH BNB
   Calls payable buyBTC()
   ========================================================== */

async function buyBTC() {
  const input =
    $("bnbAmount");

  const rawInput =
    input?.value?.trim();

  const amount =
    Number(rawInput);

  if (
    !rawInput ||
    !Number.isFinite(amount) ||
    amount < MIN_BNB
  ) {
    showCalculatorMessage(
      `Enter an amount of at least ${MIN_BNB} BNB.`
    );

    return;
  }

  if (!window.ethereum) {
    showToast(
      "No compatible Web3 wallet detected."
    );

    return;
  }

  try {

    /*
     * Make sure BNB Smart Chain is selected
     * before opening the transaction.
     */

    await ensureBSC();

    /*
     * Always rebuild the provider/signer
     * after a possible chain switch.
     */

    provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    await provider.send(
      "eth_requestAccounts",
      []
    );

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

    /*
     * Use the exact entered BNB amount.
     */

    const value =
      ethers.parseEther(
        rawInput
      );

    /*
     * This opens MetaMask with:
     *
     * To:
     * CONTRACT_ADDRESS
     *
     * Value:
     * entered BNB amount
     *
     * The contract function:
     * buyBTC()
     */

    const transaction =
      await contract.buyBTC({
        value: value
      });

    showToast(
      "Transaction submitted. Waiting for confirmation."
    );

    await transaction.wait();

    showToast(
      "BTC purchase confirmed."
    );

    /*
     * Refresh genuine on-chain activity
     * after confirmation.
     */

    await loadActivity();

  } catch (error) {

    console.error(
      "buyBTC failed:",
      error
    );

    if (
      error?.code === 4001 ||
      error?.code === "ACTION_REJECTED"
    ) {
      showToast(
        "Transaction cancelled."
      );

      return;
    }

    if (
      error?.code === "INSUFFICIENT_FUNDS"
    ) {
      showToast(
        "Insufficient BNB for this transaction."
      );

      return;
    }

    showToast(
      error?.shortMessage ||
      error?.reason ||
      "Transaction could not be completed."
    );
  }
}

/* ==========================================================
   WALLET BUTTON
   ========================================================== */

function setupWallet() {
  const button =
    $("connectWallet");

  if (!button) return;

  button.addEventListener(
    "click",
    connectWallet
  );
}

/* ==========================================================
   MARKET DATA
   ========================================================== */

async function fetchTicker(symbol) {
  const urls = [
    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`,
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
  ];

  let lastError =
    null;

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
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      if (
        !data ||
        !data.lastPrice
      ) {
        throw new Error(
          "Invalid market response"
        );
      }

      return data;

    } catch (error) {
      lastError =
        error;
    }
  }

  throw lastError ||
    new Error(
      "Market request failed."
    );
}

async function loadMarketData() {
  try {

    const [
      btc,
      bnb
    ] =
      await Promise.all([
        fetchTicker(
          "BTCUSDT"
        ),

        fetchTicker(
          "BNBUSDT"
        )
      ]);

    const btcPrice =
      Number(
        btc.lastPrice
      );

    const bnbPrice =
      Number(
        bnb.lastPrice
      );

    if (
      !Number.isFinite(
        btcPrice
      ) ||
      !Number.isFinite(
        bnbPrice
      )
    ) {
      throw new Error(
        "Invalid market data."
      );
    }

    setText(
      "btcPrice",
      money(
        btcPrice
      )
    );

    setText(
      "btcChange",
      `${Number(
        btc.priceChangePercent
      ).toFixed(2)}% today`
    );

    setText(
      "bnbPrice",
      money(
        bnbPrice
      )
    );

    setText(
      "bnbChange",
      `${Number(
        bnb.priceChangePercent
      ).toFixed(2)}% today`
    );

  } catch (error) {

    console.error(
      "Market data error:",
      error
    );

    setText(
      "btcPrice",
      "Unavailable"
    );

    setText(
      "btcChange",
      "Market data unavailable"
    );

    setText(
      "bnbPrice",
      "Unavailable"
    );

    setText(
      "bnbChange",
      "Market data unavailable"
    );
  }
}

/* ==========================================================
   REAL ON-CHAIN ACTIVITY
   BTCPurchased EVENTS ONLY
   ========================================================== */

function createActivityItem(
  entry,
  index
) {
  const item =
    document.createElement(
      "div"
    );

  item.className =
    `activity-item activity-slot-${index}`;

  item.innerHTML = `
    <div class="activity-text">
      <span>₿</span>

      <strong>
        ${entry.amount} BTC
      </strong>

      <small>
        ${entry.address}
      </small>
    </div>
  `;

  return item;
}

async function loadActivity() {
  const feed =
    $("activityFeed");

  if (!feed) return;

  try {

    const readContract =
      await getReadContract();

    const decimals =
      Number(
        await readContract.decimals()
      );

    const filter =
      readContract.filters.BTCPurchased();

    const events =
      await readContract.queryFilter(
        filter,
        -5000
      );

    const latest =
      events
        .slice(-3)
        .reverse()
        .map(
          (event) => {

            const buyer =
              event.args.buyer;

            const amount =
              Number(
                ethers.formatUnits(
                  event.args.totalBTCAmount,
                  decimals
                )
              );

            return {
              amount:
                amount.toFixed(3),

              address:
                shortAddress(
                  buyer
                )
            };
          }
        );

    renderActivity(
      feed,
      latest
    );

  } catch (error) {

    console.error(
      "Activity load error:",
      error
    );

    renderActivity(
      feed,
      []
    );
  }
}

function renderActivity(
  feed,
  entries
) {
  clearInterval(
    activityTimer
  );

  feed.innerHTML = "";

  if (!entries.length) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "activity-placeholder";

    empty.innerHTML = `
      <div>₿</div>

      <strong>
        Recent activity
      </strong>

      <span>
        Recent BTC purchase activity will appear here.
      </span>
    `;

    feed.appendChild(
      empty
    );

    return;
  }

  entries
    .slice(0, 3)
    .forEach(
      (entry, index) => {

        feed.appendChild(
          createActivityItem(
            entry,
            index
          )
        );
      }
    );

  startActivityRotation(
    feed,
    entries
  );
}

function startActivityRotation(
  feed,
  entries
) {
  if (
    entries.length <= 1
  ) {
    return;
  }

  let offset = 0;

  activityTimer =
    setInterval(
      () => {

        offset =
          (offset + 1) %
          entries.length;

        const rotated =
          entries.map(
            (_, index) =>
              entries[
                (index + offset) %
                  entries.length
              ]
          );

        feed.innerHTML = "";

        rotated
          .slice(0, 3)
          .forEach(
            (entry, index) => {

              feed.appendChild(
                createActivityItem(
                  entry,
                  index
                )
              );
            }
          );

      },
      4500
    );
}

/* ==========================================================
   COPY CONTRACT ADDRESS
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

      } catch (error) {

        console.error(
          error
        );

        showToast(
          "Unable to copy automatically."
        );
      }
    }
  );
}

/* ==========================================================
   BUY BUTTON
   Keeps:
   "Buy BTC with BNB"
   ========================================================== */

function setupBuyButton() {
  const portal =
    $("portal");

  if (!portal) return;

  /*
   * Don't create a duplicate button.
   */

  if (
    $("buyBTCButton")
  ) {
    return;
  }

  const existingButton =
    portal.querySelector(
      '[data-action="buy-btc"]'
    );

  /*
   * If the existing HTML already
   * contains a buy button, connect
   * the real buyBTC() function to it.
   */

  if (existingButton) {

    existingButton.addEventListener(
      "click",
      buyBTC
    );

    return;
  }

  const target =
    portal.querySelector(
      ".participation"
    );

  if (!target) return;

  const button =
    document.createElement(
      "button"
    );

  button.id =
    "buyBTCButton";

  button.type =
    "button";

  button.className =
    "button primary full";

  button.innerHTML =
    `Buy BTC with BNB <b>→</b>`;

  button.addEventListener(
    "click",
    buyBTC
  );

  target.appendChild(
    button
  );
}

/* ==========================================================
   PROGRAM GUIDE
   ========================================================== */

function setupProgramGuide() {
  const portal =
    $("portal");

  const activity =
    $("activity");

  if (
    !portal ||
    !activity ||
    $("programGuide")
  ) {
    return;
  }

  const section =
    document.createElement(
      "section"
    );

  section.id =
    "programGuide";

  section.className =
    "section";

  section.innerHTML = `
    <div class="section-heading">
      <div>

        <label>
          PROGRAM GUIDE
        </label>

        <h2>
          How the BTC allocation works.
        </h2>

        <p>
          Choose your BNB amount, review the
          calculated BTC allocation, connect your
          wallet and review the transaction before
          confirming it on BNB Smart Chain.
        </p>

      </div>
    </div>

    <div class="portal-grid">

      <article class="glass-card">

        <div class="card-heading">

          <div>

            <label>
              ABOUT THE PROGRAM
            </label>

            <h3>
              BTC allocation from BNB
            </h3>

          </div>

          <strong class="bonus">
            +${BONUS_PERCENT}%
          </strong>

        </div>

        <p>
          Choose an amount of at least
          ${MIN_BNB} BNB. The configured smart
          contract calculates the base BTC amount,
          bonus amount and total BTC allocation.
        </p>

        <p>
          Before purchasing, review the calculation
          displayed on the portal. Selecting
          Buy BTC with BNB opens your compatible
          Web3 wallet so you can review the
          destination and transaction value.
        </p>

        <p>
          The transaction is sent to the configured
          contract using its payable
          <strong>buyBTC()</strong> function.
        </p>

      </article>

      <article class="glass-card">

        <div class="card-heading">

          <div>

            <label>
              HOW TO PARTICIPATE
            </label>

            <h3>
              Step by step
            </h3>

          </div>

        </div>

        <div class="step-list">

          <div class="step">

            <b>01</b>

            <div>

              <strong>
                Choose your amount
              </strong>

              <span>
                Enter ${MIN_BNB} BNB or more
                in the BNB amount field.
              </span>

            </div>

          </div>

          <div class="step">

            <b>02</b>

            <div>

              <strong>
                Calculate BTC
              </strong>

              <span>
                Review the base BTC amount,
                ${BONUS_PERCENT}% bonus and
                total BTC allocation.
              </span>

            </div>

          </div>

          <div class="step">

            <b>03</b>

            <div>

              <strong>
                Connect your wallet
              </strong>

              <span>
                Connect MetaMask or another
                compatible Web3 wallet.
              </span>

            </div>

          </div>

          <div class="step">

            <b>04</b>

            <div>

              <strong>
                Review the transaction
              </strong>

              <span>
                Your wallet opens on BNB Smart
                Chain with the contract destination
                and entered BNB amount.
              </span>

            </div>

          </div>

          <div class="step">

            <b>05</b>

            <div>

              <strong>
                Confirm the transaction
              </strong>

              <span>
                Review the transaction in your
                wallet and confirm or cancel it.
              </span>

            </div>

          </div>

        </div>

      </article>

    </div>
  `;

  activity.parentNode.insertBefore(
    section,
    activity
  );
}

/* ==========================================================
   DISPLAY LIMITS
   ========================================================== */

function updateDisplayedLimits() {
  document
    .querySelectorAll(
      ".limits"
    )
    .forEach(
      (element) => {

        const spans =
          element.querySelectorAll(
            "span"
          );

        if (spans[0]) {

          spans[0].innerHTML =
            `Minimum <b>${MIN_BNB} BNB</b>`;
        }

        /*
         * No maximum is displayed because
         * the frontend does not impose one.
         */

        if (spans[1]) {

          spans[1].innerHTML =
            `No frontend maximum`;
        }
      }
    );
}

/* ==========================================================
   REFRESH MARKET
   ========================================================== */

function setupRefresh() {
  const button =
    $("refreshMarket") ||
    $("refreshButton");

  if (!button) return;

  button.addEventListener(
    "click",
    loadMarketData
  );
}

/* ==========================================================
   START PORTAL
   ========================================================== */

function startPortal() {

  createParticles();

  installActivityStyles();

  setupCalculator();

  setupWallet();

  setupCopyButton();

  setupRefresh();

  setupBuyButton();

  setupProgramGuide();

  updateDisplayedLimits();

  loadMarketData();

  loadActivity();

  /*
   * Refresh market prices every minute.
   */

  setInterval(
    loadMarketData,
    60000
  );

  /*
   * Refresh on-chain activity every minute.
   */

  setInterval(
    loadActivity,
    60000
  );

  /*
   * Wallet account changes.
   */

  if (window.ethereum) {

    window.ethereum.on(
      "accountsChanged",
      (accounts) => {

        connectedAddress =
          accounts?.[0] || null;

        updateWalletDisplay(
          connectedAddress
        );

        if (!connectedAddress) {

          signer = null;
          contract = null;
        }
      }
    );

    /*
     * Reload after network change so
     * the provider is recreated correctly.
     */

    window.ethereum.on(
      "chainChanged",
      () => {
        window.location.reload();
      }
    );
  }
}

/* ==========================================================
   DOM READY
   ========================================================== */

document.addEventListener(
  "DOMContentLoaded",
  startPortal
);
