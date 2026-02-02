import { EditorDashboard } from "./EditorDashboard";
import { StatCard } from "./StatCard";

type AdminDashboardData = {
  totalMovies: number;
  draftMovies: number;
  pendingReview: number;
  videoErrors: number;

  totalUsers: number;
  blockedUsers: number;
};

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-6">
      {/* Editor section */}
      <EditorDashboard data={data} />

      {/* Admin section */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-400">
          Admin Overview
        </h2>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={data.totalUsers} />
          <StatCard
            label="Blocked Users"
            value={data.blockedUsers}
            tone="danger"
          />
        </div>
      </div>
    </div>
  );
}
