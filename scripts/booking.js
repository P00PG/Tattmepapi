// Booking page: embedded Jotform booking form

const bookingFrame = document.getElementById("JotFormIFrame-262707547029058");

if (bookingFrame) {
  // Jotform's helper resizes the form to fit its content, so it never
  // needs its own scrollbar
  if (typeof window.jotformEmbedHandler === "function") {
    window.jotformEmbedHandler(
      "iframe[id='JotFormIFrame-262707547029058']",
      "https://form.jotform.com/"
    );
  } else {
    // Helper didn't load — let the form scroll inside its box instead
    bookingFrame.setAttribute("scrolling", "yes");
  }

  // After sending, bring the "Thank you" message into view
  let loads = 0;
  bookingFrame.addEventListener("load", () => {
    loads += 1;
    if (loads > 1) {
      bookingFrame.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
