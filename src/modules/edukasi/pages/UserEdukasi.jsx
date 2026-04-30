import { useEffect, useState } from "react";
import { getEdukasi } from "../edukasiService";

export default function UserEdukasi() {
    const [data, setData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const result = await getEdukasi();
        setData(result);
    };

    return (
        <div>
            <h1 className="text-lg font-semibold mb-4">Edukasi</h1>

            <div className="space-y-3">
                {data.map((item) => (
                    <div key={item.id} className="p-4 bg-white rounded shadow">
                        <h2 className="font-semibold">{item.judul}</h2>
                        <p className="text-sm text-gray-600">{item.deskripsi}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
