/* ==========================================================
   BITCOIN BTC PORTAL
   Plain HTML / CSS / JavaScript
   ========================================================== */

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;
const CHAIN_ID_HEX = "0x38";

const DEFAULT_BONUS_PERCENT = 11;
const DEFAULT_MIN_BNB = 5;
const DEFAULT_MAX_BNB = 1000;


/* ----------------------------------------------------------
   CONTRACT ABI
   ---------------------------------------------------------- */

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
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256"
      }
    ],
    name: "ERC20InsufficientAllowance",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256"
      }
    ],
    name: "ERC20InsufficientBalance",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address"
      }
    ],
    name: "ERC20InvalidApprover",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address"
      }
    ],
    name: "ERC20InvalidReceiver",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "ERC20InvalidSender",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "ERC20InvalidSpender",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address"
      }
    ],
    name: "OwnableInvalidOwner",
    type: "error"
  },

  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
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
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
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
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
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
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
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
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
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
      {
        internalType: "uint256",
        name: "minimumBNB",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maximumBNB",
        type: "uint256"
      }
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
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
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
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
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
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
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
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
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


/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */

let provider = null;
let signer = null;
let readContract = null;
let writeContract = null;
let connectedAddress = null;

let bonusPercent = DEFAULT_BONUS_PERCENT;
let minBNB = DEFAULT_MIN_BNB;
let maxBNB = DEFAULT_MAX_BNB;


/* ----------------------------------------------------------
   START
   ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  startPortal();
});


async function startPortal() {

  createParticles();

  setupCalculator();

  setupWallet();

  setupCopyButton();

  setupBuyButton();

  setupActivityFeed();

  loadMarketData();

  loadContractConfiguration();

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


/* ----------------------------------------------------------
   PARTICLES
   ---------------------------------------------------------- */

function createParticles() {

  const container =
    document.getElementById("particles");

  if (!container) return;

  for (let i = 0; i < 25; i++) {

    const particle =
      document.createElement("span");

    particle.style.position = "absolute";
    particle.style.width = "2px";
    particle.style.height = "2px";
    particle.style.borderRadius = "50%";
    particle.style.background =
      "rgba(247,147,26,.5)";

    particle.style.left =
      `${Math.random() * 100}%`;

    particle.style.top =
      `${Math.random() * 100}%`;

    particle.style.opacity =
      `${Math.random() * .5 + .1}`;

    particle.style.animation =
      `particleFloat ${6 + Math.random() * 10}s linear infinite`;

    container.appendChild(particle);
  }
}


/* ----------------------------------------------------------
   CONTRACT CONFIGURATION
   ---------------------------------------------------------- */

async function loadContractConfiguration() {

  try {

    if (!window.ethereum) return;

    provider =
      provider ||
      new ethers.BrowserProvider(
        window.ethereum
      );

    readContract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

    const [
      contractBonus,
      contractMin,
      contractMax
    ] = await Promise.all([
      readContract.BONUS_PERCENT(),
      readContract.referenceMinimumBNB(),
      readContract.referenceMaximumBNB()
    ]);

    bonusPercent =
      Number(contractBonus);

    minBNB =
      Number(
        ethers.formatEther(contractMin)
      );

    maxBNB =
      Number(
        ethers.formatEther(contractMax)
      );

    /*
     * If the deployed contract returns valid values,
     * use them everywhere in the interface.
     */

    if (
      Number.isFinite(bonusPercent) &&
      bonusPercent >= 0
    ) {
      updateBonusDisplays(bonusPercent);
    }

    if (
      Number.isFinite(minBNB) &&
      minBNB > 0
    ) {
      updateMinDisplays(minBNB);
    }

    if (
      Number.isFinite(maxBNB) &&
      maxBNB > 0
    ) {
      updateMaxDisplays(maxBNB);
    }

  } catch (error) {

    console.warn(
      "Unable to read contract configuration.",
      error
    );

    /*
     * Keep the configured frontend values if the
     * public contract read is temporarily unavailable.
     */

    updateBonusDisplays(DEFAULT_BONUS_PERCENT);
    updateMinDisplays(DEFAULT_MIN_BNB);
    updateMaxDisplays(DEFAULT_MAX_BNB);
  }
}


function updateBonusDisplays(value) {

  document
    .querySelectorAll("[data-bonus-percent]")
    .forEach(element => {
      element.textContent = `${value}%`;
    });
}


function updateMinDisplays(value) {

  document
    .querySelectorAll("[data-min-bnb]")
    .forEach(element => {
      element.textContent =
        `${formatNumber(value)} BNB`;
    });
}


function updateMaxDisplays(value) {

  document
    .querySelectorAll("[data-max-bnb]")
    .forEach(element => {
      element.textContent =
        `${formatNumber(value)} BNB`;
    });
}


/* ----------------------------------------------------------
   CALCULATOR
   ---------------------------------------------------------- */

function setupCalculator() {

  const input =
    document.getElementById("bnbAmount");

  const button =
    document.getElementById("calculateButton");

  if (input) {

    input.addEventListener(
      "input",
      () => {

        if (input.value) {
          calculateBTC(input.value);
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
          input ? input.value : ""
        );
      }
    );
  }
}


async function calculateBTC(value) {

  const amount =
    Number(value);

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

  if (amount < minBNB) {

    resetCalculator();

    showCalculatorMessage(
      `Minimum participation is ${formatNumber(minBNB)} BNB.`
    );

    return;
  }

  if (amount > maxBNB) {

    resetCalculator();

    showCalculatorMessage(
      `Maximum participation is ${formatNumber(maxBNB)} BNB.`
    );

    return;
  }

  try {

    provider =
      provider ||
      new ethers.BrowserProvider(
        window.ethereum
      );

    readContract =
      readContract ||
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
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
      "Allocation calculated."
    );

  } catch (error) {

    console.error(
      "BTC calculation failed.",
      error
    );

    resetCalculator();

    showCalculatorMessage(
      "Unable to calculate the BTC allocation right now."
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
}


function showCalculatorMessage(message) {

  const element =
    document.getElementById(
      "calculatorMessage"
    );

  if (element) {
    element.textContent = message;
  }
}


/* ----------------------------------------------------------
   WALLET
   ---------------------------------------------------------- */

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
      "Please install or open MetaMask."
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

    await ensureBSCNetwork();

    signer =
      await provider.getSigner();

    connectedAddress =
      await signer.getAddress();

    writeContract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

    updateWalletDisplay(
      connectedAddress
    );

    return true;

  } catch (error) {

    console.error(
      "Wallet connection failed.",
      error
    );

    if (
      error &&
      error.code === 4001
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


async function ensureBSCNetwork() {

  const network =
    await provider.getNetwork();

  if (
    Number(network.chainId) === CHAIN_ID
  ) {
    return;
  }

  try {

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: CHAIN_ID_HEX
        }
      ]
    });

  } catch (error) {

    /*
     * If BNB Smart Chain is not already available
     * in MetaMask, request it.
     */

    if (
      error &&
      error.code === 4902
    ) {

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID_HEX,
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
              "https://bscscan.com"
            ]
          }
        ]
      });

    } else {

      throw error;
    }
  }
}


function handleAccountsChanged(accounts) {

  if (!accounts || !accounts.length) {

    connectedAddress = null;

    signer = null;

    writeContract = null;

    updateWalletDisplay(null);

    return;
  }

  connectedAddress =
    accounts[0];

  updateWalletDisplay(
    connectedAddress
  );
}


function updateWalletDisplay(address) {

  const button =
    document.getElementById(
      "connectWallet"
    );

  if (!button) return;

  if (!address) {

    button.textContent =
      "Connect Wallet";

    return;
  }

  const shortened =
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  button.textContent =
    shortened;
}


/* ----------------------------------------------------------
   BUY BTC WITH BNB
   ---------------------------------------------------------- */

function setupBuyButton() {

  const button =
    document.getElementById(
      "buyBTCButton"
    );

  if (!button) return;

  button.addEventListener(
    "click",
    buyBTCWithBNB
  );
}


async function buyBTCWithBNB() {

  const input =
    document.getElementById(
      "bnbAmount"
    );

  if (!input) {

    showToast(
      "Enter a BNB amount first."
    );

    return;
  }

  const amount =
    Number(input.value);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showToast(
      "Enter a valid BNB amount."
    );

    return;
  }

  if (amount < minBNB) {

    showToast(
      `Minimum participation is ${formatNumber(minBNB)} BNB.`
    );

    return;
  }

  if (amount > maxBNB) {

    showToast(
      `Maximum participation is ${formatNumber(maxBNB)} BNB.`
    );

    return;
  }


  /*
   * Connect MetaMask first if necessary.
   */

  const connected =
    await connectWallet();

  if (!connected) {
    return;
  }


  try {

    /*
     * Re-check network immediately before creating
     * the transaction.
     */

    await ensureBSCNetwork();

    signer =
      await provider.getSigner();

    writeContract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );


    /*
     * Convert the entered BNB amount to wei.
     */

    const value =
      ethers.parseEther(
        amount.toString()
      );


    /*
     * This calls the payable buyBTC() function
     * from the supplied ABI.
     *
     * MetaMask will open and display the transaction.
     */

    showToast(
      "Opening MetaMask..."
    );

    const transaction =
      await writeContract.buyBTC({
        value: value
      });


    showToast(
      "Transaction submitted. Waiting for confirmation..."
    );


    /*
     * Wait for the transaction to be mined.
     */

    const receipt =
      await transaction.wait();


    if (receipt && receipt.status === 1) {

      showToast(
        "BTC purchase confirmed."
      );

      loadActivityFromChain();

    } else {

      showToast(
        "Transaction was not confirmed."
      );
    }

  } catch (error) {

    console.error(
      "BTC purchase failed.",
      error
    );

    if (
      error &&
      error.code === 4001
    ) {

      showToast(
        "Transaction cancelled in MetaMask."
      );

      return;
    }

    if (
      error &&
      error.info &&
      error.info.error &&
      error.info.error.message
    ) {

      showToast(
        error.info.error.message
      );

      return;
    }

    if (
      error &&
      error.shortMessage
    ) {

      showToast(
        error.shortMessage
      );

      return;
    }

    showToast(
      "Transaction could not be completed."
    );
  }
}


/* ----------------------------------------------------------
   MARKET DATA
   ---------------------------------------------------------- */

async function loadMarketData() {

  await Promise.all([
    loadBTCPrice(),
    loadBNBPrice()
  ]);
}


async function loadBTCPrice() {

  try {

    const response =
      await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
      );

    if (!response.ok) {
      throw new Error(
        "BTC market request failed"
      );
    }

    const btc =
      await response.json();

    setText(
      "btcPrice",
      money(
        Number(btc.lastPrice)
      )
    );

    setText(
      "btcChange",
      `${Number(
        btc.priceChangePercent
      ).toFixed(2)}% today`
    );

  } catch (error) {

    console.error(
      "BTC market data failed.",
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
  }
}


async function loadBNBPrice() {

  try {

    const response =
      await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT"
      );

    if (!response.ok) {
      throw new Error(
        "BNB market request failed"
      );
    }

    const bnb =
      await response.json();

    setText(
      "bnbPrice",
      money(
        Number(bnb.lastPrice)
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
      "BNB market data failed.",
      error
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


/* ----------------------------------------------------------
   ACTIVITY FEED
   ---------------------------------------------------------- */

function setupActivityFeed() {

  const feed =
    document.getElementById(
      "activityFeed"
    );

  if (!feed) return;

  loadActivityFromChain();

  /*
   * Refresh periodically so new confirmed
   * BTCPurchased events can appear.
   */

  setInterval(
    loadActivityFromChain,
    30000
  );
}


async function loadActivityFromChain() {

  const feed =
    document.getElementById(
      "activityFeed"
    );

  if (!feed) return;

  try {

    provider =
      provider ||
      new ethers.BrowserProvider(
        window.ethereum
      );

    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

    const filter =
      contract.filters.BTCPurchased();

    const events =
      await contract.queryFilter(
        filter,
        -5000
      );

    const recentEvents =
      events
        .slice(-3)
        .reverse();

    renderActivityEvents(
      feed,
      recentEvents
    );

  } catch (error) {

    console.warn(
      "Unable to load on-chain activity.",
      error
    );
  }
}


function renderActivityEvents(
  feed,
  events
) {

  if (!events.length) {

    /*
     * Do not invent transaction activity.
     * Keep the section clean until the contract
     * has confirmed BTCPurchased events.
     */

    const existing =
      feed.querySelector(
        ".activity-empty"
      );

    if (!existing) {

      feed.innerHTML = `
        <div class="activity-empty">
          <span>Waiting for confirmed activity.</span>
        </div>
      `;
    }

    return;
  }


  feed.innerHTML = "";


  events.forEach(
    (event, index) => {

      const buyer =
        event.args.buyer;

      const totalBTC =
        event.args.totalBTCAmount;

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "activity-item";


      item.innerHTML = `
        <div class="activity-icon">₿</div>

        <div class="activity-main">
          <strong>
            ${formatBTCAmount(totalBTC)}
          </strong>

          <span>
            ${shortAddress(buyer)}
          </span>
        </div>
      `;


      feed.appendChild(item);


      /*
       * Small staggered entrance animation.
       */

      item.style.animationDelay =
        `${index * 120}ms`;
    }
  );
}


/* ----------------------------------------------------------
   COPY CONTRACT
   ---------------------------------------------------------- */

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

      } catch (error) {

        console.error(error);

        showToast(
          "Unable to copy automatically."
        );
      }
    }
  );
}


/* ----------------------------------------------------------
   HELPERS
   ---------------------------------------------------------- */

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


function formatNumber(value) {

  return Number(value).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 8
    }
  );
}


function formatBTCAmount(value) {

  /*
   * BTC token decimals are read from the contract
   * when calculating. For activity events we use
   * the standard 8-decimal BTC representation.
   */

  try {

    return (
      Number(
        ethers.formatUnits(
          value,
          8
        )
      ).toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 8
        }
      ) + " BTC"
    );

  } catch {

    return "BTC";
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


function showToast(message) {

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
      3000
    );
  }
}
