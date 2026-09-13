/*
  BTC / BNB Buyback Portal
  Network: BNB Smart Chain
  Contract: 0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
*/

const CONTRACT_ADDRESS =
  "0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85";

const CHAIN_ID = 56;
const CHAIN_HEX = "0x38";

const FALLBACK_MIN_BNB = 0.1;
const BONUS_MIN_BNB = 5;
const FALLBACK_MAX_BNB = Number.MAX_SAFE_INTEGER;
const FALLBACK_BONUS = 11;

const BSC_RPC_URLS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.binance.org/",
  "https://bsc-dataseed2.binance.org/",
  "https://bsc-dataseed3.binance.org/",
  "https://bsc-dataseed4.binance.org/"
];

const ABI = [
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
        name: "baseBTC",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "bonusBTC",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "totalBTC",
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
    name: "buyBTC",
    outputs: [],
    stateMutability: "payable",
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
        name: "btcAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bonusAmount",
        type: "uint256"
      }
    ],
    name: "BTCPurchased",
    type: "event"
  }
];

let readProvider = null;
let walletProvider = null;
let signer = null;
let contract = null;

let connectedAddress = null;
let selectedWalletDefinition = null;

let btcDecimals = 8;

let bonusPercent = FALLBACK_BONUS;
let minBNB = BONUS_MIN_BNB;
let maxBNB = 1000;

let availableBTCAmount = null;

let discoveredWallets = [];

let currentCalculation = {
  baseBTC: 0,
  bonusBTC: 0,
  totalBTC: 0
};

let activityLoading = false;

const RECENT_ACTIVITY_PREVIEW = [
  {
    buyer: "0x7A2...91F",
    bnb: "25.00",
    btc: "0.00000000",
    time: "Just now"
  },
  {
    buyer: "0x3C8...D21",
    bnb: "10.00",
    btc: "0.00000000",
    time: "2 min ago"
  },
  {
    buyer: "0x91B...7A4",
    bnb: "50.00",
    btc: "0.00000000",
    time: "5 min ago"
  },
  {
    buyer: "0xE21...4C8",
    bnb: "15.00",
    btc: "0.00000000",
    time: "8 min ago"
  }
];

const WALLET_DEFINITIONS = [
  {
    name: "MetaMask",
    slug: "metamask",
    match: /metamask/i
  },
  {
    name: "Trust Wallet",
    slug: "trustwallet",
    match: /trust/i
  },
  {
    name: "Binance Wallet",
    slug: "binance",
    match: /binance/i
  },
  {
    name: "OKX Wallet",
    slug: "okx",
    match: /okx/i
  },
  {
    name: "Bitget Wallet",
    slug: "bitget",
    match: /bitget/i
  },
  {
    name: "SafePal",
    slug: "safepal",
    match: /safepal/i
  },
  {
    name: "Rabby",
    slug: "rabby",
    match: /rabby/i
  }
];

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(
    document.querySelectorAll(selector)
  );
}

function toast(message) {
  const existing =
    document.querySelector(".toast-message");

  if (existing) {
    existing.remove();
  }

  const element =
    document.createElement("div");

  element.className =
    "toast-message";

  element.textContent =
    message;

  document.body.appendChild(
    element
  );

  requestAnimationFrame(() => {
    element.classList.add("show");
  });

  setTimeout(() => {
    element.classList.remove("show");

    setTimeout(() => {
      element.remove();
    }, 300);
  }, 3200);
}

function shortenAddress(address) {
  if (!address) {
    return "";
  }

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );
}

function formatNumber(
  value,
  maximumFractionDigits = 8
) {
  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits,
      minimumFractionDigits: 0
    }
  ).format(number);
}

function getCurrentDAppUrl() {
  return (
    window.location.origin +
    window.location.pathname +
    window.location.search
  );
}

function getWalletIcon(slug) {
  const icons = {
    metamask:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",

    trustwallet:
      "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",

    binance:
      "https://public.bnbstatic.com/image/cms/blog/20210115/5a2c4c0e-4e2c-4a3f-8c2c-7db8e0c7b9e7.png",

    okx:
      "https://static.okx.com/cdn/assets/imgs/221/7E6C7F7D8F7D8F7D8F7D8F7D8F7D8F7D.png",

    bitget:
      "https://img.bitgetimg.com/multiLang/web/bitget-logo.png",

    safepal:
      "https://safepal.com/favicon.ico",

    rabby:
      "https://rabby.io/favicon.ico"
  };

  return (
    icons[slug] || ""
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInjectedProviders() {
  const providers = [];

  if (
    window.ethereum &&
    Array.isArray(
      window.ethereum.providers
    )
  ) {
    providers.push(
      ...window.ethereum.providers
    );
  }

  if (
    window.ethereum &&
    !providers.includes(
      window.ethereum
    )
  ) {
    providers.push(
      window.ethereum
    );
  }

  return providers;
}

function identifyProvider(provider) {
  if (!provider) {
    return null;
  }

  const flags = [
    ["isMetaMask", "MetaMask"],
    ["isTrust", "Trust Wallet"],
    ["isTrustWallet", "Trust Wallet"],
    ["isBinance", "Binance Wallet"],
    ["isBinanceWallet", "Binance Wallet"],
    ["isOkxWallet", "OKX Wallet"],
    ["isOKXWallet", "OKX Wallet"],
    ["isBitgetWallet", "Bitget Wallet"],
    ["isBitKeep", "Bitget Wallet"],
    ["isSafePal", "SafePal"],
    ["isRabby", "Rabby"]
  ];

  for (
    const [flag, name]
    of flags
  ) {
    if (
      provider[flag] === true
    ) {
      return name;
    }
  }

  return null;
}

function providerName(provider) {
  if (!provider) {
    return "";
  }

  const name =
    identifyProvider(
      provider
    );

  if (name) {
    return name;
  }

  return (
    provider?.name ||
    provider?.providerInfo?.name ||
    provider?.info?.name ||
    ""
  );
}

function discoverWallets() {
  discoveredWallets = [];

  const providers =
    getInjectedProviders();

  providers.forEach(
    (provider) => {
      const name =
        providerName(
          provider
        );

      discoveredWallets.push({
        provider,
        name
      });
    }
  );

  return discoveredWallets;
}

function findWalletProvider(
  definition
) {
  if (!definition) {
    return null;
  }

  const providers =
    getInjectedProviders();

  for (
    const provider
    of providers
  ) {
    const name =
      providerName(
        provider
      );

    if (
      name &&
      definition.match.test(
        name
      )
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "metamask" &&
      provider.isMetaMask
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "trustwallet" &&
      (
        provider.isTrust ||
        provider.isTrustWallet
      )
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "binance" &&
      (
        provider.isBinance ||
        provider.isBinanceWallet
      )
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "okx" &&
      (
        provider.isOkxWallet ||
        provider.isOKXWallet
      )
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "bitget" &&
      provider.isBitgetWallet
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "safepal" &&
      provider.isSafePal
    ) {
      return provider;
    }

    if (
      definition.slug ===
        "rabby" &&
      provider.isRabby
    ) {
      return provider;
    }
  }

  /*
    If there is only one injected provider, use it as the
    fallback for the selected wallet.
  */
  if (
    providers.length === 1
  ) {
    return providers[0];
  }

  return null;
}

function restoreSelectedWallet() {
  try {
    const savedSlug =
      localStorage.getItem(
        "preferredWallet"
      );

    if (!savedSlug) {
      return;
    }

    const definition =
      WALLET_DEFINITIONS.find(
        (wallet) =>
          wallet.slug ===
          savedSlug
      );

    if (definition) {
      selectedWalletDefinition =
        definition;
    }
  } catch (error) {
    console.warn(
      "Unable to restore wallet preference.",
      error
    );
  }
}

function updateWalletButton() {
  const button =
    document.querySelector(
      "#connectWallet"
    );

  if (!button) {
    return;
  }

  if (connectedAddress) {
    button.textContent =
      shortenAddress(
        connectedAddress
      );

    button.classList.add(
      "connected"
    );
  } else {
    button.textContent =
      "Connect Wallet";

    button.classList.remove(
      "connected"
    );
  }
}

function ensureBSC(
  provider
) {
  return provider.request({
    method:
      "wallet_switchEthereumChain",
    params: [
      {
        chainId:
          CHAIN_HEX
      }
    ]
  }).catch(
    async (error) => {
      if (
        error?.code !== 4902
      ) {
        throw error;
      }

      return provider.request({
        method:
          "wallet_addEthereumChain",
        params: [
          {
            chainId:
              CHAIN_HEX,

            chainName:
              "BNB Smart Chain",

            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18
            },

            rpcUrls:
              [
                BSC_RPC_URLS[0]
              ],

            blockExplorerUrls:
              [
                "https://bscscan.com"
              ]
          }
        ]
      });
    }
  );
}

async function initializeReadProvider() {
  if (
    readProvider
  ) {
    return readProvider;
  }

  for (
    const rpcUrl
    of BSC_RPC_URLS
  ) {
    try {
      const provider =
        new ethers.JsonRpcProvider(
          rpcUrl,
          {
            name:
              "bnb-smart-chain",
            chainId:
              CHAIN_ID
          }
        );

      await provider.getBlockNumber();

      readProvider =
        provider;

      return readProvider;
    } catch (error) {
      console.warn(
        "RPC unavailable:",
        rpcUrl,
        error
      );
    }
  }

  return null;
}

async function loadContractData() {
  try {
    const provider =
      await initializeReadProvider();

    if (!provider) {
      return;
    }

    const readContract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        provider
      );

    try {
      const decimals =
        await readContract.decimals();

      btcDecimals =
        Number(decimals);
    } catch (
      error
    ) {
      console.warn(
        "Unable to load BTC decimals.",
        error
      );
    }

    try {
      const bonus =
        await readContract.BONUS_PERCENT();

      bonusPercent =
        Number(
          ethers.formatUnits(
            bonus,
            0
          )
        );
    } catch (
      error
    ) {
      bonusPercent =
        FALLBACK_BONUS;
    }

    try {
      const minimum =
        await readContract.referenceMinimumBNB();

      const value =
        Number(
          ethers.formatEther(
            minimum
          )
        );

      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        minBNB =
          Math.max(
            value,
            BONUS_MIN_BNB
          );
      }
    } catch (
      error
    ) {
      minBNB =
        BONUS_MIN_BNB;
    }

    try {
      const maximum =
        await readContract.referenceMaximumBNB();

      const value =
        Number(
          ethers.formatEther(
            maximum
          )
        );

      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        maxBNB =
          Math.min(
            value,
            1000
          );
      }
    } catch (
      error
    ) {
      maxBNB =
        1000;
    }

    try {
      availableBTCAmount =
        await readContract.availableBTC();
    } catch (
      error
    ) {
      availableBTCAmount =
        null;
    }

    updateBonusUI();
  } catch (
    error
  ) {
    console.error(
      "Contract data:",
      error
    );
  }
}

function updateBonusUI() {
  $all(
    "[data-bonus-percent]"
  ).forEach(
    (element) => {
      element.textContent =
        `${bonusPercent}%`;
    }
  );

  $all(
    "[data-min-bnb]"
  ).forEach(
    (element) => {
      element.textContent =
        formatNumber(
          minBNB,
          2
        );
    }
  );

  $all(
    "[data-max-bnb]"
  ).forEach(
    (element) => {
      element.textContent =
        formatNumber(
          maxBNB,
          2
        );
    }
  );
}

function createWalletModal() {
  if (
    document.querySelector(
      "#walletModal"
    )
  ) {
    return;
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "walletModal";

  modal.className =
    "wallet-modal";

  modal.innerHTML = `
    <div class="wallet-modal-backdrop"></div>

    <div class="wallet-modal-card">

      <div class="wallet-modal-header">
        <div>
          <h3>Connect Wallet</h3>
          <p>Select your preferred wallet</p>
        </div>

        <button
          type="button"
          class="wallet-modal-close"
          id="closeWalletModal"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div
        class="wallet-list"
        id="walletList"
      ></div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  const closeButton =
    document.querySelector(
      "#closeWalletModal"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeWalletModal
    );
  }

  const backdrop =
    modal.querySelector(
      ".wallet-modal-backdrop"
    );

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeWalletModal
    );
  }

  renderWalletList();
}

function renderWalletList() {
  const list =
    document.querySelector(
      "#walletList"
    );

  if (!list) {
    return;
  }

  list.innerHTML =
    WALLET_DEFINITIONS
      .map(
        (wallet) => `
          <button
            type="button"
            class="wallet-option"
            data-wallet-slug="${escapeHtml(
              wallet.slug
            )}"
          >
            <span class="wallet-option-icon">
              <img
                src="${escapeHtml(
                  getWalletIcon(
                    wallet.slug
                  )
                )}"
                alt=""
                loading="lazy"
              >
            </span>

            <span class="wallet-option-name">
              ${escapeHtml(
                wallet.name
              )}
            </span>

            <span class="wallet-option-arrow">
              ›
            </span>
          </button>
        `
      )
      .join("");

  list
    .querySelectorAll(
      "[data-wallet-slug]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const slug =
              button.dataset
                .walletSlug;

            const definition =
              WALLET_DEFINITIONS.find(
                (wallet) =>
                  wallet.slug ===
                  slug
              );

            if (definition) {
              selectWallet(
                definition
              );
            }
          }
        );
      }
    );
}

function openWalletModal() {
  createWalletModal();

  const modal =
    document.querySelector(
      "#walletModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    "open"
  );

  document.body.classList.add(
    "wallet-modal-open"
  );
}

function closeWalletModal() {
  const modal =
    document.querySelector(
      "#walletModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "open"
  );

  document.body.classList.remove(
    "wallet-modal-open"
  );
}

function createConnectedWalletPanel() {
  if (
    document.querySelector(
      "#connectedWalletPanel"
    )
  ) {
    return;
  }

  const panel =
    document.createElement(
      "div"
    );

  panel.id =
    "connectedWalletPanel";

  panel.className =
    "connected-wallet-panel";

  panel.innerHTML = `
    <div class="connected-wallet-header">
      <div>
        <span class="connected-wallet-status">
          Wallet Connected
        </span>

        <strong
          id="connectedWalletName"
        >
          Wallet
        </strong>
      </div>

      <span
        class="connected-wallet-dot"
      ></span>
    </div>

    <div class="connected-wallet-address">
      <span
        id="connectedWalletAddress"
      >
        —
      </span>
    </div>

    <div class="connected-wallet-contract">
      <span>
        Contract
      </span>

      <code>
        ${CONTRACT_ADDRESS}
      </code>

      <button
        type="button"
        id="copyContract"
      >
        Copy Contract
      </button>
    </div>

    <button
      type="button"
      id="openConnectedWallet"
      class="open-wallet-button"
    >
      Open Wallet
    </button>
  `;

  document.body.appendChild(
    panel
  );

  setupConnectedWalletActions();
}

function updateConnectedWalletPanel() {
  const panel =
    document.querySelector(
      "#connectedWalletPanel"
    );

  if (!panel) {
    return;
  }

  const address =
    document.querySelector(
      "#connectedWalletAddress"
    );

  if (address) {
    address.textContent =
      connectedAddress
        ? shortenAddress(
            connectedAddress
          )
        : "—";
  }

  const walletName =
    document.querySelector(
      "#connectedWalletName"
    );

  if (walletName) {
    walletName.textContent =
      selectedWalletDefinition
        ?.name ||
      "Wallet";
  }

  if (
    connectedAddress
  ) {
    panel.classList.add(
      "visible"
    );
  } else {
    panel.classList.remove(
      "visible"
    );
  }
}

async function selectWallet(
  definition
) {
  selectedWalletDefinition =
    definition;

  try {
    localStorage.setItem(
      "preferredWallet",
      definition.slug
    );
  } catch (error) {
    console.warn(
      "Unable to save wallet preference.",
      error
    );
  }

  const selectedProvider =
    findWalletProvider(
      definition
    );

  if (selectedProvider) {
    closeWalletModal();

    try {
      await ensureBSC(
        selectedProvider
      );

      walletProvider =
        selectedProvider;

      const browserProvider =
        new ethers.BrowserProvider(
          selectedProvider
        );

      signer =
        await browserProvider.getSigner();

      connectedAddress =
        await signer.getAddress();

      contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          ABI,
          signer
        );

      updateWalletButton();
      updateConnectedWalletPanel();

      toast(
        `${definition.name} connected.`
      );

      return;
    } catch (
      error
    ) {
      console.error(
        "Wallet connection:",
        error
      );

      if (
        error?.code === 4001 ||
        error?.code ===
          "ACTION_REJECTED"
      ) {
        toast(
          "Wallet connection cancelled."
        );
      } else {
        toast(
          `Unable to connect ${definition.name}.`
        );
      }

      return;
    }
  }

  /*
    Mobile wallet opening:
    Use the wallet's DApp launcher only when the URL format
    is known. The selected wallet is preserved.
  */
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    const currentUrl =
      getCurrentDAppUrl();

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
        break;
    }

    if (walletUrl) {
      closeWalletModal();

      window.location.href =
        walletUrl;

      return;
    }
  }

  toast(
    `${definition.name} was not detected. Open this page in the ${definition.name} DApp browser.`
  );
}
