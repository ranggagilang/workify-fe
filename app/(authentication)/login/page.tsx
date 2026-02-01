'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios'; 

// --- IMPOR DARI GOOGLE ---
import { GoogleLogin } from '@react-oauth/google'; 

// Impor ikon
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

export default function LoginPage() {
  const router = useRouter();
  
  // ✅ UPDATE 1: Ganti 'email' jadi 'identifier' (biar bisa input NIP juga)
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  
  // State UI
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- 1. LOGIC LOGIN MANUAL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Kirim ke Backend (sesuai controller baru yg terima 'identifier')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        identifier: identifier, 
        password: password
      });

      const body = response.data;
      const token = body.token;
      const userData = body.user;

      if (!token) throw new Error("Login berhasil, tapi Token tidak ditemukan.");
      
      // Simpan Sesi
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // ✅ UPDATE 2: Redirect Logic yang Lebih Detail
      if (userData?.mustChangePassword) {
        // Kalau Employee baru / kena reset -> Paksa ganti password
        router.push('/change_password'); 
      } else {
        const role = String(userData?.role || '').toUpperCase();
        
        if (role === 'SUPERADMIN') {
            router.push('/superadmindashboard');
        } else if (role === 'ADMIN') {
            router.push('/admindashboard'); // Pastikan route admin kamu ini
        } else {
            // Role USER / EMPLOYEE
            router.push('/employee_dashboard'); 
        }
      }

    } catch (err: any) {
      console.error('Login Error:', err);
      const msg = err.response?.data?.message || "Login Gagal. Cek NIP/Email atau Password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGIC LOGIN GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);

    try {
      console.log("Token Google dikirim ke Backend...");

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
          idToken: credentialResponse.credential
      });

      const body = res.data;
      const token = body.token;
      const userData = body.user;

      if (!token) throw new Error("Token tidak diterima dari server.");

      // Simpan Sesi
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect Logic
      if (userData?.mustChangePassword) {
         router.push('/change_password');
      } else {
         const role = String(userData?.role || '').toUpperCase();
         if (role === 'SUPERADMIN') {
            router.push('/superadmindashboard');
         } else if (role === 'ADMIN') {
            router.push('/admindashboard');
         } else {
            router.push('/employee_dashboard');
         }
      }

    } catch (err: any) {
      console.error("Google Login Error:", err);
      
      const msg = err.response?.data?.message || "Login Google Gagal.";
      if(err.response?.status === 404) {
          setError("Akun Google belum terdaftar. Silakan Register Company terlebih dahulu.");
      } else {
          setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Login Google Gagal (Popup closed).");
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
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-2xl bg-white z-10">
        
        {/* === BAGIAN KIRI (BIRU) === */}
        <div 
          className="w-full lg:w-1/2 p-10 md:p-14 flex flex-col text-white"
          style={{ backgroundColor: '#19A0FA' }} 
        >
          <div className="flex items-center space-x-3"> 
            <Image src="/logoworkify.png" alt="Workify Logo" width={30} height={30} />  
            <span className="text-3xl font-bold">Workify</span>
          </div>
          <div className="flex flex-col justify-center flex-grow">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                <span className="font-normal">Hello.</span><br/>
                Welcome!
              </h1>
              <p className="text-lg leading-snug">
                Welcome back to HRIS Workify! <br/>
                Your all-in-one management solution.
              </p>
            </div>
          </div>
        </div>

        {/* === BAGIAN KANAN (FORM) === */}
        <div className="w-full lg:w-1/2 p-10 md:p-14 bg-white">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign In</h2>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Unified Input: Email or Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email or Employee ID (NIP)
              </label>
              <input 
                type="text"
                placeholder="Enter email or ID (e.g., EMP001)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-7 px-4 flex items-center text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="remember" className="ml-2 text-gray-600">Remember me</label>
              </div>
              <Link href="/forgotpassword/check_email" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </Link>
            </div>

            {/* ERROR MESSAGE AREA */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm animate-in fade-in slide-in-from-top-1">
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-3 rounded-lg transition duration-300 hover:opacity-90 flex justify-center items-center disabled:bg-gray-400"
              style={{ backgroundColor: '#092D49' }}
            >
              {isLoading ? 'Processing...' : 'Sign In'}
            </button>

            {/* DIVIDER */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or sign in with</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* TOMBOL GOOGLE */}
            <div className="w-full flex flex-col items-center">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"    
                  size="large"       
                  text="signin_with" 
                  shape="rectangular"
                  width="100%"       
               />
            </div>
          </form>

          {/* LINK KE REGISTER */}
          <div className="mt-8 text-center">
             <p className="text-sm text-gray-600">
               Don't have an account?
             </p>
             <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 mt-1 inline-block text-base">
               Create Company Account &gt;
             </Link>
          </div>

        </div>
      </div>
    </main>
  );
}