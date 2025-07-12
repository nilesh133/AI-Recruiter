"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { HiMiniUser } from "react-icons/hi2";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { AppUser } from "@/types/user";
import { set } from "firebase/database";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@heroui/react";
import {Select, SelectItem} from "@heroui/react";
import {Button} from '@heroui/button';
import { TbSortDescending2 } from "react-icons/tb";
import { HiOutlineKey } from "react-icons/hi";

export default function Signup() {
  const [form, setForm] = useState<AppUser>({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { signup, error } = useAuth();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const { addToastHandler } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendVerification = async () => {
    if (!form.email) {
      addToastHandler({
        title: "Please enter your email",
        description: "We'll send you a verification code to your email.",
        color: "warning",
        timeout: 3000,
        variant: "warning",
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        setShowVerificationCode(true);
        addToastHandler({
          title: "Verification email sent!",
          description: "Please check your email for the 6-digit code.",
          color: "success",
          timeout: 3000,
          variant: "success",
          shouldShowTimeoutProgress: true,
        });
      } else {
        addToastHandler({
          title: "Failed to send verification email",
          description: data.error || "Please try again.",
          color: "error",
          timeout: 3000,
          variant: "error",
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      addToastHandler({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      addToastHandler({
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code.",
        color: "warning",
        timeout: 3000,
        variant: "warning",
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    setLoader(true);
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          code: verificationCode,
          password: form.password,
          role: form.role,
          name: form.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToastHandler({
          title: "Account created successfully!",
          description: "Your email has been verified and account is ready.",
          color: "success",
          timeout: 3000,
          variant: "success",
          shouldShowTimeoutProgress: true,
        });
        router.push("/login");
      } else {
        addToastHandler({
          title: "Verification failed",
          description: data.error || "Please check your code and try again.",
          color: "error",
          timeout: 3000,
          variant: "error",
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      addToastHandler({
        title: "Error",
        description: "Something went wrong. Please try again.",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setLoader(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This will now trigger email verification instead of direct signup
    handleSendVerification();
  };

  return (
    <div className="min-h-screen h-screen flex font-bricolage_grotesque">
      <div className="hidden md:block w-[50%] h-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-8 !flex flex-col justify-end gap-4">
        {/* <div className="flex gap-2 items-center">
          <span className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center text-lg font-bold">
            A
          </span>
          <h3 className="text-xl text-white font-semibold">askRuit</h3>
        </div> */}
        <div className="text-[50px] text-white font-bold justify-end">
          <h1>Hire the Right Talent, Faster with AI</h1>
        </div>
      </div>
      <div className="w-[100%] md:w-[50%] h-full bg-[#080808] flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="shadow-md rounded-xl p-8 max-w-md w-full space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Sign Up</h2>
            <p className="text-sm font-medium text-gray-300">
              Let's sign up to get quickly started.
            </p>
          </div>

          <div className="field_container">
            <span className="field_container_label">Name</span>
            <div className="field_container_input">
              <span>
                <HiMiniUser className="field_container_icon" />
              </span>
              <input
                name="name"
                placeholder="Name"
                onChange={handleChange}
                value={form.name}
                className=""
                required
              />
            </div>
          </div>

          <div className="field_container">
            <span className="field_container_label">Email</span>
            <div className="field_container_input">
              <span>
                <MdEmail className="field_container_icon" />
              </span>
              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                value={form.email}
                className=""
                required
              />
            </div>
            {form.email && !showVerificationCode && (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={isVerifying}
                className="text-sm text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1"
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" />
                    Sending verification email...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            )}
          </div>

          {showVerificationCode && (
            <div className="field_container">
              <span className="field_container_label">Verification Code</span>
              <div className="field_container_input">
                <span>
                  <HiOutlineKey className="field_container_icon" />
                </span>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className=""
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>
          )}

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
                className=""
                required
              />
            </div>
          </div>

          <div className="field_container">
            <span className="field_container_label">Role</span>
            <div className="field_container_input">
              <span>
                <TbSortDescending2 className="field_container_icon" />
              </span>
              <Select placeholder="Select Role" className="bg-transparent field_dropdown" onChange={handleChange} name="role" value={form.role}>
                {[{'label': "User", 'id': 1}, {'label': "Admin", 'id': 2}].map((user) => (
                  <SelectItem key={user.id}>{user.label}</SelectItem>
                ))}
              </Select>
              {/* <select
                name="role"
                onChange={handleChange}
                value={form.role}
                className="flex-1 bg-transparent text-[15px] text-gray-100 border-none outline-none"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select> */}
            </div>
          </div>

          <Button
            type={showVerificationCode ? "button" : "submit"}
            onClick={showVerificationCode ? handleVerifyCode : undefined}
            className="w-full mt-4 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-500 text-sm relative overflow-hidden"
          >
            {loader ? (
              <Spinner size="md" variant="dots" className="spinner" />
            ) : (
              <div>
                {showVerificationCode ? "Verify & Create Account" : "Send Verification Email"}
              </div>
            )}
          </Button>

          {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}

          <p className="text-sm text-center text-gray-100">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-500 hover:underline">
              Log In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
