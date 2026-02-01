'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineClock,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.data);
    } catch (err) {
      console.error("Gagal load stats", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mengubah angka gaji menjadi format ringkas (jt/M) 
   * agar tidak merusak layout jika angka nol terlalu banyak
   */
  const formatCompactRupiah = (num: number) => {
    if (num >= 1000000000) {
      return 'Rp ' + (num / 1000000000).toFixed(1).replace('.', ',') + ' M';
    }
    if (num >= 1000000) {
      return 'Rp ' + (num / 1000000).toFixed(1).replace('.', ',') + ' jt';
    }
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(num);
  };

  const attendanceChartData = [
    { name: 'Hadir', value: stats?.attendance?.present || 0 },
    { name: 'Telat', value: stats?.attendance?.late || 0 },
    { name: 'Absen', value: stats?.attendance?.absent || 0 },
  ];

  // Mendapatkan nama bulan berjalan untuk label
  const currentMonthLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. STAT CARDS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats?.employees?.toString() || "0"}
          update="Karyawan Aktif"
          icon={HiOutlineUsers}
          iconBgColor="bg-blue-500"
        />
        <StatCard
          title="Attendance Today"
          value={((stats?.attendance?.present || 0) + (stats?.attendance?.late || 0)).toString()}
          update={`Terlambat: ${stats?.attendance?.late || 0}`}
          icon={HiOutlineClock}
          iconBgColor="bg-green-500"
        />
        <StatCard
          title="Est. Payroll"
          value={formatCompactRupiah(stats?.finance?.estimatedPayroll || 0)}
          update={`Periode ${currentMonthLabel}`} // Logika Bulan Berjalan
          icon={HiOutlineBanknotes}
          iconBgColor="bg-yellow-500"
        />
        <StatCard
          title="New Recruits"
          value={stats?.newRecruits?.toString() || "0"} 
          update="Bulan Ini"
          icon={HiOutlineUserPlus}
          iconBgColor="bg-red-500" 
        />
      </section>

      {/* 2. CHARTS & ACTIVITY SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT CHART: Attendance Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Attendance Statistic</h3>
            <div className="px-3 py-1 bg-blue-50 text-[#19A0FA] text-xs font-bold rounded-lg uppercase tracking-wider">
              Hari Ini
            </div>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={attendanceChartData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} />
                <Tooltip 
                   cursor={{fill: '#F9FAFB'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#19A0FA" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT SECTION: Recent Activity Logs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Recent Activity</h3>
            <span className="text-[10px] font-bold text-[#19A0FA] bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">Latest 5 logs</span>
          </div>
          
          <div className="space-y-4">
            {stats?.logs?.length === 0 ? (
                <p className="text-gray-400 text-center py-10 italic text-sm">No recent activity.</p>
            ) : (
                stats?.logs.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-blue-50/30 transition-colors group border border-transparent hover:border-blue-100">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                            {log.user?.image ? (
                                <img src={log.user.image} className="w-full h-full object-cover" alt="User" />
                            ) : (
                                <HiOutlineUsers className="w-5 h-5 text-gray-300"/>
                            )}
                        </div>
                        {/* Log Text */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-sm font-semibold text-gray-800 truncate pr-2">{log.user?.name}</span>
                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{log.action} - {log.details}</p>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
        
      </section>
    </div>
  );
}

// --- SUB-COMPONENT: STAT CARD ---
type StatCardProps = {
  title: string;
  value: string;
  update: string;
  icon: React.ElementType;
  iconBgColor: string;
};

function StatCard({ title, value, update, icon: Icon, iconBgColor }: StatCardProps) {
  // Mengecilkan ukuran font otomatis jika teks terlalu panjang (antisipasi angka besar)
  const isLongText = value.length > 13;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-start justify-between hover:shadow-md transition-all duration-300 group">
      <div className="flex flex-col min-w-0 overflow-hidden">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className={`
          font-bold text-gray-800 tracking-tight truncate 
          ${isLongText ? 'text-xl' : 'text-2xl'}
        `}>
          {value}
        </p>
        <p className="text-[10px] font-semibold text-[#19A0FA] mt-1 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
          {update}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${iconBgColor} text-white shadow-lg shadow-current/20 flex-shrink-0 ml-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}