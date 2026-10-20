import { once } from "node:events";
import readline from "node:readline";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const runtimeKeys = [
  "GOOGLE_SHEET_ID",
  "GOOGLE_SHEET_TAB_NAME",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "BUSINESS_EMAIL",
  "EMAIL_FROM",
  "BRAND_NAME",
  "FRONTEND_URL",
];

console.log("Ready for integration config JSON on stdin.");
if (process.stdin.isTTY) process.stdin.setRawMode(true);
const input = readline.createInterface({ input: process.stdin, terminal: false });
const [line] = await once(input, "line");
input.close();
if (process.stdin.isTTY) process.stdin.setRawMode(false);

const config = JSON.parse(line);
for (const key of runtimeKeys) {
  const value = config[key];
  if (typeof value === "string" && value.trim()) process.env[key] = value;
}

const { configureOrderSheet, SHEET_HEADERS } = await import("../src/lib/google-sheets.ts");
const sheet = await configureOrderSheet();

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
const verification = await sheets.spreadsheets.get({
  spreadsheetId: sheet.spreadsheetId,
  includeGridData: true,
  ranges: [`'${sheet.tabName.replace(/'/g, "''")}'!A1:O2`],
  fields: "sheets(properties(sheetId,title,gridProperties(frozenRowCount,hideGridlines)),data(rowData(values(userEnteredValue,userEnteredFormat,dataValidation)),columnMetadata(pixelSize)),conditionalFormats)",
});
const verifiedSheet = verification.data.sheets?.find((item) => item.properties?.sheetId === sheet.sheetId);
const verifiedHeaders = verifiedSheet?.data?.[0]?.rowData?.[0]?.values?.map((cell) => cell.userEnteredValue?.stringValue ?? "") ?? [];

const smtpPort = Number(process.env.SMTP_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
await transporter.verify();

console.log(JSON.stringify({
  sheet: {
    url: `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit#gid=${sheet.sheetId}`,
    tabName: sheet.tabName,
    headersVerified: verifiedHeaders.join("|") === SHEET_HEADERS.join("|"),
    frozenRows: verifiedSheet?.properties?.gridProperties?.frozenRowCount ?? 0,
    gridlinesHidden: verifiedSheet?.properties?.gridProperties?.hideGridlines ?? false,
    formattedColumns: verifiedSheet?.data?.[0]?.columnMetadata?.filter((column) => Boolean(column.pixelSize)).length ?? 0,
    statusRules: verifiedSheet?.conditionalFormats?.length ?? 0,
  },
  smtp: { authenticated: true, host: process.env.SMTP_HOST, port: smtpPort },
}));
