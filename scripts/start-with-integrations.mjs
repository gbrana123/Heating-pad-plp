import { once } from "node:events";
import { spawn } from "node:child_process";
import readline from "node:readline";

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

console.log("Ready for runtime config JSON on stdin.");
if (process.stdin.isTTY) process.stdin.setRawMode(true);
const input = readline.createInterface({ input: process.stdin, terminal: false });
const [line] = await once(input, "line");
input.close();
if (process.stdin.isTTY) process.stdin.setRawMode(false);

const config = JSON.parse(line);
const childEnvironment = { ...process.env, MOCK_ORDER_SUBMISSION: "false" };
for (const key of runtimeKeys) {
  const value = config[key];
  if (typeof value === "string" && value.trim()) childEnvironment[key] = value;
}

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start"], {
  cwd: process.cwd(),
  env: childEnvironment,
  stdio: ["ignore", "inherit", "inherit"],
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
