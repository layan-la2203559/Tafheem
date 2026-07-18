"use client";
import { inter } from "@/app/layout";
import { useState, useRef, useEffect, useMemo } from "react";

// Standard ISO country list with common entries (expand as needed)
const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
];

export default function CountryInput() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries dynamically based on typing search
  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  // Handle outside clicks to close & validate
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery(""); // reset search input
          if (selectedCountry.length > 0) {
            setTouchedColor("border-[#3d7033FF]");
          } else {
            setTouchedColor("border-[#b94a48FF]");
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, selectedCountry]);

  // Focus the search input automatically when the user opens the dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setSelectedCountry(code);
    setIsOpen(false);
    setSearchQuery("");
    setTouchedColor("border-[#3d7033FF]");
  };

  const currentSelection = COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75">
        Country
      </label>

      {/* Hidden input for structural form compatibility */}
      <input type="hidden" name="country" value={selectedCountry} required />

      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border-[1.33px] ${touchedColor} rounded-[5px] bg-[#fefcf7FF] text-sm text-left flex justify-between items-center transition-all focus:outline-none`}
      >
        <span
          className={
            !selectedCountry
              ? "text-[#3a303066] tracking-[1px]"
              : "text-black tracking-normal flex items-center gap-2"
          }
        >
          {currentSelection ? (
            <>
              <span className="text-base line-height-none">
                {currentSelection.flag}
              </span>
              <span>{currentSelection.name}</span>
            </>
          ) : (
            "Where do you live?"
          )}
        </span>

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

      {/* Floating Dropdown Frame */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] shadow-lg overflow-hidden flex flex-col max-h-64 animate-in fade-in slide-in-from-top-1 duration-100">
          {/* Integrated Search Bar */}
          <div className="p-2 border-b border-[#70334c1F]">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#70334c08] border border-[#70334c1F] rounded-[3px] text-xs text-black focus:outline-none placeholder-[#3a303066]"
            />
          </div>

          {/* Filtered Country List */}
          <ul className="overflow-y-auto py-1 flex-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2.5 transition-colors text-black hover:bg-[#70334c0D] active:bg-[#70334c1A]
                      ${selectedCountry === country.code ? "bg-[#70334c08] font-medium text-[#70334cFF]" : ""}`}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs text-[#3a303066] text-center italic">
                No matching countries found
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Error Message */}
      {touchedColor === "border-[#b94a48FF]" && (
        <span
          className={`text-[#b94a48] text-[12px] tracking-normal block mt-1 ${inter.className}`}
        >
          Select your country.
        </span>
      )}
    </div>
  );
}
