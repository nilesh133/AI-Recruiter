import { ToastProps } from "@/types/user";
import {addToast} from "@heroui/react";

export const useToast = () => {
    const addToastHandler = (props : ToastProps) => {
        addToast({
            title: props.title,
            description: props.description,
            color: props.color,
            timeout: props.timeout,
            shouldShowTimeoutProgress: props.shouldShowTimeoutProgress,
            variant: props.variant,
          });
    }

  return { addToastHandler };
};