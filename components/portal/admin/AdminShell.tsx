import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark text-[#e5e5e5]">
      <AdminSidebar />
      <div className="md:ml-[200px]">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
