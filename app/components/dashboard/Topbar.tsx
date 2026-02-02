export default function Topbar({ user }: { user: any }) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6">
      <span className="text-sm text-slate-400">
        Logged in as <b>{user.username}</b>
      </span>

      <form action="/api/auth/logout" method="post">
        <button className="text-sm text-red-400 hover:text-red-500">
          Logout
        </button>
      </form>
    </header>
  );
}
