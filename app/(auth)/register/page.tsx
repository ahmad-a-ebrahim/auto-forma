"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import registerImage from "@/public/register.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const schema = z
    .object({
      name: z.string().min(1, { message: "Required" }),
      email: z.string().min(1, { message: "Required" }).email(),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
      password_confirmation: z.string().min(1, { message: "Required" }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["password_confirmation"],
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });
    const data = await res.json();

    setLoading(false);

    if (data?.success) {
      router.push("/signin");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: data?.error || "Something went wrong while signing up",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-evenly gap-7 min-h-screen p-4"
      >
        <Image
          src={registerImage}
          alt="Sign Up"
          width={267}
          className="hidden md:block"
        />
        <div className="flex flex-col gap-4 min-w-full sm:min-w-96 border p-4 rounded-md shadow">
          <h1 className="text-xl text-center font-semibold">Sign Up</h1>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="text" placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="text" placeholder="Email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="password" placeholder="Password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Password confirmation"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="flex items-center gap-2 my-2">
            <hr className="flex-1 border" />
            <span className="text-sm text-gray-500">OR</span>
            <hr className="flex-1 border" />
          </div>

          {/* Continue with Google button */}
          <Button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            variant="outline"
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </Button>
        </div>
      </form>
    </Form>
  );
}
