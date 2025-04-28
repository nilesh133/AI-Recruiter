"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading == false && !user) {
      console.log(loading, user, "User not authenticated.");
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="text-center mt-20 text-gray-600">Loading...</div>;
  }

  return <>{children}</>;
};