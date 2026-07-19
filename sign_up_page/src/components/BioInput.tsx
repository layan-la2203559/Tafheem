"use client";
import { inter } from "@/app/layout";
import { ChangeEvent, useState } from "react";

export default function BioInput() {
  const [bio, setBio] = useState("");
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  function touchedColorFunc() {
    if (bio.length > 0) {
      setTouchedColor("border-[#3d7033FF]");
    } else {
      // Since it's optional, returning to neutral when empty instead of showing an error
      setTouchedColor("border-[#70334c2E]");
    }
  }

  return (
    <div>
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75">
        Bio{" "}
        <span className="text-[#3a303066] text-[11px] font-normal uppercase tracking-[2px]">
          (optional)
        </span>
      </label>
      <textarea
        name="bio"
        placeholder="A few words about yourself..."
        value={bio}
        onChange={handleBioChange}
        onBlur={touchedColorFunc}
        rows={3}
        className={`w-full px-4 py-3 border-[1.33px] ${touchedColor} rounded-[5px] bg-[#fefcf7FF] text-sm text-black
          focus:outline-none placeholder-[#3a303066] 
          placeholder:tracking-[1px] resize-y`}
      />
    </div>
  );
}
