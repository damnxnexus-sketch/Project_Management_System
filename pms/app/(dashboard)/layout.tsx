import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col">
        <TopNav />
        <main className="flex-1 pl-64 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
