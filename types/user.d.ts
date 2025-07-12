import { DateValue, TimeValue } from "@internationalized/date";

export interface AppUser {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface UserVerification {
    name: string;
    email: string;
    password: string;
    role: string;
    code: string;
    expiry: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface VerifiedUser {
    uid: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
}

export interface ToastProps {
    title: string;
    description: string;
    color: any;
    variant: any;
    timeout: number;
    shouldShowTimeoutProgress: boolean;
}