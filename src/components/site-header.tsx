import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <>
      <div className="bg-[#211916] px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        Cash on Delivery across Nepal&nbsp; · &nbsp;Fast order confirmation
      </div>
      <header className="border-b border-[#eadfd8] bg-[#fbf8f5]/95 backdrop-blur">
        <div className="page-shell flex h-18 items-center justify-between">
          <Link href="/" className="focus-ring flex shrink-0 items-center rounded-lg" aria-label="Nyanoshop home">
            <span className="relative block h-10 w-40 overflow-hidden sm:h-12 sm:w-56">
              <Image
                src="/images/nyanoshop-home-logo.png"
                alt="Nyanoshop"
                width={2172}
                height={724}
                preload
                className="absolute left-1/2 top-1/2 h-auto w-full -translate-x-1/2 -translate-y-1/2 scale-[1.08]"
              />
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#5f524c] md:flex" aria-label="Main navigation">
            <Link href="/#details" className="hover:text-[#8f1d2c]">Product</Link>
            <Link href="/#benefits" className="hover:text-[#8f1d2c]">Benefits</Link>
            <Link href="/#faq" className="hover:text-[#8f1d2c]">FAQs</Link>
          </nav>
          <Link href="/checkout?quantity=1&area=kathmandu" className="focus-ring flex items-center gap-2 rounded-full bg-[#8f1d2c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#68131f]">
            <ShoppingBag size={16} /> Order now
          </Link>
        </div>
      </header>
    </>
  );
}
