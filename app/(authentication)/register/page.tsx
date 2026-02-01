'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '', 
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!agreed) {
        setError("Kamu harus menyetujui syarat dan ketentuan untuk mendaftar.");
        setIsLoading(false);
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError("Password and Confirm Password do not match!");
        setIsLoading(false);
        return;
    }

    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            companyName: formData.companyName,
            email: formData.email,
            fullName: formData.fullName,
            password: formData.password,
            confirmPassword: formData.confirmPassword
        });

        alert("Registration Successful! Please Login.");
        router.push('/login');

    } catch (err: any) {
        setError(err.response?.data?.message || "Registration Failed");
    } finally {
        setIsLoading(false);
    }
  };

  // --- LOGIC FIX: REGISTER PAKAI GOOGLE ---
  const handleGoogleRegisterCheck = async (credentialResponse: any) => {
    setError('');
    try {
        console.log("Mengecek akun Google ke Backend...");

        // 🔥 PERBAIKAN: Ganti ke /google-check agar sesuai dengan auth.route.ts backend
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-check`, {
            idToken: credentialResponse.credential
        });

        // Ambil data hasil verifikasi backend
        const { email, name, googleId } = res.data.data;

        // Susun parameter URL
        const params = new URLSearchParams({
            email: email || '',
            name: name || '',
            googleId: googleId || ''
        });

        // 🔥 PINDAH KE HALAMAN COMPLETE PROFILE
        router.push(`/register/complete_profile?${params.toString()}`);

    } catch (err: any) {
        console.error("Google Register Error:", err);
        const msg = err.response?.data?.message || "Gagal mendaftar dengan Google.";
        setError(msg);
    }
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

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-2xl bg-white z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="w-full lg:w-1/2 p-10 md:p-14 bg-white">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#19A0FA' }}>Sign Up Company</h2>
          <p className="text-gray-500 text-sm mb-6">Create your company account instantly.</p>

          <form className="space-y-4" onSubmit={handleManualRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} type="text" required placeholder="Enter company name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" required placeholder="Enter your email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter your full name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" required placeholder="Enter your full name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? 'text' : 'password'} required placeholder="Enter your password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 px-4 flex items-center text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showConfirmPassword ? 'text' : 'password'} required placeholder="Confirm Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 top-7 px-4 flex items-center text-gray-500">{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            
            <div className="flex items-center text-sm cursor-pointer" onClick={() => setAgreed(!agreed)}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer" />
              <label className="ml-2 text-gray-600 cursor-pointer select-none">I agree with the terms of use of HRIS</label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full text-white font-semibold py-3 rounded-lg transition duration-300 hover:opacity-90 disabled:bg-gray-400" style={{ backgroundColor: '#092D49' }}>
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm text-center">{error}</div>}

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or sign up with</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="w-full flex justify-center">
                <GoogleLogin 
                  onSuccess={handleGoogleRegisterCheck} 
                  onError={() => setError("Google Signup Failed")} 
                  theme="outline" 
                  size="large" 
                  text="signup_with" 
                  width="100%" 
                />
            </div>
          </form>
        </div>

        <div className="w-full lg:w-1/2 p-10 md:p-14 flex flex-col justify-between text-white" style={{ backgroundColor: '#19A0FA' }}>
          <div className="flex justify-end items-center">
              <Image src="/logoworkify.png" alt="Workify Logo" width={30} height={30} className="object-contain" />
              <span className="text-3xl font-bold ml-3">Workify</span>
          </div>
          <div className="text-right mt-20 lg:mt-0"> 
              <h1 className="text-5xl font-bold mb-4"><span className="font-normal">Starting</span><br/>Your Journey!</h1>
              <p className="text-lg leading-snug max-w-sm ml-auto">Get started with HRIS cmlabs! Your journey to easier management begins here.</p>
          </div>
          <div className="flex justify-end mt-10 lg:mt-0"> 
              <Link href="/login" className="text-white font-semibold py-3 px-8 rounded-lg transition duration-300 hover:opacity-90 shadow text-center" style={{ backgroundColor: '#092D49' }}>Login Here &gt;</Link>
          </div>
        </div>
      </div>
    </main>
  );
}