import React, { useState } from 'react';
import { db } from "../../../services/firebase.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { X, Save } from 'lucide-react';

export default function AddMasterMakanan() {
    const [formData, setFormData] = useState({
        kode: '',
        nama: '',
        kategori: 'Serealia dan Hasil Olahannya',
        energi: '',
        protein: '',
        lemak: '',
        karbohidrat: '',
        bdd: 100
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const docRef = doc(db, "master_makanan", formData.kode.toUpperCase());
            await setDoc(docRef, {
                ...formData,
                kode: formData.kode.toUpperCase(),
                energi: parseFloat(formData.energi) || 0,
                protein: parseFloat(formData.protein) || 0,
                lemak: parseFloat(formData.lemak) || 0,
                karbohidrat: parseFloat(formData.karbohidrat) || 0,
                search_name: formData.nama.toLowerCase(),
                created_at: serverTimestamp()
            });
            alert("Data berhasil disimpan!");
            setFormData({ ...formData, kode: '', nama: '', energi: '', protein: '', lemak: '', karbohidrat: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Tambah Data Master Pangan (TKPI)</h3>
                    <button className="text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Bahan */}
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-900 italic">Nama Bahan Makanan</label>
                                <input
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                                    placeholder="Contoh: Nasi Putih"
                                    required
                                />
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-900 italic">Kategori</label>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                                >
                                    <option>Serealia dan Hasil Olahannya</option>
                                    <option>Umbi Berpati dan Hasil Olahannya</option>
                                    <option>Kacang-kacangan dan Hasil Olahannya</option>
                                    <option>Sayuran dan Hasil Olahannya</option>
                                    <option>Buah-buahan dan Hasil Olahannya</option>
                                    <option>Daging, Unggas dan Hasil Olahannya</option>
                                    <option>Ikan, Kerang, Udang dan Hasil Olahannya</option>
                                    <option>Telur dan Hasil Olahannya</option>
                                    <option>Susu dan Hasil Olahannya</option>
                                </select>
                            </div>

                            {/* Kode Bahan */}
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-900 italic">Kode Bahan (TKPI)</label>
                                <input
                                    name="kode"
                                    value={formData.kode}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5 font-mono uppercase"
                                    placeholder="AR001"
                                    required
                                />
                            </div>

                            {/* Harga (Placeholder Price pada referensi diganti BDD) */}
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-900 italic">BDD (%)</label>
                                <input
                                    name="bdd"
                                    type="number"
                                    value={formData.bdd}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        {/* Komposisi Zat Gizi Section */}
                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="mb-4 text-sm font-black text-cyan-700 uppercase tracking-widest">Detail Zat Gizi per 100g</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block mb-2 text-xs font-bold text-gray-500">Energi (kkal)</label>
                                    <input name="energi" value={formData.energi} onChange={handleChange} type="number" step="0.1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold text-gray-500">Protein (g)</label>
                                    <input name="protein" value={formData.protein} onChange={handleChange} type="number" step="0.1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold text-gray-500">Lemak (g)</label>
                                    <input name="lemak" value={formData.lemak} onChange={handleChange} type="number" step="0.1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold text-gray-500">Karbohidrat (g)</label>
                                    <input name="karbohidrat" value={formData.karbohidrat} onChange={handleChange} type="number" step="0.1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 border-t border-gray-200 rounded-b">
                        <button
                            type="submit"
                            disabled={loading}
                            className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200 font-bold rounded-lg text-sm px-10 py-3 text-center transition-all disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan Data"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
