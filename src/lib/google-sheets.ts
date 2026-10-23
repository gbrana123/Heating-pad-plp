import { google, sheets_v4 } from "googleapis";
import type { SavedOrder } from "@/lib/order-schema";

export const SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
  "Delivery Area",
  "Delivery Fee",
] as const;

const MIN_FORMATTED_ROWS = 2000;
const COLUMN_WIDTHS = [155, 155, 170, 125, 210, 270, 230, 80, 125, 125, 145, 145, 220, 185, 115] as const;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function escapeSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

async function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    key: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function statusRule(
  sheetId: number,
  rowCount: number,
  status: string,
  background: sheets_v4.Schema$Color,
  foreground: sheets_v4.Schema$Color,
): sheets_v4.Schema$ConditionalFormatRule {
  return {
    ranges: [{ sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 11, endColumnIndex: 12 }],
    booleanRule: {
      condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=$L2="${status}"` }] },
      format: {
        backgroundColor: background,
        textFormat: { bold: true, foregroundColor: foreground },
      },
    },
  };
}

function populatedOrderRule(sheetId: number, rowCount: number): sheets_v4.Schema$ConditionalFormatRule {
  return {
    ranges: [{ sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length }],
    booleanRule: {
      condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: '=$A2<>""' }] },
      format: {
        backgroundColor: { red: 1, green: 0.97, blue: 0.95 },
        textFormat: { foregroundColor: { red: 0.18, green: 0.13, blue: 0.11 } },
      },
    },
  };
}

type SheetSetup = {
  title: string;
  sheetId: number;
  rowCount: number;
  columnCount: number;
  sheet: sheets_v4.Schema$Sheet;
};

async function ensureSheetReady(sheets: sheets_v4.Sheets, spreadsheetId: string, tabName: string): Promise<SheetSetup> {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  let sheet = metadata.data.sheets?.find((item) => item.properties?.title === tabName);

  if (!sheet) {
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: tabName,
              gridProperties: { rowCount: MIN_FORMATTED_ROWS, columnCount: SHEET_HEADERS.length, frozenRowCount: 1, hideGridlines: true },
            },
          },
        }],
      },
    });
    sheet = response.data.replies?.[0]?.addSheet;
  }

  const configuredSheet = sheet;
  if (!configuredSheet?.properties || configuredSheet.properties.sheetId === undefined || configuredSheet.properties.sheetId === null) {
    throw new Error("Unable to access the configured Google Sheet tab");
  }
  const sheetId = configuredSheet.properties.sheetId;

  const rowCount = Math.max(configuredSheet.properties?.gridProperties?.rowCount ?? 0, MIN_FORMATTED_ROWS);
  const columnCount = Math.max(configuredSheet.properties?.gridProperties?.columnCount ?? 0, SHEET_HEADERS.length);
  const title = escapeSheetName(tabName);
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${title}!A1:O1` });
  const header = existing.data.values?.[0] ?? [];

  if (header.join("|") !== SHEET_HEADERS.join("|")) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!A1:O1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
  }

  return { title, sheetId, rowCount, columnCount, sheet: configuredSheet };
}

async function formatSheet(sheets: sheets_v4.Sheets, spreadsheetId: string, setup: SheetSetup) {
  const { sheetId, rowCount, columnCount, sheet: configuredSheet } = setup;

  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 1, hideGridlines: true, rowCount, columnCount },
        },
        fields: "gridProperties(frozenRowCount,hideGridlines,rowCount,columnCount)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.56, green: 0.11, blue: 0.17 },
            textFormat: { foregroundColor: { red: 1, green: 0.98, blue: 0.96 }, bold: true, fontSize: 10 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 1, green: 1, blue: 1 },
            textFormat: { foregroundColor: { red: 0.18, green: 0.13, blue: 0.11 }, fontSize: 10 },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "CLIP",
            borders: { bottom: { style: "SOLID", color: { red: 0.91, green: 0.85, blue: 0.81 } } },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,wrapStrategy,borders.bottom)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 12, endColumnIndex: 14 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: 2 },
        cell: { userEnteredFormat: { numberFormat: { type: "DATE_TIME", pattern: "dd mmm yyyy, h:mm am/pm" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 },
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0" }, horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    },
    ...[8, 9, 14].map((columnIndex): sheets_v4.Schema$Request => ({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: columnIndex, endColumnIndex: columnIndex + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: '"Rs." #,##0' }, horizontalAlignment: "RIGHT" } },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    })),
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 11, endColumnIndex: 12 },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"].map((userEnteredValue) => ({ userEnteredValue })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length } },
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 46 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: rowCount },
        properties: { pixelSize: 40 },
        fields: "pixelSize",
      },
    },
    ...COLUMN_WIDTHS.map((pixelSize, index): sheets_v4.Schema$Request => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    })),
  ];

  const conditionalRules = [
    populatedOrderRule(sheetId, rowCount),
    statusRule(sheetId, rowCount, "New Order", { red: 1, green: 0.91, blue: 0.92 }, { red: 0.55, green: 0.09, blue: 0.14 }),
    statusRule(sheetId, rowCount, "Order Confirmed", { red: 1, green: 0.95, blue: 0.82 }, { red: 0.48, green: 0.29, blue: 0 }),
    statusRule(sheetId, rowCount, "Order Ongoing", { red: 0.88, green: 0.94, blue: 1 }, { red: 0.08, green: 0.33, blue: 0.56 }),
    statusRule(sheetId, rowCount, "Delivered", { red: 0.88, green: 0.96, blue: 0.89 }, { red: 0.12, green: 0.39, blue: 0.18 }),
    statusRule(sheetId, rowCount, "Cancelled", { red: 0.93, green: 0.93, blue: 0.93 }, { red: 0.38, green: 0.34, blue: 0.33 }),
  ];
  const existingFormulas = new Set(
    configuredSheet.conditionalFormats
      ?.map((rule) => rule.booleanRule?.condition?.values?.[0]?.userEnteredValue)
      .filter((value): value is string => Boolean(value)) ?? [],
  );

  conditionalRules.forEach((rule) => {
    const formula = rule.booleanRule?.condition?.values?.[0]?.userEnteredValue;
    if (formula && !existingFormulas.has(formula)) {
      requests.push({ addConditionalFormatRule: { rule, index: configuredSheet.conditionalFormats?.length ?? 0 } });
    }
  });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

let runtimeSetup: { key: string; promise: Promise<SheetSetup> } | undefined;

function getRuntimeSheetSetup(sheets: sheets_v4.Sheets, spreadsheetId: string, tabName: string) {
  const key = `${spreadsheetId}:${tabName}`;
  if (runtimeSetup?.key === key) return runtimeSetup.promise;

  const promise: Promise<SheetSetup> = ensureSheetReady(sheets, spreadsheetId, tabName).catch((error) => {
    if (runtimeSetup?.promise === promise) runtimeSetup = undefined;
    throw error;
  });
  runtimeSetup = { key, promise };
  return promise;
}

export async function configureOrderSheet() {
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = required("GOOGLE_SHEET_TAB_NAME");
  const sheets = await getSheetsClient();
  const setup = await ensureSheetReady(sheets, spreadsheetId, tabName);
  await formatSheet(sheets, spreadsheetId, setup);
  return { spreadsheetId, tabName, sheetId: setup.sheetId, rowCount: setup.rowCount, columnCount: setup.columnCount };
}

export async function appendOrderToSheet(order: SavedOrder) {
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = required("GOOGLE_SHEET_TAB_NAME");
  const sheets = await getSheetsClient();
  const { title } = await getRuntimeSheetSetup(sheets, spreadsheetId, tabName);

  const existingOrder = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!A2:A`,
  });
  if (existingOrder.data.values?.some((row) => row[0] === order.orderId)) return;

  const deliveryArea = order.deliveryArea === "kathmandu" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley";
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${title}!A:O`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        order.orderId,
        order.sheetDateTime,
        order.fullName,
        order.phone,
        order.email,
        order.location,
        order.productName,
        order.quantity,
        order.pricePerPiece,
        order.totalPrice,
        order.paymentMethod,
        order.orderStatus,
        order.notes,
        deliveryArea,
        order.deliveryFee,
      ]],
    },
  });
}
