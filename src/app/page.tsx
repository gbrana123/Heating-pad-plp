import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Clock3, Droplets, Flame, HeartHandshake, ShieldCheck, Sparkles, ThermometerSun, Truck } from "lucide-react";
import { Faq } from "@/components/faq";
import { ProductConfigurator } from "@/components/product-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatNpr, product } from "@/lib/product";

const features = [
  { icon: ThermometerSun, title: "3 heat levels", copy: "Choose gentle, medium or extra-cosy warmth with the easy-to-use controller." },
  { icon: Clock3, title: "90-min auto off", copy: "Automatic switch-off and overheating protection bring added peace of mind." },
  { icon: Droplets, title: "Machine washable", copy: "Remove the controller and wash the soft heating pad at 30°C." },
  { icon: Sparkles, title: "Soft & breathable", copy: "A comfortable, skin-friendly surface made for relaxing moments at home." },
];

const sampleTestimonials = [
  { name: "Sushmita Karki", location: "Kathmandu", quote: "The warmth feels very comfortable after a long day, and the controller is simple to use." },
  { name: "Rajan Shrestha", location: "Bhaktapur", quote: "It heats up quickly and the soft fabric makes it much nicer than a basic hot-water bag." },
  { name: "Mina Gurung", location: "Pokhara", quote: "I like the adjustable heat and automatic switch-off. It is a cosy addition for cold evenings." },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <SiteHeader />

      <section className="noise relative border-b border-[#eadfd8] bg-[#f5ede7]">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#e8b7a1]/35 blur-3xl" />
        <div className="page-shell relative grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-[.92fr_1.08fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dfc8bc] bg-white/60 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.13em] text-[#8f1d2c]"><Flame size={14} fill="currentColor" /> Your everyday pocket of warmth</div>
            <h1 className="display-font text-[clamp(3.2rem,7vw,6.3rem)] leading-[.92]">Comfort that feels like a <em className="text-[#8f1d2c]">warm hug.</em></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#665851]">Soft, fast and adjustable—the Beurer HK Comfort brings soothing targeted warmth to your back, abdomen and legs.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout?quantity=1&area=kathmandu" className="focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#8f1d2c] px-7 font-extrabold text-white shadow-[0_15px_30px_rgba(143,29,44,.22)] transition hover:-translate-y-0.5 hover:bg-[#68131f]">Order now <ArrowRight size={18} /></Link>
              <Link href="#details" className="focus-ring inline-flex h-14 items-center justify-center rounded-full border border-[#cdbdb4] bg-white/70 px-7 font-bold transition hover:bg-white">See product details</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#5d504a]">
              <span className="flex items-center gap-2"><BadgeCheck className="text-[#317043]" size={18} /> Cash on Delivery</span>
              <span className="flex items-center gap-2"><Truck className="text-[#317043]" size={18} /> Nationwide delivery</span>
              <span className="flex items-center gap-2"><HeartHandshake className="text-[#317043]" size={18} /> Call confirmation</span>
            </div>
          </div>
          <div className="relative">
            <div className="dot-grid absolute -inset-12 rounded-full opacity-80" />
            <div className="gentle-float relative aspect-[1.06] overflow-hidden rounded-[3rem] border border-white/80 bg-white soft-shadow">
              <Image src="/images/hk-comfort-hero.png" alt="Beurer HK Comfort heating pad and box" fill loading="eager" className="object-contain p-5 sm:p-9" sizes="(max-width: 1024px) 100vw, 54vw" />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-[#211916] px-4 py-3 text-white shadow-xl"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d8cbc5]">Offer price</p><p className="mt-0.5 text-xl font-black">{formatNpr(product.offerPrice)}</p></div>
            </div>
            <div className="absolute -right-2 top-8 rotate-6 rounded-full bg-[#e66b35] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg sm:right-0">Save {formatNpr(product.discountAmount)}</div>
          </div>
        </div>
      </section>

      <section className="bg-[#211916] py-5 text-white" aria-label="Purchase benefits">
        <div className="page-shell grid grid-cols-2 gap-4 text-center text-xs font-bold uppercase tracking-[.1em] sm:grid-cols-4 sm:text-sm">
          <span>Cash on Delivery</span><span>Fast delivery</span><span>Easy ordering</span><span>Friendly support</span>
        </div>
      </section>

      <section id="details" className="page-shell scroll-mt-24 py-20 sm:py-28">
        <div className="mb-12 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.17em] text-[#8f1d2c]">Meet your comfort essential</p><h2 className="display-font mt-3 text-4xl sm:text-6xl">Warmth, precisely your way.</h2></div>
        <ProductConfigurator />
      </section>

      <section id="benefits" className="scroll-mt-24 bg-[#efe5de] py-20 sm:py-28">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[.17em] text-[#8f1d2c]">Designed for everyday ease</p><h2 className="display-font mt-3 text-4xl sm:text-6xl">Cosy where it counts.</h2><p className="mt-5 leading-7 text-[#6c5f58]">Thoughtful safety and comfort features make the HK Comfort easy to reach for whenever the temperature drops.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className="rounded-[1.6rem] border border-[#e2d5cd] bg-[#fbf8f5] p-6 card-shadow">
                <div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-[#8f1d2c] text-white"><Icon size={23} /></span><span className="text-xs font-black text-[#b9a9a0]">0{index + 1}</span></div>
                <h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6c5f58]">{copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/checkout?quantity=1&area=kathmandu" className="focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#211916] px-7 font-bold text-white transition hover:bg-[#8f1d2c]">Buy now <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="grid overflow-hidden rounded-[2.5rem] bg-[#8f1d2c] text-white lg:grid-cols-[.8fr_1.2fr]">
          <div className="p-8 sm:p-12 lg:p-14"><p className="text-xs font-black uppercase tracking-[.17em] text-[#ffc5b0]">From unbox to unwind</p><h2 className="display-font mt-4 text-4xl sm:text-5xl">Simple comfort in three steps.</h2><p className="mt-5 leading-7 text-[#f2d9d4]">Plug in, choose your level and settle into warmth. The automatic switch-off takes care of the rest.</p></div>
          <div className="grid gap-px bg-white/15 sm:grid-cols-3">
            {[['1','Place','Position the pad comfortably on the area where you want warmth.'],['2','Select','Use the controller to choose one of three temperature settings.'],['3','Relax','Enjoy soothing warmth while the safety timer works quietly.']].map(([number,title,copy]) => (
              <div key={number} className="bg-[#761723] p-8 sm:py-14"><span className="display-font text-5xl text-[#f79b78]">{number}</span><h3 className="mt-12 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#e9cbc5]">{copy}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfd8] bg-white py-20 sm:py-28">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.17em] text-[#8f1d2c]">Illustrative customer feedback</p><h2 className="display-font mt-3 text-4xl sm:text-6xl">Warm words, warmer moments.</h2></div><p className="max-w-sm text-xs leading-5 text-[#7a6d66]">Sample testimonials for layout preview. Replace these with verified customer reviews before publishing promotional claims.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {sampleTestimonials.map((item) => (
              <blockquote key={item.name} className="rounded-[1.7rem] border border-[#e6dbd4] bg-[#fbf8f5] p-7 card-shadow">
                <div className="flex gap-1 text-[#e66b35]" aria-label="Five stars">★★★★★</div>
                <p className="mt-6 text-lg leading-8">“{item.quote}”</p>
                <footer className="mt-7 flex items-center gap-3 border-t border-[#e5d9d2] pt-5"><span className="grid size-10 place-items-center rounded-full bg-[#8f1d2c] text-sm font-black text-white">{item.name.split(' ').map((word) => word[0]).join('')}</span><span><strong className="block text-sm">{item.name}</strong><span className="text-xs text-[#7d6f68]">{item.location} · Sample</span></span></footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="page-shell scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[.17em] text-[#8f1d2c]">Good to know</p><h2 className="display-font mt-3 text-4xl sm:text-6xl">Questions, answered.</h2></div>
        <Faq />
      </section>

      <section className="px-4 pb-20 sm:pb-28">
        <div className="noise relative mx-auto max-w-[1180px] overflow-hidden rounded-[2.7rem] bg-[#e66b35] px-7 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />
          <ShieldCheck className="relative mx-auto" size={36} />
          <h2 className="display-font relative mx-auto mt-5 max-w-3xl text-4xl sm:text-6xl">Your cosiest days start with one simple order.</h2>
          <p className="relative mx-auto mt-5 max-w-xl text-[#fff3ed]">Order today with Cash on Delivery. We’ll call you to confirm before dispatch.</p>
          <Link href="/checkout?quantity=1&area=kathmandu" className="focus-ring relative mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#211916] px-8 font-extrabold text-white transition hover:-translate-y-0.5">Purchase now <ArrowRight size={18} /></Link>
          <div className="relative mt-5 flex justify-center gap-5 text-xs font-bold"><span className="flex items-center gap-1.5"><Check size={14} /> No online payment</span><span className="flex items-center gap-1.5"><Check size={14} /> Quick confirmation</span></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
