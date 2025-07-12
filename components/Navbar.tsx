"use client";

import { useAuthContext } from "@/context/AuthContext";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import Logo from "../public/aicruit_logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const { user, loading } = useAuthContext(); // notice added loading
  console.log(user, "user");
  const router = useRouter();
  const pathname: any = usePathname();
  const hideNavbarRoutes = [
    "/signup",
    "/login",
    "/ongoing",
    "/interview-details",
    "/mcq-interview-details",
  ];
  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    pathname.startsWith(path)
  );

  if (loading) {
    return (
      <nav className="flex items-center justify-between px-8 py-4 shadow-md border-b border-[#575757]">
        <Image src={Logo} alt="Logo" className="w-[4rem] h-11 object-cover" />
      </nav>
    );
  }

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 shadow-md border-b border-[#575757]">
      <Image src={Logo} alt="Logo" className="w-[4rem] h-11 object-cover" />

      {!user ? (
        <div className="flex items-center gap-4">
          <Button
            className="flex items-center gap-2 bg-white text-black"
            onPress={() => router.push("/signup")}
          >
            <FaUserPlus className="text-lg" />
            Sign Up
          </Button>
          <Button
            variant="bordered"
            className="flex items-center gap-2"
            onPress={() => router.push("/login")}
          >
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

          {/* <Button
            variant="bordered"
            className="flex items-center gap-2 bg-red-500 text-white"
            onPress={async () => {
              await signOut(auth);
              router.push("/login");
            }}
          >
            <FaSignOutAlt className="text-lg" />
            Log Out
          </Button> */}

          <div className="relative">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition px-3 py-2 rounded-xl border border-zinc-700 shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(
                      user.userData?.name?.charAt(0) ||
                      user.displayName?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "U"
                    ).toUpperCase()}
                  </div>
                  <span className="text-sm text-white font-medium">
                    {user.userData?.name || "Profile"}
                  </span>
                </button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Profile Actions"
                className="bg-zinc-900 text-zinc-200 rounded-xl border border-zinc-700 shadow-lg backdrop-blur-sm p-2 w-56"
              >
                <DropdownItem
                  key="profile"
                  className="flex flex-col items-start"
                >
                  <span className="font-semibold text-white">
                    {user.userData?.name || "User"}
                  </span>
                  <br />
                  <span className="text-xs text-zinc-400 truncate">
                    {user.userData?.email || user.email}
                  </span>
                </DropdownItem>

                {/* <DropdownItem
        key="role"
        className="text-sm text-zinc-300 capitalize"
      >
        Role: {user.userData?.role || "User"}
      </DropdownItem> */}

                <DropdownItem
                  key="logout"
                  className="text-red-400 hover:text-red-300 font-medium text-sm mt-1"
                  onPress={async () => {
                    await signOut(auth);
                    router.push("/login");
                  }}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
