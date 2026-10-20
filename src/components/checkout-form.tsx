"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, LoaderCircle, LockKeyhole, Minus, Plus, ShieldCheck } from "lucide-react";
import { calculateOrderTotal, formatNpr, getDeliveryFee, product, type DeliveryArea } from "@/lib/product";

type Props = { initialQuantity: number; initialArea: DeliveryArea };
type FieldErrors = Partial<Record<"fullName" | "phone" | "email" | "location", string>>;

export function CheckoutForm({ initialQuantity, initialArea }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>(initialArea);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const requestKey = useRef(crypto.randomUUID());
  const total = useMemo(() => calculateOrderTotal(quantity, deliveryArea), [quantity, deliveryArea]);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("nyanoshop-order-key") || crypto.randomUUID();
    window.sessionStorage.setItem("nyanoshop-order-key", saved);
    requestKey.current = saved;
  }, []);

  const validate = (form: FormData) => {
    const errors: FieldErrors = {};
    const name = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const email = String(form.get("email") || "").trim();
    const location = String(form.get("location") || "").trim();
    if (name.length < 2) errors.fullName = "Please enter your full name.";
    if (!/^(?:\+977[- ]?)?(?:9[678]\d{8}|0?1\d{7})$/.test(phone)) errors.phone = "Enter a valid Nepali phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (location.length < 5) errors.location = "Kindly share your exact location.";
    return errors;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setServerError("");
    const form = new FormData(event.currentTarget);
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": requestKey.current },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          email: form.get("email"),
          location: form.get("location"),
          website: form.get("website"),
          deliveryArea,
          productName: product.name,
          quantity,
          pricePerPiece: product.offerPrice,
          totalPrice: total,
          idempotencyKey: requestKey.current,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not submit your order. Please try again.");

      window.sessionStorage.removeItem("nyanoshop-order-key");
      const query = new URLSearchParams({ orderId: result.orderId, product: product.shortName, quantity: String(quantity), total: String(total) });
      router.push(`/thank-you?${query.toString()}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "We could not submit your order. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass = "focus-ring mt-2 h-12 w-full rounded-xl border border-[#d9cdc5] bg-white px-4 text-sm text-[#211916] placeholder:text-[#a0938c]";

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] border border-[#e6dbd4] bg-white p-6 card-shadow sm:p-8">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#8f1d2c]">Delivery details</p><h1 className="display-font mt-2 text-3xl sm:text-4xl">Complete your order</h1></div><span className="grid size-11 place-items-center rounded-full bg-[#e9f3eb] text-[#2c6b3c]"><LockKeyhole size={20} /></span></div>
      <p className="mt-3 text-sm leading-6 text-[#746760]">No online payment is required. We’ll call to confirm before dispatch.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-bold">Full name <em className="text-[#8f1d2c]">*</em></span><input name="fullName" autoComplete="name" placeholder="Your full name" className={inputClass} aria-invalid={!!fieldErrors.fullName} />{fieldErrors.fullName && <span className="mt-1.5 block text-xs font-semibold text-[#a52732]">{fieldErrors.fullName}</span>}</label>
        <label className="block"><span className="text-sm font-bold">Phone number <em className="text-[#8f1d2c]">*</em></span><input name="phone" autoComplete="tel" inputMode="tel" placeholder="98XXXXXXXX" className={inputClass} aria-invalid={!!fieldErrors.phone} />{fieldErrors.phone && <span className="mt-1.5 block text-xs font-semibold text-[#a52732]">{fieldErrors.phone}</span>}</label>
        <label className="block sm:col-span-2"><span className="text-sm font-bold">Email address <em className="text-[#8f1d2c]">*</em></span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} aria-invalid={!!fieldErrors.email} />{fieldErrors.email && <span className="mt-1.5 block text-xs font-semibold text-[#a52732]">{fieldErrors.email}</span>}</label>
        <label className="block sm:col-span-2"><span className="text-sm font-bold">Delivery area <em className="text-[#8f1d2c]">*</em></span><select value={deliveryArea} onChange={(event) => setDeliveryArea(event.target.value as DeliveryArea)} className={inputClass}><option value="kathmandu">Inside Kathmandu Valley — Rs. 100</option><option value="outside">Outside Kathmandu Valley — Rs. 150</option></select></label>
        <label className="block sm:col-span-2"><span className="text-sm font-bold">Exact location <em className="text-[#8f1d2c]">*</em></span><textarea name="location" rows={3} autoComplete="street-address" placeholder="Kindly share your exact location" className="focus-ring mt-2 w-full resize-none rounded-xl border border-[#d9cdc5] bg-white px-4 py-3 text-sm placeholder:text-[#a0938c]" aria-invalid={!!fieldErrors.location} />{fieldErrors.location && <span className="mt-1.5 block text-xs font-semibold text-[#a52732]">{fieldErrors.location}</span>}</label>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

      <div className="mt-7 rounded-2xl border border-[#e6dad2] bg-[#f8f3ef] p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-extrabold">{product.name}</p><p className="mt-1 text-xs text-[#766961]">Price per piece: {formatNpr(product.offerPrice)}</p></div><div className="flex h-10 items-center gap-1 rounded-xl border border-[#d8cbc3] bg-white p-1"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1} className="focus-ring grid size-8 place-items-center rounded-lg disabled:opacity-30" aria-label="Decrease quantity"><Minus size={15} /></button><span className="w-7 text-center text-sm font-black">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))} disabled={quantity === 10} className="focus-ring grid size-8 place-items-center rounded-lg disabled:opacity-30" aria-label="Increase quantity"><Plus size={15} /></button></div></div>
        <div className="mt-5 space-y-2 border-t border-[#ddd0c8] pt-4 text-sm text-[#6d6059]"><div className="flex justify-between"><span>Subtotal</span><span>{formatNpr(product.offerPrice * quantity)}</span></div><div className="flex justify-between"><span>Delivery fee</span><span>{formatNpr(getDeliveryFee(deliveryArea))}</span></div><div className="flex items-end justify-between pt-2 text-[#211916]"><span className="font-extrabold">Total price</span><span className="text-2xl font-black text-[#8f1d2c]">{formatNpr(total)}</span></div></div>
      </div>

      {serverError && <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-[#efc9cc] bg-[#fff1f2] p-4 text-sm font-semibold leading-6 text-[#8a2730]"><AlertCircle className="mt-0.5 shrink-0" size={18} />{serverError}</div>}

      <button type="submit" disabled={submitting} className="focus-ring mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#8f1d2c] px-5 text-base font-extrabold text-white shadow-[0_12px_26px_rgba(143,29,44,.23)] transition hover:bg-[#68131f] disabled:cursor-not-allowed disabled:opacity-65">
        {submitting ? <><LoaderCircle className="animate-spin" size={19} /> Submitting Order...</> : <>Order now · {formatNpr(total)}</>}
      </button>
      <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#766961]"><span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Details kept private</span><span className="flex items-center gap-1.5"><Check size={14} /> Cash on Delivery</span></div>
    </form>
  );
}
