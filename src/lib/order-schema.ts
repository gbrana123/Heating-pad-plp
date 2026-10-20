import { z } from "zod";

export const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+977[- ]?)?(?:9[678]\d{8}|0?1\d{7})$/, "Please enter a valid Nepali phone number"),
  email: z.string().trim().email("Please enter a valid email address").max(160),
  location: z.string().trim().min(5, "Please share your exact location").max(300),
  deliveryArea: z.enum(["kathmandu", "outside"]),
  productName: z.string().trim().min(1, "Product name is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10),
  pricePerPiece: z.coerce.number().positive("Price per piece must be valid"),
  totalPrice: z.coerce.number().positive("Total price must be valid"),
  idempotencyKey: z.string().uuid("Invalid order request").optional(),
  website: z.string().max(0, "Invalid submission").optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export type SavedOrder = OrderInput & {
  orderId: string;
  dateTime: string;
  sheetDateTime: string;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  deliveryFee: number;
  notes: string;
};
