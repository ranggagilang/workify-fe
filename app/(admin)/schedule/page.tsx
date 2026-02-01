'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiChevronLeft, HiChevronRight, HiPlus, HiOutlineClock,
  HiTrash, HiCalendarDays, HiCog6Tooth, 
  HiUserGroup, 
  HiOutlineUserCircle,
  HiOutlineInformationCircle,
  HiTag // 🟢 Icon baru untuk Tab Kategori
} from 'react-icons/hi2';

// Calendar Imports
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function SchedulePage() {
  // === STATE NAVIGASI TAB ===
  // 🟢 Tambahkan tab 'CATEGORIES'
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'SHIFTS' | 'ASSIGN' | 'CATEGORIES'>('CALENDAR');

  // === STATE DATA ===
  const [events, setEvents] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); 
  const [categories, setCategories] = useState<any[]>([]); // 🟢 Simpan data kategori dari DB

  // === STATE UI CALENDAR ===
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  // === STATE UI SHIFT ===
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // === STATE BULK ASSIGNMENT ===
  const [selectedEmpIds, setSelectedEmpIds] = useState<number[]>([]); 
  const [bulkShiftId, setBulkShiftId] = useState(""); 

  // Form Data
  const [eventForm, setEventForm] = useState({ title: '', start: '', end: '', type: '', description: '', color: '#3B82F6' });
  const [shiftForm, setShiftForm] = useState({ name: '', clockIn: '08:00', clockOut: '17:00', lateToleranceMinutes: 30, absentThresholdMinutes: 60 });
  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#19A0FA' }); // 🟢 Form untuk Kategori Baru

  // 1. FETCH DATA SAAT LOAD
  useEffect(() => {
    fetchEvents();
    fetchShifts();
    fetchEmployees();
    fetchCategories(); // 🟢 Panggil kategori
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  // --- API CALLS ---
  const fetchEvents = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/calendar`, getHeaders());
        const formatted = res.data.data.map((ev: any) => ({ 
            ...ev, 
            start: new Date(ev.start), 
            end: new Date(ev.end),
            color: ev.color || '#3B82F6' // 🟢 Pastikan warna terambil dari DB
        }));
        setEvents(formatted);
    } catch (e) { console.error("Err calendar"); }
  };

  const fetchShifts = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/shifts`, getHeaders());
        setShifts(res.data.data);
    } catch (e) { console.error("Err shifts"); }
  }

  const fetchEmployees = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees`, getHeaders());
        setEmployees(res.data.data);
    } catch (e) { console.error("Err employees"); }
  }

  // 🟢 Ambil data kategori dari Backend
  const fetchCategories = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, getHeaders());
        setCategories(res.data.data);
    } catch (e) { console.error("Err categories"); }
  }

  // --- ACTIONS ---

  // 🟢 Action: Simpan Kategori Baru
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/categories`, categoryForm, getHeaders());
        alert("Kategori berhasil dibuat!");
        setCategoryForm({ name: '', color: '#19A0FA' });
        fetchCategories();
    } catch (e) { alert("Gagal membuat kategori"); } finally { setLoading(false); }
  }

  // 🟢 Action: Hapus Kategori
  const deleteCategory = async (id: number) => {
    if(confirm("Hapus kategori ini?")) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, getHeaders());
        fetchCategories();
    }
  }

  const handleUpdateEmployeeShift = async (employeeId: number, newShiftId: string) => {
    if(!newShiftId) return;
    try {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employeeId}/shift`, { shiftId: newShiftId }, getHeaders());
        alert("Shift karyawan berhasil diupdate!");
        fetchEmployees(); 
    } catch (error) { alert("Gagal update shift"); }
  }

  const handleBulkUpdate = async () => {
    if (selectedEmpIds.length === 0 || !bulkShiftId) return alert("Pilih karyawan dan shift!");
    try {
        setLoading(true);
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/employees/bulk-shift`, { employeeIds: selectedEmpIds, shiftId: bulkShiftId }, getHeaders());
        alert(`Sukses!`);
        fetchEmployees(); setSelectedEmpIds([]); setBulkShiftId("");    
    } catch (error) { alert("Gagal"); } finally { setLoading(false); }
  };

  const toggleSelect = (id: number) => {
    if (selectedEmpIds.includes(id)) setSelectedEmpIds(selectedEmpIds.filter(x => x !== id));
    else setSelectedEmpIds([...selectedEmpIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedEmpIds.length === employees.length) setSelectedEmpIds([]);
    else setSelectedEmpIds(employees.map(e => e.id));
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
        // 🟢 Temukan warna dari kategori yang dipilih
        const selectedCat = categories.find(c => c.name === eventForm.type);
        const payload = { 
            ...eventForm, 
            color: selectedCat ? selectedCat.color : '#3B82F6' // 🟢 Gunakan warna kategori
        };

        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/calendar`, payload, getHeaders());
        alert("Jadwal Berhasil!"); 
        setIsEventModalOpen(false); 
        fetchEvents();
        setEventForm({ title: '', start: '', end: '', type: '', description: '', color: '#3B82F6' }); 
    } catch (e) { alert("Gagal simpan jadwal"); } finally { setLoading(false); }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shifts`, shiftForm, getHeaders());
        alert("Shift Berhasil!"); setIsShiftModalOpen(false); fetchShifts();
        setShiftForm({ name: '', clockIn: '08:00', clockOut: '17:00', lateToleranceMinutes: 30, absentThresholdMinutes: 60 });
    } catch (e) { alert("Gagal"); } finally { setLoading(false); }
  };

  const deleteEvent = async (id: number) => {
    if(confirm("Hapus Jadwal?")) { 
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/calendar/${id}`, getHeaders()); 
        fetchEvents(); 
    }
  }

  const deleteShift = async (id: number) => {
    if(confirm("Hapus Shift ini?")) { 
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/shifts/${id}`, getHeaders()); 
        fetchShifts(); 
    }
  }

  const handleSelectSlot = ({ start, end }: any) => {
    setEventForm({ ...eventForm, start: moment(start).format('YYYY-MM-DDTHH:mm'), end: moment(end).format('YYYY-MM-DDTHH:mm') });
    setIsEventModalOpen(true);
  };
  
  const eventStyleGetter = (event: any) => {
    return { style: { backgroundColor: event.color, color: 'white', fontSize: '12px', borderRadius: '4px', padding: '2px 5px', border: 'none' } };
  };

  const onNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate = new Date(date);
    if (action === 'TODAY') newDate = new Date();
    else if (action === 'PREV') newDate = moment(date).subtract(1, view === Views.MONTH ? 'month' : 'week').toDate();
    else if (action === 'NEXT') newDate = moment(date).add(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setDate(newDate);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* HEADER & TABS NAVIGATION */}
      <div className="bg-white rounded-xl border border-[#19A0FA]/20 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Schedule Center</h2>
                <p className="text-sm text-gray-500">Pengaturan jadwal operasional perusahaan.</p>
            </div>
            
            <div className="bg-gray-100 p-1 rounded-xl flex overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('CALENDAR')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'CALENDAR' ? 'bg-white text-[#19A0FA] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                    <HiCalendarDays className="w-5 h-5"/> Calendar
                </button>
                {/* 🟢 Tombol Tab Kategori */}
                <button onClick={() => setActiveTab('CATEGORIES')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'CATEGORIES' ? 'bg-white text-[#19A0FA] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                    <HiTag className="w-5 h-5"/> Categories
                </button>
                <button onClick={() => setActiveTab('SHIFTS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'SHIFTS' ? 'bg-white text-[#19A0FA] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                    <HiCog6Tooth className="w-5 h-5"/> Shift Master
                </button>
                <button onClick={() => setActiveTab('ASSIGN')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ASSIGN' ? 'bg-white text-[#19A0FA] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                    <HiUserGroup className="w-5 h-5"/> Assignment
                </button>
            </div>
        </div>
      </div>

      {/* === TAB 1: CALENDAR === */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-[#19A0FA]/20 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button onClick={() => onNavigate('PREV')} className="p-2 hover:bg-white rounded-md text-gray-500"><HiChevronLeft/></button>
                            <button onClick={() => onNavigate('TODAY')} className="px-4 text-xs font-bold text-gray-600">Today</button>
                            <button onClick={() => onNavigate('NEXT')} className="p-2 hover:bg-white rounded-md text-gray-500"><HiChevronRight/></button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{moment(date).format('MMMM YYYY')}</h3>
                    </div>
                    <button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#19A0FA] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200">
                        <HiPlus/> Add Event
                    </button>
                </div>
                <div className="h-[600px] text-sm font-medium border rounded-xl overflow-hidden">
                    <Calendar
                        localizer={localizer} events={events} startAccessor="start" endAccessor="end"
                        view={view} onView={setView} date={date} onNavigate={setDate}
                        eventPropGetter={eventStyleGetter} selectable onSelectSlot={handleSelectSlot}
                        onSelectEvent={(ev: any) => deleteEvent(ev.id)} toolbar={false} popup
                    />
                </div>
            </div>
        </div>
      )}

      {/* === 🟢 TAB 2: CATEGORIES (CONTENT BARU) === */}
      {activeTab === 'CATEGORIES' && (
          <div className="bg-white rounded-xl border border-[#19A0FA]/20 shadow-sm p-8 space-y-8 animate-fade-in">
              <div>
                  <h3 className="text-xl font-bold text-gray-800">Master Kategori Jadwal</h3>
                  <p className="text-sm text-gray-500">Tentukan warna label untuk tipe acara di kalender.</p>
              </div>

              <form onSubmit={handleCategorySubmit} className="flex flex-wrap gap-4 items-end bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-bold text-gray-400 uppercase">Nama Kategori</label>
                      <input className="w-full mt-1 p-2.5 border rounded-xl outline-none" placeholder="Misal: Meeting Internal" required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}/>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Warna Label</label>
                      <input type="color" className="block w-16 h-11 mt-1 border rounded-xl cursor-pointer p-1" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})}/>
                  </div>
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-[#19A0FA] text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-100">Tambah Kategori</button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((cat: any) => (
                      <div key={cat.id} className="p-4 border rounded-2xl flex items-center justify-between hover:bg-gray-50 transition shadow-sm bg-white">
                          <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                              <span className="font-bold text-gray-700">{cat.name}</span>
                          </div>
                          <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-300 hover:text-red-500 transition"><HiTrash/></button>
                      </div>
                  ))}
                  {categories.length === 0 && <div className="col-span-full py-10 text-center text-gray-400 italic font-medium">Belum ada kategori master.</div>}
              </div>
          </div>
      )}

      {/* === TAB 3: SHIFTS (KODE ANDA) === */}
      {activeTab === 'SHIFTS' && (
          <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Master Shift</h3>
                <button onClick={() => setIsShiftModalOpen(true)} className="bg-[#19A0FA] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md"><HiPlus/> Tambah Shift</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {shifts.map((s:any) => (
                    <div key={s.id} className="p-6 border rounded-xl relative group bg-white shadow-sm">
                        <button onClick={()=>deleteShift(s.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><HiTrash/></button>
                        <h4 className="font-bold text-xl mb-1">{s.name}</h4>
                        <p className="text-gray-500 font-mono">{s.clockIn} - {s.clockOut}</p>
                    </div>
                ))}
              </div>
          </div>
      )}

      {/* === TAB 4: ASSIGN (KODE ANDA) === */}
      {activeTab === 'ASSIGN' && (
          <div className="bg-white rounded-xl border border-[#19A0FA]/20 overflow-hidden shadow-sm">
             <div className="p-6 bg-gray-50 border-b flex justify-between items-center gap-4">
                <h3 className="font-bold">Assignment Shift</h3>
                <div className="flex gap-2">
                    <select className="border p-2 rounded-lg text-sm bg-white" value={bulkShiftId} onChange={e=>setBulkShiftId(e.target.value)}>
                        <option value="">-- Pilih Shift --</option>
                        {shifts.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={handleBulkUpdate} className="bg-[#19A0FA] text-white px-6 py-2 rounded-lg font-bold shadow-md transition hover:bg-blue-600">Apply Bulk</button>
                </div>
             </div>
             <table className="w-full text-left">
                <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-500"><tr className="border-b">
                    <th className="p-4 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedEmpIds.length === employees.length && employees.length > 0} /></th>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Current Shift</th>
                </tr></thead>
                <tbody className="text-sm">
                    {employees.map((emp:any)=>(
                        <tr key={emp.id} className={`border-b hover:bg-gray-50 transition ${selectedEmpIds.includes(emp.id) ? 'bg-blue-50' : ''}`}>
                            <td className="p-4"><input type="checkbox" checked={selectedEmpIds.includes(emp.id)} onChange={()=> toggleSelect(emp.id)} /></td>
                            <td className="p-4 font-bold flex items-center gap-2"><HiOutlineUserCircle size={20} className="text-gray-400"/>{emp.name}</td>
                            <td className="p-4">{emp.shift ? <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{emp.shift.name}</span> : '-'}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      )}

      {/* === MODAL ADD EVENT (DROPDOWN DINAMIS) === */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-800">Tambah Jadwal Baru</h3>
                    <button onClick={()=>setIsEventModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <form onSubmit={handleEventSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nama Jadwal</label>
                        <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="Contoh: Meeting Mingguan" required value={eventForm.title} onChange={e=>setEventForm({...eventForm, title: e.target.value})}/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Mulai</label>
                            <input type="datetime-local" className="w-full p-3 border rounded-xl text-sm" required value={eventForm.start} onChange={e=>setEventForm({...eventForm, start: e.target.value})}/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Selesai</label>
                            <input type="datetime-local" className="w-full p-3 border rounded-xl text-sm" required value={eventForm.end} onChange={e=>setEventForm({...eventForm, end: e.target.value})}/>
                        </div>
                    </div>
                    
                    {/* 🟢 DROPDOWN TIPE DARI MASTER CATEGORY */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Pilih Kategori</label>
                        <select 
                            className="w-full p-3 border rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                            required
                            value={eventForm.type}
                            onChange={e => setEventForm({...eventForm, type: e.target.value})}
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {/* 🟢 Render opsi dari database */}
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-[10px] text-red-500 mt-1 font-bold">* Belum ada kategori. Silakan buat dulu di tab Master Categories.</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Deskripsi (Opsional)</label>
                        <textarea className="w-full p-3 border rounded-xl text-sm h-20 outline-none" placeholder="Catatan tambahan..." value={eventForm.description} onChange={e=>setEventForm({...eventForm, description: e.target.value})}/>
                    </div>

                    <button disabled={loading || categories.length === 0} className="w-full py-4 bg-[#19A0FA] text-white font-black rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all">
                        {loading ? 'MENYIMPAN...' : 'SIMPAN JADWAL'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* (Modal Shift Master Tetap Sama...) */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold">Buat Shift Baru</h3><button onClick={()=>setIsShiftModalOpen(false)}>✕</button></div>
                <form onSubmit={handleShiftSubmit} className="space-y-4">
                    <input className="w-full p-2 border rounded" placeholder="Nama Shift" required value={shiftForm.name} onChange={e=>setShiftForm({...shiftForm, name: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="time" className="w-full border p-2 rounded" required value={shiftForm.clockIn} onChange={e=>setShiftForm({...shiftForm, clockIn: e.target.value})}/>
                        <input type="time" className="w-full border p-2 rounded" required value={shiftForm.clockOut} onChange={e=>setShiftForm({...shiftForm, clockOut: e.target.value})}/>
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-[#19A0FA] text-white font-bold rounded-xl shadow-md transition">Simpan Shift</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}