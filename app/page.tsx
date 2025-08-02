import Header from "@/components/ui/header";
import { SessionProvider } from 'next-auth/react';
import LandingPage from './landing-page/page';

export default function Home() {
  return (
    <SessionProvider>
      <main className="flex min-h-dvh flex-col">
        <Header />
        <LandingPage />
      </main>
    </SessionProvider>
  )
}
