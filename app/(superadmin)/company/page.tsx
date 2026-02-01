'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiOutlineTrash, 
  HiOutlinePencilSquare,
  HiOutlineEye,
} from 'react-icons/hi2';

type SubscriptionStatus = 'Active' | 'Trial' | 'Expired';

interface Company {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  subscriptionPlan: string;
  status: SubscriptionStatus;
  logoColor: string; 
  logoUrl?: string; 
}

const LOGO_COLORS = [
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600',
    'bg-green-100 text-green-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
];

export default function CompanyManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/companies`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const rawData = res.data.data;

        // Di dalam fetchCompanies > rawData.map
        const formattedData: Company[] = rawData.map((item: any, index: number) => {
            const admin = item.users?.[0] || {};
            const now = new Date();
            const expiryDate = item.expiredAt ? new Date(item.expiredAt) : null;
            
            // 🔥 1. Penentuan status yang cerdas (Mengecek tanggal kadaluarsa)
            let currentStatus: SubscriptionStatus = 'Trial';
            
            if (item.status === 'ACTIVE') {
                currentStatus = 'Active';
            } else if (item.status === 'SUSPENDED' || (expiryDate && now > expiryDate)) {
                // Jika status emang Suspended ATAU sudah lewat tanggal expired
                currentStatus = 'Expired';
            } else if (item.isTrial) {
                currentStatus = 'Trial';
            }

            // 🔥 2. Proteksi agar tidak crash jika nama kosong
            const safeName = item.name || 'Unnamed Company';

            return {
                id: item.id.toString(),
                name: safeName,
                initials: safeName.substring(0, 2).toUpperCase(),
                phone: admin.phone || item.phone || '-',
                email: admin.email || item.email || '-',
                address: item.address || 'No Address',
                registrationDate: new Date(item.createdAt).toLocaleDateString('id-ID'),
                // Tambahkan info ini agar bisa ditampilkan di tabel jika mau
                expiryDate: expiryDate ? expiryDate.toLocaleDateString('id-ID') : '-', 
                subscriptionPlan: item.isTrial ? 'Free Trial' : 'Enterprise',
                status: currentStatus,
                logoColor: LOGO_COLORS[index % LOGO_COLORS.length],
                logoUrl: item.image 
            };
        });

        setCompanies(formattedData);
    } catch (err) {
        console.error("Gagal ambil data company:", err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'Active':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100 shadow-sm shadow-green-50">Active</span>;
      case 'Trial':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-50">Trial</span>;
      case 'Expired':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 shadow-sm shadow-red-50">Suspended</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden h-fit transition-all duration-500">
        
        <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Data Perusahaan</h3>
            <span className="bg-[#19A0FA] text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm shadow-blue-100">
              {isLoading ? '...' : filteredCompanies.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#19A0FA] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari perusahaan..." 
                  className="pl-10 pr-4 py-2 w-full sm:w-60 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#19A0FA] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-50/30 text-[#19A0FA] border-b border-blue-50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Company Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Address</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50 font-medium text-gray-600">
              {isLoading ? (
                  <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                          <div className="animate-pulse flex flex-col items-center">
                              <p className="font-bold text-xs uppercase tracking-tighter">Memproses Data...</p>
                          </div>
                      </td>
                  </tr>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-110 transition-transform overflow-hidden ${company.logoUrl ? 'bg-white border border-gray-100' : company.logoColor}`}>
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                          ) : (
                            company.initials
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{company.name}</p>
                          <p className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">ID: {company.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-gray-700 truncate">{company.email}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-wider">{company.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 max-w-[140px] truncate">{company.address}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs text-gray-500 font-bold">{company.registrationDate}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(company.status)}
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{company.subscriptionPlan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-[#19A0FA] hover:bg-blue-50 rounded-xl transition-all"><HiOutlineEye className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><HiOutlineTrash className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-300 italic text-sm font-bold">Data tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}