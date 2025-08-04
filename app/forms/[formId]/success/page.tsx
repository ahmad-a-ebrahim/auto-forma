import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import success from "@/public/success.svg";

const SubmitFormSuccessPage = () => {
  return (
    <Alert variant="default" className="max-w-md border-none">
      <AlertTitle className="text-center text-lg font-medium flex flex-col gap-7 items-center justify-center">
        <Image src={success} width={176} alt="Success" />
        Success
      </AlertTitle>
      <AlertDescription className="text-center text-sm">
        Your answers were recorded successfully. Thank you for submitting the
        form!
      </AlertDescription>
    </Alert>
  );
};

export default SubmitFormSuccessPage;
