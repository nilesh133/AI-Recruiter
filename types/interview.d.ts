export interface InterviewDetails {
    id: any;
    profile: string;
    duration: string;
    description: string;
    types: string[];
    start_date: DateValue | null;
    start_time: TimeValue | null;
    expiry_date: DateValue | null;
    expiry_time: TimeValue | null;
    noOfQuestions: string;
    level: string;
    userId: string;
    createdAt: DateValue | null;
}

export interface McqInterviewDetails {
    id: any;
    profile: string;
    duration: string;
    start_date: DateValue | null;
    start_time: TimeValue | null;
    expiry_date: DateValue | null;
    expiry_time: TimeValue | null;
    noOfQuestions: string;
    level: string;
    userId: string;
    createdAt: DateValue | null;
    questions: MCQQuestion[];
}

export interface Question {
    type: string;
    question: string;
}


export interface Attendees {
    id: string;
    fullName: string;
    email: string;
    createdAt: any;
    data: any;
}

export type MCQQuestion = {
    id: number;
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  };