import { DateValue, TimeValue } from "@internationalized/date";

export interface AppUser {
    name: string;
    email: string;
    password: string;
    role: string;
  }

  export interface ToastProps {
    title: string;
    description: string;
    color: string;
    variant: string;
    timeout: number;
    shouldShowTimeoutProgress: boolean;
  }
  export interface InterviewDetails {
    profile: string;
    duration: string;
    description: string;
    types: string[];
    start_date: DateValue | null;
    start_time: TimeValue | null;
    expiry_date: DateValue | null;
    expiry_time: TimeValue | null;
    noOfQuestions: number;
    level: string;
  }

  export interface Question {
    type: string;
    question: string;
  }