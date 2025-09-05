// Auth temporarily disabled

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <nav className="text-sm space-x-4 mb-6">
        <a href="/admin" className="underline">Dashboard</a>
        <a href="/admin/tours" className="underline">Tours</a>
      </nav>
      {children}
    </div>
  );
}
