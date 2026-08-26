/* =========================================================
   BITCOIN BTC BUYBACK PORTAL — COMPLETE APP.JS
========================================================= */

const BTC_PRICE_SYMBOL = "BTCUSDT";
const BNB_PRICE_SYMBOL = "BNBUSDT";

const MIN_BNB = 5;
const MAX_BNB = 500;
const BONUS_RATE = 0.11;

/*
  Add the verified BSC address here when you are ready.
*/
const BSC_ADDRESS = "";


/* =========================================================
   GLOBAL MARKET PRICES
========================================================= */

let btcPrice = 0;
let bnbPrice = 0;


/* =========================================================
   SELECTOR HELPER
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);


/* =========================================================
   BINANCE MARKET DATA
========================================================= */

async function getBinanceTicker(symbol) {

  const urls = [

    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,

    `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`

  ];


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
        continue;
      }


      return await response.json();

    } catch {

      continue;

    }

  }


  throw new Error(
    "Binance market data unavailable"
  );

}


/* =========================================================
   FORMAT USD
========================================================= */

function formatUSD(value) {

  if (
    !Number.isFinite(value) ||
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
        value < 1 ? 4 : 2,
      maximumFractionDigits:
        value < 1 ? 4 : 2
    }
  ).format(value);

}


/* =========================================================
   FORMAT BTC
========================================================= */

function formatBTC(value) {

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    return "0 BTC";

  }


  return `${value.toFixed(8)} BTC`;

}


/* =========================================================
   FORMAT NUMBERS
========================================================= */

function formatNumber(value) {

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 8
    }
  ).format(value);

}


/* =========================================================
   MARKET CHANGE
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


  if (!Number.isFinite(value)) {

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

  const btcPriceEl =
    $("#btcPrice");

  const bnbPriceEl =
    $("#bnbPrice");


  try {

    const [
      btc,
      bnb
    ] = await Promise.all([

      getBinanceTicker(
        BTC_PRICE_SYMBOL
      ),

      getBinanceTicker(
        BNB_PRICE_SYMBOL
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


    if (btcPriceEl) {

      btcPriceEl.textContent =
        formatUSD(
          btcPrice
        );

    }


    if (bnbPriceEl) {

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


    calculateBTC();

  } catch (error) {

    console.warn(
      "Market price error:",
      error
    );


    if (btcPriceEl) {

      btcPriceEl.textContent =
        "Unavailable";

    }


    if (bnbPriceEl) {

      bnbPriceEl.textContent =
        "Unavailable";

    }

  }

}


/* =========================================================
   BTC CALCULATOR
========================================================= */

function calculateBTC() {

  const input =
    $("#bnbAmount");

  const message =
    $("#calculatorMessage");


  const estimatedEl =
    $("#estimatedBTC");

  const bonusEl =
    $("#bonusBTC");

  const totalEl =
    $("#totalBTC");


  if (
    !input ||
    !message ||
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


  /*
    Empty input.
  */

  if (!amount) {

    estimatedEl.textContent =
      "0 BTC";

    bonusEl.textContent =
      "0 BTC";

    totalEl.textContent =
      "0 BTC";


    message.textContent =
      "Minimum 5 BNB · Maximum 500 BNB";

    return;

  }


  /*
    Minimum.
  */

  if (
    amount < MIN_BNB
  ) {

    estimatedEl.textContent =
      "0 BTC";

    bonusEl.textContent =
      "0 BTC";

    totalEl.textContent =
      "0 BTC";


    message.textContent =
      "Minimum participation is 5 BNB.";

    return;

  }


  /*
    Maximum.
  */

  if (
    amount > MAX_BNB
  ) {

    estimatedEl.textContent =
      "0 BTC";

    bonusEl.textContent =
      "0 BTC";

    totalEl.textContent =
      "0 BTC";


    message.textContent =
      "Maximum participation is 500 BNB.";

    return;

  }


  /*
    Wait for prices.
  */

  if (
    !btcPrice ||
    !bnbPrice
  ) {

    message.textContent =
      "Waiting for current market prices.";

    return;

  }


  /*
    BNB → USD → BTC.
  */

  const baseBTC =
    (
      amount *
      bnbPrice
    ) /
    btcPrice;


  /*
    11% bonus.
  */

  const bonusBTC =
    baseBTC *
    BONUS_RATE;


  /*
    Total.
  */

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


  message.textContent =
    "Estimate calculated from current displayed market prices.";

}


/* =========================================================
   SAMPLE ACTIVITY DATA
========================================================= */

const activity = [

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
  },

  {
    amount: "0.06180000",
    address: "0x47ce...b381"
  },

  {
    amount: "0.09750000",
    address: "0xd521...7aa6"
  }

];


/* =========================================================
   ACTIVITY CARD
========================================================= */

function activityCard(item) {

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
   RECENT ACTIVITY
   ATOM-STYLE SLOW FADE / REPLACE
========================================================= */

function renderActivity() {

  const grid =
    $("#activityGrid");


  /*
    index.html currently uses activityList.
    This supports both IDs so nothing breaks.
  */

  const activityContainer =
    grid ||
    $("#activityList");


  if (!activityContainer) {
    return;
  }


  let currentIndex = 0;


  /*
    Number of rows shown at once.
  */

  const VISIBLE_ROWS = 3;


  /*
    Draw the current three rows.
  */

  function drawActivity() {

    const visible =
      [];


    for (
      let i = 0;
      i < VISIBLE_ROWS;
      i++
    ) {

      visible.push(
        activity[
          (
            currentIndex +
            i
          ) %
          activity.length
        ]
      );

    }


    activityContainer.innerHTML =
      visible
        .map(
          activityCard
        )
        .join("");


    const rows =
      activityContainer.querySelectorAll(
        ".activity-row"
      );


    /*
      Smooth entrance.
    */

    rows.forEach(
      (
        row,
        index
      ) => {

        row.style.opacity =
          "0";

        row.style.transform =
          "translateY(-18px)";


        row.style.transition =
          "opacity 1.1s ease, transform 1.1s ease";


        setTimeout(
          () => {

            row.style.opacity =
              "1";

            row.style.transform =
              "translateY(0)";

          },
          index * 140
        );

      }
    );

  }


  /*
    First display.
  */

  drawActivity();


  /*
    Slowly fade the three visible rows away.
    Then replace them with the next three.
  */

  setInterval(
    () => {

      const rows =
        activityContainer.querySelectorAll(
          ".activity-row"
        );


      rows.forEach(
        (
          row,
          index
        ) => {

          setTimeout(
            () => {

              row.style.opacity =
                "0";

              row.style.transform =
                "translateY(24px)";

            },
            index * 180
          );

        }
      );


      /*
        Wait for the fade-out to finish.
      */

      setTimeout(
        () => {

          currentIndex =
            (
              currentIndex +
              1
            ) %
            activity.length;


          drawActivity();

        },
        2800
      );


    },
    7000
  );

}


/* =========================================================
   COPY BSC ADDRESS
========================================================= */

function setupAddress() {

  const addressElement =
    $("#bscAddress");

  const copyButton =
    $("#copyAddress");

  const explorerLink =
    $("#explorerLink");


  /*
    Show address.
  */

  if (addressElement) {

    addressElement.textContent =
      BSC_ADDRESS ||
      "ADDRESS WILL BE ADDED";

  }


  /*
    Explorer link.
  */

  if (
    explorerLink &&
    BSC_ADDRESS
  ) {

    explorerLink.href =
      `https://bscscan.com/address/${BSC_ADDRESS}`;

  }


  /*
    Copy button.
  */

  if (copyButton) {

    copyButton.addEventListener(
      "click",
      async () => {

        if (!BSC_ADDRESS) {

          copyButton.textContent =
            "Address not added";

          setTimeout(
            () => {

              copyButton.textContent =
                "Copy";

            },
            1600
          );

          return;

        }


        try {

          await navigator.clipboard.writeText(
            BSC_ADDRESS
          );


          copyButton.textContent =
            "Copied ✓";


          setTimeout(
            () => {

              copyButton.textContent =
                "Copy";

            },
            1600
          );

        } catch {

          copyButton.textContent =
            "Copy failed";

        }

      }
    );

  }

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
    .querySelectorAll("a")
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
   CALCULATOR EVENTS
========================================================= */

function setupCalculator() {

  const input =
    $("#bnbAmount");


  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    calculateBTC
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

            const targetId =
              link.getAttribute(
                "href"
              );


            if (
              !targetId ||
              targetId === "#"
            ) {

              return;

            }


            const target =
              document.querySelector(
                targetId
              );


            if (!target) {
              return;
            }


            event.preventDefault();


            target.scrollIntoView(
              {
                behavior: "smooth",
                block: "start"
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

function init() {

  setupCalculator();

  setupAddress();

  setupMobileMenu();

  setupNavigation();

  renderActivity();

  loadPrices();


  /*
    Refresh market prices
    every 60 seconds.
  */

  setInterval(
    loadPrices,
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
