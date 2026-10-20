"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { InteractiveProductGallery } from "@/components/interactive-product-gallery";
import { calculateOrderTotal, formatNpr, getDeliveryFee, product, type DeliveryArea } from "@/lib/product";

export function ProductConfigurator() {
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState<DeliveryArea>("kathmandu");
  const total = useMemo(() => calculateOrderTotal(quantity, area), [quantity, area]);
  const checkoutHref = `/checkout?quantity=${quantity}&area=${area}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
      <div>
        <InteractiveProductGallery images={product.images} />
      </div>

      <div className="lg:py-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f7e7e9] px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-[#8f1d2c]">Official Beurer comfort</div>
        <h2 className="display-font text-4xl leading-[1.05] sm:text-5xl">{product.name}</h2>
        <p className="mt-5 text-base leading-7 text-[#6f625c]">{product.description}</p>

        <ul className="mt-6 space-y-3">
          {product.benefits.slice(0, 4).map((benefit) => (
            <li key={benefit} className="flex gap-3 text-sm font-medium text-[#423732]"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e5f3e8] text-[#27723b]"><Check size={13} strokeWidth={3} /></span>{benefit}</li>
          ))}
        </ul>

        <div className="mt-7 flex items-end gap-3 border-y border-[#eadfd8] py-5">
          <span className="text-3xl font-black tracking-tight text-[#8f1d2c]">{formatNpr(product.offerPrice)}</span>
          <span className="mb-1 text-base text-[#8b7d76] line-through">{formatNpr(product.regularPrice)}</span>
          <span className="mb-1 rounded-full bg-[#fff0cf] px-2.5 py-1 text-xs font-extrabold text-[#7a4b00]">SAVE {formatNpr(product.discountAmount)}</span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#6d6059]">Quantity</legend>
            <div className="flex h-12 w-full items-center justify-between rounded-xl border border-[#dbcfc7] bg-white p-1">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Decrease quantity" className="focus-ring grid size-10 place-items-center rounded-lg transition hover:bg-[#f5eeea] disabled:opacity-35"><Minus size={17} /></button>
              <span className="font-extrabold" aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))} disabled={quantity === 10} aria-label="Increase quantity" className="focus-ring grid size-10 place-items-center rounded-lg transition hover:bg-[#f5eeea] disabled:opacity-35"><Plus size={17} /></button>
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#6d6059]">Delivery area</span>
            <select value={area} onChange={(event) => setArea(event.target.value as DeliveryArea)} className="focus-ring h-12 w-full rounded-xl border border-[#dbcfc7] bg-white px-3 text-sm font-semibold">
              <option value="kathmandu">Inside Kathmandu Valley</option>
              <option value="outside">Outside Kathmandu Valley</option>
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f0e7e1] p-5">
          <div className="flex justify-between text-sm text-[#675a54]"><span>{quantity} × {formatNpr(product.offerPrice)}</span><span>{formatNpr(product.offerPrice * quantity)}</span></div>
          <div className="mt-2 flex justify-between text-sm text-[#675a54]"><span>Delivery</span><span>{formatNpr(getDeliveryFee(area))}</span></div>
          <div className="mt-4 flex items-center justify-between border-t border-[#d9cbc2] pt-4"><span className="font-bold">Total payable</span><span className="text-2xl font-black text-[#8f1d2c]">{formatNpr(total)}</span></div>
        </div>

        <Link href={checkoutHref} className="focus-ring mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#8f1d2c] px-5 text-base font-extrabold text-white shadow-[0_12px_26px_rgba(143,29,44,.25)] transition hover:-translate-y-0.5 hover:bg-[#68131f]">
          <ShoppingBag size={19} /> Purchase now · Cash on Delivery
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#71645e]"><span className="flex items-center gap-1.5"><ShieldCheck size={15} /> Safe order form</span><span className="flex items-center gap-1.5"><Truck size={15} /> Delivery across Nepal</span></div>
      </div>
    </div>
  );
}
