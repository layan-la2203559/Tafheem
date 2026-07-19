"use client";
import { inter } from "@/app/layout";
import { ChangeEvent, useState } from "react";

type EmailInputProps = {
  setValidEmail: (isValid: boolean) => void;
};

export default function EmailInput({ setValidEmail }: EmailInputProps) {
  const [email, setEmail] = useState("");
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");
  const [error, setError] = useState(false);

  const checkEmailValidity = (value: string) => {
    return /\S+@\S+\.\S+/.test(value) && !value.endsWith(".");
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Bubble validation up continuously so submit behaves dynamically
    const isValid = checkEmailValidity(value);
    setValidEmail(isValid);
    if (isValid) {
      setTouchedColor("border-[#3d7033FF]");
      setError(false);
    }
  };

  function touchedColorFunc() {
    const isValid = checkEmailValidity(email);
    if (isValid) {
      setTouchedColor("border-[#3d7033FF]");
      setError(false);
    } else {
      setTouchedColor("border-[#b94a48FF]");
      setError(true);
    }
    setValidEmail(isValid);
  }

  return (
    <div>
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={handleEmailChange}
        onBlur={touchedColorFunc}
        className={`w-full px-4 py-3 border-[1.33px] ${touchedColor} rounded-[5px] bg-[#fefcf7FF] text-sm text-black
            focus:outline-none placeholder-[#3a303066] 
            placeholder:tracking-[1px] `}
        required
      />

      {error && (
        <span
          className={`text-[#b94a48] text-[12px] tracking-normal ${inter.className}`}
        >
          Enter a valid email address.
        </span>
      )}
    </div>
  );
}
