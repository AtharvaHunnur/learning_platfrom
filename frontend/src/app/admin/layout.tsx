import AuthGuard from "@/components/auth/AuthGuard";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminAssistant } from "@/components/ai/AdminAssistant";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['admin', 'instructor']}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:pl-[280px] pt-14 lg:pt-0 min-w-0">
          {children}
        </main>
        <AdminAssistant />
      </div>
    </AuthGuard>
  );
}
