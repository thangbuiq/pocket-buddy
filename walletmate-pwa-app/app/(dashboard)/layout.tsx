import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { Sidebar } from "@/components/shared/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <OfflineBanner />
        <main className="mx-auto w-full max-w-[940px] flex-1 px-4 py-8 sm:px-6 md:px-8 md:py-16">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
