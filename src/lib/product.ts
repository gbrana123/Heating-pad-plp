export const product = {
  brand: "Beurer",
  storeName: "Nyanoshop",
  name: "Beurer HK Comfort Heating Pad",
  shortName: "HK Comfort Heating Pad",
  tagline: "German-engineered warmth, right where you need it.",
  description:
    "Enjoy soothing warmth with the Beurer HK Comfort. Its soft, breathable fabric, fast heating, and three adjustable temperature settings provide comfortable, targeted warmth for your back, abdomen, and legs.",
  regularPrice: 8000,
  discountAmount: 500,
  offerPrice: 7500,
  currency: "NPR",
  deliveryFees: {
    kathmandu: 100,
    outside: 150,
  },
  images: [
    {
      src: "/images/hk-comfort-hero.png",
      alt: "Beurer HK Comfort heating pad with retail box",
    },
    {
      src: "/images/hk-comfort-flat.png",
      alt: "Beurer HK Comfort heating pad laid flat",
    },
    {
      src: "/images/hk-comfort-product.png",
      alt: "Close view of the Beurer HK Comfort heating pad",
    },
    {
      src: "/images/hk-comfort-detail.png",
      alt: "Soft fleece texture and controller of the heating pad",
    },
  ],
  benefits: [
    "Helps relax tired muscles and ease everyday tension",
    "Provides cosy, targeted warmth on cold days",
    "Three heat settings for personal comfort",
    "Overheating protection and 90-minute auto switch-off",
    "Machine washable at 30°C after removing the controller",
  ],
} as const;

export type DeliveryArea = "kathmandu" | "outside";

export function getDeliveryFee(area: DeliveryArea) {
  return product.deliveryFees[area];
}

export function calculateOrderTotal(quantity: number, area: DeliveryArea) {
  return product.offerPrice * quantity + getDeliveryFee(area);
}

export function formatNpr(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-NP").format(value)}`;
}
