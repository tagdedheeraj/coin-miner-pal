
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-red-600 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
