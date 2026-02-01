'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeSidebar from '@/components/employee/employeesidebar';
import EmployeeHeader from '@/components/employee/employeeheader';
import BillingBanner from '@/components/BillingBanner';
import axios from 'axios';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/billing/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanyData(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data status langganan", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'USER') {
      if (user.role === 'ADMIN') router.push('/admindashboard');
      return;
    }

    setIsAuthorized(true);
    fetchStatus();
  }, [router, fetchStatus]);

  if (!isAuthorized) return null;

  return (
    // 🔥 h-screen & overflow-hidden mencegah scrollbar ganda di samping kanan
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* 1. BANNER GLOBAL (Paling Atas) */}
      {companyData && companyData.status !== 'ACTIVE' && (
        <BillingBanner 
          status={companyData.status} 
          isTrial={companyData.isTrial} 
          createdAt={companyData.createdAt}
          expiredAt={companyData.expiredAt}
          isAdmin={false} 
        />
      )}

      {/* 2. DASHBOARD AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR (h-full agar scroll mandiri) */}
        <div className="h-full flex-shrink-0">
          <EmployeeSidebar />
        </div>

        {/* WRAPPER KANAN */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          <EmployeeHeader />
          
          {/* MAIN CONTENT (Hanya area ini yang scroll) */}
          <main className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
             {children}
          </main>
        </div>
      </div>
    </div>
  );
}