import { db } from "@/lib/firebase";
import { doc, collection, addDoc, Timestamp } from "firebase/firestore";
import { InterviewDetails, Question } from "@/types/user";
import { create } from "domain";

export const addNewInterview = async (
  interviewDetails: InterviewDetails,
  questions: Question[],
  userId: string
) => {
  if (!userId) throw new Error("User ID is required");

  const userRef = doc(db, "users", userId);
  const interviewRef = collection(userRef, "interviews");

  const newInterview = {
    ...interviewDetails,
    questions,
    userId,
    createdAt: Timestamp.now(),
    // interview_id: interviewRef
  };

  console.log(interviewRef, "interviewRef");

  const docRef = await addDoc(interviewRef, newInterview);

  return {
    interviewId: docRef.id,
    ...newInterview,
  };
};

export const generateFeedBackHandler = async (
  data: any,
  interviewId: string,
  userId: string,
  fullName: string,
  contact: string,
  email: string
) => {
  if (!userId) throw new Error("User ID is required");

  const details = {
    data,
    interviewId,
    userId,
    fullName,
    contact,
    email,
    createdAt: Timestamp.now(),
  };

  const userCollectionRef = collection(db, `users/${userId}/interviews/${interviewId}/attendees`);

  const userRef = await addDoc(userCollectionRef, details);

  return userRef;
};