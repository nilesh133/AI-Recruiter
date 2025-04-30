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
    color: any;
    variant: any;
    timeout: number;
    shouldShowTimeoutProgress: boolean;
  }