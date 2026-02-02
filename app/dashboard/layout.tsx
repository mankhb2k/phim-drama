import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth");

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role={session.user.role} />
      <div className="flex flex-col flex-1">
        <Topbar user={session.user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
