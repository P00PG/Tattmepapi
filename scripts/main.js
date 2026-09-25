const tattooVideo = document.getElementById("tattooVideo");
const videoToggle = document.getElementById("videoToggle");

function updateVideoButton() {
  const isPaused = tattooVideo.paused;

  videoToggle.classList.toggle("is-paused", isPaused);
  videoToggle.classList.toggle("is-playing", !isPaused);

  videoToggle.setAttribute(
    "aria-label",
    isPaused ? "Play tattooing video" : "Pause tattooing video"
  );

  videoToggle.setAttribute(
    "aria-pressed",
    String(!isPaused)
  );
}

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