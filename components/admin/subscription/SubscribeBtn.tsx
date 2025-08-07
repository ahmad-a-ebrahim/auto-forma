"use client";

import { getStripe } from "@/lib/stripe-client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  userId?: string;
  price: string;
};

const SubscribeBtn = ({ userId, price }: Props) => {
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = async (price: string) => {
    if (!userId) {
      router.push("/login");
    }

    try {
      const { sessionId } = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price }),
      }).then((res) => res.json());

      const stripe = await getStripe();

      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Redirecting to checkout failed",
      });
    }
  };

  return (
    <Button
      variant="link"
      className="p-0"
      onClick={() => handleCheckout(price)}
    >
      Upgrade your plan
    </Button>
  );
};

export default SubscribeBtn;
