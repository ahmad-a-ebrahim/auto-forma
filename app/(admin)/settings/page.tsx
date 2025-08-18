import React from "react";
import ManageSubscription from "@/components/admin/subscription/ManageSubscription";
import UpgradeAccBtn from "@/components/admin/subscription/UpgradeAccBtn";
import EditProfile from "@/components/admin/edit-profile/EditProfile";
import { getAuthenticatedUser } from "@/app/actions/getAuthenticatedUser";

const SettingsPage = async () => {
  const data = await getAuthenticatedUser();
  const user = data.user;

  const plan = user?.subscribed ? "premium" : "free";

  return (
    <div className="p-2 sm:p-4 flex flex-col items-start justify-start gap-4">
      <h1 className="text-xl font-[500]">Edit Profile</h1>
      <EditProfile user={user} />

      <h1 className="text-xl font-[500]">Subscription Details</h1>
      <div className="p-4 border rounded-md w-full space-y-4">
        <p>You currently are on a {plan} plan</p>
        {user?.subscribed ? <ManageSubscription /> : <UpgradeAccBtn />}
      </div>
    </div>
  );
};

export default SettingsPage;
