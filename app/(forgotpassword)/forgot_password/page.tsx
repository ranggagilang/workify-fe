'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logika kirim email di sini
    console.log('Mengirim reset link ke:', email);
    
    // Arahkan ke halaman selanjutnya (Check Email)
    router.push('/check-email'); 
  };

  return (
    <main 
      className="relative min-h-screen w-full flex items-center justify-center p-4"
      style={{
        // Menggunakan background yang sama dengan halaman Login
        backgroundImage: "url('/building-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay Gelap supaya tulisan/kartu lebih kontras */}
      <div className="absolute inset-0 bg-black opacity-20"></div>

      {/* --- KARTU PUTIH --- */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-12 z-10 animate-in fade-in zoom-in duration-300">
        
        {/* 1. Logo (Pojok Kiri Atas) */}
        <div className="flex items-center space-x-2 mb-10">
          <Image src="/logoworkify2.png" alt="Workify Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-[#19A0FA]">Workify</span>
        </div>

        {/* 2. Judul & Deskripsi (Tengah) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Forgot Password</h1>
          <p className="text-gray-500 text-sm leading-relaxed px-4">
            Don’t worry! Enter your email or Employee ID to reset your password.
          </p>
        </div>

        {/* 3. Form Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
              Email
            </label>
            <input
              type="text"
              id="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19A0FA] focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Tombol Reset (Biru Dongker - sama dengan Login) */}
          <button
            type="submit"
            className="w-full text-white font-bold py-3.5 rounded-lg transition duration-300 hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#092D49' }}
          >
            Reset My Password
          </button>
        </form>

        {/* 4. Link Back to Login */}
        <div className="mt-8 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-gray-600 font-semibold hover:text-gray-900 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
        </div>

      </div>
    </main>
  );
}