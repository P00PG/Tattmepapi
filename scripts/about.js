// About page: portfolio filters + lightbox

const filterButtons = document.querySelectorAll(".portfolio-tab");
const cards = document.querySelectorAll(".portfolio-card");
const emptyMessage = document.getElementById("portfolioEmptyMessage");

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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("active")) return; // already on this tab

    const filter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    cards.forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !visible);

      if (visible) {
        replayFadeIn(card, visibleCount);
        visibleCount++;
      }
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  });
});

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
