import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

const AuthLayout = async ({ children }: PropsWithChildren) => {
  const session = await auth();

  if (session?.user) redirect("/my-forms");

  return children;
};

export default AuthLayout;
