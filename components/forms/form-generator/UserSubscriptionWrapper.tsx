import { PropsWithChildren } from "react";
import { auth } from "@/auth";
import { getUserSubscription } from "@/app/actions/userSubscriptions";
import { getUserFormsCount } from "@/app/actions/getUserFormsCount";
import { Button } from "@/components/ui/button";
import { MAX_FREE_FORMS } from "@/lib/utils";
import { Lock } from "lucide-react";

export default async function UserSubscriptionWrapper({
  children,
}: PropsWithChildren) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const subscription = await getUserSubscription({ userId });
  const userFormsCount = await getUserFormsCount(userId);

  const canCreate = !!subscription || userFormsCount < MAX_FREE_FORMS;

  if (canCreate) {
    return <>{children}</>;
  }

  return (
    <Button disabled>
      <Lock className="w-4 h-4 mr-2" />
      Upgrade to create more forms
    </Button>
  );
}
