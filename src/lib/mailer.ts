import nodemailer from "nodemailer";
import { businessOrderEmail, customerOrderEmail } from "@/lib/email-templates";
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

export async function sendOrderEmails(order: SavedOrder) {
  const brand = process.env.BRAND_NAME?.trim() || "Nyanoshop";
  const businessEmail = required("BUSINESS_EMAIL");
  const fromAddress = required("EMAIL_FROM");
  const replyTo = process.env.SMTP_USER?.trim() || businessEmail;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${brand}" <${fromAddress}>`,
    replyTo: order.email,
    to: businessEmail,
    subject: `New Product Order Received - ${order.orderId}`,
    html: businessOrderEmail(order, brand),
  });

  await transporter.sendMail({
    from: `"${brand}" <${fromAddress}>`,
    replyTo,
    to: order.email,
    subject: `Your Order Has Been Received - ${brand}`,
    html: customerOrderEmail(order, brand, replyTo),
  });
}
