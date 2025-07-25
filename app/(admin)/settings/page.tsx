import React from 'react'
import { auth, signIn } from '@/auth';
import ManageSubscription from './ManageSubscription';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import UpgradeAccBtn from '@/components/navigation/upgradeAccBtn';

type Props = {}

const page = async (props: Props) => {

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    signIn();
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  const plan = user?.subscribed ? 'premium' : 'free';

  return (
    <div className='p-2 sm:p-4 flex flex-col items-start justify-start gap-4'>
      <h1 className='text-xl font-[500]'>Subscription Details</h1>
      <p>You currently are on a {plan} plan</p>
      {user?.subscribed ? <ManageSubscription /> : <UpgradeAccBtn />}
    </div>
  )
}

export default page
