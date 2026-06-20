import {
    LayoutDashboard,
    Settings,
    Menu,
    Users,
    UserCheck2,
    Newspaper,
    Image,
    MessageCircle,
    ChevronDown,
    ChevronRight,
    LogOut,
    Target,
    Utensils,
    HeartPulse,
    Baby,
    Droplets,
    Activity, CircleUserRound, BookOpen, Heart, ListTodo, TargetIcon, HandPlatter
} from "lucide-react";
import {signOut} from "firebase/auth";
import {auth} from "../services/firebase";
import {useNavigate, useLocation} from "react-router-dom";
import TargetGizi from "../modules/user/monitoring/TargetGizi.jsx";

export default function Sidebar({open, setOpen, role}) {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = role === "superadmin" ? "/admin" : "/user";
    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            await signOut(auth);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (window.innerWidth < 768) setOpen(false);
    };

    return (<>
        {/* Backdrop Mobile */}
        {open && (<div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden transition-opacity"
            onClick={() => setOpen(false)}
        />)}

        {/* Sidebar Container */}
        <div
            className={`
        fixed top-0 left-0 z-[60] h-screen flex flex-col
        bg-gradient-to-b from-[#FF85B3] to-[#FF6B9E] text-white shadow-2xl
        transition-all duration-300 ease-in-out
        ${open ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-0 md:w-20"}
    `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 h-[76px] shrink-0">
                {open && (<div className="flex items-center gap-3 overflow-hidden">
                    <div
                        className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center font-bold shadow-lg shadow-pink-500/30 shrink-0">
                        e
                    </div>
                    <h1 className="text-xl font-bold tracking-wide whitespace-nowrap">
                        e-ASI Care
                    </h1>
                </div>)}
                <button
                    onClick={() => setOpen(!open)}
                    className={`p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors ${!open && "mx-auto"}`}
                >
                    <Menu size={22}/>
                </button>
            </div>

            {/* Navigasi Utama (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-6 space-y-1.5 custom-scrollbar hidden-scrollbar">

                {/* Dashboard */}
                <SidebarItem
                    icon={<LayoutDashboard size={20}/>}
                    label="Dashboard"
                    open={open}
                    active={isActive(`${basePath}/dashboard`) || isActive(`${basePath}/home`)}
                    onClick={() => handleNavigate(`${basePath}/home`)}
                />

                {/* SECTION USER (DENGAN SEGMENT) */}
                {role === "user" && (
                    <>
                        {/* Segmen 1: Pemantauan Gizi */}
                        <div className="pt-4 pb-2">
                            {open &&
                                <p className="px-6 text-[11px] font-bold text-white/40 uppercase tracking-wider">Monitoring</p>}
                        </div>
                        <SidebarItem
                            icon={<Target size={20}/>}
                            label="Target Gizi"
                            open={open}
                            active={isActive(`${basePath}/target-gizi`)}
                            onClick={() => handleNavigate(`${basePath}/target-gizi`)}
                        />
                        <SidebarItem
                            icon={<Utensils size={20}/>}
                            label="Catat Makan"
                            open={open}
                            active={isActive("/user/monitoring/makanan")}
                            onClick={() => handleNavigate("/user/monitoring/makanan")}
                        />

                        <SidebarItem
                            icon={<HeartPulse size={20}/>}
                            label="Kesehatan Nifas"
                            open={open}
                            active={isActive("/user/monitoring/kesehatan-nifas")}
                            onClick={() => handleNavigate("/user/monitoring/kesehatan-nifas")}
                        />

                        <SidebarItem
                            icon={<Baby size={20}/>}
                            label="Perilaku Menyusui"
                            open={open}
                            active={isActive("/user/monitoring/menyusui")}
                            onClick={() => handleNavigate("/user/monitoring/menyusui")}
                        />

                        {/* Kelancaran ASI */}
                        <SidebarItem
                            icon={<Droplets size={20}/>}
                            label="Kelancaran ASI"
                            open={open}
                            active={isActive("/user/monitoring/kelancaran-asi")}
                            onClick={() => handleNavigate("/user/monitoring/kelancaran-asi")}
                        />

                        {/* Pengetahuan */}
                        <SidebarItem
                            icon={<BookOpen size={20} />}
                            label="Pengetahuan"
                            open={open}
                            active={isActive("/user/monitoring/pengetahuan")}
                            onClick={() => handleNavigate("/user/monitoring/pengetahuan")}
                        />

                        {/* Sikap */}
                        <SidebarItem
                            icon={<Heart size={20} />}
                            label="Sikap"
                            open={open}
                            active={isActive("/user/monitoring/sikap")}
                            onClick={() => handleNavigate("/user/monitoring/sikap")}
                        />

                        {/* Segmen 2: Fitur Layanan */}
                        <div className="pt-4 pb-2">
                            {open &&
                                <p className="px-6 text-[11px] font-bold text-white/40 uppercase tracking-wider">Layanan</p>}
                        </div>
                        <SidebarItem
                            icon={<Image size={20}/>}
                            label="Gallery"
                            open={open}
                            active={isActive("/user/gallery")}
                            onClick={() => handleNavigate("/user/gallery")}
                        />
                        <SidebarItem
                            icon={<MessageCircle size={20}/>}
                            label="Chat Asisten"
                            open={open}
                            active={isActive("/user/chat-asisten")}
                            onClick={() => handleNavigate("/user/chat-asisten")}
                        />
                    </>
                )}

                {/* Edukasi */}
                <SidebarItem
                    icon={<Newspaper size={20}/>}
                    label="Edukasi"
                    open={open}
                    active={isActive(`${basePath}/edukasi`)}
                    onClick={() => handleNavigate(`${basePath}/edukasi`)}
                />

                {/* SECTION MANAJEMEN (Superadmin Only) */}
                {role === "superadmin" && (<>
                    <div className="pt-4 pb-2">
                        {open &&
                            <p className="px-6 text-[11px] font-bold text-white/40 uppercase tracking-wider">Data Master</p>}
                    </div>
                    {/* Item Master yang tadinya submenu sekarang jadi section utama */}
                    <SidebarItem
                        icon={<Activity size={20}/>}
                        label="AKG"
                        open={open}
                        active={isActive("/admin/monitoring/master-akg")}
                        onClick={() => handleNavigate("/admin/monitoring/master-akg")}
                    />

                    <SidebarItem
                        icon={<HandPlatter size={20}/>}
                        label="Makanan"
                        open={open}
                        active={isActive("/admin/monitoring/makanan")}
                        onClick={() => handleNavigate("/admin/monitoring/makanan")}
                    />

                    <div className="pt-4 pb-2">
                        {open &&
                            <p className="px-6 text-[11px] font-bold text-white/40 uppercase tracking-wider">Manajemen
                                Monitoring</p>}
                    </div>
                    {/* Item Monitoring yang tadinya submenu sekarang jadi section utama */}
                    <SidebarItem
                        icon={<TargetIcon size={20}/>}
                        label="Target Gizi Ibu"
                        open={open}
                        active={isActive("/admin/monitoring/gizi")}
                        onClick={() => handleNavigate("/admin/monitoring/gizi")}
                    />

                    <SidebarItem
                        icon={<Utensils size={20}/>}
                        label="Catatan Makan Ibu"
                        open={open}
                        active={isActive("/admin/monitoring/catatan-makan-ibu")}
                        onClick={() => handleNavigate("/admin/monitoring/catatan-makan-ibu")}
                    />

                    <SidebarItem
                        icon={<HeartPulse size={20}/>}
                        label="Kesehatan Nifas"
                        open={open}
                        active={isActive("/admin/monitoring/kesehatan-nifas")}
                        onClick={() => handleNavigate("/admin/monitoring/kesehatan-nifas")}
                    />

                    <SidebarItem
                        icon={<Baby size={20}/>}
                        label="Perilaku Menyusui"
                        open={open}
                        active={isActive("/admin/monitoring/menyusui")}
                        onClick={() => handleNavigate("/admin/monitoring/menyusui")}
                    />

                    <SidebarItem
                        icon={<Droplets size={20}/>}
                        label="Kelancaran ASI"
                        open={open}
                        active={isActive("/admin/monitoring/kelancaran-asi")}
                        onClick={() => handleNavigate("/admin/monitoring/kelancaran-asi")}
                    />

                    <SidebarItem
                        icon={<ListTodo size={20}/>}
                        label="Kuesioner"
                        open={open}
                        active={isActive("/admin/monitoring/kuesioner")}
                        onClick={() => handleNavigate("/admin/monitoring/kuesioner")}
                    />

                    <div className="pt-4 pb-2">
                        {open &&
                            <p className="px-6 text-[11px] font-bold text-white/40 uppercase tracking-wider">Manajemen
                                Akses</p>}
                    </div>
                    <SidebarItem icon={<Users size={20}/>} label="Pengguna" open={open}
                                 active={isActive("/admin/users")}
                                 onClick={() => handleNavigate("/admin/users")}/>
                    <SidebarItem icon={<UserCheck2 size={20}/>} label="Admin" open={open}
                                 active={isActive("/admin/admins")}
                                 onClick={() => handleNavigate("/admin/admins")}/>
                </>)}

                {/* Profil (User Only) */}
                {role === "user" && (
                    <SidebarItem icon={<CircleUserRound size={20}/>} label="Profil" open={open}
                                 active={isActive("/user/profile")}
                                 onClick={() => handleNavigate("/user/profile")}/>
                )}
            </div>

            {/* Bagian Bawah (Setting & Logout) */}
            <div className="p-4 border-t border-white/10 space-y-1 bg-black/10 shrink-0">
                <SidebarItem
                    icon={<Settings size={20}/>}
                    label="Pengaturan"
                    open={open}
                    active={isActive(`${basePath}/settings`)}
                    onClick={() => handleNavigate(`${basePath}/settings`)}
                />
                <SidebarItem
                    icon={<LogOut size={20}/>}
                    label="Logout"
                    open={open}
                    onClick={handleLogout}
                    isDanger
                />
            </div>
        </div>
    </>);
}

// Kembalikan SidebarItem ke versi aslinya (tanpa isSubItem indentasi)
function SidebarItem({icon, label, open, active, onClick, isDropdown, isOpen, isDanger}) {
    return (<div
        onClick={onClick}
        className={`
                flex items-center ${open ? "justify-between px-4" : "justify-center px-0"} 
                py-3 mx-3 my-0.5 rounded-xl cursor-pointer transition-all duration-200 group
                ${active ? "bg-white/20 text-white shadow-sm border border-white/5" : "text-white/60 hover:bg-white/10 hover:text-white"}
                ${isDanger ? "hover:bg-red-500/20 hover:text-red-300" : ""}
            `}
        title={!open ? label : ""} // Tooltip saat ditutup
    >
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                {icon}
            </div>
            {open && (<span
                className={`text-sm font-medium tracking-wide whitespace-nowrap transition-opacity duration-300`}>
                {label}
            </span>)}
        </div>

        {open && isDropdown && (<div className="text-white/40 group-hover:text-white/80 transition-colors">
            {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
        </div>)}
    </div>);
}
