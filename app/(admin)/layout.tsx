import Header from "@/components/ui/header";
import DashboardNav from "@/components/navigation/DashboardNav";
import { SessionProvider } from "next-auth/react";
import FormGenerator from "../../components/forms/form-generator";
import { SidebarNavItem } from "@/types/nav-types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserSubscriptionWrapper from "../../components/forms/form-generator/UserSubscriptionWrapper";

const dashboardConfig: {
  sidebarNav: SidebarNavItem[];
} = {
  sidebarNav: [
    {
      title: "My Forms",
      href: "/view-forms",
      icon: "library",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "settings",
    },
  ],
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-dvh flex-col space-y-6">
      <Header />
      <div className="flex gap-1 sm:gap-2 flex-1 relative">
        <aside className="px-2 border-r top-0 left-0 sticky h-dvh py-4">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <header className="flex flex-wrap gap-4 items-center justify-between p-2 sm:p-4">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <SessionProvider>
              <UserSubscriptionWrapper>
                <FormGenerator size={"sm"} variant="secondary" />
              </UserSubscriptionWrapper>
            </SessionProvider>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
