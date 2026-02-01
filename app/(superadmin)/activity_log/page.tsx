'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiOutlineCalendar,
  HiArrowDownTray,
  HiOutlineShoppingBag,    
  HiOutlineArrowsRightLeft, 
  HiOutlineExclamationTriangle,
  HiOutlineClipboardDocumentList,
  HiOutlineGlobeAlt
} from 'react-icons/hi2';

// --- Tipe Data ---
type ActivityType = 'Purchase' | 'Extend' | 'Report' | 'Update' | 'System';

interface ActivityLog {
  id: string;
  companyName: string;
  companyInitials: string;
  logoColor: string; 
  logoUrl?: string; // Untuk menampilkan foto profil company asli
  date: string;
  time: string;
  activityType: ActivityType;
  changes: string; 
}

const LOGO_COLORS = [
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600',
    'bg-green-100 text-green-600',
    'bg-pink-100 text-pink-600',
];

export default function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('token');
        // Endpoint ini diasumsikan menggabungkan data Transactions & ActivityLogs di backend
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/activity-logs`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const formattedData = res.data.data.map((item: any, index: number) => {
            const dateObj = new Date(item.createdAt);
            
            // Logika inisial jika logo tidak ada
            const initials = item.company?.name?.slice(0, 2).toUpperCase() || 'SYS';

            return {
                id: item.id.toString(),
                companyName: item.company?.name || 'System / Global',
                companyInitials: initials,
                logoUrl: item.company?.image, // Ambil foto profil dari DB
                logoColor: LOGO_COLORS[index % LOGO_COLORS.length],
                date: dateObj.toLocaleDateString('id-ID'),
                time: dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                activityType: item.type || 'Update',
                changes: item.description || item.details
            };
        });

        setLogs(formattedData);
    } catch (err) {
        console.error("Gagal mengambil log aktivitas:", err);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.changes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'Purchase':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100 w-fit">
            <HiOutlineShoppingBag className="w-3.5 h-3.5" /> Purchase
          </span>
        );
      case 'Extend':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 w-fit">
            <HiOutlineArrowsRightLeft className="w-3.5 h-3.5" /> Billing
          </span>
        );
      case 'Report':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 w-fit">
            <HiOutlineExclamationTriangle className="w-3.5 h-3.5" /> Alert
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100 w-fit">
            <HiOutlineClipboardDocumentList className="w-3.5 h-3.5" /> Update
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden h-fit transition-all duration-500">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Log Aktivitas</h3>
            <span className="bg-[#19A0FA] text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm shadow-blue-100">
              {isLoading ? '...' : filteredLogs.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#19A0FA] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari aktivitas..." 
                  className="pl-10 pr-4 py-2 w-full sm:w-60 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#19A0FA] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-[#19A0FA] hover:text-[#19A0FA] transition-all">
                <HiArrowDownTray className="w-4 h-4" />
                EXPORT
              </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-50/30 text-[#19A0FA] border-b border-blue-50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Company</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Activity Details</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50 font-medium">
              {isLoading ? (
                  <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                          <div className="animate-pulse flex flex-col items-center">
                              <p className="font-bold text-xs uppercase tracking-tighter">Memuat Histori Aktivitas...</p>
                          </div>
                      </td>
                  </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar / Logo Profil */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-110 transition-transform overflow-hidden ${log.logoUrl ? 'bg-white' : log.logoColor}`}>
                          {log.logoUrl ? (
                            <img src={log.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            log.companyInitials
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{log.companyName}</p>
                          <p className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">LOG ID: {log.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                           <HiOutlineCalendar className="w-3.5 h-3.5 text-gray-400" />
                           {log.date}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold tracking-wider ml-5">{log.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {getActivityBadge(log.activityType)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 max-w-lg leading-relaxed font-medium">
                        {log.changes}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-300 italic text-sm font-bold">Log aktivitas tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audit Trail: {filteredLogs.length} Records</span>
            <div className="flex items-center gap-1.5">
                <button className="p-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30" disabled>&lt;</button>
                <button className="px-3 py-1.5 text-[10px] font-bold bg-[#19A0FA] text-white rounded-lg shadow-md">1</button>
                <button className="p-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-30" disabled>&gt;</button>
            </div>
        </div>
      </div>
    </div>
  );
}