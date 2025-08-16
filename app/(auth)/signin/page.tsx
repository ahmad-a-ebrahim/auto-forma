"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import loginImage from "@/public/login.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const schema = z.object({
    email: z.string().min(1, { message: "Required" }).email(),
    password: z.string().min(1, { message: "Required" }),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);

    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid email or password",
      });
    } else {
      router.push("/");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-evenly gap-7 min-h-screen p-4"
      >
        <Image
          src={loginImage}
          alt="Login"
          width={267}
          className="hidden md:block"
        />
        <div className="flex flex-col gap-4 min-w-full sm:min-w-96 border p-4 rounded-md shadow">
          <h1 className="text-xl text-center font-semibold">Sign In</h1>

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

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
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

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">Don&apos;t have an account?</p>
            <Link href={"/register"}>
              <Button variant="link" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
