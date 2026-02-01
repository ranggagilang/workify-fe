'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import React, { useState, useEffect } from 'react';
import {
  HiMagnifyingGlass,
  HiOutlineUserCircle,
  HiOutlineBell,
  HiCog6Tooth, 
  HiArrowRightOnRectangle, 
} from 'react-icons/hi2';

const getSuperadminTitleFromPath = (path: string): string => {
  if (path === '/superadmindashboard') return 'Dashboard'; 
  if (path === '/plan_management') return 'Plan Management';
  if (path === '/company') return 'Company Database';
  if (path === '/activity_log') return 'Global Activity Log';
  if (path === '/superadmin_setting') return 'System Settings';
  
  if (path.startsWith('/plan_management/')) return 'Plan Management';
  
  return 'Dashboard';
};

export default function SuperadminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getSuperadminTitleFromPath(pathname);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // --- 1. STATE MANAGEMENT ---
  const [userName, setUserName] = useState('Loading...');
  const [userRole, setUserRole] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null); // State Foto

  // --- 2. FUNGSI LOAD DATA DARI LOCALSTORAGE ---
  const loadUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Nama & Role
        setUserName(parsedUser.name || parsedUser.email || 'Super Admin');
        const role = parsedUser.role || 'Admin';
        setUserRole(role.charAt(0).toUpperCase() + role.slice(1).toLowerCase());

        // Foto Profil (Avatar)
        setUserImage(parsedUser.image || null);

      } catch (error) {
        console.error("Gagal parse user data", error);
        setUserName("Guest");
      }
    }
  };

  // --- 3. USE EFFECT: LOAD + LISTEN EVENT ---
  useEffect(() => {
    // Load awal
    loadUserData();

    // Dengar Event 'userUpdated' (Dikirim dari halaman Setting saat save)
    const handleUserUpdate = () => {
        console.log("Header mendeteksi perubahan profil...");
        loadUserData(); // Reload data dari LocalStorage
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    // Cleanup saat komponen dicopot
    return () => {
        window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-[#19A0FA]/20 sticky top-0 z-20">
      
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">
        
        {/* Search */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Anything..."
            className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Notification */}
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <HiOutlineBell className="w-6 h-6" />
        </button>

        {/* --- USER PROFILE DROPDOWN --- */}
        <div className="relative">
          
          {/* Tombol Profil */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors focus:outline-none"
          >
            {/* LOGIC FOTO PROFIL: Ada Gambar -> Tampilkan, Ga Ada -> Icon Default */}
            {userImage ? (
                <img 
                    src={userImage} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
            ) : (
                <HiOutlineUserCircle className="w-10 h-10 text-gray-500" />
            )}

            <div className="text-left hidden md:block">
              <p className="font-semibold text-sm text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </button>

          {/* Menu Dropdown */}
          {isDropdownOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>

              {/* Kotak Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
                
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Super Account</p>
                </div>

                <Link
                  href="/superadmin_setting?tab=profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#19A0FA] flex items-center gap-3 transition-colors"
                >
                  <HiCog6Tooth className="w-5 h-5" />
                  System Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <HiArrowRightOnRectangle className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}