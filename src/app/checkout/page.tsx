import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Headphones, ShieldCheck, Truck } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { type DeliveryArea, product } from "@/lib/product";

export const metadata = { title: "Checkout | Nyanoshop", description: "Complete your Cash on Delivery order." };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ quantity?: string; area?: string }> }) {
  const params = await searchParams;
  const quantity = Math.max(1, Math.min(10, Number.parseInt(params.quantity || "1", 10) || 1));
  const area: DeliveryArea = params.area === "outside" ? "outside" : "kathmandu";

  return (
    <main className="min-h-screen bg-[#f5ede7]">
      <div className="page-shell flex h-18 items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-lg text-sm font-bold text-[#594b45]"><ArrowLeft size={17} /> Back to product</Link>
        <span className="relative block h-10 w-40 shrink-0 overflow-hidden sm:h-12 sm:w-52">
          <Image
            src="/images/nyanoshop-checkout-logo.png"
            alt="Nyanoshop"
            width={2172}
            height={724}
            preload
            className="absolute left-1/2 top-1/2 h-auto w-full -translate-x-1/2 -translate-y-1/2 scale-[1.08]"
          />
        </span>
      </div>
      <div className="page-shell grid items-start gap-10 pb-16 pt-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:pb-24 lg:pt-12">
        <aside className="lg:sticky lg:top-8">
          <p className="text-xs font-black uppercase tracking-[.15em] text-[#8f1d2c]">Cash on Delivery checkout</p>
          <h2 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">One last step to soothing warmth.</h2>
          <p className="mt-4 max-w-lg leading-7 text-[#6d6059]">Review your order, add your delivery details, and we’ll call you soon to confirm everything.</p>
          <div className="mt-8 flex items-center gap-5 rounded-[1.7rem] border border-[#e0d2ca] bg-white p-4 card-shadow">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-[#f8f4f1]"><Image src="/images/hk-comfort-flat.png" alt="Beurer HK Comfort heating pad" fill className="object-contain p-2" sizes="112px" /></div>
            <div><span className="rounded-full bg-[#f7e7e9] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#8f1d2c]">Beurer</span><h3 className="mt-3 font-extrabold">{product.shortName}</h3><p className="mt-1 text-xs leading-5 text-[#776a63]">Soft, adjustable warmth with automatic switch-off.</p></div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[{ icon: ShieldCheck, label: "Secure form" }, { icon: Truck, label: "Nepal delivery" }, { icon: Headphones, label: "Call support" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-2 rounded-xl border border-[#e0d2ca] bg-white/50 p-3 text-xs font-bold"><Icon size={16} className="text-[#397248]" />{label}</div>)}
          </div>
          <div className="mt-7 flex gap-3 rounded-2xl bg-[#e9f2e9] p-4 text-sm leading-6 text-[#31553a]"><CheckCircle2 className="mt-0.5 shrink-0" size={19} /><span><strong>No advance payment.</strong> Pay in cash when your order arrives.</span></div>
        </aside>
        <CheckoutForm initialQuantity={quantity} initialArea={area} />
      </div>
    </main>
  );
}
