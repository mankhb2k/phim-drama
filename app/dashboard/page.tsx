import { getSession } from "@/lib/auth/session";
import { EditorDashboard } from "../components/dashboard/EditorDashboard";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/editor/dashboard`,
    { cache: "no-store" },
  );
  const baseData = await res.json();

  if (session.user.role === "ADMIN") {
    const adminRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users?stats=true`,
      { cache: "no-store" },
    );
    const adminData = await adminRes.json();

    return (
      <AdminDashboard
        data={{
          ...baseData,
          totalUsers: adminData.totalUsers,
          blockedUsers: adminData.blockedUsers,
        }}
      />
    );
  }

  return <EditorDashboard data={baseData} />;
}
