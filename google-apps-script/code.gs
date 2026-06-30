/**
 * Dantewada District Plantation Monitoring System (DDPMS)
 * Google Apps Script Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any code in Code.gs and paste this code.
 * 4. Click Save.
 * 5. Click Deploy > New Deployment.
 * 6. Select Type: Web App.
 * 7. Set "Execute as" to "Me", and "Who has access" to "Anyone".
 * 8. Click Deploy, authorize permissions, and copy the Web App URL ending in /exec.
 * 9. Paste this Web App URL in the Settings page of the DDPMS frontend application.
 */

const VALID_PAGES = {
  dashboard: "Index",
  index: "Index",
  home: "Index"
};

// Headers for nursery distribution sheets
const HEADERS = [
  "क्रमांक", 
  "वितरण दिनांक", 
  "लाभार्थी का नाम", 
  "मोबाइल नंबर", 
  "जनपद पंचायत", 
  "ग्राम पंचायत", 
  "ग्राम का नाम", 
  "पौधों की संख्या", 
  "पौधों का प्रकार", 
  "प्राप्तकर्ता श्रेणी", 
  "वितरणकर्ता का नाम"
];

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};

  if (isApiRequest(params)) {
    return getDatabaseResponse();
  }

  return renderPage(params.page || "dashboard");
}

/**
 * Render the web-app shell for browser requests.
 */
function renderPage(pageName) {
  const normalizedPage = String(pageName || "dashboard").toLowerCase();
  const templateName = VALID_PAGES[normalizedPage];

  if (!templateName) {
    return HtmlService.createHtmlOutput("Route not found: " + normalizedPage)
      .setTitle("DDPMS")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return HtmlService.createTemplateFromFile(templateName)
    .evaluate()
    .setTitle("DDPMS Dashboard")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * The Next frontend calls the web app as a JSON API using ?api=data.
 * Older deployed frontends also added only ?t=timestamp, so keep that path working.
 */
function isApiRequest(params) {
  return params.api === "data" || params.format === "json" || params.t !== undefined;
}

/**
 * Fetches all master data and distribution records.
 */
function getDatabaseResponse() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = {
      nurseryMaster: getSheetData(ss, "Nursery_Master"),
      plantTypes: getSheetData(ss, "Plant_Types"),
      janpadMaster: getSheetData(ss, "Janpad_Master"),
      gramPanchayatMaster: getSheetData(ss, "GramPanchayat_Master"),
      villageMaster: getSheetData(ss, "Village_Master"),
      beneficiaryCategory: getSheetData(ss, "Beneficiary_Category"),
      distributions: {}
    };

    // Get distribution data for each nursery dynamically from Nursery_Master
    const nurseryMaster = result.nurseryMaster || [];
    nurseryMaster.forEach(function(nursery) {
      const nurseryName = nursery.name || nursery.Name || nursery["नाम"];
      if (nurseryName) {
        result.distributions[nurseryName] = getSheetData(ss, nurseryName) || [];
      }
    });

    return corsResponse(result);
  } catch (error) {
    return corsResponse({ status: "error", message: error.toString() }, 500);
  }
}

/**
 * Handle POST requests - Adds a new distribution entry.
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "addDistribution") {
      const data = postData.data;
      if (!data.nursery) {
        throw new Error("Nursery name is required.");
      }

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(data.nursery);

      // Auto-create the nursery sheet if it doesn't exist
      if (!sheet) {
        sheet = ss.insertSheet(data.nursery);
        sheet.appendRow(HEADERS);
        // Format header row
        const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#1B5E20");
        headerRange.setFontColor("#FFFFFF");
      }

      const lastRow = sheet.getLastRow();
      let nextSNo = 1;

      // Calculate next serial number (S.No.)
      if (lastRow > 1) {
        const lastSNo = sheet.getRange(lastRow, 1).getValue();
        nextSNo = Number(lastSNo) ? Number(lastSNo) + 1 : lastRow;
      }

      const newRow = [
        nextSNo,
        data.date || new Date().toISOString().split('T')[0],
        data.beneficiaryName || "",
        data.mobileNumber || "",
        data.janpad || "",
        data.gramPanchayat || "",
        data.village || "",
        Number(data.quantity) || 0,
        data.plantType || "",
        data.category || "",
        data.distributorName || ""
      ];

      sheet.appendRow(newRow);

      return corsResponse({
        status: "success",
        message: "Record added successfully to " + data.nursery,
        sNo: nextSNo
      });
    }

    return corsResponse({ status: "error", message: "Invalid action: " + action }, 400);
  } catch (error) {
    return corsResponse({ status: "error", message: error.toString() }, 500);
  }
}

/**
 * Helper to fetch sheet data as an array of JSON objects.
 */
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 1 || lastColumn < 1) return [];

  const data = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(function(row) {
    const obj = {};
    headers.forEach(function(header, index) {
      if (header !== "") {
        // Convert column headers to camelCase keys for easier frontend integration
        const key = toCamelCase(header);
        obj[key] = row[index];
      }
    });
    return obj;
  });
}

/**
 * Helper to convert sheet header strings to camelCase properties.
 */
function toCamelCase(str) {
  // If string contains non-latin characters (like Hindi), keep it as is or clean spacing
  if (/[\u0900-\u097F]/.test(str)) {
    return str.trim();
  }
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Returns a JSON response with CORS headers.
 */
function corsResponse(data, statusCode) {
  const JSONString = JSON.stringify(data);
  return ContentService.createTextOutput(JSONString)
    .setMimeType(ContentService.MimeType.JSON);
}
