"use client";
import { inter } from "@/app/layout";
import { ChangeEvent, useState } from "react";

export default function NameInput() {
  const [displayName, setDisplayName] = useState("");
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };
  function touchedColorFunc() {
    if (displayName.length > 0) {
      setTouchedColor("border-[#3d7033FF]");
    } else {
      setTouchedColor("border-[#b94a48FF]");
    }
  }
  return (
    <div>
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75">
        Display Name
      </label>
      <input
        type="text"
        name="displayName"
        placeholder="How should we call you?"
        value={displayName}
        onChange={handleNameChange}
        onBlur={touchedColorFunc}
        className={`w-full px-4 py-3 border-[1.33px] ${touchedColor}   rounded-[5px] bg-[#fefcf7FF] text-sm text-black
            focus:outline-none placeholder-[#3a303066] 
            placeholder:tracking-[1px]`}
        required
      />
      {touchedColor == "border-[#b94a48FF]" && (
        <span
          className={`text-[#b94a48] text-[12px] tracking-normal ${inter.className}`}
        >
          Enter a display name.
        </span>
      )}
    </div>
  );
}
