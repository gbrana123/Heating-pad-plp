import nodemailer from "nodemailer";
import type { Options as MailOptions } from "nodemailer/lib/mailer";
import { businessOrderEmail, businessOrderText, customerOrderEmail, customerOrderText } from "@/lib/email-templates";
import type { SavedOrder } from "@/lib/order-schema";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function createTransporter() {
  const port = Number(required("SMTP_PORT"));
  if (!Number.isInteger(port) || port <= 0) throw new Error("SMTP_PORT must be a valid port number");

  return nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASS"),
    },
  });
}

type DeliveryError = Error & { code?: string; responseCode?: number };

function normalizedAddress(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isTemporaryFailure(error: unknown) {
  const deliveryError = error as DeliveryError;
  return Boolean(
    (deliveryError.responseCode && deliveryError.responseCode >= 400 && deliveryError.responseCode < 500)
      || ["ECONNECTION", "ECONNRESET", "ETIMEDOUT", "ESOCKET"].includes(deliveryError.code ?? ""),
  );
}

async function sendAcceptedMail(
  transporter: ReturnType<typeof createTransporter>,
  message: MailOptions,
  recipient: string,
  kind: "business" | "customer",
  orderId: string,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const info = await transporter.sendMail(message);
      const expected = normalizedAddress(recipient);
      const accepted = Array.isArray(info.accepted) ? info.accepted.map(normalizedAddress) : [];
      if (!accepted.includes(expected)) {
        throw Object.assign(new Error(`SMTP did not accept the ${kind} recipient`), { code: "ERECIPIENT" });
      }

      console.info("Order email accepted by SMTP", {
        orderId,
        kind,
        attempt,
        messageId: info.messageId,
        acceptedRecipients: accepted.length,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 2 || !isTemporaryFailure(error)) break;
      await new Promise((resolve) => setTimeout(resolve, 750));
    }
  }

  throw lastError;
}

export async function sendOrderEmails(order: SavedOrder) {
  const brand = process.env.BRAND_NAME?.trim() || "Nyanoshop";
  const businessEmail = required("BUSINESS_EMAIL");
  const fromAddress = required("EMAIL_FROM");
  const replyTo = process.env.SMTP_USER?.trim() || businessEmail;
  const transporter = createTransporter();

  await sendAcceptedMail(transporter, {
    from: `"${brand}" <${fromAddress}>`,
    replyTo,
    to: order.email,
    envelope: { from: fromAddress, to: order.email },
    subject: `Your Order Has Been Received - ${brand}`,
    text: customerOrderText(order, brand, replyTo),
    html: customerOrderEmail(order, brand, replyTo),
    headers: { "X-Entity-Ref-ID": order.orderId },
  }, order.email, "customer", order.orderId);

  await sendAcceptedMail(transporter, {
    from: `"${brand}" <${fromAddress}>`,
    replyTo: order.email,
    to: businessEmail,
    envelope: { from: fromAddress, to: businessEmail },
    subject: `New Product Order Received - ${order.orderId}`,
    text: businessOrderText(order, brand),
    html: businessOrderEmail(order, brand),
    headers: { "X-Entity-Ref-ID": order.orderId },
  }, businessEmail, "business", order.orderId);
}
