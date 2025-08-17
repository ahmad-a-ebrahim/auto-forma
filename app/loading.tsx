import React from "react";
import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div
      className="min-h-screen flex justify-center items-center bg-background"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 text-lg font-medium text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        AutoForma
      </div>
    </div>
  );
};

export default Loading;
