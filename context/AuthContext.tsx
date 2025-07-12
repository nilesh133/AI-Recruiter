"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // your Firebase instance

// Extended user type that includes Firestore data
interface ExtendedUser extends User {
  userData?: {
    name: string;
    email: string;
    role?: string;
    createdAt?: Date;
  };
}

type AuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUserData: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(user, "user");
  const fetchUserData = async (firebaseUser: User): Promise<ExtendedUser> => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...firebaseUser,
          userData: {
            name: userData.name || "",
            email: userData.email || firebaseUser.email || "",
            role: userData.role || "user",
            createdAt: userData.createdAt?.toDate() || new Date(),
          }
        };
      } else {
        // If user document doesn't exist, create a basic userData object
        return {
          ...firebaseUser,
          userData: {
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            role: "user",
            createdAt: new Date(),
          }
        };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Return user with basic data if Firestore fetch fails
      return {
        ...firebaseUser,
        userData: {
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          role: "user",
          createdAt: new Date(),
        }
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const extendedUser = await fetchUserData(firebaseUser);
        setUser(extendedUser);
        console.log("User authenticated with data:", extendedUser);
      } else {
        setUser(null);
        console.log("User signed out");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user) {
      try {
        const updatedUser = await fetchUserData(user);
        setUser(updatedUser);
        console.log("User data refreshed:", updatedUser);
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
