import { db } from "@/lib/firebase";
import { doc, collection, addDoc, Timestamp, getDoc, updateDoc } from "firebase/firestore";
import { InterviewDetails, McqInterviewDetails, Question, MCQQuestion } from "@/types/interview";
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
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(interviewRef, newInterview);

  return {
    interviewId: docRef.id,
    ...newInterview,
  };
};

export const addNewMcqInterview = async (
  mcqInterviewDetails: McqInterviewDetails,
  questions: MCQQuestion[],
  userId: string
) => {
  debugger;
  if (!userId) throw new Error("User ID is required");

  const interviewRef = collection(db, "mcqInterviews");

  const {id, ...rest} = mcqInterviewDetails;

  const newMcqInterview = {
    ...rest,
    questions,
    userId,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(interviewRef, newMcqInterview);

  return {
    interviewId: docRef.id,
    ...newMcqInterview,
  };
}

export const generateFeedBackHandler = async (
  data: any,
  interviewId: string,
  userId: string
) => {
  // if (!userId) throw new Error("User ID is required");

  const docRef = doc(db, `interviews/${interviewId}/attendees/${userId}`);

  await updateDoc(docRef, {
    data,
    submittedAt: new Date().toISOString(),
    hasAttempted: true,
  });

  return docRef;
};

export const registerCandidateForMcqInterviewHandler = async (interviewId: string, fullName: string, contact: string, email: string) => {

  const userCollectionRef = collection(db, `/mcqInterviews/${interviewId}/attendees`);

  const userRef = await addDoc(userCollectionRef, {
    fullName,
    contact,
    email,
    createdAt: new Date().toISOString(),
    hasStarted: true,
  });

  return userRef.id;
}

export const submitMcqInterviewHandler = async (
  interviewId: string,
  userId: string,
  answers: any,
  totalQuestions: number,
  score: number
) => {
  try {
    const docRef = doc(db, `mcqInterviews/${interviewId}/attendees/${userId}`);

    await updateDoc(docRef, {
      answers,
      totalQuestions,
      score,
      submittedAt: new Date().toISOString(),
      hasAttempted: true,
    });

    return docRef;
  } catch (error) {
    console.error("Error updating MCQ interview submission:", error);
    throw error;
  }
};

export const registerCandidateForInterviewHandler = async (interviewId: string, fullName: string, contact: string, email: string) => {
  const userCollectionRef = collection(db, `/interviews/${interviewId}/attendees`);
  const userRef = await addDoc(userCollectionRef, {
    fullName,
    contact,
    email,
    createdAt: new Date().toISOString(),
    hasStarted: true,
  });

  return userRef.id;
}