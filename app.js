/* =========================================================
   BITCOIN BTC — BNB SMART CHAIN PORTAL
   app.js
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     CONFIGURATION
     --------------------------------------------------------- */

  const CONFIG = {
    chainId: 56,
    chainIdHex: "0x38",

    contractAddress:
      "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85",

    bonusRate: 0.11,

    minBNB: 1,
    maxBNB: 1000,

    priceRefreshMs: 30000,
    activityIntervalMs: 4500,

    bscRpc:
      "https://bsc-dataseed.binance.org/"
  };

  /* ---------------------------------------------------------
     DOM HELPERS
     --------------------------------------------------------- */

  const $ = (id) => document.getElementById(id);

  const connectWalletButton = $("connectWallet");
  const walletStatus = $("walletStatus");

  const bnbAmountInput = $("bnbAmount");

  const calculateButton = $("calculateButton");
  const buyBTCButton = $("buyBTCButton");

  const baseBTCElement = $("baseBTC");
  const bonusBTCElement = $("bonusBTC");
  const totalBTCElement = $("totalBTC");
  const calculatorMessage = $("calculatorMessage");

  const contractAddressElement = $("contractAddress");
  const copyContractButton = $("copyContract");

  const btcPriceElement = $("btcPrice");
  const btcChangeElement = $("btcChange");

  const bnbPriceElement = $("bnbPrice");
  const bnbChangeElement = $("bnbChange");

  const activityFeed = $("activityFeed");

  const toast = $("toast");
  const toastMessage = $("toastMessage");

  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */

  let provider = null;
  let signer = null;
  let connectedAddress = null;

  let btcPriceUSD = 0;
  let bnbPriceUSD = 0;

  /* ---------------------------------------------------------
     TOAST
     --------------------------------------------------------- */

  function showToast(message) {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  /* ---------------------------------------------------------
     FORMATTERS
     --------------------------------------------------------- */

  function formatNumber(value, decimals = 4) {
    if (!Number.isFinite(value)) return "0";

    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }

  function formatUSD(value) {
    if (!Number.isFinite(value) || value <= 0) {
      return "Loading...";
    }

    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    });
  }

  function shortenAddress(address) {
    if (!address) return "0x0000...0000";

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /* ---------------------------------------------------------
     WALLET
     --------------------------------------------------------- */

  async function connectWallet() {
    if (!window.ethereum) {
      showToast("Install a BSC-compatible wallet to continue.");
      return;
    }

    try {
      connectWalletButton.disabled = true;
      connectWalletButton.textContent = "Connecting...";

      provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();

      if (Number(network.chainId) !== CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: CONFIG.chainIdHex
              }
            ]
          });

          provider = new ethers.BrowserProvider(window.ethereum);
        } catch (switchError) {
          showToast("Please switch your wallet to BNB Smart Chain.");
          return;
        }
      }

      signer = await provider.getSigner();
      connectedAddress = await signer.getAddress();

      updateWalletUI(connectedAddress);

      showToast("Wallet connected.");

    } catch (error) {
      console.error("Wallet connection error:", error);

      showToast("Wallet connection was cancelled or failed.");

    } finally {
      connectWalletButton.disabled = false;

      if (connectedAddress) {
        connectWalletButton.textContent =
          shortenAddress(connectedAddress);
      } else {
        connectWalletButton.textContent = "Connect Wallet";
      }
    }
  }

  function updateWalletUI(address) {
    if (walletStatus) {
      walletStatus.textContent = shortenAddress(address);
    }

    if (connectWalletButton) {
      connectWalletButton.textContent =
        shortenAddress(address);
    }

    connectWalletButton.classList.add("connected");
  }

  async function handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      connectedAddress = null;
      signer = null;

      if (walletStatus) {
        walletStatus.textContent = "Not connected";
      }

      if (connectWalletButton) {
        connectWalletButton.textContent = "Connect Wallet";
        connectWalletButton.classList.remove("connected");
      }

      return;
    }

    if (!provider) {
      provider = new ethers.BrowserProvider(window.ethereum);
    }

    signer = await provider.getSigner();
    connectedAddress = accounts[0];

    updateWalletUI(connectedAddress);
  }

  async function restoreWalletConnection() {
    if (!window.ethereum) return;

    try {
      provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send(
        "eth_accounts",
        []
      );

      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error(
        "Wallet restore error:",
        error
      );
    }
  }

  /* ---------------------------------------------------------
     CALCULATOR
     --------------------------------------------------------- */

  function calculateAllocation() {
    const amount = Number(bnbAmountInput?.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      setCalculatorMessage(
        "Enter a BNB amount to calculate."
      );

      resetCalculator();

      return;
    }

    if (amount < CONFIG.minBNB) {
      setCalculatorMessage(
        `Minimum participation is ${CONFIG.minBNB} BNB.`
      );

      resetCalculator();

      return;
    }

    if (amount > CONFIG.maxBNB) {
      setCalculatorMessage(
        `Maximum participation is ${CONFIG.maxBNB} BNB.`
      );

      resetCalculator();

      return;
    }

    /*
      The calculator displays the BTC equivalent using
      the current BTC/BNB market relationship.

      No transaction is created here.
    */

    if (!btcPriceUSD || !bnbPriceUSD) {
      setCalculatorMessage(
        "Waiting for live market prices..."
      );

      return;
    }

    const baseBTC =
      (amount * bnbPriceUSD) / btcPriceUSD;

    const bonusBTC =
      baseBTC * CONFIG.bonusRate;

    const totalBTC =
      baseBTC + bonusBTC;

    if (baseBTCElement) {
      baseBTCElement.textContent =
        `${formatNumber(baseBTC, 8)} BTC`;
    }

    if (bonusBTCElement) {
      bonusBTCElement.textContent =
        `${formatNumber(bonusBTC, 8)} BTC`;
    }

    if (totalBTCElement) {
      totalBTCElement.textContent =
        `${formatNumber(totalBTC, 8)} BTC`;
    }

    setCalculatorMessage(
      `${formatNumber(amount, 2)} BNB calculated at the current market reference price.`
    );
  }

  function resetCalculator() {
    if (baseBTCElement) {
      baseBTCElement.textContent = "0 BTC";
    }

    if (bonusBTCElement) {
      bonusBTCElement.textContent = "0 BTC";
    }

    if (totalBTCElement) {
      totalBTCElement.textContent = "0 BTC";
    }
  }

  function setCalculatorMessage(message) {
    if (calculatorMessage) {
      calculatorMessage.textContent = message;
    }
  }

  /* ---------------------------------------------------------
     CONTRACT COPY
     --------------------------------------------------------- */

  async function copyContractAddress() {
    const address =
      contractAddressElement?.textContent?.trim() ||
      CONFIG.contractAddress;

    try {
      await navigator.clipboard.writeText(address);

      showToast("Contract address copied.");

      if (copyContractButton) {
        const original =
          copyContractButton.textContent;

        copyContractButton.textContent = "Copied";

        setTimeout(() => {
          copyContractButton.textContent = original;
        }, 1800);
      }

    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );

      showToast("Unable to copy address.");
    }
  }

  /* ---------------------------------------------------------
     PARTICIPATION BUTTON
     --------------------------------------------------------- */

  function handleParticipationButton() {
    const amount = Number(bnbAmountInput?.value);

    if (!connectedAddress) {
      showToast("Connect your preferred wallet first.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a BNB amount first.");
      return;
    }

    if (amount < CONFIG.minBNB) {
      showToast(
        `Minimum participation is ${CONFIG.minBNB} BNB.`
      );
      return;
    }

    if (amount > CONFIG.maxBNB) {
      showToast(
        `Maximum participation is ${CONFIG.maxBNB} BNB.`
      );
      return;
    }

    calculateAllocation();

    /*
      Deliberately does not submit or transfer BNB.

      The wallet remains connected and the user can independently
      review the contract address and transaction details.
    */

    showToast(
      "Amount calculated. Review the contract address before proceeding."
    );
  }

  /* ---------------------------------------------------------
     LIVE MARKET DATA
     --------------------------------------------------------- */

  async function loadMarketData() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price" +
        "?ids=bitcoin,binancecoin" +
        "&vs_currencies=usd" +
        "&include_24hr_change=true",
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `Market request failed: ${response.status}`
        );
      }

      const data = await response.json();

      btcPriceUSD =
        Number(data?.bitcoin?.usd) || 0;

      bnbPriceUSD =
        Number(data?.binancecoin?.usd) || 0;

      const btcChange =
        Number(data?.bitcoin?.usd_24h_change);

      const bnbChange =
        Number(data?.binancecoin?.usd_24h_change);

      if (btcPriceElement) {
        btcPriceElement.textContent =
          formatUSD(btcPriceUSD);
      }

      if (bnbPriceElement) {
        bnbPriceElement.textContent =
          formatUSD(bnbPriceUSD);
      }

      if (btcChangeElement) {
        btcChangeElement.textContent =
          Number.isFinite(btcChange)
            ? `${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(2)}% 24h`
            : "Market data updated";
      }

      if (bnbChangeElement) {
        bnbChangeElement.textContent =
          Number.isFinite(bnbChange)
            ? `${bnbChange >= 0 ? "+" : ""}${bnbChange.toFixed(2)}% 24h`
            : "Market data updated";
      }

      /*
        Recalculate automatically when a valid amount
        is already entered.
      */

      const amount = Number(
        bnbAmountInput?.value
      );

      if (
        Number.isFinite(amount) &&
        amount >= CONFIG.minBNB &&
        amount <= CONFIG.maxBNB
      ) {
        calculateAllocation();
      }

    } catch (error) {
      console.error(
        "Market data error:",
        error
      );

      if (btcPriceElement) {
        btcPriceElement.textContent =
          "Unavailable";
      }

      if (bnbPriceElement) {
        bnbPriceElement.textContent =
          "Unavailable";
      }

      if (btcChangeElement) {
        btcChangeElement.textContent =
          "Market data unavailable";
      }

      if (bnbChangeElement) {
        bnbChangeElement.textContent =
          "Market data unavailable";
      }
    }
  }

  /* ---------------------------------------------------------
     ACTIVITY FEED
     --------------------------------------------------------- */

  /*
    Presentation-only activity feed.

    It does NOT query blockchain activity and does NOT claim
    these entries are real transactions.
  */

  const activityEntries = [
    {
      amount: "0.042 BTC",
      address: "0xA73C...91B4"
    },
    {
      amount: "0.018 BTC",
      address: "0x31F7...E204"
    },
    {
      amount: "0.067 BTC",
      address: "0x8C42...A91D"
    }
  ];

  let activityIndex = 0;

  function renderActivity() {
    if (!activityFeed) return;

    const entries = [];

    for (let i = 0; i < 3; i++) {
      const index =
        (activityIndex + i) %
        activityEntries.length;

      entries.push(
        activityEntries[index]
      );
    }

    activityFeed.innerHTML = `
      <div class="activity-card">
        ${entries
          .map(
            (entry) => `
              <div class="activity-item">
                <div class="activity-icon">↗</div>

                <div class="activity-details">
                  <strong>${entry.amount}</strong>
                  <span>${entry.address}</span>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;

    activityIndex =
      (activityIndex + 1) %
      activityEntries.length;
  }

  function startActivityFeed() {
    renderActivity();

    setInterval(() => {
      if (!activityFeed) return;

      const card =
        activityFeed.querySelector(
          ".activity-card"
        );

      if (card) {
        card.classList.add(
          "activity-transition"
        );
      }

      setTimeout(() => {
        renderActivity();
      }, 550);

    }, CONFIG.activityIntervalMs);
  }

  /* ---------------------------------------------------------
     PARTICLES
     --------------------------------------------------------- */

  function createParticles() {
    const container =
      $("particles");

    if (!container) return;

    const fragment =
      document.createDocumentFragment();

    for (let i = 0; i < 35; i++) {
      const particle =
        document.createElement("span");

      particle.className = "particle";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.top =
        `${Math.random() * 100}%`;

      particle.style.animationDelay =
        `${Math.random() * 6}s`;

      particle.style.animationDuration =
        `${5 + Math.random() * 7}s`;

      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  /* ---------------------------------------------------------
     INPUT EVENTS
     --------------------------------------------------------- */

  if (bnbAmountInput) {
    bnbAmountInput.addEventListener(
      "input",
      () => {
        const amount =
          Number(bnbAmountInput.value);

        if (
          Number.isFinite(amount) &&
          amount >= CONFIG.minBNB &&
          amount <= CONFIG.maxBNB
        ) {
          calculateAllocation();
        }
      }
    );
  }

  if (calculateButton) {
    calculateButton.addEventListener(
      "click",
      calculateAllocation
    );
  }

  if (buyBTCButton) {
    buyBTCButton.addEventListener(
      "click",
      handleParticipationButton
    );
  }

  if (connectWalletButton) {
    connectWalletButton.addEventListener(
      "click",
      connectWallet
    );
  }

  if (copyContractButton) {
    copyContractButton.addEventListener(
      "click",
      copyContractAddress
    );
  }

  /* ---------------------------------------------------------
     WALLET EVENTS
     --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     INITIALIZE
     --------------------------------------------------------- */

  async function initialize() {
    createParticles();

    await restoreWalletConnection();

    await loadMarketData();

    startActivityFeed();

    setInterval(
      loadMarketData,
      CONFIG.priceRefreshMs
    );

    if (contractAddressElement) {
      contractAddressElement.textContent =
        CONFIG.contractAddress;
    }
  }

  initialize();

})();
