"use client";
import { inter } from "@/app/layout";

interface FormErrorProps {
  message?: string;
}

export default function FormError({
  message = "Please correct the errors below before continuing.",
}: FormErrorProps) {
  return (
    <div
      className={`${inter.className} flex items-center justify-between w-full border-[2px] border-[#b94a48] bg-[#b94a48]/5 
      px-2.5 py-1.5 text-[12px] text-[#b94a48] tracking-[0.2px] font-normal mb-6 mt-2`}
    >
      <span>{message}</span>

      {/* Exclamation point inside a circle */}
      <svg
        className="w-[22px] h-[22px] flex-shrink-0 stroke-[#b94a48]"
        viewBox="0 0 24.5 24.5"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
  );
}
