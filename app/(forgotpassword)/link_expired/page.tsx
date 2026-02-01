'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiUser, HiXMark } from 'react-icons/hi2'; // Menggunakan kombinasi ikon untuk meniru gambar

export default function LinkExpiredPage() {
  return (
    <main 
      className="relative min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/building-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay Gelap */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* --- KARTU PUTIH --- */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-12 z-10 animate-in fade-in zoom-in duration-300">
        
        {/* 1. Logo (Pojok Kiri Atas) */}
        <div className="flex items-center space-x-2 mb-12">
          <Image src="/logoworkify2.png" alt="Workify Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-[#19A0FA]">Workify</span>
        </div>

        {/* 2. Konten Utama (Tengah) */}
        <div className="text-center flex flex-col items-center">
          
          {/* Ilustrasi Icon (Kotak Biru dengan User + X) */}
          <div className="relative mb-6">
            <div className="w-20 h-16 bg-[#19A0FA] rounded-lg flex items-center justify-center">
               <HiUser className="w-10 h-10 text-white" />
            </div>
            {/* Badge X Kecil */}
            <div className="absolute top-2 right-3 w-4 h-4 text-white font-bold flex items-center justify-center">
               <HiXMark className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Link Expired</h1>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
            "Oops! The reset link has expired. Please generate a new one to proceed."
          </p>

          {/* Tombol Back to Login (Full Button Sesuai Gambar) */}
          <Link 
            href="/login"
            className="w-full block text-center text-white font-bold py-3.5 rounded-lg transition duration-300 hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#092D49' }}
          >
            Back to Login
          </Link>

        </div>

      </div>
    </main>
  );
}