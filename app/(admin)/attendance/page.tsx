'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    HiMagnifyingGlass,
    HiCalendarDays,
    HiEye,
    HiXMark,
    HiUser,
    HiMapPin,
    HiDocumentText,
    HiClock
} from 'react-icons/hi2'; 
import Link from 'next/link';

export default function AttendancePage() {
  const getLocalToday = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(getLocalToday());
  const [search, setSearch] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchAttendance = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance?date=${filterDate}`, getHeaders());
        setAttendance(res.data.data || []);
    } catch (e) {
        console.error("Gagal load data", e);
    } finally {
        setLoading(false);
    }
  };

  const filteredData = attendance.filter((item) => 
    item.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (item: any) => {
      const status = item.status;
      if (status === 'IZIN' || status === 'SAKIT' || status === 'CUTI' || item.isPermit) {
          return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold border border-blue-200 uppercase tracking-tighter">Izin (Approved)</span>;
      }
      if (item.clockIn && !item.clockOut) {
          return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold border border-yellow-200 animate-pulse uppercase tracking-tighter">⏳ Bekerja</span>;
      }
      if (status === 'LATE') {
          return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold border border-orange-200 uppercase tracking-tighter">Terlambat</span>;
      }
      if (status === 'ALPA') {
          return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold border border-red-200 uppercase tracking-tighter">Alpa</span>;
      }
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold border border-green-200 uppercase tracking-tighter">Hadir</span>;
  };

  return (
    // 🔥 Animasi Entry Sinkron dengan Dashboard
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Attendance Log</h3>
              <p className="text-xs text-gray-400 mt-1">Monitoring kehadiran tim secara real-time</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <HiCalendarDays className="w-4 h-4 text-[#19A0FA]" />
                  <input type="date" value={filterDate} onChange={(e)=>setFilterDate(e.target.value)} className="bg-transparent text-sm font-semibold outline-none text-gray-700"/>
              </div>
              
              <div className="relative flex-1 md:w-64">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                  <input type="text" placeholder="Cari nama..." className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all" value={search} onChange={(e)=>setSearch(e.target.value)}/>
              </div>

              <Link href="/attendance/permit_employee" className="px-4 py-2 bg-[#19A0FA] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all uppercase tracking-widest">
                  Permits
              </Link>
          </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                  <thead className="bg-gray-50/50">
                      <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                          <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Masuk</th>
                          <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pulang</th>
                          <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                      {loading ? ( <tr><td colSpan={5} className="p-16 text-center text-gray-400 animate-pulse font-medium">Synchronizing...</td></tr> ) : 
                       filteredData.length === 0 ? ( <tr><td colSpan={5} className="p-16 text-center text-gray-400 italic">No records found.</td></tr> ) : 
                       ( filteredData.map((item) => (
                              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                              {item.user?.image ? <img src={item.user.image} className="w-full h-full object-cover"/> : <HiUser className="w-6 h-6 text-gray-300"/>}
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-gray-700 truncate">{item.user?.name}</p>
                                              <p className="text-[10px] font-semibold text-gray-400 uppercase">{item.user?.shift?.name || 'Reguler'}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-center font-mono text-sm">
                                      {item.clockIn ? <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">{new Date(item.clockIn).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span> : <span className="text-gray-300">--:--</span>}
                                  </td>
                                  <td className="px-6 py-4 text-center font-mono text-sm">
                                      {item.clockOut ? <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg">{new Date(item.clockOut).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span> : <span className="text-gray-300">--:--</span>}
                                  </td>
                                  <td className="px-6 py-4 text-center">{getStatusBadge(item)}</td>
                                  <td className="px-6 py-4 text-center">
                                      <button onClick={() => {setSelectedData(item); setIsDetailOpen(true);}} className="p-2 text-gray-400 hover:text-[#19A0FA] hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-blue-100">
                                          <HiEye className="w-5 h-5"/>
                                      </button>
                                  </td>
                              </tr>
                          ))
                       )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* MODAL DETAIL (ANIMATED) */}
      {isDetailOpen && selectedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-blue-50 animate-in zoom-in-95 duration-300">
                  <div className="bg-[#19A0FA] p-6 flex justify-between items-center text-white">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                            <HiUser className="w-7 h-7"/>
                          </div>
                          <div>
                              <h3 className="font-bold text-xl leading-tight">{selectedData.user?.name}</h3>
                              <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest">{selectedData.user?.department?.name || 'Staff'}</p>
                          </div>
                      </div>
                      <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><HiXMark className="w-6 h-6"/></button>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                              <div>
                                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <HiClock className="w-4 h-4"/> Schedule
                                  </p>
                                  <p className="font-bold text-gray-800 text-sm">{selectedData.user?.shift?.name || 'Reguler'}</p>
                                  <p className="font-mono font-bold text-blue-600 text-lg mt-1">
                                      {selectedData.user?.shift ? `${selectedData.user.shift.clockIn} - ${selectedData.user.shift.clockOut}` : '-'}
                                  </p>
                              </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HiMapPin className="w-4 h-4"/> Activity Log</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-gray-400 uppercase">In</p>
                                      <p className="font-mono font-bold text-green-600 text-2xl">
                                          {selectedData.clockIn ? new Date(selectedData.clockIn).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                                      </p>
                                  </div>
                                  <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-gray-400 uppercase">Out</p>
                                      <p className="font-mono font-bold text-red-500 text-2xl">
                                          {selectedData.clockOut ? new Date(selectedData.clockOut).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><HiEye className="w-4 h-4"/> Proof</h4>
                          <div className="grid grid-cols-2 gap-3">
                              <div className="aspect-[3/4] rounded-2xl bg-gray-100 border border-gray-50 overflow-hidden shadow-inner flex items-center justify-center">
                                  {selectedData.imageClockIn ? <img src={selectedData.imageClockIn} className="w-full h-full object-cover"/> : <div className="text-[10px] text-gray-300 font-bold uppercase">No Image</div>}
                              </div>
                              <div className="aspect-[3/4] rounded-2xl bg-gray-100 border border-gray-50 overflow-hidden shadow-inner flex items-center justify-center">
                                  {selectedData.imageClockOut ? <img src={selectedData.imageClockOut} className="w-full h-full object-cover"/> : <div className="text-[10px] text-gray-300 font-bold uppercase">No Image</div>}
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex justify-end">
                      <button onClick={() => setIsDetailOpen(false)} className="px-10 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg uppercase tracking-[0.2em]">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}