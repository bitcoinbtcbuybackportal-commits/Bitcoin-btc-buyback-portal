/* =========================================================
   BITCOIN BTC BUYBACK PORTAL
   COMPLETE APP.JS
========================================================= */


/* =========================================================
   CONTRACT CONFIGURATION
========================================================= */

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const BSC_CHAIN_ID =
  "0x38";

const BSC_CHAIN_NAME =
  "BNB Smart Chain";


/* =========================================================
   MARKET CONFIGURATION
========================================================= */

const BTC_SYMBOL =
  "BTCUSDT";

const BNB_SYMBOL =
  "BNBUSDT";


/* =========================================================
   FALLBACK PROGRAM VALUES
   Contract values are preferred when available.
========================================================= */

const FALLBACK_BONUS_PERCENT =
  11;

const FALLBACK_MIN_BNB =
  5;

const FALLBACK_MAX_BNB =
  500;


/* =========================================================
   CONTRACT ABI
========================================================= */

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
    name: "buyBTC",
    outputs: [],
    stateMutability: "payable",
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
  }

];


/* =========================================================
   GLOBAL STATE
========================================================= */

let btcPrice = 0;
let bnbPrice = 0;

let bonusPercent =
  FALLBACK_BONUS_PERCENT;

let minimumBNB =
  FALLBACK_MIN_BNB;

let maximumBNB =
  FALLBACK_MAX_BNB;

let selectedBNB =
  0;

let selectedBTC =
  0;


/* =========================================================
   HELPER
========================================================= */

const $ =
  selector =>
    document.querySelector(
      selector
    );


/* =========================================================
   MARKET DATA
========================================================= */

async function getBinanceTicker(
  symbol
) {

  const urls = [

    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,

    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`

  ];


  for (
    const url of urls
  ) {

    try {

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

        continue;

      }


      return await response.json();

    } catch {

      continue;

    }

  }


  throw new Error(
    "Market data unavailable"
  );

}


/* =========================================================
   USD FORMAT
========================================================= */

function formatUSD(
  value
) {

  if (
    !Number.isFinite(
      value
    ) ||
    value <= 0
  ) {

    return "Unavailable";

  }


  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits:
        value < 1
          ? 4
          : 2,
      maximumFractionDigits:
        value < 1
          ? 4
          : 2
    }
  ).format(
    value
  );

}


/* =========================================================
   BTC FORMAT
========================================================= */

function formatBTC(
  value
) {

  if (
    !Number.isFinite(
      value
    ) ||
    value <= 0
  ) {

    return "0 BTC";

  }


  return `${value.toFixed(8)} BTC`;

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(
  value
) {

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits:
        8
    }
  ).format(
    value
  );

}


/* =========================================================
   UPDATE MARKET CHANGE
========================================================= */

function updateChange(
  selector,
  value
) {

  const element =
    $(selector);


  if (!element) {
    return;
  }


  if (
    !Number.isFinite(
      value
    )
  ) {

    element.textContent =
      "Market data unavailable";

    return;

  }


  const sign =
    value >= 0
      ? "+"
      : "";


  element.textContent =
    `${sign}${value.toFixed(2)}% 24h`;


  element.classList.toggle(
    "negative",
    value < 0
  );

}


/* =========================================================
   LOAD MARKET PRICES
========================================================= */

async function loadPrices() {

  try {

    const [
      btc,
      bnb
    ] =
      await Promise.all([

        getBinanceTicker(
          BTC_SYMBOL
        ),

        getBinanceTicker(
          BNB_SYMBOL
        )

      ]);


    btcPrice =
      Number(
        btc.lastPrice
      );


    bnbPrice =
      Number(
        bnb.lastPrice
      );


    const btcPriceEl =
      $("#btcPrice");

    const bnbPriceEl =
      $("#bnbPrice");


    if (
      btcPriceEl
    ) {

      btcPriceEl.textContent =
        formatUSD(
          btcPrice
        );

    }


    if (
      bnbPriceEl
    ) {

      bnbPriceEl.textContent =
        formatUSD(
          bnbPrice
        );

    }


    updateChange(
      "#btcChange",
      Number(
        btc.priceChangePercent
      )
    );


    updateChange(
      "#bnbChange",
      Number(
        bnb.priceChangePercent
      )
    );


    calculateAllocation();

  } catch (
    error
  ) {

    console.warn(
      "Market price error:",
      error
    );


    const btcPriceEl =
      $("#btcPrice");

    const bnbPriceEl =
      $("#bnbPrice");


    if (
      btcPriceEl
    ) {

      btcPriceEl.textContent =
        "Unavailable";

    }


    if (
      bnbPriceEl
    ) {

      bnbPriceEl.textContent =
        "Unavailable";

    }

  }

}


/* =========================================================
   ETHERS LOADER
   Loads ethers.js only when required.
========================================================= */

async function loadEthers() {

  if (
    window.ethers
  ) {

    return window.ethers;

  }


  return new Promise(
    (
      resolve,
      reject
    ) => {

      const script =
        document.createElement(
          "script"
        );


      script.src =
        "https://cdn.jsdelivr.net/npm/ethers@6.13.5/dist/ethers.umd.min.js";


      script.onload =
        () => {

          if (
            window.ethers
          ) {

            resolve(
              window.ethers
            );

          } else {

            reject(
              new Error(
                "Ethers failed to load"
              )
            );

          }

        };


      script.onerror =
        () => {

          reject(
            new Error(
              "Unable to load Web3 library"
            )
          );

        };


      document.head.appendChild(
        script
      );

    }
  );

}


/* =========================================================
   READ CONTRACT DATA
   Uses public BSC RPC.
========================================================= */

async function loadContractData() {

  try {

    const ethers =
      await loadEthers();


    const provider =
      new ethers.JsonRpcProvider(
        "https://bsc-dataseed.binance.org/"
      );


    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );


    /*
      Bonus percentage.
    */

    try {

      const value =
        await contract.BONUS_PERCENT();

      bonusPercent =
        Number(value);

    } catch (
      error
    ) {

      console.warn(
        "Bonus read failed:",
        error
      );

    }


    /*
      Minimum BNB.
    */

    try {

      const value =
        await contract.referenceMinimumBNB();

      minimumBNB =
        Number(
          ethers.formatEther(
            value
          )
        );

    } catch (
      error
    ) {

      console.warn(
        "Minimum BNB read failed:",
        error
      );

    }


    /*
      Maximum BNB.
    */

    try {

      const value =
        await contract.referenceMaximumBNB();

      maximumBNB =
        Number(
          ethers.formatEther(
            value
          )
        );

    } catch (
      error
    ) {

      console.warn(
        "Maximum BNB read failed:",
        error
      );

    }


    updateProgramValues();

    calculateAllocation();

  } catch (
    error
  ) {

    console.warn(
      "Contract data unavailable:",
      error
    );

    updateProgramValues();

  }

}


/* =========================================================
   UPDATE PROGRAM VALUES
========================================================= */

function updateProgramValues() {

  const bonusEl =
    $("#bonusPercent");


  if (
    bonusEl
  ) {

    bonusEl.textContent =
      `${bonusPercent}%`;

  }


  const message =
    $("#calculatorMessage");


  if (
    message &&
    !$("#bnbAmount")?.value
  ) {

    message.textContent =
      `Minimum ${formatNumber(minimumBNB)} BNB · Maximum ${formatNumber(maximumBNB)} BNB`;

  }

}


/* =========================================================
   CONTRACT CALCULATION
========================================================= */

async function calculateFromContract(
  bnbAmount
) {

  try {

    const ethers =
      await loadEthers();


    const provider =
      new ethers.JsonRpcProvider(
        "https://bsc-dataseed.binance.org/"
      );


    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );


    const amountWei =
      ethers.parseEther(
        bnbAmount.toString()
      );


    const result =
      await contract.calculateBTC(
        amountWei
      );


    const base =
      Number(
        ethers.formatUnits(
          result[0],
          8
        )
      );


    const bonus =
      Number(
        ethers.formatUnits(
          result[1],
          8
        )
      );


    const total =
      Number(
        ethers.formatUnits(
          result[2],
          8
        )
      );


    return {
      base,
      bonus,
      total
    };

  } catch (
    error
  ) {

    console.warn(
      "Contract calculation failed:",
      error
    );


    return null;

  }

}


/* =========================================================
   CALCULATOR
========================================================= */

async function calculateAllocation() {

  const input =
    $("#bnbAmount");


  const estimatedEl =
    $("#estimatedBTC");

  const bonusEl =
    $("#bonusBTC");

  const totalEl =
    $("#totalBTC");

  const message =
    $("#calculatorMessage");


  if (
    !input ||
    !estimatedEl ||
    !bonusEl ||
    !totalEl
  ) {

    return;

  }


  const amount =
    Number(
      input.value
    );


  if (
    !amount
  ) {

    estimatedEl.textContent =
      "0 BTC";

    bonusEl.textContent =
      "0 BTC";

    totalEl.textContent =
      "0 BTC";


    selectedBNB =
      0;

    selectedBTC =
      0;


    updatePurchaseSummary();


    if (
      message
    ) {

      message.textContent =
        `Minimum ${formatNumber(minimumBNB)} BNB · Maximum ${formatNumber(maximumBNB)} BNB`;

    }


    return;

  }


  if (
    amount < minimumBNB
  ) {

    estimatedEl.textContent =
      "0 BTC";

    bonusEl.textContent =
      "0 BTC";

    totalEl.textContent =
      "0 BTC";


    selectedBNB =
      0;

    selectedBTC =
      0;


    updatePurchaseSummary();


    if (
      message
    ) {

      message.textContent =
        `Minimum participation is ${formatNumber(minimumBNB)} BNB.`;

    }


    return;

  }


  if (
    amount > maximumBNB
  ) {

    estimatedEl.textContent =
      "0 BTC";

    bonusEl.textContent =
      "0 BTC";

    totalEl.textContent =
      "0 BTC";


    selectedBNB =
      0;

    selectedBTC =
      0;


    updatePurchaseSummary();


    if (
      message
    ) {

      message.textContent =
        `Maximum participation is ${formatNumber(maximumBNB)} BNB.`;

    }


    return;

  }


  if (
    !btcPrice ||
    !bnbPrice
  ) {

    if (
      message
    ) {

      message.textContent =
        "Waiting for current market prices.";

    }


    return;

  }


  if (
    message
  ) {

    message.textContent =
      "Reading current contract calculation...";

  }


  /*
    First try the deployed contract.
  */

  const contractResult =
    await calculateFromContract(
      amount
    );


  if (
    contractResult
  ) {

    estimatedEl.textContent =
      formatBTC(
        contractResult.base
      );


    bonusEl.textContent =
      formatBTC(
        contractResult.bonus
      );


    totalEl.textContent =
      formatBTC(
        contractResult.total
      );


    selectedBNB =
      amount;

    selectedBTC =
      contractResult.total;


    updatePurchaseSummary();


    if (
      message
    ) {

      message.textContent =
        `Calculated by the deployed contract · ${bonusPercent}% bonus.`;

    }


    return;

  }


  /*
    Fallback display calculation.
  */

  const baseBTC =
    (
      amount *
      bnbPrice
    ) /
    btcPrice;


  const bonusBTC =
    baseBTC *
    (
      bonusPercent /
      100
    );


  const totalBTC =
    baseBTC +
    bonusBTC;


  estimatedEl.textContent =
    formatBTC(
      baseBTC
    );


  bonusEl.textContent =
    formatBTC(
      bonusBTC
    );


  totalEl.textContent =
    formatBTC(
      totalBTC
    );


  selectedBNB =
    amount;

  selectedBTC =
    totalBTC;


  updatePurchaseSummary();


  if (
    message
  ) {

    message.textContent =
      "Market estimate shown while contract calculation is unavailable.";

  }

}


/* =========================================================
   PURCHASE SUMMARY
========================================================= */

function updatePurchaseSummary() {

  const bnbEl =
    $("#purchaseBNB");

  const btcEl =
    $("#purchaseBTC");


  if (
    bnbEl
  ) {

    bnbEl.textContent =
      selectedBNB
        ? `${formatNumber(selectedBNB)} BNB`
        : "0 BNB";

  }


  if (
    btcEl
  ) {

    btcEl.textContent =
      selectedBTC
        ? formatBTC(
            selectedBTC
          )
        : "0 BTC";

  }

}


/* =========================================================
   SWITCH TO BSC
========================================================= */

async function switchToBSC(
  ethereum
) {

  try {

    await ethereum.request(
      {
        method:
          "wallet_switchEthereumChain",

        params: [
          {
            chainId:
              BSC_CHAIN_ID
          }
        ]
      }
    );

    return true;

  } catch (
    error
  ) {

    /*
      Error 4902 means the network
      isn't currently added.
    */

    if (
      error.code ===
      4902
    ) {

      try {

        await ethereum.request(
          {
            method:
              "wallet_addEthereumChain",

            params: [
              {
                chainId:
                  BSC_CHAIN_ID,

                chainName:
                  BSC_CHAIN_NAME,

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
          }
        );


        return true;

      } catch (
        addError
      ) {

        console.error(
          addError
        );

        return false;

      }

    }


    console.error(
      error
    );

    return false;

  }

}


/* =========================================================
   REAL BUY BTC TRANSACTION
========================================================= */

async function buyBTC() {

  const button =
    $("#buyBTCButton");

  const message =
    $("#transactionMessage");

  const input =
    $("#bnbAmount");


  if (
    !input ||
    !button
  ) {

    return;

  }


  const amount =
    Number(
      input.value
    );


  if (
    !amount ||
    amount < minimumBNB ||
    amount > maximumBNB
  ) {

    if (
      message
    ) {

      message.textContent =
        `Enter an amount between ${formatNumber(minimumBNB)} and ${formatNumber(maximumBNB)} BNB.`;

    }


    input.focus();

    return;

  }


  /*
    A compatible Web3 wallet is required
    for the actual blockchain transaction.
  */

  if (
    !window.ethereum
  ) {

    if (
      message
    ) {

      message.textContent =
        "No compatible Web3 wallet was detected. Open this portal in a wallet-enabled browser.";

    }


    return;

  }


  try {

    button.disabled =
      true;

    button.textContent =
      "Preparing transaction...";


    if (
      message
    ) {

      message.textContent =
        "Checking BNB Smart Chain network...";

    }


    const onBSC =
      await switchToBSC(
        window.ethereum
      );


    if (
      !onBSC
    ) {

      throw new Error(
        "Please switch your wallet to BNB Smart Chain."
      );

    }


    const ethers =
      await loadEthers();


    const provider =
      new ethers.BrowserProvider(
        window.ethereum
      );


    const signer =
      await provider.getSigner();


    const network =
      await provider.getNetwork();


    if (
      network.chainId !==
      56n
    ) {

      throw new Error(
        "Wallet is not connected to BNB Smart Chain."
      );

    }


    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );


    const amountWei =
      ethers.parseEther(
        amount.toString()
      );


    button.textContent =
      "Confirm in wallet";


    if (
      message
    ) {

      message.textContent =
        "Review the transaction in your wallet before approving it.";

    }


    /*
      This is the real payable contract call.
    */

    const transaction =
      await contract.buyBTC(
        {
          value:
            amountWei
        }
      );


    button.textContent =
      "Transaction submitted";


    if (
      message
    ) {

      message.innerHTML =
        `
          Transaction submitted.
          <a
            href="https://bscscan.com/tx/${transaction.hash}"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on BscScan ↗
          </a>
        `;

    }


    /*
      Wait for blockchain confirmation.
    */

    await transaction.wait();


    button.textContent =
      "Confirmed ✓";


    if (
      message
    ) {

      message.innerHTML =
        `
          Transaction confirmed.
          <a
            href="https://bscscan.com/tx/${transaction.hash}"
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction ↗
          </a>
        `;

    }


    /*
      Refresh real activity after confirmation.
    */

    await loadBlockchainActivity();


  } catch (
    error
  ) {

    console.error(
      "Purchase error:",
      error
    );


    let errorMessage =
      "Transaction could not be completed.";


    if (
      error?.code ===
      4001
    ) {

      errorMessage =
        "Transaction was rejected in the wallet.";

    } else if (
      error?.shortMessage
    ) {

      errorMessage =
        error.shortMessage;

    } else if (
      error?.message
    ) {

      errorMessage =
        error.message;

    }


    if (
      message
    ) {

      message.textContent =
        errorMessage;

    }


    button.disabled =
      false;

    button.innerHTML =
      `
        Buy BTC with BNB
        <span>↗</span>
      `;

  }

}


/* =========================================================
   COPY CONTRACT ADDRESS
========================================================= */

function setupCopyAddress() {

  const button =
    $("#copyAddress");


  if (
    !button
  ) {

    return;

  }


  button.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          CONTRACT_ADDRESS
        );


        button.textContent =
          "Copied ✓";


        setTimeout(
          () => {

            button.textContent =
              "Copy address";

          },
          1700
        );

      } catch {

        button.textContent =
          "Copy failed";


        setTimeout(
          () => {

            button.textContent =
              "Copy address";

          },
          1700
        );

      }

    }
  );

}


/* =========================================================
   RECENT ACTIVITY DATA
========================================================= */

const sampleActivity = [

  {
    amount: "0.08400000",
    address: "0xa73c...91b4"
  },

  {
    amount: "0.02150000",
    address: "0x31f7...e204"
  },

  {
    amount: "0.04620000",
    address: "0x8c42...a91d"
  },

  {
    amount: "0.11200000",
    address: "0x6b91...42fa"
  },

  {
    amount: "0.02940000",
    address: "0x51d8...c720"
  },

  {
    amount: "0.15300000",
    address: "0x92ab...18ef"
  }

];


/* =========================================================
   ACTIVITY CARD
========================================================= */

function createActivityCard(
  item
) {

  return `

    <article class="activity-row">

      <div class="activity-icon">
        ↗
      </div>

      <div class="activity-main">

        <strong>
          ${item.amount} BTC
        </strong>

        <span>
          ${item.address}
        </span>

      </div>

      <div class="activity-status">

        <strong>
          ACTIVITY
        </strong>

        <small>
          Recent
        </small>

      </div>

    </article>

  `;

}


/* =========================================================
   FADE ACTIVITY ANIMATION
   ATOM-STYLE
========================================================= */

function renderActivity() {

  const container =
    $("#activityList");


  if (
    !container
  ) {

    return;

  }


  let index =
    0;


  const visibleCount =
    3;


  function draw() {

    const rows =
      [];


    for (
      let i = 0;
      i < visibleCount;
      i++
    ) {

      rows.push(
        sampleActivity[
          (
            index +
            i
          ) %
          sampleActivity.length
        ]
      );

    }


    container.innerHTML =
      rows
        .map(
          createActivityCard
        )
        .join("");


    const elements =
      container.querySelectorAll(
        ".activity-row"
      );


    /*
      Fade into view one after another.
    */

    elements.forEach(
      (
        element,
        position
      ) => {

        element.style.opacity =
          "0";

        element.style.transform =
          "translateY(-18px)";


        element.style.transition =
          "opacity 1.2s ease, transform 1.2s ease";


        setTimeout(
          () => {

            element.style.opacity =
              "1";

            element.style.transform =
              "translateY(0)";

          },
          position * 140
        );

      }
    );

  }


  draw();


  /*
    Every cycle:

    visible
       ↓
    slowly fade
       ↓
    disappear
       ↓
    next rows appear
  */

  setInterval(
    () => {

      const elements =
        container.querySelectorAll(
          ".activity-row"
        );


      elements.forEach(
        (
          element,
          position
        ) => {

          setTimeout(
            () => {

              element.style.opacity =
                "0";

              element.style.transform =
                "translateY(24px)";

            },
            position * 180
          );

        }
      );


      setTimeout(
        () => {

          index =
            (
              index +
              1
            ) %
            sampleActivity.length;


          draw();

        },
        3000
      );


    },
    7000
  );

}


/* =========================================================
   BLOCKCHAIN ACTIVITY
   Reads BTCPurchased events when available.
========================================================= */

async function loadBlockchainActivity() {

  const history =
    $("#historyList");


  if (
    !history
  ) {

    return;

  }


  try {

    const ethers =
      await loadEthers();


    const provider =
      new ethers.JsonRpcProvider(
        "https://bsc-dataseed.binance.org/"
      );


    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );


    const currentBlock =
      await provider.getBlockNumber();


    const fromBlock =
      Math.max(
        0,
        currentBlock -
        50000
      );


    const filter =
      contract.filters.BTCPurchased();


    const events =
      await contract.queryFilter(
        filter,
        fromBlock,
        currentBlock
      );


    if (
      !events.length
    ) {

      return;

    }


    const latest =
      events
        .slice(-10)
        .reverse();


    history.innerHTML =
      latest
        .map(
          event => {

            const args =
              event.args;


            const total =
              Number(
                ethers.formatUnits(
                  args.totalBTCAmount,
                  8
                )
              );


            const buyer =
              args.buyer;


            return `

              <div class="history-item">

                <div>

                  <strong>
                    ${formatBTC(total)}
                  </strong>

                  <span>
                    ${buyer.slice(0, 8)}
                    ...
                    ${buyer.slice(-6)}
                  </span>

                </div>

                <a
                  href="https://bscscan.com/tx/${event.transactionHash}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View ↗
                </a>

              </div>

            `;

          }
        )
        .join("");


  } catch (
    error
  ) {

    console.warn(
      "Blockchain activity unavailable:",
      error
    );

  }

}


/* =========================================================
   CALCULATOR EVENTS
========================================================= */

function setupCalculator() {

  const input =
    $("#bnbAmount");

  const button =
    $("#calculateButton");


  if (
    input
  ) {

    input.addEventListener(
      "input",
      () => {

        clearTimeout(
          input._calculateTimer
        );


        input._calculateTimer =
          setTimeout(
            calculateAllocation,
            250
          );

      }
    );

  }


  if (
    button
  ) {

    button.addEventListener(
      "click",
      calculateAllocation
    );

  }

}


/* =========================================================
   BUY BUTTON
========================================================= */

function setupBuyButton() {

  const button =
    $("#buyBTCButton");


  if (
    !button
  ) {

    return;

  }


  button.addEventListener(
    "click",
    buyBTC
  );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

  const button =
    $("#menuButton");

  const menu =
    $("#mobileMenu");


  if (
    !button ||
    !menu
  ) {

    return;

  }


  button.addEventListener(
    "click",
    () => {

      menu.classList.toggle(
        "open"
      );

    }
  );


  menu
    .querySelectorAll(
      "a"
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            menu.classList.remove(
              "open"
            );

          }
        );

      }
    );

}


/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const id =
              link.getAttribute(
                "href"
              );


            if (
              !id ||
              id === "#"
            ) {

              return;

            }


            const target =
              document.querySelector(
                id
              );


            if (
              !target
            ) {

              return;

            }


            event.preventDefault();


            target.scrollIntoView(
              {
                behavior:
                  "smooth",
                block:
                  "start"
              }
            );

          }
        );

      }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function init() {

  /*
    Basic UI.
  */

  setupCopyAddress();

  setupCalculator();

  setupBuyButton();

  setupMobileMenu();

  setupNavigation();

  renderActivity();


  /*
    Market data.
  */

  loadPrices();


  /*
    Contract information.
  */

  loadContractData();


  /*
    Blockchain activity.
  */

  loadBlockchainActivity();


  /*
    Refresh market prices.
  */

  setInterval(
    loadPrices,
    60000
  );


  /*
    Refresh blockchain activity.
  */

  setInterval(
    loadBlockchainActivity,
    60000
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
    init
  );

} else {

  init();

}
