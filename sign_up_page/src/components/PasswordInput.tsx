"use client";
import { inter } from "@/app/layout";
import { ChangeEvent, useState } from "react";

export default function PasswordInput() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touchedColor, setTouchedColor] = useState("border-[#70334c2E]");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touchedColor2, setTouchedColor2] = useState("border-[#70334c2E]");

  // --- Password Strength Logic ---
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-gray-200" };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score, label: "WEAK", color: "bg-[#b94a48]" }; // Exact Red
      case 2:
        return { score, label: "FAIR", color: "bg-[#d97706]" }; // Orange shade
      case 3:
        return { score, label: "GOOD", color: "bg-[#eab308]" }; // Yellow shade
      case 4:
        return { score, label: "STRONG", color: "bg-[#3d7033FF]" }; // Exact Green
      default:
        return { score: 1, label: "WEAK", color: "bg-[#b94a48]" };
    }
  };

  const strength = getPasswordStrength(password);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (confirmPassword.length > 0) {
      if (newPassword.length > 0 && confirmPassword === newPassword) {
        setTouchedColor2("border-[#3d7033FF]");
      } else {
        setTouchedColor2("border-[#b94a48FF]");
      }
    }
  };

  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentConfirmValue = e.target.value;
    setConfirmPassword(currentConfirmValue);

    if (password.length > 0 && currentConfirmValue === password) {
      setTouchedColor2("border-[#3d7033FF]");
    } else {
      setTouchedColor2("border-[#b94a48FF]");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleConfirmVisibility = () => {
    setShowConfirm((prev) => !prev);
  };

  function touchedColorFunc() {
    if (password.length > 0) {
      setTouchedColor("border-[#3d7033FF]");
    } else {
      setTouchedColor("border-[#b94a48FF]");
    }
  }

  return (
    <div className={inter.className}>
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75">
        PASSWORD
      </label>

      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create a strong password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={touchedColorFunc}
          className={`w-full pl-4 pr-12 py-3 border-[1.33px] ${touchedColor} rounded-[5px] bg-[#fefcf7FF] text-sm text-black
            focus:outline-none placeholder-[#3a303066] uppercase
            placeholder:normal-case placeholder:tracking-[1px]`}
          required
        />

        {/* Toggle Visibility Button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a3030aa] hover:text-black focus:outline-none"
          aria-label={showPassword ? "HIDE PASSWORD" : "SHOW PASSWORD"}
        >
          {showPassword ? (
            <img className="w-5 h-5" src="/viewEyeOff.svg" alt="" />
          ) : (
            <img className="w-5 h-5" src="/viewEye.svg" alt="" />
          )}
        </button>
      </div>

      {/* --- 4-Segment Strength Rectangles (Sharp edges, 3px high) --- */}
      <div className="grid grid-cols-4 gap-1.5 mt-2 w-full">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-[3px] transition-colors duration-300 ${
              index <= strength.score ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Strength Text Indicator (Unbolded) */}
      <div
        className={`${inter.className} text-[#3a303088] text-[10px] font-normal tracking-[1.5px] uppercase mt-1`}
      >
        {strength.label && `${strength.label} PASSWORD`}
      </div>

      {/* {touchedColor === "border-[#b94a48FF]" && (
        <span
          className={`${inter.className} text-[#b94a48] text-[10px] tracking-normal block mt-1 uppercase`}
        >
          ENTER A PASSWORD.
        </span>
      )} */}

      {/* Confirm Password */}
      <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1 ml-0.75 mt-5">
        CONFIRM PASSWORD
      </label>

      <div className="relative w-full">
        <input
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          placeholder="Rewrite your password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          className={`w-full pl-4 pr-12 py-3 border-[1.33px] ${touchedColor2} rounded-[5px] bg-[#fefcf7FF] text-sm text-black
            focus:outline-none placeholder-[#3a303066] uppercase
            placeholder:normal-case placeholder:tracking-[1px]`}
          required
        />

        {/* Toggle Visibility Button */}
        <button
          type="button"
          onClick={toggleConfirmVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a3030aa] hover:text-black focus:outline-none"
          aria-label={showConfirm ? "HIDE PASSWORD" : "SHOW PASSWORD"}
        >
          {showConfirm ? (
            <img className="w-5 h-5" src="/viewEyeOff.svg" alt="" />
          ) : (
            <img className="w-5 h-5" src="/viewEye.svg" alt="" />
          )}
        </button>
      </div>

      {/* Status Messages */}
      {touchedColor2 === "border-[#b94a48FF]" && (
        <span
          className={`${inter.className} text-[#b94a48] text-[10px] tracking-[1.5px] block mt-1 uppercase`}
        >
          PASSWORD NOT MATCH
        </span>
      )}

      {touchedColor2 === "border-[#3d7033FF]" && password.length > 0 && (
        <span
          className={`${inter.className} text-[#3d7033] text-[10px] tracking-[1.5px] block mt-1 uppercase`}
        >
          PASSWORD MATCH
        </span>
      )}
    </div>
  );
}
