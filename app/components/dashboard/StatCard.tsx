type Props = {
  label: string;
  value: number | string;
  tone?: "default" | "warning" | "danger";
};

export function StatCard({ label, value, tone = "default" }: Props) {
  const toneClass =
    tone === "warning"
      ? "text-[var(--color-warning)]"
      : tone === "danger"
        ? "text-[var(--color-danger)]"
        : "text-white";

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
