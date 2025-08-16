import React from "react";
import { getUserForms } from "@/app/actions/getUserForms";
import { MAX_FREE_FORMS } from "@/utils/constants";
import SubscribeBtn from "@/components/admin/subscription/SubscribeBtn";
import { auth } from "@/auth";
import { getUserSubscription } from "@/app/actions/userSubscriptions";
import ProgressBar from "@/components/progressBar";

const UpgradeAccBtn = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const subscription = await getUserSubscription({ userId });

  if (subscription) {
    return null;
  }

  const forms = await getUserForms();

  const formCount = forms.length;

  const percent = Math.min((formCount / MAX_FREE_FORMS) * 100, 100);

  return (
    <div className="text-left text-sm flex flex-col gap-4 max-w-sm">
      <ProgressBar value={percent} />
      <div className="leading-6">
        <p>
          {formCount > 3
            ? "You've hit your free plan"
            : `${formCount} out of ${MAX_FREE_FORMS} forms generated.`}
        </p>
        <p>
          <SubscribeBtn
            price="price_1RKS39RaVWBS12gHIGTgnEZs"
            userId={userId}
          />{" "}
          for unlimited forms.
        </p>
      </div>
    </div>
  );
};

export default UpgradeAccBtn;
