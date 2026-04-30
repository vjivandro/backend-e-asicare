import { Navigate, Routes, Route, Outlet } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"
import AdminEdukasi from "../modules/edukasi/pages/AdminEdukasi";
import AdminDashboard from "../modules/user/pages/AdminDashboard";
import Asi from "../modules/monitoring/pages/Asi.jsx";
import Menyusui from "../modules/monitoring/pages/Menyusui.jsx";
import Gizi from "../modules/monitoring/pages/Gizi.jsx";
import UserManagement from "../modules/user/pages/UserManagement.jsx";
import AdminManagement from "../modules/user/pages/AdminManagement.jsx";
import UserLayout from "../layouts/UserLayout";
import Home from "../modules/user/pages/Home.jsx";
import Login from "../auth/Login.jsx";
import Register from "../auth/register.jsx";

function AdminRoute({ user }) {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "superadmin") return <Navigate to="/user/home" replace />;
    return <Outlet />;
}

function UserRoute({ user }) {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "user") return <Navigate to="/admin/dashboard" replace />;
    return <Outlet />;
}

function GuestRoute({ user }) {
    if (user?.role === "superadmin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "user") return <Navigate to="/user/home" replace />;
    return <Outlet />;
}


export default function AppRoutes({ user, setUser }) {
    return (
        <Routes>
            {/* Root redirect berdasarkan role */}
            <Route
                path="/"
                element={
                    user?.role === "superadmin" ? <Navigate to="/admin/dashboard" replace /> :
                        user?.role === "user" ? <Navigate to="/user/home" replace /> :
                            <Navigate to="/login" replace />
                }
            />

            {/* ✅ Guest routes — tidak bisa diakses kalau sudah login */}
            <Route element={<GuestRoute user={user} />}>
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* ✅ Admin routes — hanya superadmin */}
            <Route element={<AdminRoute user={user} />}>
                <Route path="/admin" element={<AdminLayout user={user} />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="edukasi" element={<AdminEdukasi />} />
                    <Route path="monitoring/gizi" element={<Gizi />} />
                    <Route path="monitoring/menyusui" element={<Menyusui />} />
                    <Route path="monitoring/asi" element={<Asi />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="admins" element={<AdminManagement />} />
                </Route>
            </Route>

            {/* ✅ User routes — hanya role user */}
            <Route element={<UserRoute user={user} />}>
                <Route path="/user" element={<UserLayout user={user} />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<Home />} />
                </Route>
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
