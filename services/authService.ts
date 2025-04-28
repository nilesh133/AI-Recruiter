// services/authService.ts
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { AppUser } from "@/types/user";

export const registerUser = async (userData: AppUser, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    name: userData.name,
    email: userData.email,
    role: userData.role,
  });

  return user;
};