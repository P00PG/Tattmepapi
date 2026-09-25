const filterButtons = document.querySelectorAll(".portfolio-tab");
const cards = document.querySelectorAll(".portfolio-card");
const emptyMessage = document.getElementById("portfolioEmptyMessage");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const selected = item === button;

      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    cards.forEach((card) => {
      const visible =
        filter === "all" || card.dataset.category === filter;

      card.classList.toggle("is-hidden", !visible);

      if (visible) {
        visibleCount++;
      }
    });

    emptyMessage.hidden = visibleCount > 0;
  });
});

const lightbox = document.getElementById("portfolioLightbox");
const lightboxImage = document.getElementById("portfolioLightboxImage");
const closeButton = document.getElementById("portfolioLightboxClose");

let lastClickedThumbnail = null;

document.querySelectorAll(".portfolio-open").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");

    lastClickedThumbnail = button;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;

    lightbox.showModal();
    document.body.classList.add("lightbox-open");
  });
});

closeButton.addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

lightbox.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";

  lastClickedThumbnail?.focus();
});