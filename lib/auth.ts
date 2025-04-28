// lib/auth.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

// Sign up new user
export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login existing user
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};