'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

// Komponen Isi (Content)
function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Ambil data yang dilempar dari Halaman Register sebelumnya
  const googleEmail = searchParams.get('email') || '';
  const googleName = searchParams.get('name') || '';
  const googleId = searchParams.get('googleId') || '';

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState(''); // Opsional kalau mau simpan no HP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Proteksi: Kalau orang iseng buka link ini tanpa login Google, tendang balik
  useEffect(() => {
    if (!googleId || !googleEmail) {
      router.push('/register');
    }
  }, [googleId, googleEmail, router]);

  const handleFinishSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 2. Kirim Data Final ke Backend
      // Endpoint ini akan membuat Company + User Admin sekaligus
      // ... di dalam handleFinishSetup ...
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-register-finish`, { // PENTING: Pake /api/auth/
        companyName: companyName,
        fullName: googleName,
        email: googleEmail,
        googleId: googleId,
        phone: phone  // <--- UBAH JADI AKTIF (HAPUS //)
    });

      // 3. Sukses! Arahkan ke Login
      router.push('/login');

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create company.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-2xl z-10 animate-fade-in-up">
      
      {/* Header */}
      <div className="text-center mb-8">
         <Image src="/logoworkify2.png" alt="Logo" width={50} height={50} className="mx-auto mb-3" />
         <h2 className="text-2xl font-bold" style={{ color: '#092D49' }}>Complete Registration</h2>
         <p className="text-gray-500 text-sm mt-1">One last step to set up your Company</p>
      </div>

      <form onSubmit={handleFinishSetup} className="space-y-5">
        
        {/* Info User Google (Read Only) */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start space-x-3">
            <div className="bg-blue-200 p-2 rounded-full text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Signing up as</p>
                <p className="font-bold text-gray-800 text-sm">{googleName}</p>
                <p className="text-gray-600 text-sm">{googleEmail}</p>
            </div>
        </div>

        {/* Input Company Name */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: PT Mencari Cinta Sejati"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
        </div>

        {/* Input Phone (Opsional) */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 08123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
            </div>
        )}

        <button 
            type="submit" 
            disabled={isLoading}
            className="w-full text-white font-bold py-3 rounded-lg hover:opacity-90 transition duration-300 shadow-md transform active:scale-95"
            style={{ backgroundColor: '#092D49' }}
        >
            {isLoading ? 'Creating Company...' : 'Finish Setup'}
        </button>
      </form>
    </div>
  );
}

// Wrapper Page (Wajib pakai Suspense)
export default function CompleteProfilePage() {
    return (
        <main 
            className="relative min-h-screen w-full flex items-center justify-center p-4"
            style={{
                backgroundImage: "url('/building-background.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black opacity-40"></div>
            
            {/* Suspense wajib ada karena kita pakai useSearchParams */}
            <Suspense fallback={<div className="text-white font-bold">Loading...</div>}>
                <CompleteProfileContent />
            </Suspense>
        </main>
    )
}