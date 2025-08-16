import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

const AuthLayout = async ({ children }: PropsWithChildren) => {
  const session = await auth();

  if (session?.user) redirect("/");

  return children;
};

export default AuthLayout;
