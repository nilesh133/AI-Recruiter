import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useAuthContext } from "@/context/AuthContext";

// Extended user type that includes Firestore data
interface ExtendedUser extends User {
  userData?: {
    name: string;
    email: string;
    role?: string;
    createdAt?: Date;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser as ExtendedUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
  };
};

// Hook to get user data with Firestore information
export const useUserData = () => {
  const { user, loading, refreshUserData } = useAuthContext();
  
  return {
    user,
    loading,
    userData: user?.userData,
    refreshUserData,
    // Helper functions
    getUserName: () => user?.userData?.name || user?.displayName || 'User',
    getUserEmail: () => user?.userData?.email || user?.email || '',
    getUserRole: () => user?.userData?.role || 'user',
    getUserInitial: () => {
      const name = user?.userData?.name || user?.displayName || user?.email?.charAt(0) || 'U';
      return name.toUpperCase();
    }
  };
};