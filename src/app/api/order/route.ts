import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { appendOrderToSheet } from "@/lib/google-sheets";
import { sendOrderEmails } from "@/lib/mailer";
import { orderSchema, type SavedOrder } from "@/lib/order-schema";
import { calculateOrderTotal, getDeliveryFee, product } from "@/lib/product";

export const runtime = "nodejs";

function allowedOrigin(request: NextRequest) {
  const expected = process.env.FRONTEND_URL?.replace(/\/$/, "");
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  if (!expected || !origin) return true;
  return origin === expected;
}

function createOrderId(idempotencyKey: string, now: Date) {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).replaceAll("-", "");
  const suffix = createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 8).toUpperCase();
  return `NYN-${date}-${suffix}`;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", dateStyle: "medium", timeStyle: "short", hour12: true }).format(date);
}

function formatSheetDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")} ${value("hour")}:${value("minute")}:${value("second")}`;
}

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request)) return NextResponse.json({ error: "This request origin is not allowed." }, { status: 403 });

  try {
    const payload = orderSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });

    const requestKey = payload.idempotencyKey || request.headers.get("idempotency-key");
    if (!requestKey || !/^[0-9a-f-]{36}$/i.test(requestKey)) return NextResponse.json({ error: "Please refresh the page and try again." }, { status: 400 });

    const expectedTotal = calculateOrderTotal(payload.quantity, payload.deliveryArea);
    if (payload.productName !== product.name || payload.pricePerPiece !== product.offerPrice || payload.totalPrice !== expectedTotal) {
      return NextResponse.json({ error: "The order price changed. Please refresh and review your order." }, { status: 400 });
    }

    const now = new Date();
    const order: SavedOrder = {
      ...payload,
      orderId: createOrderId(requestKey, now),
      dateTime: formatDateTime(now),
      sheetDateTime: formatSheetDateTime(now),
      deliveryFee: getDeliveryFee(payload.deliveryArea),
      paymentMethod: "Cash On Delivery",
      orderStatus: "New Order",
      notes: "",
    };

    const mockMode = process.env.NODE_ENV !== "production" && process.env.MOCK_ORDER_SUBMISSION === "true";
    if (!mockMode) {
      await appendOrderToSheet(order);
      try {
        await sendOrderEmails(order);
      } catch (error) {
        console.error("Order saved, but email delivery failed", { orderId: order.orderId, error });
        return NextResponse.json({ error: `Order ${order.orderId} was saved, but email delivery failed. Please contact us before trying again.`, orderId: order.orderId }, { status: 502 });
      }
    } else {
      console.info("Development mock order accepted", { orderId: order.orderId });
    }

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Please check the order details.", fields: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("Order submission failed", error);
    const message = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "We could not submit your order. Please try again or contact us.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
