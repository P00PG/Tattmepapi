const revealTargets = document.querySelectorAll(
  [
    ".about-grid",
    ".portfolio-tabs",
    ".portfolio-card",
    ".aftercare-container",
    ".booking-hero-layout",
    ".booking-process-layout",
    ".booking-pricing-layout",
    ".booking-deposit-layout",
    ".booking-policy-layout",
    ".booking-consent-layout",
    ".booking-payment-layout",
    ".booking-contact-layout"
  ].join(", ")
);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealTargets.forEach((element) => {
    element.classList.add("reveal-on-scroll");
    observer.observe(element);
  });
}