import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import { useNavigate } from "react-router";
import { baseUrl } from "@/constants/baseUrl";

export default function OTPLoginPage() {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^\d?$/.test(value)) {
      e.target.value = "";
      return;
    }

    // Move to the next input if a number is entered
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && index > 0 && !e.currentTarget.value) {
      // Move to the previous input if Backspace is pressed on an empty box
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const email = localStorage.email;
      const otp = inputsRef.current.map((input) => input?.value || "").join("");
      const { data } = await axios.post(baseUrl + "/login/otp", { otp, email });

      localStorage.setItem("access_token", data.access_token);
      navigate("/");
    } catch (error) {
      console.error(error);

      Toastify({
        text: "Invalid OTP, Please try again!",
        duration: 3000,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">Verify Your OTP</h2>
        <p className="text-gray-600 text-center mb-6">We've sent a 6-digit code to your email. Please enter it below.</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => handleSubmit(e)}>
          <div className="flex justify-center gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 border rounded-md text-center text-xl focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <Button
            className="w-full text-white py-2 px-4 rounded-lg"
            type="submit">
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}
