'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    HiPlus, 
    HiOutlineClipboardDocumentList,
    HiDocumentText,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiCalendarDays,
    HiArrowDownTray,
    HiPaperClip,
    HiOutlineDocument
} from 'react-icons/hi2';

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'TEMPLATES'>('REQUESTS');
  const [requests, setRequests] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'PERMIT', 
    startDate: '',
    endDate: '',
    reason: '',
    attachment: '' 
  });
  const [totalDays, setTotalDays] = useState(0); 
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, [activeTab]);

  // Hitung Durasi Otomatis
  useEffect(() => {
      if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
          setTotalDays(diffDays > 0 ? diffDays : 0);
      }
  }, [formData.startDate, formData.endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        if (activeTab === 'REQUESTS') {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/leaves/my`, { headers });
            setRequests(res.data.data);
        } else {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/letters`, { headers });
            setTemplates(res.data.data);
        }
    } catch (error) {
        console.error("Error fetching data");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) return alert("Ukuran file maksimal 5MB");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
              setFormData({ ...formData, attachment: reader.result as string });
          };
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) return alert("Lengkapi data!");

    setSubmitLoading(true);
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/leaves`, {
            ...formData,
            days: totalDays 
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        alert("✅ Pengajuan berhasil dikirim!");
        setIsModalOpen(false);
        setFormData({ type: 'PERMIT', startDate: '', endDate: '', reason: '', attachment: '' });
        setActiveTab('REQUESTS'); 
        fetchData(); 

    } catch (error: any) {
        alert(error.response?.data?.message || "Gagal mengirim data");
    } finally {
        setSubmitLoading(false);
    }
  };

  // --- 🔥 LOGIC DOWNLOAD BARU (ANTI-CORRUPT) ---
  const handleDownload = async (base64Data: string, fileName: string) => {
    try {
        // Cek apakah base64 valid (harus ada header data:...)
        if (!base64Data || !base64Data.includes(',')) {
            return alert("File tidak valid atau rusak.");
        }

        // 1. Fetch data langsung dari string Base64 (Browser yang handle decodingnya)
        const response = await fetch(base64Data);
        const blob = await response.blob(); // Ubah jadi binary BLOB

        // 2. Deteksi Ekstensi Otomatis dari Tipe Blob
        let extension = '';
        if (blob.type.includes('pdf')) extension = '.pdf';
        else if (blob.type.includes('word') || blob.type.includes('officedocument')) extension = '.docx';
        else if (blob.type.includes('image')) extension = '.jpg';

        // 3. Buat Link Download Virtual
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Paksa nama file + ekstensi yang benar
        link.download = `${fileName}${extension}`; 
        document.body.appendChild(link);
        link.click();
        
        // 4. Bersihkan memori
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download Error:", error);
        alert("Gagal mendownload file. Format mungkin rusak.");
    }
  };

  const renderBadge = (status: string) => {
    if (status === 'APPROVED') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex w-fit items-center gap-1"><HiOutlineCheckCircle/> Approved</span>;
    if (status === 'REJECTED') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold flex w-fit items-center gap-1"><HiOutlineXCircle/> Rejected</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold flex w-fit items-center gap-1"><HiOutlineClock/> Pending</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Leave & Permit</h1>
                <p className="text-gray-500 text-sm">Download template surat, isi, lalu upload saat pengajuan.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 px-6 py-3 bg-[#19A0FA] hover:bg-blue-600 text-white font-bold rounded-lg shadow-md flex items-center gap-2">
                <HiPlus className="w-5 h-5" /> Buat Pengajuan
            </button>
        </div>
        <div className="flex space-x-2 border-b border-gray-100">
            <button onClick={() => setActiveTab('REQUESTS')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'REQUESTS' ? 'border-[#19A0FA] text-[#19A0FA]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <HiOutlineClipboardDocumentList className="w-5 h-5"/> Riwayat Pengajuan
            </button>
            <button onClick={() => setActiveTab('TEMPLATES')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'TEMPLATES' ? 'border-[#19A0FA] text-[#19A0FA]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <HiDocumentText className="w-5 h-5"/> Template Surat (Download)
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* --- TAB 1: HISTORY REQUEST --- */}
        {activeTab === 'REQUESTS' && (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase"><tr className="border-b"><th className="px-6 py-4">Tipe</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Durasi</th><th className="px-6 py-4">Lampiran</th><th className="px-6 py-4">Status</th></tr></thead>
                    <tbody className="divide-y">
                        {loading ? <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr> : 
                        requests.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-400">Belum ada pengajuan.</td></tr> :
                        requests.map((r:any) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-gray-700">{r.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2"><HiCalendarDays/> {new Date(r.startDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm font-bold">{r.days} Hari</td>
                                <td className="px-6 py-4">
                                    {r.attachment ? (
                                        // 👇 PAKAI FUNGSI BARU DISINI
                                        <button 
                                            onClick={() => handleDownload(r.attachment, `Bukti_Izin_${r.id}`)}
                                            className="text-[#19A0FA] text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline" 
                                            title="Download File"
                                        >
                                            <HiPaperClip/> Lihat/Download
                                        </button>
                                    ) : <span className="text-gray-300 text-xs">-</span>}
                                </td>
                                <td className="px-6 py-4">{renderBadge(r.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- TAB 2: TEMPLATE DOWNLOAD --- */}
        {activeTab === 'TEMPLATES' && (
            <div className="p-6">
                {templates.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed"><p className="text-gray-500">Belum ada template dari Admin.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((t: any) => (
                            <div key={t.id} className="border p-4 rounded-xl flex justify-between items-center bg-white hover:shadow-md transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><HiOutlineDocument className="w-6 h-6"/></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{t.title}</h4>
                                        <p className="text-xs text-gray-500">{t.description}</p>
                                    </div>
                                </div>
                                {/* 👇 PAKAI FUNGSI BARU DISINI JUGA */}
                                <button 
                                    onClick={() => handleDownload(t.fileUrl, t.title)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg text-sm font-bold flex gap-2 items-center transition"
                                >
                                    <HiArrowDownTray/> Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Buat Pengajuan Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Jenis</label>
                        <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-1" 
                            value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                            <option value="PERMIT">Izin (Permit)</option>
                            <option value="SICK">Sakit (Sick)</option>
                            <option value="ANNUAL">Cuti Tahunan (Annual)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Mulai</label>
                            <input type="date" required className="w-full p-2 border rounded-lg mt-1" 
                                value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Sampai</label>
                            <input type="date" required className="w-full p-2 border rounded-lg mt-1" 
                                value={formData.endDate} onChange={e=>setFormData({...formData, endDate: e.target.value})}/>
                        </div>
                    </div>
                    {totalDays > 0 && <div className="text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded text-center">Durasi: {totalDays} Hari</div>}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Alasan</label>
                        <textarea required className="w-full p-2 border rounded-lg mt-1" rows={2} 
                            placeholder="Jelaskan alasan pengajuan..."
                            value={formData.reason} onChange={e=>setFormData({...formData, reason: e.target.value})}></textarea>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition" onClick={()=>fileInputRef.current?.click()}>
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2 cursor-pointer">
                            <HiPaperClip className="text-blue-500"/> Upload Lampiran
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Lampirkan surat dokter / form cuti (PDF/Word/JPG).</p>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleFileChange}/>
                        {formData.attachment ? <p className="text-xs text-green-600 font-bold break-all">File Terlampir (Siap Kirim)</p> : <p className="text-xs text-gray-400 italic">Belum ada file dipilih</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" disabled={submitLoading} className="flex-1 py-2 bg-[#19A0FA] text-white rounded-lg font-bold hover:bg-blue-600 shadow-lg">
                            {submitLoading ? 'Sending...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}