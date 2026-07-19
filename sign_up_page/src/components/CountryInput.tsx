"use client";
import { inter } from "@/app/layout";
import { useState, useRef, useEffect, useMemo } from "react";

// Simplified list relying strictly on name strings
const countries = [
  { name: "Afghanistan" },
  { name: "Albania" },
  { name: "Algeria" },
  { name: "Andorra" },
  { name: "Angola" },
  { name: "Argentina" },
  { name: "Armenia" },
  { name: "Australia" },
  { name: "Austria" },
  { name: "Azerbaijan" },
  { name: "Bahamas" },
  { name: "Bahrain" },
  { name: "Bangladesh" },
  { name: "Barbados" },
  { name: "Belarus" },
  { name: "Belgium" },
  { name: "Belize" },
  { name: "Benin" },
  { name: "Bhutan" },
  { name: "Bolivia" },
  { name: "Bosnia and Herzegovina" },
  { name: "Botswana" },
  { name: "Brazil" },
  { name: "Brunei" },
  { name: "Bulgaria" },
  { name: "Burkina Faso" },
  { name: "Burundi" },
  { name: "Cabo Verde" },
  { name: "Cambodia" },
  { name: "Cameroon" },
  { name: "Canada" },
  { name: "Central African Republic" },
  { name: "Chad" },
  { name: "Chile" },
  { name: "China" },
  { name: "Colombia" },
  { name: "Comoros" },
  { name: "Costa Rica" },
  { name: "Croatia" },
  { name: "Cuba" },
  { name: "Cyprus" },
  { name: "Czechia" },
  { name: "Democratic Republic of the Congo" },
  { name: "Denmark" },
  { name: "Djibouti" },
  { name: "Dominica" },
  { name: "Dominican Republic" },
  { name: "Ecuador" },
  { name: "Egypt" },
  { name: "El Salvador" },
  { name: "Equatorial Guinea" },
  { name: "Eritrea" },
  { name: "Estonia" },
  { name: "Eswatini" },
  { name: "Ethiopia" },
  { name: "Fiji" },
  { name: "Finland" },
  { name: "France" },
  { name: "Gabon" },
  { name: "Gambia" },
  { name: "Georgia" },
  { name: "Germany" },
  { name: "Ghana" },
  { name: "Greece" },
  { name: "Grenada" },
  { name: "Guatemala" },
  { name: "Guinea" },
  { name: "Guinea-Bissau" },
  { name: "Guyana" },
  { name: "Haiti" },
  { name: "Honduras" },
  { name: "Hungary" },
  { name: "Iceland" },
  { name: "India" },
  { name: "Indonesia" },
  { name: "Iran" },
  { name: "Iraq" },
  { name: "Ireland" },
  { name: "Israel" },
  { name: "Italy" },
  { name: "Ivory Coast" },
  { name: "Jamaica" },
  { name: "Japan" },
  { name: "Jordan" },
  { name: "Kazakhstan" },
  { name: "Kenya" },
  { name: "Kiribati" },
  { name: "Kosovo" },
  { name: "Kuwait" },
  { name: "Kyrgyzstan" },
  { name: "Laos" },
  { name: "Latvia" },
  { name: "Lebanon" },
  { name: "Lesotho" },
  { name: "Liberia" },
  { name: "Libya" },
  { name: "Liechtenstein" },
  { name: "Lithuania" },
  { name: "Luxembourg" },
  { name: "Madagascar" },
  { name: "Malawi" },
  { name: "Malaysia" },
  { name: "Maldives" },
  { name: "Mali" },
  { name: "Malta" },
  { name: "Marshall Islands" },
  { name: "Mauritania" },
  { name: "Mauritius" },
  { name: "Mexico" },
  { name: "Micronesia" },
  { name: "Moldova" },
  { name: "Monaco" },
  { name: "Mongolia" },
  { name: "Montenegro" },
  { name: "Morocco" },
  { name: "Mozambique" },
  { name: "Myanmar" },
  { name: "Namibia" },
  { name: "Nauru" },
  { name: "Nepal" },
  { name: "Netherlands" },
  { name: "New Zealand" },
  { name: "Nicaragua" },
  { name: "Niger" },
  { name: "Nigeria" },
  { name: "North Korea" },
  { name: "North Macedonia" },
  { name: "Norway" },
  { name: "Oman" },
  { name: "Pakistan" },
  { name: "Palau" },
  { name: "Panama" },
  { name: "Papua New Guinea" },
  { name: "Paraguay" },
  { name: "Peru" },
  { name: "Philippines" },
  { name: "Poland" },
  { name: "Portugal" },
  { name: "Qatar" },
  { name: "Republic of the Congo" },
  { name: "Romania" },
  { name: "Russia" },
  { name: "Rwanda" },
  { name: "Saint Kitts and Nevis" },
  { name: "Saint Lucia" },
  { name: "Saint Vincent and the Grenadines" },
  { name: "Samoa" },
  { name: "San Marino" },
  { name: "Sao Tome and Principe" },
  { name: "Saudi Arabia" },
  { name: "Senegal" },
  { name: "Serbia" },
  { name: "Seychelles" },
  { name: "Sierra Leone" },
  { name: "Singapore" },
  { name: "Slovakia" },
  { name: "Slovenia" },
  { name: "Solomon Islands" },
  { name: "Somalia" },
  { name: "South Africa" },
  { name: "South Korea" },
  { name: "South Sudan" },
  { name: "Spain" },
  { name: "Sri Lanka" },
  { name: "Sudan" },
  { name: "Suriname" },
  { name: "Sweden" },
  { name: "Switzerland" },
  { name: "Syria" },
  { name: "Taiwan" },
  { name: "Tajikistan" },
  { name: "Tanzania" },
  { name: "Thailand" },
  { name: "Timor-Leste" },
  { name: "Togo" },
  { name: "Tonga" },
  { name: "Trinidad and Tobago" },
  { name: "Tunisia" },
  { name: "Turkey" },
  { name: "Turkmenistan" },
  { name: "Tuvalu" },
  { name: "Uganda" },
  { name: "Ukraine" },
  { name: "United Arab Emirates" },
  { name: "United Kingdom" },
  { name: "United States of America" },
  { name: "Uruguay" },
  { name: "Uzbekistan" },
  { name: "Vanuatu" },
  { name: "Vatican City" },
  { name: "Venezuela" },
  { name: "Vietnam" },
  { name: "Yemen" },
  { name: "Zambia" },
  { name: "Zimbabwe" },
  { name: "Palestine" },
].sort((a, b) => a.name.localeCompare(b.name));
const countriesOptions = [{ name: "Prefer not to say" }, ...countries];

export default function CountryInput() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries dynamically based on typing search
  const filteredCountries = useMemo(() => {
    return countriesOptions.filter((country) =>
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

  const handleSelect = (name: string) => {
    setSelectedCountry(name);
    setIsOpen(false);
    setSearchQuery("");
    setTouchedColor("border-[#3d7033FF]");
  };

  const currentSelection = countriesOptions.find(
    (c) => c.name === selectedCountry,
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 mb-1.5 ml-0.75">
        <label className="text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase select-none">
          Country
        </label>
        {/* SVG for question mark */}

        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-[#70334cFF]"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M12 17V17.01M12 14C12 12.5 13 11.5 14 10.5C14.75 9.75 15 8.8 15 8C15 6.3 13.7 5 12 5C10.3 5 9 6.3 9 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg> */}
      </div>

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
            <span>{currentSelection.name}</span>
          ) : (
            "Select country"
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
                <li key={country.name}>
                  <button
                    type="button"
                    onClick={() => handleSelect(country.name)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2.5 transition-colors text-black hover:bg-[#70334c0D] active:bg-[#70334c1A]
                      ${selectedCountry === country.name ? "bg-[#70334c08] font-medium text-[#70334cFF]" : ""}`}
                  >
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

      {/* Audience Insight Info Box */}
      <div className="mt-2.5 p-0.75 bg-[#fdfbf2] border border-[#cca227] rounded-[4px] flex items-center gap-2">
        <svg
          className="w-5 h-5 text-[#cca227] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-[11px] text-[#3a3030a1] leading-tight font-normal">
          We use this to understand our audience better and support future
          features.
        </span>
      </div>
    </div>
  );
}
