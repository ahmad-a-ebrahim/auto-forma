import React from "react";
import { auth, signOut } from "@/auth";
import { Button } from "./button";
import Image from "next/image";
import Link from "next/link";
import { CircleUser } from "lucide-react";

type Props = {};

function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button size="sm" variant="ghost" type="submit">
        Sign out
      </Button>
    </form>
  );
}

const Header = async (props: Props) => {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border bottom-1">
      <nav className="bg-white border-gray-200 px-4 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <p>AutoForma</p>
          <div>
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link href="/my-forms">
                  <Button size="sm" variant="link">
                    Dashboard
                  </Button>
                </Link>
                {user && user.image && (
                  <Image
                    src={user.image}
                    alt={"Profile image"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover !w-8 !h-8"
                  />
                )}
                {user && !user.image && (
                  <CircleUser className="w-7 h-7 text-gray-500" />
                )}
                <SignOut />
              </div>
            ) : (
              <Link href="/signin">
                <Button variant="link">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
