'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'; 
import { 
    HiMapPin, 
    HiOutlineBuildingOffice, 
    HiOutlineHome,
    HiOutlineClock,
    HiOutlineClipboardDocumentList, 
    HiCamera,
    HiOutlineArrowPath 
} from 'react-icons/hi2';

// Import Map secara dinamis
const MapWithRadius = dynamic(() => import('../../../components/MapWithRadius'), { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Memuat Peta...</div>
});

export default function AttendancePage() {
  
  // === STATE ===
  // 👇 UPDATE: Tambah workingType di interface state
  const [officeConfig, setOfficeConfig] = useState<{
      lat: number, 
      lng: number, 
      radiusKm: number, 
      workingType?: string 
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'PRESENCE' | 'HISTORY'>('PRESENCE');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [todayStats, setTodayStats] = useState<any>({ 
      status: 'LOADING', clockIn: null, clockOut: null, shift: null 
  });

  const [location, setLocation] = useState<{lat: number, long: number} | null>(null);
  const [address, setAddress] = useState("Mencari lokasi...");
  const [attendanceType, setAttendanceType] = useState('WFO'); 
  const [notes, setNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [distance, setDistance] = useState<number>(0);
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
  const [loadingHistory, setLoadingHistory] = useState(false);

  // === INITIALIZATION ===
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchCompanyConfig(); 
    fetchTodayData(); 
    getLocation(); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'HISTORY') fetchHistory();
  }, [activeTab, selectedMonth]);

  useEffect(() => {
     if (location && officeConfig) {
        const dist = calculateDistance(location.lat, location.long, officeConfig.lat, officeConfig.lng);
        setDistance(dist);
        setIsWithinRadius(dist <= officeConfig.radiusKm);
     }
  }, [location, officeConfig]);

  // === HELPER ===
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  // === API CALLS ===
  const fetchCompanyConfig = async () => {
      try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/companies/profile`, getHeaders());
          const data = res.data.data;
          
          if(data && data.latitude && data.longitude) {
              const wType = data.workingType || 'HYBRID'; // Default Hybrid jika null
              
              setOfficeConfig({
                  lat: Number(data.latitude), 
                  lng: Number(data.longitude),
                  radiusKm: data.radiusKm ? Number(data.radiusKm) : 0.1,
                  workingType: wType // Simpan tipe kerja
              });

              // 👇 LOGIC BARU: Otomatis set tipe absen berdasarkan kebijakan perusahaan
              if (wType === 'WFO') setAttendanceType('WFO');
              if (wType === 'WFA') setAttendanceType('WFA');
          }
      } catch (e) { console.error("Gagal load config"); }
  };

  const fetchTodayData = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance/today`, getHeaders());
        const data = res.data.data;
        
        if (data) {
            let status = 'BELUM_ABSEN';
            if (data.clockIn && !data.clockOut) {
                status = 'SUDAH_MASUK'; 
            } else if (data.clockIn && data.clockOut) {
                status = 'SUDAH_PULANG'; 
            }

            setTodayStats({
                status: status,
                clockIn: data.clockIn,
                clockOut: data.clockOut,
                shift: data.shift 
            });
        } else {
             setTodayStats((prev: any) => ({ ...prev, status: 'BELUM_ABSEN' }));
        }
    } catch (e) { 
        setTodayStats((prev: any) => ({ ...prev, status: 'BELUM_ABSEN' }));
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance/history`, getHeaders());
        const filtered = res.data.data.filter((h: any) => h.date.startsWith(selectedMonth));
        setHistory(filtered);
    } catch (e) { console.error("Error history"); }
    finally { setLoadingHistory(false); }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
        setAddress("Mengambil koordinat...");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation({ lat: latitude, long: longitude });
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    setAddress(data.display_name?.split(',')[0] || "Lokasi Terdeteksi");
                } catch (e) { setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`); }
            }, 
            () => setAddress("Gagal ambil lokasi. Pastikan GPS Aktif!")
        );
    } else { setAddress("Browser tidak support GPS."); }
  };

  // === ACTIONS ===
  const handleClockIn = async () => {
    if (!location) return alert("Lokasi wajib ada! Tunggu GPS.");
    
    setLoadingAction(true);
    try {
        let base64Image = "";
        if (imageFile) {
            base64Image = await convertToBase64(imageFile);
        }
        
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-in`, {
            latitude: location.lat, 
            longitude: location.long, 
            type: attendanceType, 
            notes,
            image: base64Image, 
            address: address    
        }, getHeaders());
        
        alert("✅ " + res.data.message); 
        await fetchTodayData(); 
        
        setImageFile(null);
        setImagePreview("");
        
    } catch (e: any) { 
        const msg = e.response?.data?.message || "Gagal absen";
        alert("⚠️ " + msg);

        if (msg.includes("sudah melakukan Clock In")) {
            await fetchTodayData();
        }
    } finally { 
        setLoadingAction(false); 
    }
  };

  const handleClockOut = async () => {
    if (!location) return alert("Lokasi wajib ada!");
    
    setLoadingAction(true);
    try {
        let base64Image = "";
        if (imageFile) base64Image = await convertToBase64(imageFile);

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-out`, {
            latitude: location.lat, 
            longitude: location.long, 
            image: base64Image,
            notes: "" 
        }, getHeaders());

        alert("👋 Hati-hati di jalan! Absen pulang berhasil."); 
        await fetchTodayData(); 
        
    } catch (e: any) { 
        const msg = e.response?.data?.message || "Gagal absen pulang";
        
        if (msg.includes("Wajib isi 'Catatan'")) {
            const reason = prompt("⚠️ " + msg + "\n\nMasukkan alasan pulang cepat:");
            
            if (reason) {
                try {
                    let base64Image = "";
                    if (imageFile) base64Image = await convertToBase64(imageFile);

                    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attendance/clock-out`, {
                        latitude: location.lat, 
                        longitude: location.long, 
                        image: base64Image,
                        notes: reason 
                    }, getHeaders());

                    alert("✅ Izin pulang cepat berhasil dicatat.");
                    await fetchTodayData();
                } catch (retryError: any) {
                    const retryMsg = retryError.response?.data?.message || "Gagal menyimpan izin.";
                    alert("❌ " + retryMsg);
                }
            }
        } else {
            alert("❌ " + msg);
        }
    } finally { 
        setLoadingAction(false); 
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'LATE') return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold border border-yellow-200">Terlambat</span>;
    if (status === 'PRESENT') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200">Tepat Waktu</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">{status}</span>;
  };

  return (
    <div className="space-y-6 pb-20">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm border border-[#19A0FA]/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-xl font-bold text-gray-800">Presensi Karyawan</h2>
            <p className="text-sm text-gray-500">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
         </div>
         <div className="bg-gray-100 p-1 rounded-lg flex">
            <button onClick={() => setActiveTab('PRESENCE')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'PRESENCE' ? 'bg-white text-[#19A0FA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <HiOutlineClock className="w-5 h-5"/> Absen Hari Ini
            </button>
            <button onClick={() => setActiveTab('HISTORY')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-white text-[#19A0FA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <HiOutlineClipboardDocumentList className="w-5 h-5"/> Riwayat
            </button>
         </div>
      </div>

      {/* === TAB 1: FORM ABSENSI === */}
      {activeTab === 'PRESENCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* KIRI: FORM */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                
                {/* Header Jam & Shift */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h3 className="font-bold text-gray-700">Form Kehadiran</h3>
                        {todayStats.shift ? (
                             <p className="text-xs text-purple-600 font-bold mt-1 bg-purple-50 px-2 py-1 rounded inline-block border border-purple-100">
                                📅 Jadwal Shift: {todayStats.shift.name} ({todayStats.shift.clockIn} - {todayStats.shift.clockOut})
                             </p>
                        ) : (
                             <p className="text-xs text-red-400 mt-1 italic">Belum ada jadwal shift.</p>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-mono font-bold text-[#19A0FA]">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                        </span>
                    </div>
                </div>

                {/* INFO JARAK DINAMIS */}
                {attendanceType === 'WFO' && location && officeConfig ? (
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${isWithinRadius ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        <div className="flex items-center gap-2">
                            <HiOutlineBuildingOffice className="w-5 h-5"/>
                            <span className="text-sm font-bold">Jarak ke Kantor: {distance.toFixed(3)} km</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded">
                            {isWithinRadius ? "✅ Dalam Radius" : "❌ Terlalu Jauh"}
                        </span>
                    </div>
                ) : attendanceType === 'WFO' && (
                    <div className="p-3 bg-gray-50 border rounded text-xs text-gray-400 text-center">
                        Memuat konfigurasi lokasi kantor...
                    </div>
                )}

                {/* 👇 Pilihan WFO/WFA DINAMIS BERDASARKAN SETTINGAN ADMIN */}
                {todayStats.status === 'BELUM_ABSEN' && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            Lokasi Kerja 
                            {/* Opsional: Tampilkan label mode */}
                            {officeConfig?.workingType && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{officeConfig.workingType}</span>}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                             
                             {/* TOMBOL WFO: Muncul jika HYBRID atau WFO */}
                             {(officeConfig?.workingType === 'HYBRID' || officeConfig?.workingType === 'WFO') && (
                                 <button 
                                    onClick={() => setAttendanceType('WFO')} 
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${attendanceType === 'WFO' ? 'border-[#19A0FA] bg-blue-50 text-[#19A0FA]' : 'border-gray-100 hover:bg-gray-50'}`}
                                 >
                                    <HiOutlineBuildingOffice className="w-6 h-6"/> 
                                    <span className="font-bold text-sm">WFO (Kantor)</span>
                                 </button>
                             )}

                             {/* TOMBOL WFA: Muncul jika HYBRID atau WFA */}
                             {(officeConfig?.workingType === 'HYBRID' || officeConfig?.workingType === 'WFA') && (
                                 <button 
                                    onClick={() => setAttendanceType('WFA')} 
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${attendanceType === 'WFA' ? 'border-[#19A0FA] bg-blue-50 text-[#19A0FA]' : 'border-gray-100 hover:bg-gray-50'}`}
                                 >
                                    <HiOutlineHome className="w-6 h-6"/> 
                                    <span className="font-bold text-sm">WFA (Bebas)</span>
                                 </button>
                             )}
                        </div>
                    </div>
                )}

                {/* Lokasi GPS */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-3 items-center">
                    <div className="text-red-500 animate-pulse"><HiMapPin className="w-6 h-6"/></div>
                    <div className="flex-1">
                         <p className="text-sm font-bold text-gray-800">{address}</p>
                         {location && <p className="text-xs text-gray-500 font-mono">Lat: {location.lat.toFixed(5)} | Long: {location.long.toFixed(5)}</p>}
                    </div>
                    <button onClick={getLocation} className="p-2 bg-white border rounded hover:bg-gray-100 text-gray-500">
                        <HiOutlineArrowPath className="w-5 h-5"/>
                    </button>
                </div>

                {/* INPUT FOTO (Opsional) */}
                {todayStats.status !== 'SUDAH_PULANG' && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
                            <HiCamera className="w-5 h-5"/> 
                            {todayStats.status === 'SUDAH_MASUK' ? "Selfie Pulang (Opsional)" : "Bukti Selfie (Opsional)"}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                            <input 
                                type="file" accept="image/*" capture="user" onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-40 mx-auto rounded-lg object-cover shadow-sm"/>
                            ) : (
                                <div className="text-gray-400 py-4">
                                    <HiCamera className="w-10 h-10 mx-auto mb-2"/>
                                    <p className="text-xs">Klik untuk ambil foto / upload</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Catatan (Hanya saat masuk) */}
                {todayStats.status === 'BELUM_ABSEN' && (
                    <div>
                        <label className="text-sm font-bold text-gray-600 mb-2 block">Catatan</label>
                        <textarea className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Isi catatan jika perlu..." rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}/>
                    </div>
                )}

                {/* ACTION BUTTONS (LOGIC UTAMA) */}
                <div className="pt-2">
                    {todayStats.status === 'LOADING' ? (
                        <div className="text-center text-gray-400 py-4">Memuat data...</div>
                    ) : todayStats.status === 'BELUM_ABSEN' ? (
                        <button 
                            onClick={handleClockIn} 
                            disabled={loadingAction || !location || (attendanceType === 'WFO' && !isWithinRadius)} 
                            className="w-full py-4 bg-[#19A0FA] text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingAction ? "Memproses..." : "CLOCK IN (MASUK KERJA)"}
                        </button>
                    ) : todayStats.status === 'SUDAH_MASUK' ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 text-center rounded-xl border border-green-200">
                                <p className="text-sm font-bold">✅ Anda sudah Absen Masuk</p>
                                <p className="text-2xl font-mono font-bold mt-1">{new Date(todayStats.clockIn).toLocaleTimeString()}</p>
                            </div>
                            <button 
                                onClick={handleClockOut} 
                                disabled={loadingAction || !location} 
                                className="w-full py-4 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition disabled:opacity-50"
                            >
                                {loadingAction ? "Memproses..." : "CLOCK OUT (PULANG)"}
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 bg-gray-100 rounded-xl text-center border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-600">Absensi Selesai!</h3>
                            <div className="flex justify-center gap-4 mt-4 text-sm font-mono">
                                <span className="text-green-600">IN: {new Date(todayStats.clockIn).toLocaleTimeString()}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-red-600">OUT: {new Date(todayStats.clockOut).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* KANAN: MAPS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-80 lg:h-auto relative min-h-[300px] z-0">
                <MapWithRadius 
                    key={officeConfig ? "office-loaded" : "office-loading"} // Force Refresh Map
                    userLocation={location} 
                    officeLocation={officeConfig} 
                />
            </div>
        </div>
      )}

      {/* === TAB 2: HISTORY === */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#19A0FA]/20 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-gray-700">Laporan Kehadiran</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">Bulan:</span>
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"/>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#19A0FA]/5 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Masuk</th>
                            <th className="px-6 py-4">Pulang</th>
                            <th className="px-6 py-4">Tipe</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loadingHistory ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Sedang memuat data...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Tidak ada data absensi.</td></tr>
                        ) : (
                            history.map((h: any) => (
                                <tr key={h.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-700">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</td>
                                    <td className="px-6 py-4 text-green-600 font-mono font-bold">{new Date(h.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-4 text-red-600 font-mono font-bold">{h.clockOut ? new Date(h.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${h.type === 'WFO' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{h.type}</span></td>
                                    <td className="px-6 py-4">{getStatusBadge(h.status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

    </div>
  );
}