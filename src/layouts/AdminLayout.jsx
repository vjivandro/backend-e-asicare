import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar.jsx";

export default function AdminLayout({ user }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar open={open} setOpen={setOpen} role={user?.role} />

            <div className="flex-1 w-full bg-gray-100">
                <Topbar user={user} onMenuClick={() => setOpen(true)} />

                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
