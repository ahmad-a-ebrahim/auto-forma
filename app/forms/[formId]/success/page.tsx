import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const SubmitFormSuccessPage = () => {
  return (
    <Alert variant="default" className="max-w-md">
      <AlertTitle className="text-center text-lg font-[500] flex flex-col gap-2 items-center justify-center">
        <CheckCircle2 className="text-green-600 h-8 w-8" />
        Success
      </AlertTitle>
      <AlertDescription className="text-center text-base">
        Your answers were recorded successfully. Thank you for submitting the
        form!
      </AlertDescription>
    </Alert>
  );
};

export default SubmitFormSuccessPage;
