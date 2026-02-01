'use client';

import React from 'react';
import { HiOutlineInformationCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Link from 'next/link';

interface BillingBannerProps {
  status: string;
  isTrial: boolean;
  createdAt: string;
  expiredAt?: string;
  isAdmin?: boolean; // 🔥 Tambahkan ini agar error merah hilang
}

export default function BillingBanner({ 
  status, 
  isTrial, 
  createdAt, 
  expiredAt,
  isAdmin = false // Default ke false (Employee)
}: BillingBannerProps) {
  
  const today = new Date();
  const finalExpiry = expiredAt ? new Date(expiredAt) : new Date(new Date(createdAt).getTime() + 14 * 24 * 60 * 60 * 1000);

  const diffTime = finalExpiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 1. Kondisi: SUDAH EXPIRED (Merah)
  if (status === 'EXPIRED' || status === 'PAST_DUE' || diffDays <= 0) {
    return (
      <div className="w-full bg-red-600 text-white px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-4 z-[9999] relative">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-white" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            ⚠️ LAYANAN TERHENTI: MASA AKTIF TELAH BERAKHIR PADA {finalExpiry.toLocaleDateString('id-ID')}. SILAKAN HUBUNGI ADMIN.
          </p>
        </div>

        {/* 🔥 Tombol AKTIVASI hanya muncul jika isAdmin = true */}
        {isAdmin && (
          <Link href="/billing" className="px-5 py-1.5 bg-white text-red-600 rounded-lg text-[10px] font-bold uppercase hover:bg-gray-100 transition-all shadow-lg">
            Aktivasi Sekarang
          </Link>
        )}
      </div>
    );
  }

  // 2. Kondisi: PENGINGAT (Orange - Sisa 3 hari atau kurang)
  if (diffDays <= 3 && diffDays > 0) {
    return (
      <div className="w-full bg-amber-500 text-white px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-4 z-[9999] relative">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <HiOutlineInformationCircle className="w-4 h-4 text-white" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            ℹ️ PERHATIAN: MASA AKTIF SISTEM AKAN BERAKHIR DALAM {diffDays} HARI LAGI.
          </p>
        </div>

        {/* 🔥 Tombol CEK BILLING hanya muncul jika isAdmin = true */}
        {isAdmin && (
          <Link href="/billing" className="px-5 py-1.5 bg-amber-900/20 border border-white/30 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-white/10 transition-all">
            Cek Billing
          </Link>
        )}
      </div>
    );
  }

  return null;
}