"use client";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { inter, playfair } from "@/app/layout";
import Image from "next/image";

export default function SignUpFormOld() {
  interface FormData {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
    country: string;
    bio: string;
  }
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    country: "",
    bio: "",
  });
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    console.log(value);
  };
  //input border becomes green if filled

  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const isValid = value.length > 0; // your validation rule

  // Handle form submission
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-[#fefcf7] flex flex-col items-center font-sans">
      {/* Header Banner */}
      <header className="w-full bg-[#70334c] py-4 px-6 flex items-center shadow-md">
        <span className="text-[#dbbc47] font-[Amiri] text-xl mr-2 font-light">
          تفهيم
        </span>
        <h1
          className={`${playfair.className} text-white  text-xl font-light tracking-wide`}
        >
          Tafheem
        </h1>
      </header>

      {/* Form Container */}
      <main className="w-full max-w-md px-6 py-8 flex flex-col flex-grow">
        <div className="text-center mb-8">
          <h2
            className={`text-[#70334cFF] text-2xl ${playfair.className} font-bold`}
          >
            Create Your Account
          </h2>
          <p
            className={`text-[#3a303099] ${inter.className} text-sm mt-1 font-normal tracking-[0.3px]`}
          >
            Begin your journey of reflection
          </p>
          <hr className="border-none h-[1px] bg-[linear-gradient(to_right,#EAE1E1_0%,#DBBC47_95%,#DBBC47_100%)] mt-4 w-full opacity-50" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
          {/* Display Name */}
          <div>
            <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              placeholder="How should we call you?"
              value={formData.displayName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-[1.33px] rounded-[5px] bg-[#fefcf7FF] text-sm focus:outline-none focus:border-[#70334cFF] placeholder-[#3a303066] placeholder:tracking-[1px] ${
                formData.displayName.length > 0
                  ? "border-[#3d7033FF]"
                  : "border-[#70334c2E]"
              }`}
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] text-sm focus:outline-none focus:border-[#70334cFF] placeholder-[#3a303066] placeholder:tracking-[1px]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#70334c] text-xs font-bold tracking-[2px] uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] text-sm focus:outline-none focus:border-[#70334cFF] placeholder-[#3a303066] placeholder:tracking-[1px] pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              >
                {/* Eye Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px] mt-1 px-1">
              Password Strength
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Rewrite your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] text-sm focus:outline-none focus:border-[#70334cFF] placeholder-[#3a303066] placeholder:tracking-[1px] pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              >
                {/* Eye Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px] mt-1 px-1">
              Password Match
            </div>
          </div>

          {/* Gender Select */}
          <div>
            <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] text-sm text-gray-700 focus:outline-none focus:border-[#70334cFF] appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
              }}
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="none">Prefer not to say</option>
            </select>
          </div>

          {/* Country Select with Tooltip Info Box */}
          <div>
            <div className="flex items-center mb-1">
              <label className="text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mr-1">
                Country
              </label>
              {/* Info Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5 text-gray-500 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] text-sm text-gray-700 focus:outline-none focus:border-[#70334cFF] appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] mb-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
              }}
              required
            >
              <option value="" disabled>
                Select country
              </option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              {/* Add more countries as needed */}
            </select>

            {/* Orange Info Alert Box */}
            <div className="bg-[#FFFDF4] border border-[#F4E3B1] rounded-[5px] p-2 flex items-start space-x-2">
              <Image
                src="/icons/notice.svg"
                alt="Warning"
                width={16}
                height={16}
              />
              <p className="text-[10px] text-gray-500 leading-normal">
                We use this to understand our audience better and support future
                features.
              </p>
            </div>
          </div>

          {/* Bio (Optional) */}
          <div>
            <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1">
              Bio{" "}
              <span className="text-gray-400 font-normal font-sans tracking-normal">
                (OPTIONAL)
              </span>
            </label>
            <textarea
              name="bio"
              rows={3}
              placeholder="A few words about yourself..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-3 border-[1.33px] border-[#70334c2E] rounded-[5px] bg-[#fefcf7FF] text-sm focus:outline-none focus:border-[#70334cFF] placeholder-[#3a303066] placeholder:tracking-[1px] resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-[#70334c]/50 hover:bg-[#70334c] text-[#fefcf7] ${playfair.className} font-semibold py-3 px-4 rounded-[5px] transition-colors duration-200 text-lg shadow-sm mt-4`}
          >
            Create Account
          </button>
        </form>

        {/* Footer Link */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-[#70334cFF] font-bold hover:underline"
          >
            Sign in
          </a>
        </footer>
      </main>
    </div>
  );
}
