import React, { useState, useEffect, useRef } from "react";
import { User, Lock, LogOut, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { auth, db } from "../../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth"; // <-- Tambahan onAuthStateChanged
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState("personal");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Simpan data user auth (UID, role, dll)
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        phone: "",
        dob: "",
        location: "Jember, Jawa Timur",
        postalCode: "",
    });

    // 1. Ambil Data User langsung dari Firebase Auth secara mandiri
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setCurrentUserInfo({ uid: currentUser.uid, role: data.role });

                        // Pecah username menjadi first name & last name
                        const nameParts = (data.username || "").split(" ");

                        setFormData({
                            firstName: nameParts[0] || "",
                            lastName: nameParts.slice(1).join(" ") || "",
                            email: data.email || currentUser.email || "",
                            address: data.address || "",
                            phone: data.phone || "",
                            dob: data.dob || "",
                            location: data.location || "Jember, Jawa Timur",
                            postalCode: data.postalCode || "",
                        });
                        setProfilePhoto(data.photoURL || currentUser.photoURL || "");
                    }
                } catch (error) {
                    console.error("Gagal mengambil data profil:", error);
                } finally {
                    setLoading(false); // Matikan loading setelah selesai
                }
            } else {
                setLoading(false);
            }
        });

        // Cleanup listener saat komponen ditutup
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentUserInfo?.uid) return;

        setSaving(true);
        try {
            const docRef = doc(db, "users", currentUserInfo.uid);
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            await updateDoc(docRef, {
                username: fullName,
                address: formData.address,
                phone: formData.phone,
                dob: formData.dob,
                location: formData.location,
                postalCode: formData.postalCode,
                photoURL: profilePhoto
            });

            alert("Profil berhasil diperbarui! 🎉");
        } catch (error) {
            console.error("Gagal menyimpan profil:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        if (window.confirm("Apakah Bunda yakin ingin keluar dari akun?")) {
            try {
                await signOut(auth);
                navigate("/login");
            } catch (error) {
                console.error("Gagal logout:", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#D81B60]">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">

                {/* ================= LEFT SIDEBAR ================= */}
                <div className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col items-center">

                    {/* Foto Profil */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-[#D81B60] to-[#FF6B9E] flex items-center justify-center text-white text-4xl font-bold uppercase">
                                    {formData.firstName ? formData.firstName.charAt(0) : "U"}
                                </div>
                            )}
                        </div>

                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />

                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-1 right-1 w-8 h-8 bg-[#D81B60] hover:bg-[#b0164e] text-white rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white"
                        >
                            <Camera size={14} />
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 text-center capitalize">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-[#D81B60] text-xs font-bold tracking-widest uppercase mt-1 mb-8">
                        {currentUserInfo?.role || "USER"}
                    </p>

                    <div className="w-full space-y-2">
                        <button
                            onClick={() => setActiveTab("personal")}
                            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold transition-all ${
                                activeTab === "personal"
                                    ? "bg-pink-100 text-[#D81B60]"
                                    : "text-gray-500 hover:bg-white hover:shadow-sm"
                            }`}
                        >
                            <User size={18} /> Informasi Pribadi
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold transition-all ${
                                activeTab === "security"
                                    ? "bg-pink-100 text-[#D81B60]"
                                    : "text-gray-500 hover:bg-white hover:shadow-sm"
                            }`}
                        >
                            <Lock size={18} /> Keamanan Akun
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all mt-4"
                        >
                            <LogOut size={18} /> Keluar Akun
                        </button>
                    </div>
                </div>

                {/* ================= RIGHT CONTENT ================= */}
                <div className="flex-1 p-8 md:p-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Informasi Pribadi</h1>

                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Depan</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Masukkan nama depan" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Belakang</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Masukkan nama belakang" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Alamat Email</label>
                            <div className="relative">
                                <input type="email" name="email" value={formData.email} disabled className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-32 py-3 outline-none text-sm text-gray-500 font-medium cursor-not-allowed" />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                                    <CheckCircle2 size={14} /> Terverifikasi
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email digunakan untuk login dan tidak dapat diubah.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Alamat Domisili</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Contoh: Jl. Kalimantan No. 37" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nomor Handphone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Contoh: 081234567890" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Tanggal Lahir</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Kota / Kabupaten</label>
                                <select name="location" value={formData.location} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium cursor-pointer">
                                    <option value="Jember, Jawa Timur">Jember, Jawa Timur</option>
                                    <option value="Surabaya, Jawa Timur">Surabaya, Jawa Timur</option>
                                    <option value="Malang, Jawa Timur">Malang, Jawa Timur</option>
                                    <option value="Banyuwangi, Jawa Timur">Banyuwangi, Jawa Timur</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Kode Pos</label>
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Contoh: 68121" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-sm text-gray-800 font-medium" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
                            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}