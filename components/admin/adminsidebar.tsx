'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendar,
  HiOutlineBanknotes,
  HiOutlineCog6Tooth,
  HiOutlineCreditCard, // Icon baru untuk Billing
  HiOutlineInformationCircle,
} from 'react-icons/hi2';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType; 
};

const navItems: NavItem[] = [
  { href: '/admindashboard', label: 'Dashboard', icon: HiOutlineHome },
  { href: '/information', label: 'Information', icon: HiOutlineUser },
  { href: '/attendance', label: 'Attendance', icon: HiOutlineClipboardDocumentList },
  { href: '/schedule', label: 'Schedule', icon: HiOutlineCalendar },
  { href: '/salary', label: 'Salary', icon: HiOutlineBanknotes },
  { href: '/billing', label: 'Billing', icon: HiOutlineCreditCard }, // Menu Billing Baru
  { href: '/admin_setting', label: 'Setting', icon: HiOutlineCog6Tooth },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [billingInfo, setBillingInfo] = useState({ totalUser: 0, estimatedBill: 0 });

  // Ambil data billing singkat untuk ditampilkan di sidebar
  useEffect(() => {
    const fetchSidebarBilling = async () => {
      try {
        const token = localStorage.getItem('token');
        // Anggap kita buat endpoint khusus ringkasan untuk sidebar
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/billing/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBillingInfo(res.data.data);
      } catch (err) {
        console.log("Gagal ambil summary billing");
      }
    };
    fetchSidebarBilling();
  }, []);

  return (
    <aside 
      className="w-64 h-full flex-shrink-0 flex flex-col py-4 pl-4 pr-0 overflow-y-auto custom-scrollbar"
      style={{ backgroundColor: '#19A0FA' }}
    >
      
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8 px-2 py-2"> 
        <Image src="/logoworkify.png" alt="Workify Logo" width={30} height={30} />
        <span className="text-white text-2xl font-bold">Workify</span>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href); 

            return (
              <li key={item.label} className="relative group">
                {isActive && (
                  <div className="absolute right-0 -top-5 w-5 h-5 bg-transparent rounded-br-[20px] shadow-[5px_5px_0_5px_white] z-20 pointer-events-none"></div>
                )}

                <Link
                  href={item.href}
                  className={`
                    relative flex items-center space-x-3 p-3 z-10
                    rounded-l-[30px] rounded-r-none
                    ${isActive
                      ? 'bg-white text-[#19A0FA] font-bold shadow-sm' 
                      : 'text-white hover:bg-white/10 transition-colors duration-200' 
                    }
                  `}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'text-[#19A0FA]' : 'text-white'}`} />
                  <span className="text-lg">{item.label}</span>
                </Link>

                {isActive && (
                  <div className="absolute right-0 -bottom-5 w-5 h-5 bg-transparent rounded-tr-[20px] shadow-[5px_-5px_0_5px_white] z-20 pointer-events-none"></div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* --- BAGIAN BILLING INFO (GANTI UPGRADE PRO) --- */}
      <div className="mt-auto pt-6 pr-4">
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center relative overflow-hidden group">
          
          <div className="relative z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
             <HiOutlineInformationCircle className="w-6 h-6" />
          </div>

          <h4 className="relative z-10 text-white font-semibold text-sm mb-1">Estimasi Tagihan</h4>
          <h2 className="relative z-10 text-white font-bold text-xl mb-1">
            Rp {billingInfo.estimatedBill.toLocaleString()}
          </h2>
          <p className="relative z-10 text-blue-100 text-[10px] mb-4 uppercase tracking-wider">
            {billingInfo.totalUser} User Aktif
          </p>

          <Link 
              href="/billing" 
              className="relative z-10 block w-full bg-white text-[#19A0FA] font-bold py-2 rounded-lg text-xs hover:bg-blue-50 transition-all shadow-lg"
          >
            Lihat Detail Tagihan
          </Link>
        </div>
      </div>

    </aside>
  );
}