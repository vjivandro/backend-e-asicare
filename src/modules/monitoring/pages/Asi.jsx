import { useState, useEffect, useRef } from "react";
import { getKelancaranASI } from "../monitoringService";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Asi() {
    const [dataList, setDataList] = useState([]);
    const [selectedDate, setSelectedDate] = useState();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);
    const filteredData = selectedDate
        ? dataList.filter(item => {
            const formatted = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
            return item.tanggal === formatted;

        })

        : dataList;

useEffect(() => {
    const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getKelancaranASI();
            setDataList(data);
        };

        fetchData();
    }, []);

    const formatTanggalIndo = (dateInput, withTime = false) => {
        const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

        const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        const tanggal = `${hari[date.getDay()]}, ${String(date.getDate()).padStart(2, "0")} ${bulan[date.getMonth()]} ${date.getFullYear()}`;

        if (!withTime) return tanggal;

        const jam = String(date.getHours()).padStart(2, "0");
        const menit = String(date.getMinutes()).padStart(2, "0");

        return `${tanggal} ${jam}:${menit} WIB`;
    };

    return (
        <div className="w-full p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-xl md:text-3xl font-bold text-gray-800">Kelancaran ASI</h1>
            </div>

            <div ref={calendarRef} className="mb-6 bg-white p-4 rounded-xl shadow relative">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-gray-600 font-medium">Filter Tanggal</label>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        readOnly
                        value={
                            selectedDate
                                ? formatTanggalIndo(selectedDate)
                                : ""
                        }
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        placeholder="Pilih tanggal"
                        className="w-full border px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={() => {
                            setSelectedDate(undefined);
                            setIsCalendarOpen(false);
                        }}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                    >
                        Reset
                    </button>
                </div>

                {isCalendarOpen && (
                    <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-lg p-2">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date);
                                setIsCalendarOpen(false);
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                            <th className="px-4 py-2 text-left">User</th>
                            <th className="px-4 py-2 text-left">Skor</th>
                            <th className="px-4 py-2 text-left">Kategori</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Rekomendasi</th>
                            <th className="px-4 py-2 text-left">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-400">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="px-4 py-2">{item.userId}</td>
                                    <td className="px-4 py-2">{item.skorTotal}</td>

                                    <td className="px-4 py-2">{item.kategori}</td>
                                    <td className="px-4 py-2">{item.status || "-"}</td>

                                    <td className="px-4 py-2">
                                        {Array.isArray(item.rekomendasi) && item.rekomendasi.length > 0 ? (
                                            <ul className="list-disc pl-4 text-sm text-gray-600 break-words">
                                                {item.rekomendasi.map((r, idx) => (
                                                    <li key={idx}>{r}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    <td className="px-4 py-2">
                                        {item.createdAt
                                            ? formatTanggalIndo(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt, true)
                                            : formatTanggalIndo(item.tanggal)
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
