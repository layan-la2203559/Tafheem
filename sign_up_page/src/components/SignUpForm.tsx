"use client";
import { useState, SubmitEvent } from "react";
import { inter, playfair } from "@/app/layout";
import NameInput from "./NameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import GenderInput from "./GenderInput";
import CountryInput from "./CountryInput";
import BioInput from "./BioInput";
import FormError from "./FormError";

export default function SignUpForm() {
  const [validName, setValidName] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [validGender, setValidGender] = useState(false);
  const [validCountry, setValidCountry] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null); // Reset error state on new submission attempt

    if (!validName) {
      setSubmitError("Please enter a valid display name.");
      return;
    }

    if (!validEmail) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    if (!validPassword) {
      setSubmitError("Password is too weak or does not match confirmation.");
      return;
    }

    if (!validGender) {
      setSubmitError("Please select a gender option.");
      return;
    }

    if (!validCountry) {
      setSubmitError("Please select your country.");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    console.log("Form is valid! Submitting data...");
    console.log("Name:", formData.get("displayName"));
    console.log("Email:", formData.get("email"));
    console.log("Gender:", formData.get("gender"));
    console.log("Country:", formData.get("country"));

    const userData = Object.fromEntries(formData.entries());
// 
    console.log("JSON Payload:", JSON.stringify(userData, null, 2));
  }

  return (
    <div className="w-full max-w-md px-6 py-8 flex flex-col grow">
      <div className="text-center mb-6">
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

      {/* Renders right below the line with a contextual reason */}
      {submitError && <FormError message={submitError} />}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <NameInput setValidName={setValidName} />
        <EmailInput setValidEmail={setValidEmail} />
        <PasswordInput setValidPassword={setValidPassword} />
        <GenderInput setValidGender={setValidGender} />
        <CountryInput setValidCountry={setValidCountry} />
        <BioInput />

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
