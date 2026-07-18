"use client";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { inter, playfair } from "@/app/layout";
import NameInput from "./NameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import GenderInput from "./GenderInput";
import CountryInput from "./CountryInput";

export default function SignUpForm() {
  const [formValues, setformValues] = useState(null);
  const [validEmail, setValidEmail] = useState(false);
  // const [password, setPassword] = useState("");

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(formData.get("displayName"));
    console.log(formData.get("email"));
    console.log(validEmail ? "valid" : "not valid");
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
        <hr className="border-none h-[1px] bg-[linear-gradient(to_right,#EAE1E1_0%,#DBBC47_95%,#DBBC47_100%)] mt-4 w-full opacity-50" />
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <NameInput />
        <EmailInput setValidEmail={setValidEmail} />
        <PasswordInput />
        <GenderInput />
        <CountryInput />
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
    </div>
  );
}
