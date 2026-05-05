import React, { useState, useEffect } from 'react';
import { db } from "../../../services/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Search, Utensils, Plus, X } from 'lucide-react';

export default function FoodSearch({ onFoodSelect }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.length < 2) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const q = query(
                    collection(db, "master_makanan"),
                    where("search_name", ">=", searchTerm.toLowerCase()),
                    where("search_name", "<=", searchTerm.toLowerCase() + "\uf8ff"),
                    limit(5)
                );
                const snapshot = await getDocs(q);
                setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) { console.error(error); }
            finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
                <input
                    type="text"
                    placeholder="Cari makanan (misal: Nasi...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-white border-2 border-pink-50 rounded-[2rem] shadow-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all font-medium"
                />
            </div>
            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-pink-50 z-50 overflow-hidden">
                    {results.map((food) => (
                        <button
                            key={food.id}
                            onClick={() => { onFoodSelect(food); setSearchTerm(""); setResults([]); }}
                            className="w-full flex items-center justify-between p-4 hover:bg-pink-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 rounded-lg text-pink-500"><Utensils size={16}/></div>
                                <div className="text-left leading-tight">
                                    <p className="font-bold text-gray-800 capitalize text-sm">{food.nama}</p>
                                    <p className="text-[10px] text-pink-400 font-bold uppercase">{food.kategori}</p>
                                </div>
                            </div>
                            <Plus size={16} className="text-pink-300 group-hover:text-pink-500" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
