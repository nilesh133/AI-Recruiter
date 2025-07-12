"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/react";
import { useAuthContext } from "@/context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, error } = useAuth(); // 👈 make sure you expose `user` from useAuth
  const { addToastHandler } = useToast();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const {user} = useAuthContext(); // 👈 make sure to call this to get the user context

  // 🔥 Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);

    try {
      await login(form.email, form.password);
      router.push("/dashboard");

      addToastHandler({
        title: "Login Successful",
        description: "",
        color: "success",
        timeout: 3000,
        variant: "success",
        shouldShowTimeoutProgress: true,
      });
    } catch (error: any) {
      let errorMessage = "Something went wrong. Please try again.";

      switch (error.message) {
        case "invalid-credentials":
          errorMessage = "Invalid email or password.";
          break;
        case "user-doc-not-found":
          errorMessage = "No user record found with this email.";
          break;
        case "unknown-error":
        default:
          errorMessage = "Unexpected error occurred during login.";
      }

      addToastHandler({
        title: "Login Failed",
        description: errorMessage,
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex font-bricolage_grotesque">
      <div className="hidden md:flex w-[50%] h-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-8 flex-col gap-4 justify-end">
        {/* <div className="flex gap-2 items-center">
          <span className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center text-lg font-bold">
            A
          </span>
          <h3 className="text-xl text-white font-semibold">askRuit</h3>
        </div> */}
        <div className="text-[50px] text-white font-bold">
          <h1>Hire the Right Talent, Faster with AI</h1>
        </div>
      </div>
      <div className="w-[100%] md:w-[50%] h-full bg-[#080808] flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="shadow-md rounded-xl p-8 max-w-md w-full space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Sign In</h2>
            <p className="text-sm font-medium text-gray-300">
              Log in to continue your journey.
            </p>
          </div>

          <div className="field_container">
            <span className="field_container_label">Email</span>
            <div className="field_container_input">
              <span>
                <MdEmail className="field_container_icon" />
              </span>
              <input
                name="email"
                placeholder="email"
                onChange={handleChange}
                value={form.email}
                required
              />
            </div>
          </div>

          <div className="field_container">
            <span className="field_container_label">Password</span>
            <div className="field_container_input">
              <span>
                <RiLockPasswordFill className="field_container_icon" />
              </span>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                value={form.password}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-500 text-sm relative overflow-hidden"
          >
            {loader ? (
              <Spinner size="md" variant="dots" className="spinner" />
            ) : (
              <div>Sign In</div>
            )}
          </Button>

          <p className="text-sm text-center text-gray-100">
            Do not have account?{" "}
            <a href="/signup" className="text-indigo-500 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
