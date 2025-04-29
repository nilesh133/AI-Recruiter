import { db } from "@/lib/firebase";
import { doc, collection, addDoc, Timestamp } from "firebase/firestore";
import { InterviewDetails, Question } from "@/types/interview";
import { create } from "domain";
import moment from "moment";

export const addNewInterview = async (
  interviewDetails: InterviewDetails,
  questions: Question[],
  userId: string
) => {
  debugger
  if (!userId) throw new Error("User ID is required");

  const interviewRef = collection(db, "interviews");

  const {id, ...rest} = interviewDetails;

  const newInterview = {
    ...rest,
    questions,
    userId,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(interviewRef, newInterview);

  return {
    interviewId: docRef.id,
    ...newInterview,
  };
};


export const generateFeedBackHandler = async (
  data: any,
  interviewId: string,
  // userId: string,
  fullName: string,
  contact: string,
  email: string
) => {
  // if (!userId) throw new Error("User ID is required");

  const details = {
    data,
    interviewId,
    // userId,
    fullName,
    contact,
    email,
    createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
  };

  const userCollectionRef = collection(db, `/interviews/${interviewId}/attendees`);

  const userRef = await addDoc(userCollectionRef, details);

  return userRef;
};