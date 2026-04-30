import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    const menus = [
        { title: "Edukasi", path: "/user/edukasi", color: "bg-pink-100" },
        { title: "Monitoring", path: "/user/monitoring", color: "bg-blue-100" },
    ];

    return (
        <div className="space-y-4">

            {/* Title */}
            <h1 className="text-xl font-bold">Dashboard User</h1>

            <p className="text-gray-600 text-sm">
                Selamat datang di e-ASI Care 👶
            </p>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4">
                {menus.map((menu) => (
                    <div
                        key={menu.title}
                        onClick={() => navigate(menu.path)}
                        className={`${menu.color} p-4 rounded-xl text-center cursor-pointer hover:shadow transition`}
                    >
                        <p className="font-semibold">{menu.title}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}
