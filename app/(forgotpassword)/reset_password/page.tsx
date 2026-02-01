'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Logika simpan password baru di sini
    console.log('Password reset successfully');
    
    // Arahkan ke halaman Sukses
    router.push('/password-changed'); 
  };

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

        {/* 2. Judul & Deskripsi */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Set new password</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter your new password to finalize the reset. Ensure it’s safe and hard to guess.
          </p>
        </div>

        {/* 3. Form Input */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input: New Password */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-600 mb-2">
              New password
            </label>
            <input
              type="password"
              id="new-password"
              placeholder="Enter your new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19A0FA] focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-2">
              Use at least 8 characters with a mix of letters, numbers, and unique symbols.
            </p>
          </div>

          {/* Input: Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-600 mb-2">
              Confirm password
            </label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19A0FA] focus:border-transparent transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Tombol Reset (Biru Dongker) */}
          <button
            type="submit"
            className="w-full text-white font-bold py-3.5 rounded-lg transition duration-300 hover:opacity-90 shadow-md mt-4"
            style={{ backgroundColor: '#092D49' }}
          >
            Reset Password
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