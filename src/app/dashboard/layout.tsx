import AuthGuard from "@/components/auth/AuthGuard";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { StudentAssistant } from "@/components/ai/StudentAssistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="min-h-screen bg-background">
        <StudentSidebar />
        <main className="lg:pl-[280px] pt-14 lg:pt-0 min-w-0">
          {children}
        </main>
        <StudentAssistant />
      </div>
    </AuthGuard>
  );
}
