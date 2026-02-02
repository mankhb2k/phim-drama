type Role = "EDITOR" | "ADMIN";

const nav = [
  { label: "Dashboard", href: "/dashboard", roles: ["EDITOR", "ADMIN"] },
  { label: "Movies", href: "/dashboard/movies", roles: ["EDITOR", "ADMIN"] },
  {
    label: "Pending Movies",
    href: "/dashboard/admin/movies/pending",
    roles: ["ADMIN"],
  },
  { label: "Users", href: "/dashboard/admin/users", roles: ["ADMIN"] },
];

export default function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="w-64 bg-panel border-r border-border p-4">
      <h1 className="text-lg font-semibold mb-6">Dashboard</h1>

      <nav className="space-y-2">
        {nav
          .filter((i) => i.roles.includes(role))
          .map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md hover:bg-slate-800"
            >
              {item.label}
            </a>
          ))}
      </nav>
    </aside>
  );
}
