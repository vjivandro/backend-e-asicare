import { Navigate, Routes, Route, Outlet } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"
import AdminEdukasi from "../modules/admin/edukasi/AdminEdukasi.jsx";
import AdminDashboard from "../modules/admin/dashboard/AdminDashboard.jsx";
import AdminAsi from "../modules/admin/monitoring/AdminAsi.jsx";
import AdminMenyusui from "../modules/admin/monitoring/AdminMenyusui.jsx";
import AdminGizi from "../modules/admin/monitoring/AdminGizi.jsx";
import UserManagement from "../modules/admin/user-management/UserManagement.jsx";
import AdminManagement from "../modules/admin/user-management/AdminManagement.jsx";
import UserLayout from "../layouts/UserLayout";
import Home from "../modules/user/home/Home.jsx";
import UserEdukasi from "../modules/user/edukasi/UserEdukasi.jsx";
import Login from "../auth/Login.jsx";
import Register from "../auth/register.jsx";
import TargetGizi from "../modules/user/monitoring/TargetGizi.jsx";
import ChatAsisten from "../modules/user/chat/ChatAsisten.jsx";
import Gallery from "../modules/user/gallery/Gallery.jsx";
import AddMasterMakanan from "../modules/admin/monitoring/AddMasterMakanan.jsx";
import MasterPangan from "../modules/admin/monitoring/MasterPangan.jsx";
import FoodDiary from "../modules/user/monitoring/FoodDiary.jsx";
import ChecklistKesehatan from "../modules/user/monitoring/ChecklistKesehatan.jsx";
import AdminKesehatanNifas from "../modules/admin/monitoring/AdminKesehatanNifas.jsx";
import Menyusui from "../modules/user/monitoring/Menyusui.jsx";
import KelancaranAsi from "../modules/user/monitoring/KelancaranAsi.jsx";
import KuesionerPengetahuan from "../modules/user/monitoring/pengetahuan/KuesionerPengetahuan.jsx";
import Profile from "../modules/user/profile/Profile.jsx";
import KuesionerSikap from "../modules/user/monitoring/sikap/KuesionerSikap.jsx";
import MonitoringKuesioner from "../modules/admin/monitoring/MonitoringKuesioner.jsx";
import HalamanNotifikasi from "../modules/user/profile/HalamanNotifikasi.jsx";

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

            <Route element={<GuestRoute user={user} />}>
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<AdminRoute user={user} />}>
                <Route path="/admin" element={<AdminLayout user={user} />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="edukasi" element={<AdminEdukasi />} />
                    <Route path="monitoring/gizi" element={<AdminGizi />} />
                    <Route path="monitoring/makanan" element={<MasterPangan />} />
                    <Route path="monitoring/makanan/tambah" element={<AddMasterMakanan />} />
                    <Route path="monitoring/kesehatan-nifas" element={<AdminKesehatanNifas />} />
                    <Route path="monitoring/menyusui" element={<AdminMenyusui />} />
                    <Route path="monitoring/kelancaran-asi" element={<AdminAsi />} />
                    <Route path="monitoring/kuesioner" element={<MonitoringKuesioner />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="admins" element={<AdminManagement />} />
                    <Route path="notifikasi" element={<HalamanNotifikasi />} />
                </Route>
            </Route>

            <Route element={<UserRoute user={user} />}>
                <Route path="/user" element={<UserLayout user={user} />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<Home user={user} />} />
                    <Route path="target-gizi" element={<TargetGizi />} />
                    <Route path="monitoring/makanan" element={<FoodDiary />} />
                    <Route path="monitoring/kesehatan-nifas" element={<ChecklistKesehatan />} />
                    <Route path="monitoring/menyusui" element={<Menyusui />} />
                    <Route path="monitoring/kelancaran-asi" element={<KelancaranAsi />} />
                    <Route path="monitoring/pengetahuan" element={<KuesionerPengetahuan />} />
                    <Route path="monitoring/sikap" element={<KuesionerSikap />} />
                    <Route path="edukasi" element={<UserEdukasi />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="chat-asisten" element={<ChatAsisten />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="notifikasi" element={<HalamanNotifikasi />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
