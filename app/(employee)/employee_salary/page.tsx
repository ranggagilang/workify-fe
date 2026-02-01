'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    HiOutlineBanknotes, 
    HiOutlineDocumentText, 
    HiXMark,
    HiArrowDownTray
} from 'react-icons/hi2';

export default function MyPayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);

  useEffect(() => {
      fetchMyPayrolls();
  }, []);

  const getHeaders = () => {
      const token = localStorage.getItem('token');
      return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchMyPayrolls = async () => {
      setLoading(true);
      try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payroll/my`, getHeaders());
          setPayrolls(res.data.data);
      } catch (err) {
          console.error("Gagal load data");
      } finally {
          setLoading(false);
      }
  };

  const formatRupiah = (num: number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(num));
  };

  return (
    <div className="space-y-6">
      {/* 🟢 CSS UNTUK FIX PRINT (Tengah & Bersih) */}
      <style jsx global>{`
        @media print {
          /* 1. Sembunyikan SEMUA elemen di luar slip */
          body * {
            visibility: hidden;
          }
          
          /* 2. Tampilkan area slip gaji saja */
          #printable-slip, #printable-slip * {
            visibility: visible;
          }
          
          /* 3. Posisikan ke tengah (CENTER) */
          #printable-slip {
            position: absolute;
            left: 50%;
            top: 40px;
            transform: translateX(-50%);
            width: 100%;
            max-width: 600px;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: 1px solid #eee !important;
          }

          /* 4. Sembunyikan elemen UI yang tidak perlu di PDF */
          .no-print {
            display: none !important;
          }

          /* 5. Hapus header/footer otomatis browser */
          @page {
            size: auto;
            margin: 10mm 0;
          }
        }
      `}</style>

      {/* HEADER DASHBOARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold text-gray-800">Slip Gaji Saya</h1>
              <p className="text-gray-500 text-sm">Riwayat pembayaran gaji dan tunjangan.</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <HiOutlineBanknotes className="w-8 h-8"/>
          </div>
      </div>

      {/* LIST SLIP GAJI */}
      <div className="grid gap-4">
          {loading ? (
              <p className="text-center text-gray-400 py-10">Memuat data...</p>
          ) : payrolls.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                  <p className="text-gray-500">Belum ada riwayat gaji.</p>
              </div>
          ) : (
              payrolls.map((slip) => (
                  <div key={slip.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:border-[#19A0FA] transition cursor-pointer" onClick={() => setSelectedSlip(slip)}>
                      <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                          <div className="w-12 h-12 bg-blue-50 text-[#19A0FA] rounded-xl flex items-center justify-center font-bold text-lg">
                              <HiOutlineDocumentText className="w-6 h-6"/>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800 text-lg">Gaji Bulan {slip.month}</h4>
                              <p className="text-sm text-gray-500">Diterbitkan: {new Date(slip.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                              <p className="text-xs text-gray-400 font-bold uppercase">Take Home Pay</p>
                              <p className="text-xl font-bold text-green-600">{formatRupiah(slip.netSalary)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${slip.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {slip.status}
                          </span>
                      </div>
                  </div>
              ))
          )}
      </div>

      {/* MODAL DETAIL SLIP (E-PAYSLIP) */}
      {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              
              <div id="printable-slip" className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
                  
                  {/* Header Slip */}
                  <div className="bg-[#19A0FA] p-6 text-white text-center relative">
                      <button onClick={() => setSelectedSlip(null)} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full no-print">
                        <HiXMark className="w-6 h-6"/>
                      </button>
                      <h3 className="font-bold text-xl uppercase tracking-widest">Slip Gaji</h3>
                      <p className="opacity-90 text-sm">Periode: {selectedSlip.month}</p>
                      <div className="mt-4">
                          <p className="text-sm opacity-80 mb-1 font-medium">Total Penerimaan Bersih</p>
                          <h2 className="text-3xl font-bold">{formatRupiah(selectedSlip.netSalary)}</h2>
                      </div>
                  </div>

                  {/* Body Slip */}
                  <div className="p-6 space-y-6">
                      
                      {/* Statistik Kehadiran */}
                      <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-3 rounded-lg text-xs border border-gray-100">
                          <div>
                              <p className="text-gray-500 font-medium">Hadir</p>
                              <p className="font-bold text-gray-800">{selectedSlip.attendanceDays} Hari</p>
                          </div>
                          <div>
                              <p className="text-gray-500 font-medium">Telat</p>
                              <p className="font-bold text-red-500">{selectedSlip.lateCount} Kali</p>
                          </div>
                          <div>
                              <p className="text-gray-500 font-medium">Lembur</p>
                              <p className="font-bold text-green-600">{selectedSlip.overtimeHours} Jam</p>
                          </div>
                      </div>

                      {/* Rincian Pendapatan */}
                      <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 border-b pb-1 tracking-wider">Penerimaan (+)</h4>
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                  <span className="text-gray-600">Gaji Pokok</span>
                                  <span className="font-bold text-gray-800">{formatRupiah(selectedSlip.basicSalary)}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-gray-600">Total Tunjangan</span>
                                  <span className="font-bold text-gray-800">{formatRupiah(selectedSlip.totalAllowance)}</span>
                              </div>
                          </div>
                      </div>

                      {/* Rincian Potongan */}
                      <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 border-b pb-1 tracking-wider">Potongan (-)</h4>
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                  <span className="text-gray-600">Potongan Telat/Alpha</span>
                                  <span className="font-bold text-red-500">-{formatRupiah(selectedSlip.totalDeduction)}</span>
                              </div>
                          </div>
                      </div>

                      {/* Info Pembayaran */}
                      <div className="pt-4 border-t border-dashed text-[10px] text-gray-400 text-center">
                          <p>Dokumen ini dihasilkan secara otomatis oleh sistem payroll Workify.</p>
                      </div>
                  </div>

                  {/* Footer Action (Sembunyikan saat cetak) */}
                  <div className="p-4 bg-gray-50 border-t flex justify-center no-print">
                      <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-black transition shadow-lg">
                          <HiArrowDownTray className="w-4 h-4"/> Cetak / Simpan PDF
                      </button>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
}