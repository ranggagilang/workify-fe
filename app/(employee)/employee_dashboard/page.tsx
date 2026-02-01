'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    HiOutlineClock, 
    HiOutlineCalendarDays, 
    HiOutlineBriefcase, 
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiUser,
    HiOutlineMegaphone
} from 'react-icons/hi2';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Stats Realtime
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    todayStatus: 'Belum Absen'
  });

  // State Agenda
  const [nextEvent, setNextEvent] = useState<{title: string, date: string, type: string, color: string} | null>(null);

  // State Shift
  const [shift, setShift] = useState({
      name: '-',
      in: '--:--',
      out: '--:--'
  });

  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    fetchDashboardData();

    return () => clearInterval(interval);
  }, []);

  const getHeaders = () => {
      const token = localStorage.getItem('token');
      return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchDashboardData = async () => {
      try {
          const headers = getHeaders();

          // 1. PROFIL
          const resMe = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, headers);
          const userData = resMe.data.data;
          setUser(userData);

          if (userData.shift) {
              setShift({
                  name: userData.shift.name,
                  in: userData.shift.clockIn,
                  out: userData.shift.clockOut
              });
          }

          // 2. STATUS HARI INI
          const resToday = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance/today`, headers);
          const dataToday = resToday.data.data;
          
          let statusText = 'Belum Absen';
          if (dataToday?.clockIn) {
             if (dataToday?.clockOut) statusText = 'Sudah Pulang';
             else statusText = 'Sedang Bekerja';
          }

          // 3. STATISTIK KEHADIRAN (Bulan Ini)
          const resHistory = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance/history`, headers);
          const historyData = resHistory.data.data || [];

          const now = new Date();
          const thisMonthData = historyData.filter((item: any) => {
              const itemDate = new Date(item.date);
              return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
          });

          const totalPresent = thisMonthData.length;
          const totalLate = thisMonthData.filter((h: any) => h.status === 'LATE').length;

          // 4. JADWAL (Filter Agenda Mendatang)
          try {
              const resSchedule = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/calendar/my-schedule`, headers);
              const allEvents = resSchedule.data.data.events || [];
              
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Reset ke jam 12 malam tadi agar hari ini tetap tampil

              // 🔥 LOGIKA FILTER & SORT
              const upcomingEvents = allEvents
                  .filter((ev: any) => {
                      const eventDate = new Date(ev.start);
                      return eventDate >= today; // Hanya ambil tanggal hari ini atau ke depan
                  })
                  .sort((a: any, b: any) => {
                      return new Date(a.start).getTime() - new Date(b.start).getTime(); // Urutkan dari yang paling dekat
                  });

              if (upcomingEvents.length > 0) {
                  const ev = upcomingEvents[0]; // Ambil 1 data terdekat
                  setNextEvent({
                      title: ev.title,
                      type: ev.type,
                      color: ev.color || '#F97316', // Fallback color jika DB kosong
                      date: new Date(ev.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
                  });
              } else {
                  setNextEvent(null);
              }
          } catch (err) {
              console.log("Gagal load jadwal");
          }

          setStats({
              present: totalPresent,
              late: totalLate,
              todayStatus: statusText
          });

      } catch (error) {
          console.error("❌ Gagal load dashboard", error);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* 1. WELCOME BANNER */}
      <div className="bg-[#19A0FA] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Halo, {user?.name?.split(' ')[0] || 'Employee'}! 👋</h1>
                <p className="text-blue-50 max-w-xl text-sm md:text-base opacity-90">Selamat bekerja! Tetap semangat dan jangan lupa untuk melakukan absensi tepat waktu.</p>
                
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                        <HiOutlineCalendarDays className="w-5 h-5" />
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                        <HiOutlineClock className="w-5 h-5" />
                        {currentTime} WIB
                    </div>
                </div>
            </div>
            
            <div className="hidden md:block">
                <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg overflow-hidden bg-white/10 flex items-center justify-center">
                    {user?.image ? (
                        <img 
                            src={user.image} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <HiUser className="w-10 h-10 text-white" />
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Hadir</p>
                <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.present} <span className="text-sm font-normal text-gray-400">Hari</span></h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><HiOutlineCheckCircle/> Bulan ini</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><HiOutlineBriefcase className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Terlambat</p>
                <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.late} <span className="text-sm font-normal text-gray-400">Hari</span></h3>
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><HiOutlineExclamationCircle/> Perlu diperbaiki</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><HiOutlineClock className="w-6 h-6" /></div>
        </div>

        {/* 🟢 AGENDA BERIKUTNYA (DINAMIS & FILTERED) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div className="flex-1 min-w-0 pr-2">
                <p className="text-gray-500 text-sm font-medium mb-1">Agenda Berikutnya</p>
                {nextEvent ? (
                    <>
                        <h3 className="text-lg font-bold text-gray-800 truncate" title={nextEvent.title}>{nextEvent.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span 
                                className="text-[10px] px-2 py-0.5 rounded font-bold text-white uppercase"
                                style={{ backgroundColor: nextEvent.color }}
                            >
                                {nextEvent.type}
                            </span>
                            <span className="text-xs text-gray-500">{nextEvent.date}</span>
                        </div>
                    </>
                ) : (
                    <h3 className="text-lg font-bold text-gray-400 italic">Tidak ada agenda mendatang</h3>
                )}
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                <HiOutlineMegaphone className="w-6 h-6" />
            </div>
        </div>
      </div>

      {/* 3. BOTTOM INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Status Hari Ini</h3>
            <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${stats.todayStatus === 'Sedang Bekerja' ? 'bg-green-500 animate-pulse' : stats.todayStatus === 'Sudah Pulang' ? 'bg-gray-400' : 'bg-red-500'}`}></div>
                <span className="text-lg font-medium text-gray-700">{stats.todayStatus}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2 italic">
                {stats.todayStatus === 'Belum Absen' ? 'Silakan melakukan absensi masuk melalui menu Attendance.' : 
                 stats.todayStatus === 'Sedang Bekerja' ? 'Pekerjaan sedang berlangsung. Jangan lupa absen pulang saat selesai.' :
                 'Terima kasih! Sesi kerja Anda hari ini telah berakhir.'}
            </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-800">Jadwal Shift</h3>
                <span className="px-3 py-1 bg-blue-50 text-[#19A0FA] text-xs font-bold rounded-full">{shift.name}</span>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Jam Masuk</span><span className="font-bold text-gray-800">{shift.in}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Jam Pulang</span><span className="font-bold text-gray-800">{shift.out}</span></div>
            </div>
        </div>
      </div>
    </div>
  );
}