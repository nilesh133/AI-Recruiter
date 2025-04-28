import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useState } from "react";
import {Question, InterviewDetails} from "@/types/user";
import { addNewInterview, generateFeedBackHandler } from "@/services/interviewService";

export const useInterview = () => {
  const [error, setError] = useState<string | null>(null);

  const addInterview = async (interviewDetails: InterviewDetails, questions: Question[], user_uid: string, onSuccess: (res: any) => void) => {
    const res = await addNewInterview(interviewDetails, questions, user_uid);
    onSuccess(res);
  }

  const generateFeedBack = async (data: any, interview_id: string, user_uid: string, fullName: string, contact: string, email: string, onSuccess: (res: any) => void) => {
    debugger;
    const res = await generateFeedBackHandler(data, interview_id, user_uid, fullName, contact, email);
    onSuccess(res);
  }

  return { addInterview, generateFeedBack };
};