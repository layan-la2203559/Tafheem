"use client";
import { inter } from "@/app/layout";
import { useState, useRef, useEffect } from "react";

type GenderInputProps = {
  setValidGender: (isValid: boolean) => void;
};

export default function GenderInput({ setValidGender }: GenderInputProps) {
  const [gender, setGender] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  // Sync state validity dynamically with the parent form
  useEffect(() => {
    setValidGender(gender.length > 0);
  }, [gender, setValidGender]);

  // Close dropdown and validate when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          // Run validation on close/blur
          if (gender.length > 0) {
            setTouchedColor("border-[#3d7033FF]");
          } else {
            setTouchedColor("border-[#b94a48FF]");
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, gender]);

  const handleSelect = (value: string) => {
    setGender(value);
    setIsOpen(false);
    setTouchedColor("border-[#3d7033FF]");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Find the clean label to show in the box
  const selectedLabel = options.find((o) => o.value === gender)?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75">
        Gender
      </label>

      {/* Hidden input to keep standard form submissions working perfectly */}
      <input type="hidden" name="gender" value={gender} required />

      {/* Trigger Box - Completely mimics your Display Name Input box */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full px-4 py-3 border-[1.33px] ${touchedColor} rounded-[5px] bg-[#fefcf7FF] text-sm text-left flex justify-between items-center transition-all focus:outline-none`}
      >
        <span
          className={
            !gender
              ? "text-[#3a303066] tracking-[1px]"
              : "text-black tracking-normal"
          }
        >
          {selectedLabel || "Select Gender"}
        </span>

        {/* Sleek custom chevron arrow that rotates on open */}
        <svg
          className={`w-4 h-4 text-[#70334c66] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Styled Dropdown Menu Options */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2.5 text-sm text-left transition-colors text-black hover:bg-[#70334c0D] active:bg-[#70334c1A]
                    ${gender === option.value ? "bg-[#70334c08] font-medium text-[#70334cFF]" : ""}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Message Section */}
      {touchedColor === "border-[#b94a48FF]" && (
        <span
          className={`text-[#b94a48] text-[12px] tracking-normal block mt-1 ${inter.className}`}
        >
          Select a gender option.
        </span>
      )}
    </div>
  );
}
