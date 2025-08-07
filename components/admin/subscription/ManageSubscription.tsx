"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ManageSubscription = () => {
  const { toast } = useToast();
  const router = useRouter();

  const redirectToCustomerPortal = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { url } = await response.json();
      router.push(url.url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Redirecting to customer portal failed",
      });
    }
  };

  return (
    <Button onClick={redirectToCustomerPortal} className="w-fit">
      Change your subscription
    </Button>
  );
};

export default ManageSubscription;
