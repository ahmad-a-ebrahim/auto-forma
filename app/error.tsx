"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-sm">
          An unexpected error occurred. Please try again.
        </p>
        <Button variant={"outline"} onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
