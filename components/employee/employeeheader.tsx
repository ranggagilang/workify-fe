'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { HiUser } from 'react-icons/hi2';

export default function EmployeeHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const localData = localStorage.getItem('user');
    if (localData) {
      setUser(JSON.parse(localData));
    }

    const fetchLatestProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
        } catch (error) {
            console.error("Gagal refresh header user");
        }
    };

    fetchLatestProfile();
  }, []);

  return (
    // 🔥 Gunakan 'sticky top-0' & hapus 'left-64' agar presisi mengikuti flexbox parent
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-8 flex items-center justify-between transition-all w-full flex-shrink-0">
      
      <h2 className="text-gray-700 font-semibold text-lg">Employee Area</h2>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-800">{user?.name || 'Loading...'}</p>
          <p className="text-xs text-gray-500">{user?.role || 'Employee'}</p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 overflow-hidden flex items-center justify-center shadow-sm">
           {user?.image ? (
               <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
           ) : (
               <span className="text-gray-400 font-bold text-lg">
                 {user?.name?.charAt(0).toUpperCase() || <HiUser />}
               </span>
           )}
        </div>
      </div>
    </header>
  );
}