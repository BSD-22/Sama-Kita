import { Link, useLocation } from "react-router";
import { Bot, LayoutDashboard, SquareActivity, MessageCircle, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("email") || "user@email.com";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menuItems = [
    {
      category: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      items: [
        { name: "Overview", path: "/" },
        { name: "Graph Performance", path: "/graph" },
        { name: "Front Desk", path: "/frontdesk" },
      ],
    },
    {
      category: "Properties",
      icon: <Bot className="w-4 h-4" />,
      items: [
        { name: "Property List", path: "/property" },
        { name: "Add Property", path: "/property/add" },
      ],
    },
    {
      category: "Expenses",
      icon: <SquareActivity className="w-4 h-4" />,
      items: [
        { name: "Maintenance", path: "/expenses/maintenance" },
        { name: "Add Expenses", path: "/expenses/add" },
      ],
    },
  ];

  return (
    <div className={cn("relative flex flex-col h-full bg-white border-r transition-all duration-300 ease-in-out", isCollapsed ? "w-20" : "w-64", className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border rounded-full p-1.5 hover:bg-gray-100">
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header/Logo Section */}
      <div className="p-4 border-b">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">SK</div>
          {!isCollapsed && <span className="font-semibold text-xl">Sama Kita</span>}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section, idx) => (
          <div
            key={idx}
            className="mb-4">
            <div className={cn("px-4 mb-2 flex items-center gap-2 text-sm font-medium text-gray-600", isCollapsed && "justify-center")}>
              <div className="shrink-0">{section.icon}</div>
              {!isCollapsed && <span>{section.category}</span>}
            </div>
            {!isCollapsed &&
              section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 text-sm block transition-all duration-200",
                    location.pathname === item.path ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100",
                    isCollapsed && "text-center"
                  )}>
                  {item.name}
                </Link>
              ))}
          </div>
        ))}
      </div>

      {/* Customer Service */}
      <div className="px-4 py-3 border-t border-b">
        <a
          href="https://wa.me/+6282249013283"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors", isCollapsed && "justify-center")}>
          <MessageCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Customer Service</span>}
        </a>
      </div>

      {/* User Profile Section - Updated */}
      <div className="border-t mt-auto">
        <button
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
          className={cn("w-full p-4 hover:bg-gray-50 transition-colors", isProfileExpanded && "bg-gray-50")}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">SK</div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            )}
          </div>
        </button>

        {/* Logout Button with Animation */}
        <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isProfileExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0")}>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
