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
    noOfQuestions: number;
    level: string;
    userId: string;
    createdAt: DateValue | null;
}

export interface Question {
    type: string;
    question: string;
}


export interface Attendees {
    id: string;
    fullName: string;
    createdAt: any;
    data: any;
}