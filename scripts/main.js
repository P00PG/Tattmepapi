// Home page: video + New Zealand notice

const tattooVideo = document.getElementById("tattooVideo");
const videoToggle = document.getElementById("videoToggle"); // optional button

// Respect visitors who have asked their device to reduce motion
if (tattooVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tattooVideo.removeAttribute("autoplay");
  tattooVideo.pause();
}

// Only wire up the play/pause button if it exists in the HTML
if (tattooVideo && videoToggle) {
  const updateVideoButton = () => {
    const isPaused = tattooVideo.paused;
    videoToggle.classList.toggle("is-paused", isPaused);
    videoToggle.classList.toggle("is-playing", !isPaused);
    videoToggle.setAttribute("aria-label", isPaused ? "Play tattooing video" : "Pause tattooing video");
    videoToggle.setAttribute("aria-pressed", String(!isPaused));
  };

  videoToggle.addEventListener("click", () => {
    if (tattooVideo.paused) {
      tattooVideo.play();
    } else {
      tattooVideo.pause();
    }
  });

  tattooVideo.addEventListener("play", updateVideoButton);
  tattooVideo.addEventListener("pause", updateVideoButton);
  updateVideoButton();
}

// New Zealand notice: show once per visit, and again on reload
const nzNotice = document.getElementById("nzNotice");

if (nzNotice && typeof nzNotice.showModal === "function") {
  let hasSeenNotice = false;

  try {
    hasSeenNotice = sessionStorage.getItem("nzNoticeSeen") === "true";
    sessionStorage.setItem("nzNoticeSeen", "true");
  } catch (error) {
    // Storage can be blocked (e.g. some private modes) — just show the notice
  }

  const navigation = performance.getEntriesByType?.("navigation")[0];

  if (!hasSeenNotice || navigation?.type === "reload") {
    nzNotice.showModal();
  }
}
