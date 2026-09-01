/* ==========================================================
   ACTIVITY ANIMATION
   Three BTC rows continuously slide/fade away
   ========================================================== */

function installActivityStyles() {
  if ($("activityAnimationStyles")) return;

  const style = document.createElement("style");
  style.id = "activityAnimationStyles";

  style.textContent = `
    .activity-feed {
      overflow: hidden;
      min-height: 180px;
    }

    .activity-item {
      opacity: 0;
      transform: translateY(18px);
      animation: activityEnterExit 4.5s ease-in-out forwards;
      will-change: opacity, transform;
    }

    .activity-item:nth-child(1) {
      animation-delay: 0s;
    }

    .activity-item:nth-child(2) {
      animation-delay: 1.2s;
    }

    .activity-item:nth-child(3) {
      animation-delay: 2.4s;
    }

    .activity-text {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: .75rem;
      align-items: center;
    }

    .activity-text span {
      grid-row: span 2;
      font-size: 1.35rem;
    }

    .activity-text strong,
    .activity-text small {
      display: block;
    }

    @keyframes activityEnterExit {

      0% {
        opacity: 0;
        transform: translateY(18px);
      }

      12% {
        opacity: 1;
        transform: translateY(0);
      }

      58% {
        opacity: 1;
        transform: translateY(0);
      }

      100% {
        opacity: 0;
        transform: translateY(-28px);
      }
    }
  `;

  document.head.appendChild(style);
}


const ACTIVITY_ENTRIES = [
  {
    amount: "0.042",
    address: "0xA73C...91B4"
  },
  {
    amount: "0.018",
    address: "0x31F7...E204"
  },
  {
    amount: "0.067",
    address: "0x8C42...A91D"
  }
];


function createActivityItem(entry) {
  const item = document.createElement("div");

  item.className = "activity-item";

  item.innerHTML = `
    <div class="activity-text">
      <span>₿</span>

      <strong>${entry.amount} BTC</strong>

      <small>${entry.address}</small>
    </div>
  `;

  return item;
}


function renderActivity() {
  const feed = $("activityFeed");

  if (!feed) return;

  clearInterval(activityTimer);

  feed.innerHTML = "";

  ACTIVITY_ENTRIES.forEach((entry) => {
    feed.appendChild(
      createActivityItem(entry)
    );
  });

  /*
   * Restart the animation continuously.
   * A new row replaces the row that has faded away,
   * creating the same flowing/fading activity effect.
   */

  let position = 0;

  activityTimer = setInterval(() => {

    const items =
      feed.querySelectorAll(".activity-item");

    if (!items.length) return;

    const newEntry =
      ACTIVITY_ENTRIES[position];

    const newItem =
      createActivityItem(newEntry);

    newItem.style.animationDelay = "0s";

    feed.appendChild(newItem);

    const first =
      feed.querySelector(".activity-item");

    if (first && feed.children.length > 3) {
      first.remove();
    }

    position =
      (position + 1) %
      ACTIVITY_ENTRIES.length;

  }, 1500);
}
