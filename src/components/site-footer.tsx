import Link from "next/link";
import { Flame, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#211916] text-white">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.3fr_.7fr_.8fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#8f1d2c]"><Flame size={18} fill="currentColor" /></span>
            <span className="text-xl font-extrabold tracking-[-0.04em]">nyano<span className="text-[#ff9070]">shop</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#c8bbb5]">Thoughtful comfort essentials, delivered to your doorstep with a simple Cash on Delivery ordering experience.</p>
        </div>
        <div>
          <h3 className="font-bold">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#c8bbb5]">
            <Link href="/#details" className="hover:text-white">Product details</Link>
            <Link href="/#benefits" className="hover:text-white">Why choose it</Link>
            <Link href="/#faq" className="hover:text-white">Questions</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Need help?</h3>
          <div className="mt-4 space-y-3 text-sm text-[#c8bbb5]">
            <p className="flex items-center gap-2"><Mail size={15} /> ranagb275@gmail.com</p>
            <p className="flex items-center gap-2"><Phone size={15} /> We call after every order</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> Delivery across Nepal</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-[#9f918a]">© {new Date().getFullYear()} Nyanoshop. All rights reserved.</div>
    </footer>
  );
}
