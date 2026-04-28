import React, { useState, useEffect, useRef } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function KelancaranASIPage() {
    const [dataList, setDataList] = useState([]);
    const [searchDate, setSearchDate] = useState("");
    const [selectedDate, setSelectedDate] = useState();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const calendarRef = useRef(null);

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
            const querySnapshot = await getDocs(collection(db, "kelancaran_asi"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDataList(data);
            setFilteredData(data);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const formatted = selectedDate
            ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
            : "";
        if (!selectedDate) {
            setFilteredData(dataList);
        } else {
            const filtered = dataList.filter(item => item.tanggal === formatted);
            setFilteredData(filtered);
        }
    }, [selectedDate, dataList]);

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
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Kelancaran ASI</h1>
                </div>
    
                <div ref={calendarRef} className="mb-6 bg-white p-4 rounded-xl shadow relative">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-gray-600 font-medium">Filter Tanggal</label>
                    </div>
    
                    <div className="flex gap-2">
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
                                setSearchDate("");
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
                    <table className="w-full text-sm caption-top md:caption-bottom">
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
    
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${item.kategori === "Baik" ? "bg-green-100 text-green-700" : ""}
                                                ${item.kategori === "Cukup" ? "bg-yellow-100 text-yellow-700" : ""}
                                                ${item.kategori === "Kurang" ? "bg-red-100 text-red-700" : ""}
                                            `}>
                                                {item.kategori}
                                            </span>
                                        </td>
    
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${item.status === "Baik" ? "bg-green-100 text-green-700" : ""}
                                                ${item.status === "Perlu Perhatian" ? "bg-yellow-100 text-yellow-700" : ""}
                                                ${item.status === "Risiko" ? "bg-red-100 text-red-700" : ""}
                                            `}>
                                                {item.status || "-"}
                                            </span>
                                        </td>
    
                                        <td className="px-4 py-2">
                                            {Array.isArray(item.rekomendasi) && item.rekomendasi.length > 0 ? (
                                                <ul className="list-disc pl-4 text-sm text-gray-600">
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
