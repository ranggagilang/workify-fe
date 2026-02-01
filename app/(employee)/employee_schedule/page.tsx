'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    HiOutlineCalendar, 
    HiOutlineClock, 
    HiChevronLeft, 
    HiChevronRight,
    HiOutlineInformationCircle
} from 'react-icons/hi2';

// Calendar Imports
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function EmployeeSchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [myShift, setMyShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const getHeaders = () => {
      const token = localStorage.getItem('token');
      return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchMySchedule = async () => {
      try {
          const headers = getHeaders();
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/calendar/my-schedule`, headers);
          
          const { shift, events } = res.data.data;

          const formattedEvents = (events || []).map((ev: any) => ({
              ...ev,
              start: new Date(ev.start),
              end: new Date(ev.end),
              // Pastikan ada properti color dari DB, kalau tidak ada pakai default
              color: ev.color || '#3B82F6' 
          }));

          setEvents(formattedEvents);
          setMyShift(shift);

      } catch (error) {
          console.error("Gagal load schedule", error);
      } finally {
          setLoading(false);
      }
  };

  const onNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate = new Date(date);
    if (action === 'TODAY') newDate = new Date();
    else if (action === 'PREV') newDate = moment(date).subtract(1, view === Views.MONTH ? 'month' : 'week').toDate();
    else if (action === 'NEXT') newDate = moment(date).add(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setDate(newDate);
  };

  // 🔥 UPDATE 1: Styling Dinamis (Mengikuti warna dari Database)
  const eventStyleGetter = (event: any) => {
    return { 
        style: { 
            backgroundColor: event.color, // Gunakan warna dari DB admin
            color: 'white', 
            fontSize: '12px', 
            borderRadius: '4px', 
            padding: '2px 5px',
            border: 'none',
            display: 'block'
        } 
    };
  };

  // 🔥 UPDATE 2: Generate Legend Unik (Berdasarkan Data yang Ada)
  // Kita cari tipe event apa saja yang ada di list events, lalu ambil warnanya
  const uniqueEventTypes = Array.from(new Set(events.map(e => JSON.stringify({ type: e.type, color: e.color }))))
    .map((s: any) => JSON.parse(s));

  return (
    <div className="w-full space-y-6 animate-in fade-in pb-10">
      
      {/* 1. HEADER INFO SHIFT */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
              <h1 className="text-2xl font-bold text-gray-800">Jadwal & Agenda</h1>
              <p className="text-gray-500 text-sm mt-1">Pantau jadwal kerja dan agenda penting perusahaan.</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4 min-w-[300px]">
              <div className="w-12 h-12 bg-[#19A0FA] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                  <HiOutlineClock className="w-6 h-6"/>
              </div>
              <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Shift Saya Saat Ini</p>
                  {myShift ? (
                      <div>
                          <h3 className="text-lg font-bold text-gray-800">{myShift.name}</h3>
                          <p className="text-sm text-gray-600 font-mono">
                              {myShift.clockIn} - {myShift.clockOut} WIB
                          </p>
                      </div>
                  ) : (
                      <p className="text-sm text-gray-400 italic">Belum ada jadwal shift.</p>
                  )}
              </div>
          </div>
      </div>

      {/* 2. MAIN CALENDAR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <button onClick={() => onNavigate('PREV')} className="p-2 hover:bg-white hover:shadow rounded-lg transition text-gray-600">
                      <HiChevronLeft className="w-5 h-5"/>
                  </button>
                  <span className="min-w-[140px] text-center font-bold text-gray-800 text-lg">
                      {moment(date).format('MMMM YYYY')}
                  </span>
                  <button onClick={() => onNavigate('NEXT')} className="p-2 hover:bg-white hover:shadow rounded-lg transition text-gray-600">
                      <HiChevronRight className="w-5 h-5"/>
                  </button>
              </div>

              <div className="flex items-center gap-3">
                  <button onClick={() => onNavigate('TODAY')} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                      Hari Ini
                  </button>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                      {[Views.MONTH, Views.WEEK, Views.DAY].map(v => (
                          <button 
                              key={v} 
                              onClick={() => setView(v)} 
                              className={`px-4 py-1.5 text-sm rounded-md capitalize transition-all ${view === v ? 'bg-white text-[#19A0FA] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                              {v}
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          <div className="h-[600px] text-sm font-medium">
              <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  eventPropGetter={eventStyleGetter}
                  toolbar={false} 
                  popup
                  onSelectEvent={(event) => alert(`📅 ${event.title}\n\n📝 ${event.description || 'Tidak ada deskripsi'}\n⏰ ${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`)}
              />
          </div>

          {/* 🔥 LEGENDA DINAMIS (Sesuai Isian Admin) */}
          <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Keterangan:</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  {uniqueEventTypes.length > 0 ? (
                      uniqueEventTypes.map((typeData: any, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                              <span 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: typeData.color }}
                              ></span> 
                              {typeData.type}
                          </div>
                      ))
                  ) : (
                      <span className="text-gray-400 italic">Belum ada agenda.</span>
                  )}
                  <div className="flex items-center gap-2 ml-auto text-gray-400">
                      <HiOutlineInformationCircle className="w-4 h-4"/> Klik jadwal untuk detail.
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}