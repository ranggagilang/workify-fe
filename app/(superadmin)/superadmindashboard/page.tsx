'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const PRIMARY_BLUE = '#19A0FA';
const PRIMARY_GREEN = '#10B981';

export default function SuperadminDashboardPage() {
  const [pricing, setPricing] = useState({ pricePerUser: 0 });
  const [billingData, setBillingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      
      const [priceRes, billingRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/price`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/billing-monitor`, { headers })
      ]);

      if (priceRes.data.data) setPricing(priceRes.data.data);
      if (billingRes.data.data) setBillingData(billingRes.data.data);
      
    } catch (err: any) {
      console.error("Gagal load dashboard data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    const newPrice = prompt("Masukkan Harga Baru per User (Rp):", pricing.pricePerUser.toString());
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/price`, 
          { pricePerUser: Number(newPrice) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Harga berhasil diperbarui!");
        fetchDashboardData();
      } catch (err) {
        alert("Gagal update harga");
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (confirm(`Ubah status perusahaan menjadi ${newStatus}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/company/${id}/status`, 
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchDashboardData();
      } catch (err) {
        alert("Gagal update status");
      }
    }
  };

  const totalCompany = billingData.length;
  const totalActiveUsers = billingData.reduce((acc, curr) => acc + (Number(curr.totalUser) || 0), 0);
  const estimatedRevenue = billingData.reduce((acc, curr) => acc + (Number(curr.monthlyBill) || 0), 0);

  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">Loading Superadmin Dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECTION 1: TOP STATS (With Hover Animation) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MiniStatCard 
          title="Total Perusahaan" 
          value={totalCompany.toString()} 
          subtitle="Entitas Terdaftar"
          icon={HiOutlineBuildingOffice2} 
          colorCode={PRIMARY_BLUE} 
        />
        <MiniStatCard 
          title="Total User Aktif" 
          value={totalActiveUsers.toLocaleString()} 
          subtitle="Karyawan Terhubung"
          icon={HiOutlineUsers} 
          colorCode={PRIMARY_GREEN} 
        />
        <MiniStatCard 
          title="Estimasi Pendapatan" 
          value={`Rp ${estimatedRevenue.toLocaleString()}`} 
          subtitle="Bulan Berjalan"
          icon={HiOutlineBanknotes} 
          colorCode="#F59E0B" 
        />
      </section>

      {/* SECTION 2: PRICING & CHART */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Global Price Control */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center group hover:border-[#19A0FA]/40 transition-all duration-300">
            <div className="bg-blue-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <HiOutlineShieldCheck className="w-10 h-10 text-[#19A0FA]" />
            </div>
            <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Harga Pay-As-You-Go</h3>
            <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-gray-800 tracking-tighter">Rp {Number(pricing.pricePerUser).toLocaleString()}</span>
                <span className="text-gray-400 text-sm font-semibold">/ User</span>
            </div>
            <button 
              onClick={handleUpdatePrice}
              className="mt-6 w-full py-3 bg-[#19A0FA] text-white rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-100 text-sm"
            >
                Ubah Harga Global
            </button>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Monitor (Top Companies)">
            <div className="h-64 w-full min-h-[250px]">
              {isClient && billingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={billingData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 500}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 500}} />
                    <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="monthlyBill" radius={[6, 6, 0, 0]} barSize={50}>
                      {billingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? PRIMARY_BLUE : '#93C5FD'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                  Belum ada data transaksi untuk ditampilkan
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </section>

      {/* SECTION 3: TABLE MONITORING */}
      <section className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Monitoring Akses & Billing Perusahaan</h3>
            <span className="text-[10px] font-bold text-[#19A0FA] bg-blue-50 px-3 py-1 rounded-md uppercase tracking-widest">Live Data</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-semibold tracking-wider">
                    <tr>
                        <th className="px-6 py-4 tracking-wider">Nama Perusahaan</th>
                        <th className="px-6 py-4 text-center tracking-wider">User Aktif</th>
                        <th className="px-6 py-4 text-center tracking-wider">Estimasi Tagihan</th>
                        <th className="px-6 py-4 text-center tracking-wider">Status Akses</th>
                        <th className="px-6 py-4 text-right tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-medium">
                    {billingData.length > 0 ? billingData.map((company) => (
                        <tr key={company.id} className="hover:bg-blue-50/20 transition-colors group">
                            <td className="px-6 py-4">
                                <p className="font-semibold text-gray-800">{company.name}</p>
                                <p className="text-[10px] text-gray-400 font-normal tracking-tighter">ID: #{company.id}</p>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-600 font-semibold">{company.totalUser || 0} User</td>
                            <td className="px-6 py-4 text-center font-semibold text-gray-700 font-mono text-xs">
                                Rp {Number(company.monthlyBill || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                                    company.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {company.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleToggleStatus(company.id, company.status)}
                                  className={`p-2 rounded-lg transition-all ${
                                    company.status === 'ACTIVE' 
                                    ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                                    : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'
                                  }`}
                                >
                                    {company.status === 'ACTIVE' ? <HiOutlineLockClosed className="w-5 h-5"/> : <HiOutlineCheckCircle className="w-5 h-5"/>}
                                </button>
                            </td>
                        </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400 text-sm italic">Belum ada data perusahaan terdaftar.</td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
      </section>
    </div>
  );
}

// Updated Sub-component with Hover Animation
const MiniStatCard = ({ title, value, subtitle, icon: Icon, colorCode }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-start justify-between hover:border-[#19A0FA]/40 hover:shadow-md transition-all duration-300 group">
    <div className="flex flex-col min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h2>
      <p className="text-[10px] font-semibold text-[#19A0FA] mt-1 bg-blue-50 px-2 py-0.5 rounded-md w-fit">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-2xl text-white shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`} style={{ backgroundColor: colorCode }}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 h-full">
    <h3 className="text-base font-semibold text-gray-800 mb-6">{title}</h3>
    {children}
  </div>
);