import { LoginForm } from "@/components/login-form";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { baseUrl } from "@/constants/baseUrl";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  // const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  async function getUserByEmail() {
    try {
      const { data } = await axios.post(baseUrl + "/user", { email });
      console.log(data);

      localStorage.setItem("name", data.name);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const { data } = await axios.post(baseUrl + "/login", { email });
      console.log(data);

      getUserByEmail();

      localStorage.setItem("email", email);
      navigate(`/login/otp`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm
          handleLogin={handleLogin}
          setEmail={setEmail}
        />
      </div>
    </div>
  );
}
