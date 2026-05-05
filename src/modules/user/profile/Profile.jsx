

import React from "react";
import { Construction, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-orange-100 px-6 text-center">

      {/* Icon */}
      <div className="bg-white p-6 rounded-full shadow-lg mb-6">
        <Construction className="w-12 h-12 text-orange-500" />
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Halaman Profile Sedang Dikembangkan
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 max-w-md mb-6">
        Fitur profile akan segera tersedia untuk membantu Anda mengelola data akun dan informasi pribadi.
      </p>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-full mb-8">
        <Clock className="w-4 h-4" />
        Coming Soon
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg shadow transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>
    </div>
  );
};

export default Profile;
