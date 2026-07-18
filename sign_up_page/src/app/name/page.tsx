"use client";
import { log } from "console";

// export default function NameInput() {
//   const [displayName, setDisplayName] = useState("hi");
//   const sendHello = () => {
//     fetch("https://api.example.com/data", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: "hello" }),
//     });
//   };
//   return (
//     <div>
//       <label className="block text-[#70334cFF] text-xs font-bold tracking-[2px] uppercase mb-1">
//         Display Name
//       </label>
//       <input
//         type="text"
//         name="displayName"
//         placeholder="How should we call you?"
//         value={displayName}
//         onChange={sendHello}
//         onBlur={() => console.log("BLUR FIRED")}
//         required
//       />
//     </div>
//   );
// }

import React, { useState } from "react";

function InputTracker() {
  // 1. Create a state variable to hold the input value
  const [inputValue, setInputValue] = useState("");

  // 2. Create the onChange handler function
  const handleChange = (event) => {
    // event.target.value grabs the current text from the input field
    setInputValue(event.target.value);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>React onChange Example</h2>

      {/* 3. Bind the value and onChange handler to the input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Type something..."
        style={{ padding: "8px", fontSize: "16px", width: "250px" }}
      />

      {/* 4. Display the state value in real-time */}
      <p style={{ marginTop: "15px", fontSize: "18px" }}>
        <strong>You typed:</strong> {inputValue || "(Nothing yet!)"}
      </p>
    </div>
  );
}

export default InputTracker;
