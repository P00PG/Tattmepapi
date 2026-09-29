/**
 * TATTMEPAPI — booking form → Google Sheet
 *
 * Paste this into the Google Sheet's Extensions → Apps Script editor,
 * then deploy it as a Web app (see the setup steps).
 * Each booking enquiry is added as a new row on the "Bookings" tab.
 */

// Optional: put her email here to get an email for every new enquiry.
// Leave as "" for no emails.
const NOTIFY_EMAIL = "";

const SHEET_NAME = "Bookings";

// [Column heading, form field name]
const COLUMNS = [
  ["Submitted", "_timestamp"],
  ["Status", "_status"],
  ["Name", "name"],
  ["Contact number", "phone"],
  ["Email", "email"],
  ["Preferred contact", "contact_method"],
  ["Instagram", "instagram"],
  ["Tattoo type", "type"],
  ["Availability", "availability"],
  ["Budget", "budget"],
  ["Placement", "placement"],
  ["Size (cm)", "size"],
  ["Design details", "design"],
  ["Additional comments", "comments"],
  ["Read policies", "policies"]
];

function doPost(e) {
  const params = (e && e.parameter) || {};

  // Spam trap: real visitors never fill in the hidden "website" field
  if (params.website) {
    return reply({ result: "success" });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // stops two enquiries at once from clashing

  try {
    const sheet = getBookingSheet();

    const row = COLUMNS.map(([, key]) => {
      if (key === "_timestamp") return new Date();
      if (key === "_status") return "New";
      if (key === "policies") return params.policies ? "Yes" : "No";
      return clean(params[key]);
    });

    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        "New booking enquiry: " + (params.name || "Unknown"),
        params.message || row.join("\n")
      );
    }

    return reply({ result: "success" });
  } catch (error) {
    return reply({ result: "error", error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

// Creates the "Bookings" tab with bold, frozen headings the first time
function getBookingSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([heading]) => heading));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// Tidies each answer, and stops text starting with = + - @ being read as a formula
function clean(value) {
  let text = String(value || "").trim().slice(0, 5000);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function reply(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
