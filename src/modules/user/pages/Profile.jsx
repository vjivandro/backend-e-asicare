import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Activity, Image, MessageCircle, User } from "lucide-react";

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { label: "Dashboard", path: "/user/home", icon: <LayoutDashboard size={18} /> },
    { label: "Edukasi", path: "/user/edukasi", icon: <BookOpen size={18} /> },
    { label: "Monitoring", path: "/user/monitoring", icon: <Activity size={18} /> },
    { label: "Gallery", path: "/user/gallery", icon: <Image size={18} /> },
    { label: "Chat", path: "/user/chat", icon: <MessageCircle size={18} /> },
    { label: "Profil", path: "/user/profile", icon: <User size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white p-4">
        <h1 className="text-lg font-bold mb-6">e-ASI Care</h1>

        <nav className="space-y-2">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;

            return (
              <div
                key={menu.path}
                onClick={() => navigate(menu.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                  isActive ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {menu.icon}
                <span>{menu.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">

        {/* Topbar */}
        <div className="bg-white shadow px-6 py-3 font-semibold">
          User Panel
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>

      </div>

    </div>
  );
}
