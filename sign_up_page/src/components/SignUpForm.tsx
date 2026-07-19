"use client";
import { useState, type FormEvent } from "react";
import { inter, playfair } from "@/app/layout";
import NameInput from "./NameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import GenderInput from "./GenderInput";
import CountryInput from "./CountryInput";
import BioInput from "./BioInput";

export default function SignUpForm() {
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null); // Reset error state on new try

    if (!validEmail) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    if (!validPassword) {
      setSubmitError("Password is too weak or does not match confirmation.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    console.log("Form is valid! Submitting data...");
    console.log(formData.get("displayName"));
    console.log(formData.get("email"));

    // Continue with your actual registration dispatch or API request here
  }

  return (
    <div className="w-full max-w-md px-6 py-8 flex flex-col grow">
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
        <hr className="border-none h-px bg-[linear-gradient(to_right,#EAE1E1_0%,#DBBC47_95%,#DBBC47_100%)] mt-4 w-full opacity-50" />
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <NameInput />
        <EmailInput setValidEmail={setValidEmail} />
        <PasswordInput setValidPassword={setValidPassword} />
        <GenderInput />
        <CountryInput />
        <BioInput />

        {/* Dynamic Global Submit Error Feedback */}
        {submitError && (
          <div
            className={`${inter.className} text-[#b94a48] text-xs font-semibold uppercase tracking-[0.5px] bg-[#b94a48]/10 p-3 rounded text-center`}
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          className={`w-full bg-[#70334c]/50 hover:bg-[#70334c] text-[#fefcf7] ${playfair.className} font-semibold py-3 px-4 rounded-[5px] transition-colors duration-200 text-lg shadow-sm mt-2`}
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
    </div>
  );
}
