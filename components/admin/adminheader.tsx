// components/admin/adminheader.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import React, { useState, useRef, useEffect } from 'react'; 
import axios from 'axios'; 
import {
  HiMagnifyingGlass,
  HiOutlineUserCircle,
  HiOutlineBell,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';

const getTitleFromPath = (path: string): string => {
  if (path === '/dashboard') return 'Dashboard';
  if (path === '/information') return 'Employee Database';
  if (path === '/attendance') return 'Employee Attendance';
  if (path.startsWith('/attendance/')) return 'Employee Permit Data';
  if (path === '/schedule') return 'Schedule Management';
  if (path === '/salary') return 'Employee Salary';
  if (path === '/billing') return 'Billing Information';
  if (path.startsWith('/salary/')) return 'New Salary Data';
  if (path === '/admin_setting') return 'Settings';
  return 'Dashboard';
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitleFromPath(pathname);

  const [userName, setUserName] = useState('Loading...');
  const [userRole, setUserRole] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- FUNGSI UPDATE DATA (Bisa dipanggil kapan saja) ---
  const updateHeaderData = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          try {
              const parsedUser = JSON.parse(storedUser);
              setUserName(parsedUser.name || parsedUser.email || 'Admin User');
              const role = parsedUser.role || 'Admin';
              setUserRole(role.charAt(0).toUpperCase() + role.slice(1).toLowerCase());
              if (parsedUser.image) {
                  setUserImage(parsedUser.image);
              }
          } catch (error) {
              console.error("Gagal parse user data", error);
          }
      }
  };

  // --- USE EFFECT: LOAD DATA & PASANG TELINGA (LISTENER) ---
  useEffect(() => {
    // 1. Load data saat pertama kali buka
    updateHeaderData();

    // 2. Sync Background (Opsional, buat jaga-jaga)
    const syncWithBackend = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { user } = res.data.data;
                if (user) {
                   const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                   localStorage.setItem('user', JSON.stringify({ ...currentUser, ...user }));
                   updateHeaderData(); // Update tampilan setelah sync
                }
            } catch (e) { console.error(e) }
        }
    };
    syncWithBackend();

    // 3. PASANG TELINGA: Dengarkan event bernama 'userUpdated'
    // Ini kuncinya! Saat SettingPage mengirim sinyal ini, Header langsung update.
    window.addEventListener('userUpdated', updateHeaderData);

    // Bersihkan telinga saat pindah halaman (Cleanup)
    return () => {
        window.removeEventListener('userUpdated', updateHeaderData);
    };
  }, [pathname]);

  // --- Logic Klik di Luar Dropdown ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-[#19A0FA]/20 sticky top-0 z-20 h-24">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search Anything..." className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
        </div>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <HiOutlineBell className="w-6 h-6" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors focus:outline-none">
            {userImage ? (
                <img src={userImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200"/>
            ) : (
                <HiOutlineUserCircle className="w-10 h-10 text-gray-500" />
            )}
            <div className="text-left hidden md:block">
              <p className="font-semibold text-sm text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                </div>
                <Link href="/admin_setting?tab=profile" onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#19A0FA] flex items-center gap-3 transition-colors">
                  <HiCog6Tooth className="w-5 h-5" /> Profile Setting
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                  <HiArrowRightOnRectangle className="w-5 h-5" /> Log Out
                </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}