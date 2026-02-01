'use client';

import Sidebar from '@/components/admin/adminsidebar';
import Header from '@/components/admin/adminheader';
import BillingBanner from '@/components/BillingBanner';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [companyData, setCompanyData] = useState<any>(null);

  // 🔥 Bungkus fungsi dalam useCallback agar bisa dipanggil berulang kali
  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/billing/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("CHECK DATA LAYOUT:", res.data.data); // Untuk debug di console
      setCompanyData(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data status langganan", err);
    }
  }, []);

  // Ambil data pertama kali
  useEffect(() => {
    fetchStatus();
    
    // 🔥 OPSIONAL: Polling setiap 30 detik untuk memastikan banner hilang otomatis 
    // jika pembayaran dilakukan di tab lain
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="flex bg-white h-screen w-screen overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="flex-shrink-0">
         <Sidebar />
      </div>

      {/* WRAPPER KANAN */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* 🔥 BILLING BANNER */}
        {/* Banner hanya muncul jika status BUKAN ACTIVE */}
        {companyData && companyData.status !== 'ACTIVE' && (
          <BillingBanner 
            status={companyData.status} 
            isTrial={companyData.isTrial} 
            createdAt={companyData.createdAt}
            expiredAt={companyData.expiredAt}
          />
        )}

        {/* HEADER */}
        <Header />
        
        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {children}
        </main>
      </div>

    </div>
  );
}