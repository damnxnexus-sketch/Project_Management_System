import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let currentUser = null;
  let allUsers: any[] = [];

  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
    if (user) {
      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        avatar: user.avatar || ''
      };
    }
    const dbUsers = await prisma.user.findMany();
    allUsers = dbUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar || ''
    }));
  }

  return (
    <div className="flex min-h-screen">
      <SkipToContent />
      {currentUser && <StoreInitializer currentUser={currentUser} allUsers={allUsers} />}
      <Sidebar />
      <div className="flex w-full flex-col">
        <TopNav />
        <main id="main-content" className="flex-1 md:pl-64 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
      <OnboardingTour />
    </div>
  );
}
