import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar.jsx";

export default function UserLayout({ user}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <Sidebar open={open} setOpen={setOpen} role="user" />

            {/* Main */}
            <div className="flex-1 w-full bg-gray-100">

                <Topbar user={user} onMenuClick={() => setOpen(true)} />

                {/* Content */}
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>

            </div>
        </div>
    );
}
