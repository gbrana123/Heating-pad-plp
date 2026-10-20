import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beurer HK Comfort Heating Pad | Nyanoshop",
  description: "Order the Beurer HK Comfort Heating Pad in Nepal with Cash on Delivery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Beurer HK Comfort Heating Pad | Nyanoshop",
    description: "Soft, adjustable and reassuring warmth—delivered across Nepal.",
    images: ["/images/hk-comfort-hero.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
