import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"
import UserLayout from "../layouts/UserLayout"
import { AdminGuard, UserGuard } from "./guards"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ADMIN */}
        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="/admin/edukasi" element={<AdminEdukasi />} />
        </Route>

        {/* USER (PWA) */}
        <Route element={<UserGuard><UserLayout /></UserGuard>}>
          <Route path="/app/home" element={<Home />} />
          <Route path="/app/edukasi" element={<UserEdukasi />} />
          <Route path="/app/monitoring" element={<Gizi />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}