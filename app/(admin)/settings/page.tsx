import React from "react";
import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ManageSubscription from "@/components/admin/subscription/ManageSubscription";
import UpgradeAccBtn from "@/components/admin/subscription/UpgradeAccBtn";
import EditProfile from "@/components/admin/edit-profile/EditProfile";
import { SessionProvider } from "next-auth/react";

const SettingsPage = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    signIn();
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const plan = user?.subscribed ? "premium" : "free";

  return (
    <div className="p-2 sm:p-4 flex flex-col items-start justify-start gap-4">
      <h1 className="text-xl font-[500]">Edit Profile</h1>
      <SessionProvider>
        <EditProfile />
      </SessionProvider>

      <h1 className="text-xl font-[500]">Subscription Details</h1>
      <div className="p-4 border rounded-md w-full">
        <p>You currently are on a {plan} plan</p>
        {user?.subscribed ? <ManageSubscription /> : <UpgradeAccBtn />}
      </div>
    </div>
  );
};

export default SettingsPage;
