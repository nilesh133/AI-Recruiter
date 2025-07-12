import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useState } from "react";
import {Question, InterviewDetails, McqInterviewDetails, MCQQuestion} from "@/types/interview";
import { addNewInterview, generateFeedBackHandler, addNewMcqInterview, registerCandidateForMcqInterviewHandler, submitMcqInterviewHandler, registerCandidateForInterviewHandler } from "@/services/interviewService";

export const useInterview = () => {
  const [error, setError] = useState<string | null>(null);

  const addInterview = async (interviewDetails: InterviewDetails, questions: Question[], user_uid: string, onSuccess: (res: any) => void) => {
    const res = await addNewInterview(interviewDetails, questions, user_uid);
    onSuccess(res);
  }

  const generateFeedBack = async (data: any, interview_id: string, userId: string, onSuccess: (res: any) => void) => {
    debugger;
    const res = await generateFeedBackHandler(data, interview_id, userId);
    onSuccess(res);
  }

  const addMcqInterview = async (mcqInterviewDetails: McqInterviewDetails, questions: MCQQuestion[], user_uid: string, onSuccess: (res: any) => void) => {
    const res = await addNewMcqInterview(mcqInterviewDetails, questions, user_uid);
    onSuccess(res);
  }

  const registerCandidateForInterview = async (interviewId: string, fullName: string, contact: string, email: string, onSuccess: (res: any) => void) => {
    const res = await registerCandidateForInterviewHandler(interviewId, fullName, contact, email);
    onSuccess(res);
  }

  const registerCandidateForMcqInterview = async (interviewId: string, fullName: string, contact: string, email: string, onSuccess: (res: any) => void) => {
    const res = await registerCandidateForMcqInterviewHandler(interviewId, fullName, contact, email);
    onSuccess(res);
  }

  const submitMcqInterview = async (interviewId: string, userId: string, answers: any, totalQuestions: number, score: number, onSuccess: (res: any) => void) => {
    const res = await submitMcqInterviewHandler(interviewId, userId, answers, totalQuestions, score);
    onSuccess(res);
  }

  return { addInterview, generateFeedBack, addMcqInterview, registerCandidateForMcqInterview, submitMcqInterview, registerCandidateForInterview  };
};