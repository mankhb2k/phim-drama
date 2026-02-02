import { StatCard } from "./StatCard";

type EditorDashboardData = {
  totalMovies: number;
  draftMovies: number;
  pendingReview: number;
  videoErrors: number;
};

export function EditorDashboard({ data }: { data: EditorDashboardData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total Movies" value={data.totalMovies} />
      <StatCard label="Draft" value={data.draftMovies} />
      <StatCard
        label="Pending Review"
        value={data.pendingReview}
        tone="warning"
      />
      <StatCard label="Video Errors" value={data.videoErrors} tone="danger" />
    </div>
  );
}
