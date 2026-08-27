/* ==========================================================
   BITCOIN BTC PORTAL
   Plain HTML / CSS / JavaScript
   ========================================================== */

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;

const BONUS_PERCENT = 11;
const MIN_BNB = 5;
const MAX_BNB = 500;


/* ----------------------------------------------------------
   CONTRACT ABI
   ---------------------------------------------------------- */

const CONTRACT_ABI = [
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


/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */

let provider = null;
let signer = null;
let contract = null;
let connectedAddress = null;


/* ----------------------------------------------------------
   START
   ---------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    startPortal();
  }
);


async function startPortal() {

  createParticles();

  setupCalculator();

  setupWallet();

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
    particle.style.background = "rgba(247,147,26,.5)";

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
   CALCULATOR
   ---------------------------------------------------------- */

function setupCalculator() {

  const input =
    document.getElementById("bnbAmount");

  const button =
    document.getElementById("calculateButton");

  if (!input || !button) return;

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
      `Minimum participation is ${MIN_BNB} BNB.`
    );

    return;
  }

  if (amount > MAX_BNB) {

    resetCalculator();

    showCalculatorMessage(
      `Maximum participation is ${MAX_BNB} BNB.`
    );

    return;
  }


  /*
   * First attempt:
   * use the deployed contract's calculation.
   */

  try {

    if (!provider && window.ethereum) {

      provider =
        new ethers.BrowserProvider(
          window.ethereum
        );
    }


    if (provider) {

      contract =
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
        await contract.calculateBTC(
          rawAmount
        );

      const decimals =
        await contract.decimals();

      const base =
        ethers.formatUnits(
          result.baseAmount,
          decimals
        );

      const bonus =
        ethers.formatUnits(
          result.bonusAmount,
          decimals
        );

      const total =
        ethers.formatUnits(
          result.totalAmount,
          decimals
        );

      updateResults(
        Number(base),
        Number(bonus),
        Number(total)
      );

      showCalculatorMessage(
        "Calculation completed from the configured contract."
      );

      return;
    }

  } catch (error) {

    console.warn(
      "Contract calculation unavailable.",
      error
    );
  }


  /*
   * Fallback calculation from the configured
   * 11% bonus when the contract cannot be read.
   *
   * This keeps the interface functional instead
   * of leaving the user with a blank calculator.
   */

  const base =
    amount;

  const bonus =
    base * (BONUS_PERCENT / 100);

  const total =
    base + bonus;

  updateResults(
    base,
    bonus,
    total
  );

  showCalculatorMessage(
    "Allocation estimate calculated with the configured 11% bonus."
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
      "No compatible Web3 wallet detected."
    );

    return;
  }

  try {

    provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    const network =
      await provider.getNetwork();

    if (
      Number(network.chainId) !== CHAIN_ID
    ) {

      showToast(
        "Please switch your wallet to BNB Smart Chain."
      );

      return;
    }


    await provider.send(
      "eth_requestAccounts",
      []
    );


    signer =
      await provider.getSigner();

    connectedAddress =
      await signer.getAddress();


    updateWalletDisplay(
      connectedAddress
    );

    showToast(
      "Wallet connected."
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Wallet connection was cancelled."
    );
  }
}


function handleAccountsChanged(accounts) {

  if (!accounts.length) {

    connectedAddress = null;

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


/* ----------------------------------------------------------
   MARKET DATA
   ---------------------------------------------------------- */

async function loadMarketData() {

  try {

    const response =
      await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
      );

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
      `${Number(btc.priceChangePercent).toFixed(2)}% today`
    );


  } catch (error) {

    setText(
      "btcPrice",
      "Unavailable"
    );

    setText(
      "btcChange",
      "Market data unavailable"
    );
  }


  try {

    const response =
      await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT"
      );

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
      `${Number(bnb.priceChangePercent).toFixed(2)}% today`
    );


  } catch (error) {

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

function startActivityFeed() {

  const feed =
    document.getElementById(
      "activityFeed"
    );

  if (!feed) return;


  const activities = [
    "BTC allocation",
    "BNB participation",
    "BTC allocation",
    "BNB participation",
    "BTC allocation"
  ];


  let index = 0;


  setTimeout(
    () => {

      addActivity(
        feed,
        activities[index]
      );

      index++;

    },
    900
  );


  setInterval(
    () => {

      addActivity(
        feed,
        activities[index % activities.length]
      );

      index++;

    },
    5000
  );
}


function addActivity(
  feed,
  type
) {

  const placeholder =
    feed.querySelector(
      ".activity-placeholder"
    );

  if (placeholder) {
    placeholder.remove();
  }


  const item =
    document.createElement("div");

  item.className =
    "activity-item";


  const bnbAmount =
    randomAmount();


  item.innerHTML = `
    <div class="activity-icon">₿</div>

    <div class="activity-main">
      <strong>${type}</strong>
      <span>BNB Smart Chain</span>
    </div>

    <div class="activity-amount">
      ${bnbAmount} BNB
    </div>
  `;


  feed.prepend(item);


  while (
    feed.children.length > 5
  ) {
    feed.lastElementChild.remove();
  }


  /*
   * Remove the item after the fade animation
   * has completed.
   */

  setTimeout(
    () => {

      if (
        item.parentElement
      ) {
        item.remove();
      }

    },
    12500
  );
}


function randomAmount() {

  const values = [
    5,
    7,
    8,
    10,
    12,
    15,
    18,
    20,
    25
  ];

  return values[
    Math.floor(
      Math.random() * values.length
    )
  ];
}


/* ----------------------------------------------------------
   COPY
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

      } catch {

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
    element.textContent = value;
  }
}


function formatNumber(value) {

  return Number(
    value
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 8
    }
  );
}


function money(value) {

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
