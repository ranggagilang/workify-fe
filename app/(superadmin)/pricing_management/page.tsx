'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiOutlineBanknotes,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlinePencilSquare,
  HiOutlineChartBar
} from 'react-icons/hi2';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const PRIMARY_BLUE = '#19A0FA';

export default function PricingManagementPage() {
  const [pricing, setPricing] = useState({ pricePerUser: 0 });
  const [billingData, setBillingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Mengambil harga global dan data monitor perusahaan
      const [priceRes, monitorRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/price`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/billing-monitor`, { headers })
      ]);

      if (priceRes.data.data) setPricing(priceRes.data.data);
      if (monitorRes.data.data) setBillingData(monitorRes.data.data);
      
    } catch (err: any) {
      console.error("Gagal load data pricing:", err);
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
        alert("✅ Harga global berhasil diperbarui!");
        fetchPricingData();
      } catch (err) {
        alert("❌ Gagal update harga");
      }
    }
  };

  // Kalkulasi Statistik Keseluruhan
  const totalActiveUsers = billingData.reduce((acc, curr) => acc + (Number(curr.totalUser) || 0), 0);
  const totalRevenue = billingData.reduce((acc, curr) => acc + (Number(curr.monthlyBill) || 0), 0);

  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">Memuat Pricing Management...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pricing Management</h1>
          <p className="text-sm text-gray-500 font-medium">Atur tarif lisensi global dan pantau performa billing ekosistem Workify.</p>
        </div>
      </div>

      {/* Top Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total User Aktif" 
          value={totalActiveUsers.toLocaleString()} 
          subtitle="Seluruh Perusahaan"
          icon={HiOutlineUsers} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Estimasi Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          subtitle="Bulan Berjalan"
          icon={HiOutlineBanknotes} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Harga Saat Ini" 
          value={`Rp ${Number(pricing.pricePerUser).toLocaleString()}`} 
          subtitle="Per User / Bulan"
          icon={HiOutlineShieldCheck} 
          colorClass="bg-amber-500" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Control Box */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center text-center group hover:border-[#19A0FA]/40 transition-all duration-300">
            <div className="bg-blue-50 p-5 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
                <HiOutlinePencilSquare className="w-12 h-12 text-[#19A0FA]" />
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Konfigurasi Tarif</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800 tracking-tighter">Rp {Number(pricing.pricePerUser).toLocaleString()}</span>
                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">/ User</span>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed font-medium">
                Perubahan harga akan berdampak langsung pada estimasi tagihan di seluruh dashboard Admin Perusahaan secara real-time.
            </p>
            <button 
              onClick={handleUpdatePrice}
              className="mt-8 w-full py-4 bg-[#19A0FA] text-white rounded-2xl font-bold hover:bg-blue-600 transition shadow-xl shadow-blue-100 text-sm tracking-wide"
            >
                Update Harga Global
            </button>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-gray-50 rounded-lg">
                <HiOutlineChartBar className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 tracking-tight">Revenue Distribution per Company</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#F9FAFB'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="monthlyBill" radius={[8, 8, 0, 0]} barSize={45}>
                  {billingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? PRIMARY_BLUE : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 tracking-tight">Rincian Billing Ekosistem</h3>
            <span className="text-[10px] font-bold text-[#19A0FA] bg-blue-50 px-3 py-1 rounded-md uppercase tracking-[0.2em]">Live Monitoring</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                        <th className="px-6 py-5">Perusahaan</th>
                        <th className="px-6 py-5 text-center">User (USER Role)</th>
                        <th className="px-6 py-5 text-center">Estimasi Revenue</th>
                        <th className="px-6 py-5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-semibold">
                    {billingData.map((company) => (
                        <tr key={company.id} className="hover:bg-blue-50/20 transition-colors group">
                            <td className="px-6 py-4">
                                <p className="text-gray-800 font-bold">{company.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium tracking-tight">UID: {company.id}</p>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-600 font-bold">{company.totalUser || 0} Karyawan</td>
                            <td className="px-6 py-4 text-center text-gray-800 font-mono text-xs">
                                Rp {Number(company.monthlyBill || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    company.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {company.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </section>
    </div>
  );
}

// Sub-component StatCard
function StatCard({ title, value, subtitle, icon: Icon, colorClass }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex items-start justify-between hover:border-[#19A0FA]/40 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col min-w-0 overflow-hidden">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight truncate">{value}</h2>
        <p className="text-[10px] font-bold text-[#19A0FA] mt-1.5 bg-blue-50 px-2 py-0.5 rounded-md w-fit uppercase">{subtitle}</p>
      </div>
      <div className={`p-4 rounded-2xl text-white shadow-xl shadow-current/10 ${colorClass} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}