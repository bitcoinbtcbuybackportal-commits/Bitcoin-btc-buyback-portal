/* =========================================================
   BITCOIN BTC BUYBACK PORTAL
   PREMIUM WEB3 INTERFACE
   ========================================================= */

:root {
  --bg: #050505;
  --bg-soft: #0b0b0c;
  --panel: rgba(18, 18, 20, 0.78);
  --panel-solid: #111113;
  --panel-light: rgba(255, 255, 255, 0.055);

  --text: #ffffff;
  --muted: #9b9ba3;
  --muted-light: #c7c7cd;

  --btc: #f7931a;
  --btc-light: #ffb347;
  --btc-dark: #d97900;

  --line: rgba(255, 255, 255, 0.09);
  --line-strong: rgba(247, 147, 26, 0.28);

  --success: #35d07f;
  --danger: #ff5d6c;

  --radius-lg: 28px;
  --radius-md: 18px;
  --radius-sm: 12px;

  --shadow:
    0 25px 80px rgba(0, 0, 0, 0.45);

  --transition: 220ms ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 70% 5%,
      rgba(247, 147, 26, 0.11),
      transparent 30%
    ),
    radial-gradient(
      circle at 15% 45%,
      rgba(247, 147, 26, 0.055),
      transparent 27%
    ),
    var(--bg);

  color: var(--text);
  font-family: "Inter", sans-serif;
  overflow-x: hidden;
  line-height: 1.5;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}


/* =========================================================
   BACKGROUND
   ========================================================= */

.page-background {
  position: fixed;
  inset: 0;
  z-index: -10;
  pointer-events: none;
  overflow: hidden;
  background: #050505;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.18;
}

.bg-glow-one {
  width: 520px;
  height: 520px;
  top: -250px;
  right: -100px;
  background: var(--btc);
}

.bg-glow-two {
  width: 420px;
  height: 420px;
  bottom: -220px;
  left: -160px;
  background: #ff7a00;
  opacity: 0.08;
}

.grid-overlay {
  position: absolute;
  inset: 0;

  background-image:
    linear-gradient(
      rgba(255, 255, 255, 0.018) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.018) 1px,
      transparent 1px
    );

  background-size: 65px 65px;

  mask-image:
    linear-gradient(
      to bottom,
      black,
      transparent 90%
    );
}


/* =========================================================
   HEADER
   ========================================================= */

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;

  border-bottom: 1px solid rgba(255, 255, 255, 0.065);

  background: rgba(5, 5, 5, 0.78);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.header-inner {
  width: min(1240px, calc(100% - 40px));
  min-height: 82px;

  margin: auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 25px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;

  min-width: max-content;
}

.brand-mark {
  width: 42px;
  height: 42px;

  border-radius: 13px;

  display: grid;
  place-items: center;

  color: #050505;
  font-size: 24px;
  font-weight: 900;

  background:
    linear-gradient(
      145deg,
      #ffd08a,
      var(--btc) 45%,
      var(--btc-dark)
    );

  box-shadow:
    0 0 30px rgba(247, 147, 26, 0.24);
}

.brand-mark.small {
  width: 35px;
  height: 35px;
  border-radius: 10px;
  font-size: 20px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-text strong {
  font-family: "Space Grotesk", sans-serif;
  font-size: 15px;
  letter-spacing: -0.2px;
}

.brand-text span {
  color: var(--muted);
  font-size: 11px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 28px;

  margin-left: auto;
}

.desktop-nav a {
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;

  transition:
    color var(--transition),
    transform var(--transition);
}

.desktop-nav a:hover {
  color: white;
  transform: translateY(-1px);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.network-button,
.connect-button {
  border: 1px solid var(--line);
  border-radius: 12px;

  min-height: 42px;

  padding: 0 15px;

  display: flex;
  align-items: center;
  gap: 8px;

  background: rgba(255, 255, 255, 0.035);
  color: white;

  font-size: 12px;
  font-weight: 700;
}

.network-dot,
.activity-live span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: var(--success);

  box-shadow:
    0 0 12px rgba(53, 208, 127, 0.75);
}

.connect-button {
  border-color: rgba(247, 147, 26, 0.4);

  background:
    linear-gradient(
      135deg,
      rgba(247, 147, 26, 0.18),
      rgba(247, 147, 26, 0.07)
    );

  transition:
    background var(--transition),
    border-color var(--transition),
    transform var(--transition);
}

.connect-button:hover {
  border-color: rgba(247, 147, 26, 0.75);

  background:
    linear-gradient(
      135deg,
      rgba(247, 147, 26, 0.3),
      rgba(247, 147, 26, 0.1)
    );

  transform: translateY(-1px);
}


/* =========================================================
   HERO
   ========================================================= */

.hero-section {
  width: min(1240px, calc(100% - 40px));

  min-height: 650px;

  margin: auto;

  display: grid;
  grid-template-columns: 1.05fr 0.95fr;

  align-items: center;
  gap: 70px;

  padding: 95px 0 70px;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.eyebrow {
  width: max-content;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;

  border: 1px solid rgba(247, 147, 26, 0.2);
  border-radius: 999px;

  background: rgba(247, 147, 26, 0.055);

  color: var(--btc-light);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.live-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--btc);

  box-shadow:
    0 0 12px rgba(247, 147, 26, 0.9);

  animation: pulse 1.8s infinite;
}

.hero-content h1 {
  max-width: 760px;

  margin-top: 25px;

  font-family: "Space Grotesk", sans-serif;

  font-size: clamp(48px, 6vw, 82px);

  line-height: 0.99;

  letter-spacing: -4px;

  font-weight: 700;
}

.hero-content h1 span {
  display: block;

  background:
    linear-gradient(
      100deg,
      #fff 0%,
      #fff 22%,
      var(--btc-light) 65%,
      var(--btc) 100%
    );

  -webkit-background-clip: text;
  background-clip: text;

  color: transparent;
}

.hero-description {
  max-width: 570px;

  margin-top: 27px;

  color: var(--muted);

  font-size: 16px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;

  gap: 12px;

  margin-top: 34px;
}

.primary-button,
.secondary-button {
  min-height: 52px;

  padding: 0 22px;

  border-radius: 14px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  font-size: 13px;
  font-weight: 800;

  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.primary-button {
  color: #080808;

  background:
    linear-gradient(
      135deg,
      #ffd18b,
      var(--btc)
    );

  box-shadow:
    0 12px 35px rgba(247, 147, 26, 0.2);
}

.primary-button:hover {
  transform: translateY(-2px);

  box-shadow:
    0 18px 45px rgba(247, 147, 26, 0.28);
}

.secondary-button {
  border: 1px solid var(--line);

  background: rgba(255, 255, 255, 0.035);

  color: white;
}

.secondary-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.07);
}

.hero-stats {
  margin-top: 55px;

  display: flex;
  align-items: center;

  gap: 22px;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hero-stat strong {
  font-family: "Space Grotesk", sans-serif;
  font-size: 17px;
}

.hero-stat span {
  color: var(--muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--line);
}


/* =========================================================
   BTC VISUAL
   ========================================================= */

.hero-visual {
  position: relative;

  min-height: 500px;

  display: grid;
  place-items: center;
}

.btc-card {
  position: relative;
  z-index: 3;

  width: min(390px, 85%);

  padding: 18px;

  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 30px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.11),
      rgba(255, 255, 255, 0.035)
    );

  box-shadow:
    0 35px 100px rgba(0, 0, 0, 0.55),
    0 0 70px rgba(247, 147, 26, 0.08);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  transform: rotate(2deg);

  animation: floatCard 6s ease-in-out infinite;
}

.btc-card-top,
.btc-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btc-card-top {
  padding: 5px 4px 15px;

  font-size: 12px;
  font-weight: 800;
}

.verified-badge {
  padding: 5px 8px;

  border-radius: 999px;

  color: var(--success);

  background: rgba(53, 208, 127, 0.08);

  font-size: 8px;
  letter-spacing: 1px;
}

.btc-image-wrap {
  position: relative;

  overflow: hidden;

  aspect-ratio: 0.92;

  border-radius: 21px;

  background: #171717;
}

.btc-image {
  width: 100%;
  height: 100%;

  object-fit: cover;

  filter:
    saturate(0.75)
    contrast(1.1);

  opacity: 0.72;

  transform: scale(1.05);

  transition:
    transform 600ms ease,
    opacity 600ms ease;
}

.btc-card:hover .btc-image {
  opacity: 0.85;
  transform: scale(1.1);
}

.btc-image-wrap::after {
  content: "";

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      180deg,
      rgba(247, 147, 26, 0.02),
      rgba(247, 147, 26, 0.25)
    );
}

.btc-symbol {
  position: absolute;

  left: 50%;
  top: 50%;

  z-index: 2;

  transform: translate(-50%, -50%);

  width: 105px;
  height: 105px;

  border-radius: 50%;

  display: grid;
  place-items: center;

  font-family: "Space Grotesk", sans-serif;

  font-size: 66px;
  font-weight: 700;

  color: #111;

  background:
    linear-gradient(
      145deg,
      #ffd99c,
      var(--btc),
      var(--btc-dark)
    );

  box-shadow:
    0 0 70px rgba(247, 147, 26, 0.35),
    inset 0 2px 8px rgba(255, 255, 255, 0.35);
}

.btc-card-bottom {
  padding: 17px 5px 3px;
}

.btc-card-bottom div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.btc-card-bottom div:last-child {
  text-align: right;
}

.label {
  color: var(--muted);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btc-card-bottom strong {
  font-size: 12px;
}

.orbit {
  position: absolute;

  border: 1px solid rgba(247, 147, 26, 0.11);

  border-radius: 50%;

  pointer-events: none;
}

.orbit-one {
  width: 530px;
  height: 530px;

  transform: rotate(25deg);
}

.orbit-two {
  width: 390px;
  height: 580px;

  transform: rotate(-35deg);

  border-color: rgba(255, 255, 255, 0.06);
}


/* =========================================================
   WALLET
   ========================================================= */

.wallet-section,
.portal-section,
.contract-section,
.activity-section,
.info-section {
  width: min(1240px, calc(100% - 40px));
  margin: auto;
}

.wallet-section {
  margin-bottom: 70px;
}

.wallet-status-card {
  min-height: 90px;

  padding: 18px 20px;

  display: flex;
  align-items: center;
  gap: 16px;

  border: 1px solid var(--line);

  border-radius: 20px;

  background:
    linear-gradient(
      110deg,
      rgba(255, 255, 255, 0.055),
      rgba(255, 255, 255, 0.025)
    );

  box-shadow: var(--shadow);

  backdrop-filter: blur(18px);
}

.wallet-status-icon {
  width: 48px;
  height: 48px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 15px;

  color: var(--btc-light);

  background: rgba(247, 147, 26, 0.09);

  font-size: 22px;
}

.wallet-status-content {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.small-label {
  color: var(--muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.wallet-status-content strong {
  margin-top: 2px;
  font-size: 13px;
}

.wallet-status-content span:last-child {
  overflow: hidden;

  color: var(--muted);

  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallet-action-button {
  margin-left: auto;

  min-height: 42px;

  padding: 0 17px;

  border: 1px solid var(--line);
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.045);

  color: white;

  font-size: 11px;
  font-weight: 800;
}


/* =========================================================
   SECTION HEADINGS
   ========================================================= */

.portal-section {
  padding: 35px 0 90px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 30px;

  margin-bottom: 28px;
}

.section-kicker,
.card-kicker {
  color: var(--btc-light);

  font-size: 9px;
  font-weight: 900;

  letter-spacing: 1.8px;
}

.section-heading h2 {
  margin-top: 8px;

  font-family: "Space Grotesk", sans-serif;

  font-size: clamp(30px, 4vw, 45px);

  line-height: 1.05;

  letter-spacing: -1.8px;
}

.section-heading p {
  max-width: 540px;

  margin-top: 10px;

  color: var(--muted);

  font-size: 13px;
}

.chain-badge,
.activity-live {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 9px 12px;

  border: 1px solid var(--line);

  border-radius: 999px;

  background: rgba(255, 255, 255, 0.035);

  color: var(--muted-light);

  font-size: 10px;
  font-weight: 700;

  white-space: nowrap;
}

.chain-badge span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: var(--btc);
}


/* =========================================================
   PORTAL GRID
   ========================================================= */

.portal-grid {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 20px;
}

.glass-card {
  min-width: 0;

  padding: 27px;

  border: 1px solid var(--line);

  border-radius: var(--radius-lg);

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.065),
      rgba(255, 255, 255, 0.025)
    );

  box-shadow: var(--shadow);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 28px;
}

.card-heading h3 {
  margin-top: 5px;

  font-family: "Space Grotesk", sans-serif;

  font-size: 21px;
}

.live-badge,
.secure-badge {
  padding: 6px 9px;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 900;

  letter-spacing: 1px;
}

.live-badge {
  color: var(--success);
  background: rgba(53, 208, 127, 0.08);
}

.secure-badge {
  color: var(--success);
  background: rgba(53, 208, 127, 0.07);

  letter-spacing: 0;
}

.secure-badge span {
  margin-right: 4px;
}


/* =========================================================
   INPUT
   ========================================================= */

.calculator-card label {
  display: block;

  margin-bottom: 8px;

  color: var(--muted);

  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.amount-input {
  height: 66px;

  display: flex;
  align-items: center;

  padding: 0 18px;

  border: 1px solid rgba(255, 255, 255, 0.09);

  border-radius: 16px;

  background: rgba(0, 0, 0, 0.27);

  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

.amount-input:focus-within {
  border-color: rgba(247, 147, 26, 0.45);

  box-shadow:
    0 0 0 4px rgba(247, 147, 26, 0.06);
}

.amount-input input {
  min-width: 0;
  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;

  color: white;

  font-family: "Space Grotesk", sans-serif;

  font-size: 25px;
  font-weight: 600;
}

.amount-input input::placeholder {
  color: #48484d;
}

.amount-input span {
  color: var(--btc-light);

  font-size: 12px;
  font-weight: 900;
}

.limit-row {
  display: flex;
  gap: 8px;

  margin-top: 9px;
}

.limit-button {
  flex: 1;

  padding: 9px 10px;

  border: 1px solid var(--line);

  border-radius: 10px;

  background: rgba(255, 255, 255, 0.025);

  color: var(--muted);

  font-size: 9px;

  display: flex;
  justify-content: space-between;

  transition: background var(--transition);
}

.limit-button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.limit-button span {
  color: white;
  font-weight: 800;
}


/* =========================================================
   ALLOCATION
   ========================================================= */

.allocation-preview {
  margin-top: 26px;

  padding: 16px;

  border: 1px solid var(--line);

  border-radius: 16px;

  background: rgba(0, 0, 0, 0.2);
}

.preview-row {
  min-height: 34px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.preview-row span {
  color: var(--muted);

  font-size: 11px;
}

.preview-row strong {
  font-family: "Space Grotesk", sans-serif;

  font-size: 12px;
}

.preview-divider {
  height: 1px;

  margin: 8px 0;

  background: var(--line);
}

.total-row {
  min-height: 43px;
}

.total-row span {
  color: white;

  font-weight: 700;
}

.total-row strong {
  color: var(--btc-light);

  font-size: 17px;
}


/* =========================================================
   BUTTONS
   ========================================================= */

.full-secondary-button {
  width: 100%;

  min-height: 50px;

  margin-top: 16px;

  border: 1px solid var(--line);

  border-radius: 13px;

  background: rgba(255, 255, 255, 0.04);

  color: white;

  font-size: 11px;
  font-weight: 800;

  transition:
    background var(--transition),
    border-color var(--transition);
}

.full-secondary-button:hover {
  border-color: rgba(247, 147, 26, 0.35);

  background: rgba(247, 147, 26, 0.07);
}


/* =========================================================
   PURCHASE CARD
   ========================================================= */

.purchase-visual {
  min-height: 185px;

  padding: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 22px;

  border: 1px solid var(--line);

  border-radius: 20px;

  background:
    radial-gradient(
      circle at center,
      rgba(247, 147, 26, 0.1),
      transparent 65%
    );
}

.purchase-orb {
  width: 82px;
  height: 82px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background:
    linear-gradient(
      145deg,
      #ffd391,
      var(--btc)
    );

  color: #111;

  font-family: "Space Grotesk", sans-serif;

  font-size: 45px;
  font-weight: 700;

  box-shadow:
    0 0 50px rgba(247, 147, 26, 0.22);
}

.purchase-visual > div:last-child {
  display: flex;
  flex-direction: column;
}

.purchase-visual span {
  color: var(--muted);

  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.purchase-visual strong {
  margin-top: 3px;

  font-family: "Space Grotesk", sans-serif;

  font-size: 28px;
}

.transaction-info {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;

  margin-top: 15px;
}

.transaction-info div {
  padding: 12px;

  border: 1px solid var(--line);

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.025);
}

.transaction-info span {
  display: block;

  color: var(--muted);

  font-size: 9px;
}

.transaction-info strong {
  display: block;

  margin-top: 4px;

  font-size: 11px;
}

.contract-short {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.buy-button {
  width: 100%;

  min-height: 58px;

  margin-top: 16px;

  padding: 0 18px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  border: 0;

  border-radius: 15px;

  color: #080808;

  background:
    linear-gradient(
      100deg,
      #ffd99e,
      var(--btc)
    );

  font-size: 12px;
  font-weight: 900;

  box-shadow:
    0 15px 35px rgba(247, 147, 26, 0.15);

  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.buy-button:hover {
  transform: translateY(-2px);

  box-shadow:
    0 20px 45px rgba(247, 147, 26, 0.24);
}

.button-icon {
  font-size: 18px;
}

.button-arrow {
  margin-left: auto;

  font-size: 17px;
}

.transaction-note {
  margin-top: 12px;

  color: #68686e;

  font-size: 9px;

  text-align: center;
}


/* =========================================================
   CONTRACT
   ========================================================= */

.contract-section {
  padding: 0 0 90px;
}

.contract-card {
  padding: 28px;

  display: grid;
  grid-template-columns: 0.8fr 1.2fr;

  align-items: center;

  gap: 30px;

  border: 1px solid rgba(247, 147, 26, 0.18);

  border-radius: var(--radius-lg);

  background:
    radial-gradient(
      circle at 85% 50%,
      rgba(247, 147, 26, 0.08),
      transparent 40%
    ),
    rgba(255, 255, 255, 0.03);
}

.contract-left h2 {
  margin-top: 7px;

  font-family: "Space Grotesk", sans-serif;

  font-size: 27px;
}

.contract-left p {
  max-width: 430px;

  margin-top: 8px;

  color: var(--muted);

  font-size: 11px;
}

.contract-address-box {
  padding: 17px;

  border: 1px solid var(--line);

  border-radius: 15px;

  background: rgba(0, 0, 0, 0.25);
}

.contract-address-box > span {
  display: block;

  margin-bottom: 9px;

  color: var(--muted);

  font-size: 9px;

  text-transform: uppercase;

  letter-spacing: 1px;
}

.address-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-line code {
  min-width: 0;

  flex: 1;

  overflow: hidden;

  color: var(--muted-light);

  font-family: monospace;

  font-size: 10px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-line button {
  flex: 0 0 auto;

  padding: 7px 10px;

  border: 1px solid var(--line);

  border-radius: 8px;

  background: rgba(255, 255, 255, 0.04);

  color: white;

  font-size: 9px;
}


/* =========================================================
   ACTIVITY
   ========================================================= */

.activity-section {
  padding-bottom: 100px;
}

.activity-heading {
  align-items: center;
}

.activity-feed {
  min-height: 130px;

  position: relative;

  display: flex;
  flex-direction: column;
  gap: 9px;
}

.activity-live {
  color: var(--success);
}

.empty-activity {
  min-height: 130px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px dashed rgba(255, 255, 255, 0.1);

  border-radius: 18px;

  color: var(--muted);
}

.empty-icon {
  margin-bottom: 7px;

  color: #55555b;

  font-size: 24px;
}

.empty-activity strong {
  color: #c9c9cd;

  font-size: 11px;
}

.empty-activity span {
  margin-top: 2px;

  font-size: 9px;
}

.activity-item {
  position: relative;

  min-height: 72px;

  padding: 14px 16px;

  display: flex;
  align-items: center;

  gap: 13px;

  border: 1px solid var(--line);

  border-radius: 15px;

  background: rgba(255, 255, 255, 0.025);

  animation:
    activityIn 500ms ease both,
    activityFade 14s ease forwards;
}

.activity-icon {
  width: 39px;
  height: 39px;

  display: grid;
  place-items: center;

  flex: 0 0 auto;

  border-radius: 12px;

  background: rgba(247, 147, 26, 0.09);

  color: var(--btc-light);

  font-weight: 800;
}

.activity-content {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;
}

.activity-content strong {
  font-size: 11px;
}

.activity-content span {
  overflow: hidden;

  color: var(--muted);

  font-size: 9px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-amount {
  color: var(--btc-light);

  font-family: "Space Grotesk", sans-serif;

  font-size: 12px;
  font-weight: 700;
}


/* =========================================================
   INFO
   ========================================================= */

.info-section {
  padding-bottom: 100px;
}

.info-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 15px;
}

.info-card {
  min-height: 185px;

  padding: 24px;

  border: 1px solid var(--line);

  border-radius: 20px;

  background: rgba(255, 255, 255, 0.025);

  transition:
    transform var(--transition),
    background var(--transition);
}

.info-card:hover {
  transform: translateY(-3px);

  background: rgba(255, 255, 255, 0.045);
}

.info-number {
  color: rgba(247, 147, 26, 0.65);

  font-family: "Space Grotesk", sans-serif;

  font-size: 11px;
  font-weight: 800;
}

.info-card h3 {
  margin-top: 35px;

  font-family: "Space Grotesk", sans-serif;

  font-size: 18px;
}

.info-card p {
  margin-top: 7px;

  color: var(--muted);

  font-size: 10px;

  line-height: 1.7;
}


/* =========================================================
   FOOTER
   ========================================================= */

.site-footer {
  border-top: 1px solid var(--line);

  background: rgba(0, 0, 0, 0.35);
}

.footer-inner {
  width: min(1240px, calc(100% - 40px));

  min-height: 105px;

  margin: auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 30px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-brand > div:last-child {
  display: flex;
  flex-direction: column;
}

.footer-brand strong {
  font-size: 11px;
}

.footer-brand span {
  color: var(--muted);

  font-size: 9px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: var(--muted);

  font-size: 9px;
}

.footer-links a:hover {
  color: white;
}

.footer-network {
  display: flex;
  align-items: center;
  gap: 7px;

  color: var(--muted);

  font-size: 9px;
}

.footer-network span {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--success);
}

.footer-bottom {
  width: min(1240px, calc(100% - 40px));

  margin: auto;

  padding: 15px 0;

  display: flex;
  justify-content: space-between;

  border-top: 1px solid rgba(255, 255, 255, 0.045);

  color: #4f4f54;

  font-size: 8px;
}


/* =========================================================
   TOAST
   ========================================================= */

.toast {
  position: fixed;

  right: 22px;
  bottom: 22px;

  z-index: 200;

  width: min(370px, calc(100% - 30px));

  padding: 14px;

  display: flex;
  align-items: center;

  gap: 11px;

  border: 1px solid var(--line);

  border-radius: 15px;

  background:
    rgba(17, 17, 19, 0.94);

  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.5);

  backdrop-filter: blur(20px);

  opacity: 0;
  visibility: hidden;

  transform: translateY(20px);

  transition:
    opacity 220ms ease,
    transform 220ms ease,
    visibility 220ms ease;
}

.toast.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.toast-icon {
  width: 35px;
  height: 35px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 10px;

  color: var(--success);

  background: rgba(53, 208, 127, 0.1);
}

.toast > div:nth-child(2) {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;
}

.toast strong {
  font-size: 10px;
}

.toast span {
  color: var(--muted);

  font-size: 9px;
}

.toast button {
  border: 0;

  background: transparent;

  color: #777;

  font-size: 18px;
}


/* =========================================================
   MODAL
   ========================================================= */

.modal {
  position: fixed;
  inset: 0;

  z-index: 150;

  display: grid;
  place-items: center;

  padding: 20px;

  opacity: 0;
  visibility: hidden;

  transition:
    opacity 200ms ease,
    visibility 200ms ease;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-backdrop {
  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.75);

  backdrop-filter: blur(10px);
}

.modal-card {
  position: relative;
  z-index: 2;

  width: min(420px, 100%);

  padding: 35px;

  text-align: center;

  border: 1px solid rgba(255, 255, 255, 0.1);

  border-radius: 25px;

  background:
    linear-gradient(
      145deg,
      #171719,
      #0c0c0e
    );

  box-shadow:
    0 35px 100px rgba(0, 0, 0, 0.65);

  transform: scale(0.96);

  transition: transform 250ms ease;
}

.modal.show .modal-card {
  transform: scale(1);
}

.modal-close {
  position: absolute;

  top: 14px;
  right: 16px;

  border: 0;

  background: transparent;

  color: #777;

  font-size: 22px;
}

.modal-icon {
  width: 70px;
  height: 70px;

  margin: auto;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background:
    linear-gradient(
      145deg,
      #ffd391,
      var(--btc)
    );

  color: #111;

  font-family: "Space Grotesk", sans-serif;

  font-size: 38px;
  font-weight: 700;

  box-shadow:
    0 0 45px rgba(247, 147, 26, 0.2);
}

.modal-kicker {
  display: block;

  margin-top: 22px;

  color: var(--btc-light);

  font-size: 9px;
  font-weight: 900;

  letter-spacing: 1.5px;
}

.modal-card h2 {
  margin-top: 7px;

  font-family: "Space Grotesk", sans-serif;

  font-size: 23px;
}

.modal-card p {
  margin-top: 8px;

  color: var(--muted);

  font-size: 11px;
}

.modal-loader {
  margin-top: 24px;

  display: flex;
  justify-content: center;

  gap: 5px;
}

.modal-loader span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: var(--btc);

  animation: loader 1.2s infinite ease-in-out;
}

.modal-loader span:nth-child(2) {
  animation-delay: 0.15s;
}

.modal-loader span:nth-child(3) {
  animation-delay: 0.3s;
}

.transaction-link {
  display: inline-block;

  margin-top: 22px;

  color: var(--btc-light);

  font-size: 10px;
  font-weight: 800;
}

.hidden {
  display: none !important;
}


/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.75);
  }
}

@keyframes floatCard {
  0%,
  100% {
    transform: rotate(2deg) translateY(0);
  }

  50% {
    transform: rotate(1deg) translateY(-12px);
  }
}

@keyframes loader {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }

  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@keyframes activityIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes activityFade {
  0% {
    opacity: 1;
  }

  75% {
    opacity: 0.8;
  }

  100% {
    opacity: 0.08;
  }
}


/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 980px) {

  .desktop-nav {
    display: none;
  }

  .hero-section {
    grid-template-columns: 1fr;

    gap: 35px;

    padding-top: 70px;
  }

  .hero-content {
    text-align: center;
  }

  .eyebrow {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions,
  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    min-height: 470px;
  }

  .portal-grid {
    grid-template-columns: 1fr;
  }

  .contract-card {
    grid-template-columns: 1fr;
  }
}


@media (max-width: 700px) {

  .header-inner,
  .wallet-section,
  .portal-section,
  .contract-section,
  .activity-section,
  .info-section,
  .footer-inner,
  .footer-bottom {
    width: min(100% - 24px, 1240px);
  }

  .header-inner {
    min-height: 72px;
  }

  .network-button {
    display: none;
  }

  .brand-text span {
    display: none;
  }

  .connect-button {
    min-height: 39px;
    padding: 0 12px;
  }

  .hero-section {
    width: min(100% - 24px, 1240px);

    padding-top: 55px;
  }

  .hero-content h1 {
    font-size: clamp(44px, 13vw, 65px);

    letter-spacing: -3px;
  }

  .hero-description {
    font-size: 13px;
  }

  .hero-stats {
    gap: 14px;
  }

  .hero-stat strong {
    font-size: 14px;
  }

  .hero-stat span {
    font-size: 8px;
  }

  .hero-visual {
    min-height: 400px;
  }

  .btc-card {
    width: min(330px, 90%);
  }

  .orbit-one {
    width: 390px;
    height: 390px;
  }

  .orbit-two {
    width: 310px;
    height: 430px;
  }

  .wallet-status-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .wallet-action-button {
    width: 100%;
    margin-left: 0;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .chain-badge,
  .activity-live {
    align-self: flex-start;
  }

  .glass-card {
    padding: 20px;
  }

  .transaction-info {
    grid-template-columns: 1fr;
  }

  .purchase-visual {
    min-height: 155px;
  }

  .purchase-orb {
    width: 67px;
    height: 67px;
    font-size: 36px;
  }

  .purchase-visual strong {
    font-size: 22px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .footer-inner {
    padding: 25px 0;

    align-items: flex-start;

    flex-direction: column;
  }

  .footer-links {
    flex-wrap: wrap;
  }

  .footer-bottom {
    gap: 10px;
  }
}


@media (max-width: 430px) {

  .brand-mark {
    width: 37px;
    height: 37px;

    border-radius: 11px;

    font-size: 21px;
  }

  .brand-text strong {
    font-size: 13px;
  }

  .hero-content h1 {
    font-size: 43px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .hero-stats {
    gap: 10px;
  }

  .stat-divider {
    height: 26px;
  }

  .btc-card {
    width: 290px;
  }

  .btc-symbol {
    width: 82px;
    height: 82px;
    font-size: 51px;
  }

  .address-line {
    align-items: stretch;
    flex-direction: column;
  }

  .address-line button {
    width: 100%;
  }
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--btc);

  outline-offset: 3px;
}


/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
