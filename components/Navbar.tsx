"use client";

import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import Logo from "../public/aicruit_logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { user, loading } = useAuthContext(); // notice added loading
  const router = useRouter();
  const pathname = usePathname();
  console.log("pathname", pathname);
  const hideNavbarRoutes = ["/signup", "/login", "/ongoing", "/interview-details"];
  const shouldHideNavbar = hideNavbarRoutes.some((path) => pathname.startsWith(path));

  if (loading) {
    // 👇 optional: You can show an empty navbar or a spinner while loading
    return (
      <nav className="flex items-center justify-between px-8 py-4 shadow-md border-b border-[#575757]">
        <Image src={Logo} alt="Logo" className="w-[4rem] h-11 object-cover" />
        {/* <div className="text-2xl font-bold text-indigo-600">Loading...</div> */}
      </nav>
    );
  }

  if(shouldHideNavbar) {
    return null; // Don't render the navbar if on the specified routes
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 shadow-md border-b border-[#575757]">
      <Image src={Logo} alt="Logo" className="w-[4rem] h-11 object-cover" />

      {!user ? (
        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2 bg-white text-black">
            <FaUserPlus className="text-lg" />
            Sign Up
          </Button>
          <Button variant="bordered" className="flex items-center gap-2">
            <FaSignInAlt className="text-lg" />
            Log In
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <Button
            variant="bordered"
            onPress={() => {
              router.push("/dashboard");
            }}
          >
            Dashboard
          </Button>

          <Button
            variant="bordered"
            className="flex items-center gap-2 bg-red-500 text-white"
          >
            <FaSignOutAlt className="text-lg" />
            Log Out
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-semibold text-white">
              {user.displayName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;