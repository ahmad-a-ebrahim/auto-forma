import React from 'react'
import { auth, signIn, signOut } from "@/auth";
import { Button } from './button';
import Image from 'next/image';
import Link from 'next/link';
import logo from "@/public/logo.png"

type Props = {}

function SignOut() {
  return (
    <form action={async () => {
      'use server';
      await signOut()
    }}>
      <Button size="sm" variant="ghost" type="submit">Sign out</Button>
    </form>
  )
}

const Header = async (props: Props) => {
  const session = await auth();

  return (
    <header className='border bottom-1'>
      <nav className='bg-white border-gray-200 px-4 py-2.5'>
        <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl'>
          <Image src={logo} alt="Logo" className='w-20 rounded-md' />
          <div>
            {
              session?.user ? (
                <div className="flex items-center gap-4">
                  <Link href="/view-forms">
                    <Button size="sm" variant="link">Dashboard</Button>
                  </Link>
                  {session.user.name && session.user.image &&
                    <Image
                      src={session.user.image}
                      alt={session.user.name}
                      width={32}
                      height={32}
                      className='rounded-full' />
                  }
                  <SignOut />
                </div>
              ) : (
                <Link href="/api/auth/signin">
                  <Button variant="link">Sign in</Button>
                </Link>
              )
            }
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header