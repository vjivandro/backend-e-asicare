import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Database,
    Settings,
    Menu,
    Bell,
    Search,
    Users,
    UserCheck2,
    Newspaper
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import AKGPage from "../pages/AKGPage";
import UserManagementPage from "../pages/UserManagementPage";
import AdminPage from "../pages/AdminPage";
import EdukasiPage from "../pages/EdukasiPage";
import PerilakuMenyusuiPage from "../pages/PerilakuMenyusuiPage";
import KelancaranASIPage from "../pages/KelancaranASIPage";

export default function Layout({ children, user }) {
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState(() => {
        return localStorage.getItem("page") || "edukasi";
    });
    const [openMenu, setOpenMenu] = useState({
        monitoring: true,
    });

    useEffect(() => {
        localStorage.setItem("page", page);
    }, [page]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <div
                className={`h-screen bg-gradient-to-b from-indigo-600 to-purple-600 text-white transition-all duration-300 ${open ? "w-64" : "w-20"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    {open && <h1 className="text-lg font-bold">e-ASI Care</h1>}
                    <button onClick={() => setOpen(!open)}>
                        <Menu />
                    </button>
                </div>

                {/* Menu */}
                <nav className="mt-6 space-y-2">
                    <SidebarItem
                      icon={<LayoutDashboard />}
                      label="Dashboard"
                      open={open}
                      active={page === "dashboard"}
                      onClick={() => setPage("dashboard")}
                    />
                    <div>
                      <SidebarItem
                        icon={<Database />}
                        label={`Monitoring ${openMenu.monitoring ? "▾" : "▸"}`}
                        open={open}
                        active={["akg","menyusui","asi"].includes(page)}
                        onClick={() =>
                          setOpenMenu((prev) => ({
                            ...prev,
                            monitoring: !prev.monitoring,
                          }))
                        }
                      />

                      {open && openMenu.monitoring && (
                        <div className="ml-10 mt-1 space-y-1">
                          <SidebarItem
                            label="Data AKG"
                            open={open}
                            active={page === "akg"}
                            onClick={() => setPage("akg")}
                          />
                          <SidebarItem
                            label="Perilaku Menyusui"
                            open={open}
                            active={page === "menyusui"}
                            onClick={() => setPage("menyusui")}
                          />
                          <SidebarItem
                            label="Kelancaran ASI"
                            open={open}
                            active={page === "asi"}
                            onClick={() => setPage("asi")}
                          />
                        </div>
                      )}
                    </div>

                    <SidebarItem
                      icon={<Newspaper />}
                      label="Edukasi"
                      open={open}
                      active={page === "edukasi"}
                      onClick={() => setPage("edukasi")}
                    />

                    <SidebarItem
                      icon={<Users />}
                      label="Pengguna"
                      open={open}
                      active={page === "users"}
                      onClick={() => setPage("users")}
                    />

                    <SidebarItem
                      icon={<UserCheck2 />}
                      label="Admin"
                      open={open}
                      active={page === "admins"}
                      onClick={() => setPage("admins")}
                    />

                </nav>

                {/* Bottom */}
                <div className="absolute bottom-4 w-full">
                    <SidebarItem icon={<Settings />} label="Settings" open={open} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-100 min-h-screen">
                {/* Navbar */}
                <div className="flex items-center justify-between bg-white px-6 py-3 shadow">
                    {/* Search */}
                    <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-1/3">
                        <Search size={16} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent outline-none ml-2 w-full"
                        />
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <Bell className="cursor-pointer" />

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">{user?.username}</p>
                                <p className="text-gray-500 text-xs">{user?.role}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6">
                  {page === "dashboard" && children}
                  {page === "akg" && <AKGPage />}
                  {page === "menyusui" && <PerilakuMenyusuiPage />}
                  {page === "asi" && <KelancaranASIPage />}
                  {page === "users" && <UserManagementPage />}
                  {page === "admins" && <AdminPage />}
                  {page === "edukasi" && <EdukasiPage />}
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, open, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-xl cursor-pointer transition ${active ? "bg-white/20" : "hover:bg-white/10"
                }`}
        >
            {icon && icon}
            {open && <span className="text-sm">{label}</span>}
        </div>
    );
}