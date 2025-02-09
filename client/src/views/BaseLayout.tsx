import { Outlet } from "react-router";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

export default function BaseLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.access_token) {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [navigate]);

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
