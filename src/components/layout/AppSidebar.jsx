import React, { useState } from "react";
import { LayoutDashboard, Package, Users, FileText, AlertTriangle, ClipboardList, Activity, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Manage Products", url: "/admin/products", icon: Package },
  { title: "Manage Suppliers", url: "/admin/suppliers", icon: Users },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Alerts", url: "/admin/alerts", icon: AlertTriangle },
];

const staffItems = [
  { title: "Log Stock", url: "/staff", icon: ClipboardList },
  { title: "View Alerts", url: "/staff/alerts", icon: AlertTriangle },
  { title: "My Activity", url: "/staff/activity", icon: Activity },
];

export function AppSidebar({ role }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const items = role === "admin" ? adminItems : staffItems;

  return (
    <aside className={`min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="px-6 py-5">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
              <p className="text-xs text-gray-500 capitalize">{role} Panel</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 mx-auto">
            <Package className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      <nav className="px-2 py-3">
        <div className={!isCollapsed ? "mb-2 px-3" : "sr-only"}>
          <span className="text-xs font-medium text-gray-500">Menu</span>
        </div>
        
        {items.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors
                ${isActive 
                  ? "bg-blue-50 text-blue-600 font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4">
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => {
            localStorage.removeItem('user');
          }}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </NavLink>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm"
      >
        <Package className="h-4 w-4 text-gray-600" />
      </button>
    </aside>
  );
}
