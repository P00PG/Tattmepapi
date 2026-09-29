// About page: portfolio tabs, latest Instagram posts, lightbox

/* =========================================================
   INSTAGRAM FEED SETUP
   1. She connects her Instagram at behold.so (free plan is fine)
      and creates a "JSON" feed.
   2. Paste the feed link below, e.g. "https://feeds.behold.so/abc123".
   Leave it empty and the Instagram tab simply stays hidden.
   ========================================================= */
const INSTAGRAM_FEED_URL = "https://feeds.behold.so/2yRfXN2twzlNvp6qxuEh";
const INSTAGRAM_POST_LIMIT = 12; // how many latest posts to show

const filterButtons = document.querySelectorAll(".portfolio-tab");
const portfolioGrid = document.getElementById("portfolioGrid");
const cards = document.querySelectorAll(".portfolio-card");
const emptyMessage = document.getElementById("portfolioEmptyMessage");
const instagramTab = document.querySelector('.portfolio-tab[data-filter="instagram"]');
const instagramGrid = document.getElementById("instagramGrid");
const instagramMore = document.getElementById("instagramMore");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Plays the same fade-in used when scrolling (matches .reveal-on-scroll in main.css)
// Each photo starts a little after the one before it
const STAGGER_MS = 90;
const MAX_STAGGER_MS = 720; // cap so big galleries don't wait too long

function replayFadeIn(card, order = 0) {
  if (reduceMotion || !card.animate) return;

  card.getAnimations().forEach((animation) => animation.cancel());

  const delay = Math.min(order * STAGGER_MS, MAX_STAGGER_MS);

  card.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 650, delay, easing: "ease", fill: "backwards" }
  );

  card.animate(
    [{ transform: "translateY(16px)" }, { transform: "translateY(0)" }],
    { duration: 650, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
  );
}

/* ---------- Tabs ---------- */

function showTab(filter, { animate = true } = {}) {
  const isInstagram = filter === "instagram";
  let visibleCount = 0;

  filterButtons.forEach((item) => {
    const selected = item.dataset.filter === filter;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });

  if (portfolioGrid) portfolioGrid.hidden = isInstagram;
  if (instagramGrid) instagramGrid.hidden = !isInstagram;
  if (instagramMore) instagramMore.hidden = !isInstagram;

  if (isInstagram) {
    instagramGrid.querySelectorAll(".instagram-post").forEach((post, index) => {
      if (animate) replayFadeIn(post, index);
    });
    if (emptyMessage) emptyMessage.hidden = true;
    return;
  }

  cards.forEach((card) => {
    const visible = card.dataset.category === filter;
    card.classList.toggle("is-hidden", !visible);

    if (visible) {
      if (animate) replayFadeIn(card, visibleCount);
      visibleCount++;
    }
  });

  if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("active")) return; // already on this tab
    showTab(button.dataset.filter);
  });
});

/* ---------- Latest Instagram posts ---------- */

// Works with Behold's feed format (and plain lists of posts)
function readPosts(data) {
  const posts = Array.isArray(data) ? data : data?.posts || data?.data || [];

  return posts
    .map((post) => {
      const isVideo = post.mediaType === "VIDEO" || post.media_type === "VIDEO" || post.isReel;
      const image =
        post.sizes?.medium?.mediaUrl ||
        post.sizes?.large?.mediaUrl ||
        (isVideo ? post.thumbnailUrl || post.thumbnail_url : null) ||
        post.mediaUrl ||
        post.media_url;

      return {
        image,
        link: post.permalink,
        caption: (post.prunedCaption || post.caption || "").trim(),
        type: isVideo
          ? "video"
          : (post.mediaType || post.media_type) === "CAROUSEL_ALBUM" ? "carousel" : "image"
      };
    })
    .filter((post) => post.image && post.link)
    .slice(0, INSTAGRAM_POST_LIMIT);
}

const ICONS = {
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"></path></svg>',
  carousel: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg>'
};

function renderInstagram(posts) {
  instagramGrid.innerHTML = "";

  posts.forEach((post, index) => {
    const link = document.createElement("a");
    link.className = "instagram-post";
    link.href = post.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open Instagram post ${index + 1} in a new tab`);

    const img = document.createElement("img");
    img.src = post.image;
    img.alt = post.caption ? post.caption.slice(0, 120) : "Tattoo by TATTMEPAPI on Instagram";
    img.loading = "lazy";
    img.decoding = "async";
    link.appendChild(img);

    if (ICONS[post.type]) {
      const badge = document.createElement("span");
      badge.className = `instagram-badge instagram-badge-${post.type}`;
      badge.innerHTML = ICONS[post.type];
      link.appendChild(badge);
    }

    instagramGrid.appendChild(link);
  });
}

async function loadInstagram() {
  if (!INSTAGRAM_FEED_URL || !instagramTab || !instagramGrid) return;

  try {
    const response = await fetch(INSTAGRAM_FEED_URL);
    if (!response.ok) throw new Error("Feed unavailable");

    const posts = readPosts(await response.json());
    if (posts.length === 0) return;

    renderInstagram(posts);
    instagramTab.hidden = false;

    // Open on the Instagram tab by default
    showTab("instagram", { animate: false });
    instagramGrid.querySelectorAll(".instagram-post").forEach((post, index) => {
      replayFadeIn(post, index);
    });
  } catch (error) {
    // Feed down or not set up — the normal gallery keeps working
  }
}

// Until the Instagram feed loads, open on the first tab (Fine line)
const firstTab = document.querySelector(".portfolio-tab:not([hidden])");
if (firstTab) showTab(firstTab.dataset.filter, { animate: false });

loadInstagram();

/* ---------- Lightbox (Fine line / Flash photos) ---------- */

const lightbox = document.getElementById("portfolioLightbox");
const lightboxImage = document.getElementById("portfolioLightboxImage");
const closeButton = document.getElementById("portfolioLightboxClose");

if (lightbox && lightboxImage && closeButton) {
  let lastClickedThumbnail = null;

  document.querySelectorAll(".portfolio-open").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      if (!image) return;

      lastClickedThumbnail = button;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;

      lightbox.showModal();
      document.body.classList.add("lightbox-open");
    });
  });

  closeButton.addEventListener("click", () => lightbox.close());

  // Click on the dark backdrop closes the photo
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lastClickedThumbnail?.focus();
  });
}
