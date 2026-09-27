// Booking page: copy buttons + masked bank account number

// Copies text to the clipboard, with a fallback for older browsers
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "");
    temp.style.position = "absolute";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

// Briefly shows "Copied!" on a button, then restores its label
function showCopied(button) {
  const label = button.dataset.label || button.textContent.trim();
  button.dataset.label = label;
  button.textContent = "Copied!";

  clearTimeout(button.copyTimer);
  button.copyTimer = setTimeout(() => {
    button.textContent = label;
  }, 2000);
}

/* ---------- Booking enquiry template ---------- */

const templateCopy = document.getElementById("templateCopy");
const templateStatus = document.getElementById("templateCopyStatus");
const templateContent = document.querySelector(".booking-template-content");

if (templateCopy && templateContent) {
  templateCopy.addEventListener("click", async () => {
    // Build the text from the page, so edits to the template stay in sync.
    // Only the labels are copied (not the grey hint text), ready to fill in.
    const lines = [...templateContent.querySelectorAll("p")].map((line) => {
      const copy = line.cloneNode(true);
      copy.querySelectorAll("em").forEach((hint) => hint.remove());
      return copy.textContent.replace(/\s+/g, " ").trim() + " ";
    });

    await copyText(lines.join("\n").trimEnd());

    // Swap the copy icon for a tick for 2 seconds
    templateCopy.classList.add("is-copied");
    templateCopy.title = "Copied!";
    if (templateStatus) templateStatus.textContent = "Template copied";

    clearTimeout(templateCopy.copyTimer);
    templateCopy.copyTimer = setTimeout(() => {
      templateCopy.classList.remove("is-copied");
      templateCopy.title = "Copy template";
      if (templateStatus) templateStatus.textContent = "";
    }, 2000);
  });
}

/* ---------- Masked bank account number ---------- */
// The full number is stored encoded (not as plain text in the HTML),
// so it isn't picked up by casual copying, screenshots or simple scrapers.

const accountNumber = document.getElementById("accountNumber");
const accountToggle = document.getElementById("accountToggle");
const accountCopy = document.getElementById("accountCopy");

if (accountNumber && accountToggle && accountCopy) {
  const fullNumber = atob(accountNumber.dataset.account);
  const maskedNumber = "•".repeat(fullNumber.length - 4) + fullNumber.slice(-4);
  let isShown = false;

  accountNumber.textContent = maskedNumber;

  accountToggle.addEventListener("click", () => {
    isShown = !isShown;
    accountNumber.textContent = isShown ? fullNumber : maskedNumber;
    accountToggle.textContent = isShown ? "Hide number" : "Show number";
    accountToggle.setAttribute("aria-expanded", String(isShown));
  });

  accountCopy.addEventListener("click", async () => {
    await copyText(fullNumber);
    showCopied(accountCopy);
  });
}
