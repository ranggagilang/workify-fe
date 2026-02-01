'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi2';
import { FaPaperPlane } from 'react-icons/fa'; // Menggunakan FaPaperPlane agar mirip icon di gambar

export default function CheckEmailPage() {
  
  // Fungsi simulasi buka Gmail (opsional)
  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <main 
      className="relative min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/building-background.jpg')", // Pastikan nama file background sama
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
          {/* Menggunakan logoworkify2.png sesuai request */}
          <Image src="/logoworkify2.png" alt="Workify Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-[#19A0FA]">Workify</span>
        </div>

        {/* 2. Konten Utama (Tengah) */}
        <div className="text-center flex flex-col items-center">
          
          {/* Icon Pesawat Kertas */}
          <div className="mb-6 bg-blue-50 p-4 rounded-full inline-flex items-center justify-center">
             <div className="transform -rotate-12"> {/* Sedikit miring agar dinamis */}
                <FaPaperPlane className="w-12 h-12 text-[#19A0FA]" />
             </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Check your email</h1>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
            A password reset link has been sent to your email <span className="font-bold text-gray-800">(uremail@gmail.com)</span>.<br/>
            It will expire in 24 hours. Please check your inbox.
          </p>

          {/* Tombol Open Gmail */}
          <button
            onClick={handleOpenGmail}
            className="w-full text-white font-bold py-3.5 rounded-lg transition duration-300 hover:opacity-90 shadow-md mb-6"
            style={{ backgroundColor: '#092D49' }}
          >
            Open Gmail
          </button>

          {/* Link Resend */}
          <p className="text-sm text-gray-500 mb-8">
            Don't receive the email?{' '}
            <button className="font-bold text-[#19A0FA] hover:underline transition-colors">
              Click here to resend!
            </button>
          </p>
        </div>

        {/* 3. Footer Link Back to Login */}
        <div className="text-center">
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