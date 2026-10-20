import Link from "next/link";
import { ArrowRight, Check, Home, PackageCheck, PhoneCall } from "lucide-react";
import { formatNpr } from "@/lib/product";

export const metadata = { title: "Thank You | Nyanoshop", robots: { index: false, follow: false } };

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ orderId?: string; product?: string; quantity?: string; total?: string }> }) {
  const params = await searchParams;
  const quantity = Math.max(1, Number.parseInt(params.quantity || "1", 10) || 1);
  const total = Number.parseInt(params.total || "0", 10) || 0;
  const productName = params.product || "Beurer HK Comfort Heating Pad";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5ede7] px-4 py-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.3rem] border border-[#e2d4cc] bg-white text-center soft-shadow">
        <div className="relative bg-[#8f1d2c] px-6 py-12 text-white"><div className="mx-auto grid size-20 place-items-center rounded-full border-4 border-white/30 bg-white text-[#367044]"><PackageCheck size={40} /></div><p className="mt-6 text-xs font-black uppercase tracking-[.17em] text-[#ffc8b5]">Order received</p><h1 className="display-font mt-3 text-4xl sm:text-5xl">Thank you for your order!</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#f1d6d2]">Your order has been submitted successfully. A confirmation email is on its way.</p></div>
        <div className="p-6 sm:p-9">
          {params.orderId && <div className="mb-5 rounded-xl bg-[#f6f0ec] px-4 py-3 text-sm"><span className="text-[#7c6e67]">Order ID</span><strong className="ml-2">{params.orderId}</strong></div>}
          <div className="rounded-2xl border border-[#e7dcd5] text-left">
            <div className="flex justify-between gap-5 border-b border-[#e7dcd5] px-5 py-4 text-sm"><span className="text-[#786b64]">Product ordered</span><strong className="text-right">{productName}</strong></div>
            <div className="flex justify-between gap-5 border-b border-[#e7dcd5] px-5 py-4 text-sm"><span className="text-[#786b64]">Quantity</span><strong>{quantity}</strong></div>
            <div className="flex justify-between gap-5 border-b border-[#e7dcd5] px-5 py-4 text-sm"><span className="text-[#786b64]">Total price</span><strong className="text-[#8f1d2c]">{total ? formatNpr(total) : "Shown in your email"}</strong></div>
            <div className="flex justify-between gap-5 px-5 py-4 text-sm"><span className="text-[#786b64]">Payment method</span><strong>Cash On Delivery</strong></div>
          </div>
          <div className="mt-6 flex gap-3 rounded-2xl bg-[#eef6ef] p-5 text-left text-sm leading-6 text-[#315a3a]"><PhoneCall className="mt-0.5 shrink-0" size={20} /><span><strong>What happens next?</strong><br />Our sales representative will call you soon to confirm your order.</span></div>
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs font-semibold text-[#756860]"><span className="flex items-center gap-1.5"><Check size={14} /> Email sent</span><span className="flex items-center gap-1.5"><Check size={14} /> Order recorded</span><span className="flex items-center gap-1.5"><Check size={14} /> Awaiting confirmation</span></div>
          <Link href="/" className="focus-ring mt-7 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#211916] px-7 font-bold text-white transition hover:bg-[#8f1d2c]"><Home size={17} /> Back to Home <ArrowRight size={16} /></Link>
        </div>
      </div>
    </main>
  );
}
