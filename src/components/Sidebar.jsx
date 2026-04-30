import { useState } from "react";
import {
    LayoutDashboard, Database, Settings, Menu,
    Users, UserCheck2, Newspaper, Image, MessageCircle
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ open, setOpen, role }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [openMenu, setOpenMenu] = useState({ monitoring: true });

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (window.innerWidth < 768) setOpen(false);
    };

    return (
        <>
            {/* Backdrop mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 z-[55] md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={`
                    fixed md:static top-0 left-0 z-[60]
                    h-screen flex-shrink-0
                    bg-gradient-to-b from-indigo-600 to-purple-600 text-white
                    transition-all duration-300
                    ${open
                    ? "translate-x-0 w-64"
                    : "-translate-x-full md:translate-x-0 w-64 md:w-20"
                }
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    {open && <h1 className="text-lg font-bold">e-ASI Care</h1>}
                    <button onClick={() => setOpen(!open)} className="p-1 hover:bg-white/10 rounded-lg">
                        <Menu />
                    </button>
                </div>

                <nav className="mt-6 space-y-2">
                    {/* Dashboard */}
                    <SidebarItem
                        icon={<LayoutDashboard />}
                        label="Dashboard"
                        open={open}
                        // ✅ FIX: "admin" → "superadmin"
                        active={isActive(role === "superadmin" ? "/admin/dashboard" : "/user/home")}
                        onClick={() => handleNavigate(role === "superadmin" ? "/admin/dashboard" : "/user/home")}
                    />

                    {/* Monitoring - superadmin only */}
                    {/* ✅ FIX: "admin" → "superadmin" */}
                    {role === "superadmin" && (
                        <div>
                            <SidebarItem
                                icon={<Database />}
                                label={`Monitoring ${openMenu.monitoring ? "▾" : "▸"}`}
                                open={open}
                                active={[
                                    "/admin/monitoring/gizi",
                                    "/admin/monitoring/menyusui",
                                    "/admin/monitoring/asi"
                                ].includes(location.pathname)}
                                onClick={() =>
                                    setOpenMenu((prev) => ({ ...prev, monitoring: !prev.monitoring }))
                                }
                            />
                            {open && openMenu.monitoring && (
                                <div className="ml-10 mt-1 space-y-1">
                                    <SidebarItem label="Data AKG" open={open} active={isActive("/admin/monitoring/gizi")} onClick={() => handleNavigate("/admin/monitoring/gizi")} />
                                    <SidebarItem label="Perilaku Menyusui" open={open} active={isActive("/admin/monitoring/menyusui")} onClick={() => handleNavigate("/admin/monitoring/menyusui")} />
                                    <SidebarItem label="Kelancaran ASI" open={open} active={isActive("/admin/monitoring/asi")} onClick={() => handleNavigate("/admin/monitoring/asi")} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Edukasi */}
                    <SidebarItem
                        icon={<Newspaper />}
                        label="Edukasi"
                        open={open}
                        // ✅ FIX: "admin" → "superadmin"
                        active={isActive(role === "superadmin" ? "/admin/edukasi" : "/user/edukasi")}
                        onClick={() => handleNavigate(role === "superadmin" ? "/admin/edukasi" : "/user/edukasi")}
                    />

                    {/* Gallery - user only */}
                    {role === "user" && (
                        <SidebarItem icon={<Image />} label="Gallery" open={open} active={isActive("/user/gallery")} onClick={() => handleNavigate("/user/gallery")} />
                    )}

                    {/* Chat - user only */}
                    {role === "user" && (
                        <SidebarItem icon={<MessageCircle />} label="Chat" open={open} active={isActive("/user/chat")} onClick={() => handleNavigate("/user/chat")} />
                    )}

                    {/* Pengguna & Admin - superadmin only (sudah benar) */}
                    {role === "superadmin" && (
                        <SidebarItem icon={<Users />} label="Pengguna" open={open} active={isActive("/admin/users")} onClick={() => handleNavigate("/admin/users")} />
                    )}
                    {role === "superadmin" && (
                        <SidebarItem icon={<UserCheck2 />} label="Admin" open={open} active={isActive("/admin/admins")} onClick={() => handleNavigate("/admin/admins")} />
                    )}

                    {/* Profil - user only */}
                    {role === "user" && (
                        <SidebarItem icon={<Users />} label="Profil" open={open} active={isActive("/user/profile")} onClick={() => handleNavigate("/user/profile")} />
                    )}
                </nav>

                {/* Bottom */}
                <div className="absolute bottom-4 w-full space-y-2 px-2">
                    <SidebarItem icon={<Settings />} label="Settings" open={open} />
                    <SidebarItem label="Logout" open={open} onClick={handleLogout} />
                </div>
            </div>
        </>
    );
}

function SidebarItem({ icon, label, open, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center ${open ? "gap-3 px-4" : "justify-center"} py-3 mx-2 rounded-xl cursor-pointer transition ${active ? "bg-white/20" : "hover:bg-white/10"}`}
        >
            {icon && icon}
            {open && <span className="text-sm">{label}</span>}
        </div>
    );
}
