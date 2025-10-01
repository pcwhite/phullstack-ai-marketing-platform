import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
function ConfirmationModal({
  isOpen,
  title,
  message,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-[90%] sm:max-w-lg bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl md:text-2xl">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-sm sm:text-base md:text-lg">
          {message}
        </AlertDialogDescription>
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="w-full sm:w-auto border-main text-main bg-white hover:bg-main/10"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : null}{" "}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationModal;
