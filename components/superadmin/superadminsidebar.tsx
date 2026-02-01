// components/superadmin/superadminsidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import React from 'react';

import {
  HiOutlineSquares2X2,
  HiOutlineCreditCard,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentCheck,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const superadminNavItems: NavItem[] = [
  { href: '/superadmindashboard', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { href: '/pricing_management', label: 'Pricing Management', icon: HiOutlineCreditCard },
  { href: '/company', label: 'Company', icon: HiOutlineBuildingOffice2 },
  { href: '/activity_log', label: 'Activity Log', icon: HiOutlineDocumentCheck },
  { href: '/superadmin_setting', label: 'Setting', icon: HiOutlineCog6Tooth },
];

export default function SuperadminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      // STYLE: Sticky + Full Height + Padding Kanan 0 (pr-0) agar menempel
      className="w-64 h-screen sticky top-0 overflow-y-auto flex-shrink-0 flex flex-col py-4 pl-4 pr-0 custom-scrollbar"
      style={{ backgroundColor: '#19A0FA' }}
    >
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8 px-2 py-2">
        <Image
          src="/logoworkify.png"
          alt="Workify Logo"
          width={30}
          height={30}
        />
        <span className="text-white text-2xl font-bold">Workify</span>
      </div>

      {/* Navigasi */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {superadminNavItems.map(({ href, label, icon: Icon }) => {
            // Logic Active State
            const isActive = href === '/superadmindashboard' 
              ? pathname === href 
              : pathname.startsWith(href);

            return (
              <li key={href} className="relative group">
                
                {/* --- LENGKUNGAN ATAS (CURVE TOP) --- */}
                {isActive && (
                  <div className="absolute right-0 -top-5 w-5 h-5 bg-transparent rounded-br-[20px] shadow-[5px_5px_0_5px_white] z-20 pointer-events-none"></div>
                )}

                {/* --- MENU LINK --- */}
                <Link
                  href={href}
                  className={`
                    relative flex items-center space-x-3 p-3 z-10
                    rounded-l-[30px] rounded-r-none
                    /* Logic Transisi:
                       - Active: Instan (tanpa transition) agar solid & cepat.
                       - Inactive: Transition colors agar hover halus.
                    */
                    ${isActive
                      ? 'bg-white text-[#19A0FA] font-bold shadow-sm' 
                      : 'text-white hover:bg-white/10 transition-colors duration-200'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-[#19A0FA]' : 'text-white'}`} />
                  <span className="text-lg">{label}</span>
                </Link>

                {/* --- LENGKUNGAN BAWAH (CURVE BOTTOM) --- */}
                {isActive && (
                  <div className="absolute right-0 -bottom-5 w-5 h-5 bg-transparent rounded-tr-[20px] shadow-[5px_-5px_0_5px_white] z-20 pointer-events-none"></div>
                )}

              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}