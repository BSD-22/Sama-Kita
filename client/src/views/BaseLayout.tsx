import { Outlet } from "react-router";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function BaseLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <Breadcrumbs />
        <div className="px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
