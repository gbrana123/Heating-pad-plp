"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  { question: "Where can I use the Beurer HK Comfort heating pad?", answer: "It is designed for targeted warmth on areas such as your back, abdomen and legs. Always place it comfortably against the body and follow the supplied instruction manual." },
  { question: "How many temperature settings does it have?", answer: "The HK Comfort offers three adjustable heat settings, so you can choose the level that feels most comfortable to you." },
  { question: "Does it switch off automatically?", answer: "Yes. It includes overheating protection and automatically switches off after approximately 90 minutes for added reassurance." },
  { question: "Can I wash the heating pad?", answer: "Yes. Remove the controller first, then machine wash the pad at 30°C according to the care instructions. Let it dry completely before reconnecting it." },
  { question: "How does Cash on Delivery work?", answer: "Place your order through the checkout form. Our representative will call to confirm your order, and you pay when it is delivered." },
  { question: "What is the delivery charge?", answer: "Delivery is Rs. 100 inside Kathmandu Valley and Rs. 150 outside Kathmandu Valley." },
  { question: "Is this a medical treatment device?", answer: "The heating pad provides soothing warmth and everyday comfort. It is not a substitute for medical diagnosis or treatment. Ask a healthcare professional if you have a health concern or heat sensitivity." },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[#dfd2ca] border-y border-[#dfd2ca]">
      {faqs.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.question}>
            <button type="button" onClick={() => setOpen(expanded ? -1 : index)} className="focus-ring flex w-full items-center justify-between gap-5 rounded-lg py-5 text-left" aria-expanded={expanded}>
              <span className="text-base font-bold sm:text-lg">{item.question}</span>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${expanded ? "bg-[#8f1d2c] text-white" : "bg-[#eee5df]"}`}>{expanded ? <Minus size={16} /> : <Plus size={16} />}</span>
            </button>
            {expanded && <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-[#6f625c] sm:text-base">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
