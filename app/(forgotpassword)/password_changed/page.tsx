'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiCheckBadge } from 'react-icons/hi2'; // Hanya perlu import ini sekarang

export default function PasswordChangedPage() {
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
        <div className="flex items-center space-x-2 mb-8">
          <Image src="/logoworkify2.png" alt="Workify Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-[#19A0FA]">Workify</span>
        </div>

        {/* 2. Konten Utama (Tengah) */}
        <div className="text-center flex flex-col items-center">
          
          {/* Ikon Centang Biru */}
          <div className="mb-6">
             <HiCheckBadge className="w-20 h-20 text-[#19A0FA]" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            You’ve successfully updated your password.
          </h1>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
            You may now access your account with the new password. Should you encounter difficulties, contact support.
          </p>

          {/* Tombol Login Now (Biru Gelap) */}
          <Link
            href="/login"
            className="w-full block text-center text-white font-bold py-3.5 rounded-lg transition duration-300 hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#092D49' }}
          >
            Login Now
          </Link>

          {/* Bagian Back to Login SUDAH DIHAPUS */}

        </div>

      </div>
    </main>
  );
}