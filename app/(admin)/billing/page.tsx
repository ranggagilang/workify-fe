'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  HiOutlineCreditCard, 
  HiOutlineUserGroup, 
  HiOutlineReceiptPercent,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

export default function AdminBillingPage() {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchBillingDetails();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const fetchBillingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/billing/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBillingData(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data billing", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNGSI AMPUH: Mengubah format MySQL ke Tanggal Indonesia
  const formatExpiryDate = (dateString: any) => {
    if (!dateString) return 'Belum Aktif';
    
    try {
      // Ambil YYYY-MM-DD saja agar browser tidak bingung dengan milidetik MySQL
      const cleanDate = typeof dateString === 'string' ? dateString.split(' ')[0] : dateString;
      const date = new Date(cleanDate);
      
      if (isNaN(date.getTime())) return '-'; 
      
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return '-';
    }
  };

  const startPollingStatus = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/billing/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newData = res.data.data;
      setBillingData(newData);

      const hasPaid = newData.history.some((trx: any) => trx.status === 'PAID');
      if (hasPaid || newData.status === 'ACTIVE') {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      }
    }, 5000);
  };

  const handleCreateInvoice = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/transaction/create`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.paymentUrl) {
        window.open(res.data.paymentUrl, '_blank');
        startPollingStatus();
        alert("Invoice berhasil dibuat! Silakan bayar di tab baru.");
      }
      await fetchBillingDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memproses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center space-y-4 animate-pulse">
        <HiOutlineArrowPath className="w-10 h-10 text-blue-200 mx-auto animate-spin" />
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Synchronizing Billing Data...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Your Billing & Subscription</h1>
          <p className="text-xs text-gray-500 font-semibold italic mt-1 uppercase tracking-tighter">Kelola Lisensi & Transaksi Perusahaan</p>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 border shadow-sm transition-all duration-500 ${
          billingData?.status === 'ACTIVE' 
          ? 'bg-green-50 border-green-200 text-green-700' 
          : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
        }`}>
          {billingData?.status === 'ACTIVE' ? <HiOutlineShieldCheck className="w-5 h-5" /> : <HiOutlineClock className="w-5 h-5" />}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Status: {billingData?.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Billing Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="p-6 border-b border-blue-50 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <HiOutlineReceiptPercent className="w-5 h-5 text-[#19A0FA]" />
              Tagihan Berjalan
            </h3>
            <button onClick={fetchBillingDetails} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
                <HiOutlineArrowPath className={`w-4 h-4 text-gray-400 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Estimasi Pembayaran</p>
                <h2 className="text-6xl font-bold text-gray-800 tracking-tighter">
                  Rp {billingData?.estimatedBill?.toLocaleString('id-ID')}
                </h2>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-[#19A0FA] font-bold bg-blue-50/50 inline-block px-4 py-1.5 rounded-xl uppercase tracking-widest border border-blue-100/50">
                  {billingData?.totalUser} User Aktif Terdeteksi
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto space-y-3">
              <div className="flex justify-between items-center gap-12 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <HiOutlineUserGroup className="w-4 h-4 text-[#19A0FA]" /> Karyawan
                </span>
                <span className="font-bold text-gray-800">{billingData?.totalUser} <span className="text-[10px] text-gray-400 uppercase">User</span></span>
              </div>
              <div className="flex justify-between items-center gap-12 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <HiOutlineCreditCard className="w-4 h-4 text-[#19A0FA]" /> Rate
                </span>
                <span className="font-bold text-gray-800 text-sm">Rp {billingData?.pricePerUser?.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-center md:justify-start">
            <button 
              onClick={handleCreateInvoice}
              disabled={isProcessing}
              className="px-12 py-4 bg-[#092D49] text-white rounded-2xl font-bold hover:shadow-xl transition-all text-xs disabled:opacity-50 uppercase tracking-[0.2em]"
            >
              {isProcessing ? "Processing..." : "Generate & Pay Invoice"}
            </button>
          </div>
        </div>

        {/* Plan Info Card */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-8 flex flex-col justify-between group hover:border-[#19A0FA]/40 transition-all hover:shadow-md">
          <div className="space-y-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#19A0FA] group-hover:scale-110 transition-transform shadow-inner">
              <HiOutlineClock className="w-7 h-7" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">Informasi Paket</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-semibold uppercase tracking-tight">
                  Sistem Pay-As-You-Go. Anda hanya membayar untuk karyawan aktif (Role: USER).
                </p>
            </div>
          </div>
          
          <div className="mt-10 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tipe Lisensi</span>
              <span className="font-bold text-[#19A0FA] bg-blue-50 px-3 py-1 rounded-xl text-[10px] uppercase border border-blue-100">{billingData?.isTrial ? 'Free Trial' : 'Enterprise'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Jatuh Tempo</span>
              <span className="font-bold text-gray-700 text-xs bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 shadow-inner">
                {/* 🔥 Menampilkan Tanggal Asli dari Database */}
                {billingData?.expiredAt ? formatExpiryDate(billingData.expiredAt) : 'Menunggu...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 border-b border-gray-50 bg-gray-50/20">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-8 py-5">Reference ID</th>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Total Bayar</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {billingData?.history?.length > 0 ? billingData.history.map((trx: any) => (
                <tr key={trx.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-5 font-mono text-[10px] text-gray-400 group-hover:text-blue-500">
                      {trx.externalId || trx.id.slice(0, 20)}
                  </td>
                  <td className="px-8 py-5 text-gray-600 font-bold text-xs uppercase">
                      {new Date(trx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 font-bold text-gray-800 text-sm">
                      Rp {Number(trx.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-widest shadow-sm border uppercase ${
                      trx.status === 'PAID' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {trx.status === 'PENDING' && trx.paymentUrl ? (
                      <button 
                        onClick={() => window.open(trx.paymentUrl, '_blank')}
                        className="text-[#19A0FA] font-bold text-[10px] uppercase tracking-widest hover:bg-[#19A0FA] hover:text-white bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100"
                      >
                        Bayar Sekarang
                      </button>
                    ) : (
                      <button className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#19A0FA] transition-all bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                        Invoice PDF
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-gray-300 italic text-sm font-bold uppercase tracking-widest text-[10px]">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}