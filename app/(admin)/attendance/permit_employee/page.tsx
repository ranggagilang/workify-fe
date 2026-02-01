'use client'; 

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiOutlineCalendarDays,
  HiPhoto,
  HiArrowPath,
  HiUserCircle,
  HiDocumentText,
  HiOutlineUsers,
  HiOutlineClock
} from 'react-icons/hi2';
import Link from 'next/link';

// --- Tipe Data ---
type Permit = {
  id: number;
  name: string;
  avatar: string | null;
  startDate: string;
  endDate: string;
  duration: string; 
  status: 'Approved' | 'Rejected' | 'Pending';
  position: string; 
  leaveType: string; 
  evidenceUrl?: string; 
  reason: string; 
  rejectedReason?: string; 
};

export default function PermitEmployeePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ people: 0, days: 0 });

  useEffect(() => { fetchPermits(); }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchPermits = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/leaves/all`, getHeaders());
        const rawData = res.data.data;
        
        const mappedData: Permit[] = rawData.map((item: any) => ({
            id: item.id,
            name: item.user?.name || 'Unknown',
            avatar: item.user?.image || null,
            startDate: new Date(item.startDate).toLocaleDateString('id-ID'),
            endDate: new Date(item.endDate).toLocaleDateString('id-ID'),
            duration: `${item.days} Days`,
            status: capitalize(item.status), 
            position: item.user?.department?.name || 'Staff',
            leaveType: mapLeaveType(item.type),
            evidenceUrl: item.attachment,
            reason: item.reason,
            rejectedReason: item.rejectedReason
        }));

        setPermits(mappedData);

        const uniquePeople = new Set(mappedData.map(p => p.name)).size;
        const totalDays = rawData
            .filter((p: any) => p.status === 'APPROVED')
            .reduce((sum: number, p: any) => sum + (p.days || 0), 0);
            
        setStats({ people: uniquePeople, days: totalDays });

    } catch (error) { console.error("Gagal load data:", error); } 
    finally { setLoading(false); }
  };

  const handleViewClick = (permit: Permit) => { setSelectedPermit(permit); setIsModalOpen(true); };
  const handleCloseModal = (shouldRefresh = false) => { setIsModalOpen(false); setSelectedPermit(null); if(shouldRefresh) fetchPermits(); };
  
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
  const mapLeaveType = (type: string) => {
      if(type === 'SICK') return 'Sick Leave';
      if(type === 'ANNUAL') return 'Annual Leave';
      if(type === 'PERMIT') return 'Permission';
      return type;
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* HEADER & NAV */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/attendance" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#19A0FA] transition-all group">
            <HiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Attendance
          </Link>
          
          <div className="flex gap-2">
              {/* Shortcut ke Setting Templates agar tidak 404 */}
              <Link href="/admin_setting" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm uppercase tracking-wider">
                  <HiDocumentText className="w-4 h-4 text-gray-400"/> Manage Templates
              </Link>
              <button onClick={fetchPermits} className="p-2 bg-white rounded-xl hover:bg-gray-50 text-gray-500 border border-gray-200 shadow-sm" title="Refresh Data">
                  <HiArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}/>
              </button>
          </div>
      </div>

      {/* STATISTIK */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between hover:shadow-md transition-all group">
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Employees on Leave</p>
              <p className="text-2xl font-bold text-gray-800">{stats.people} <span className="text-xs font-medium text-gray-400">People</span></p>
              <p className="text-[10px] font-semibold text-[#19A0FA] mt-1 bg-blue-50 px-2 py-0.5 rounded-md w-fit tracking-tighter uppercase">Active Now</p>
           </div>
           <div className="p-4 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <HiOutlineUsers className="w-7 h-7" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between hover:shadow-md transition-all group">
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Approved Days</p>
              <p className="text-2xl font-bold text-gray-800">{stats.days} <span className="text-xs font-medium text-gray-400">Days</span></p>
              <p className="text-[10px] font-semibold text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded-md w-fit tracking-tighter uppercase">Approved</p>
           </div>
           <div className="p-4 rounded-2xl bg-green-500 text-white shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
              <HiOutlineClock className="w-7 h-7" />
           </div>
        </div>
      </section>

      {/* TABEL DATA */}
      <main className="bg-white rounded-2xl shadow-sm w-full border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-700">Leave Request History</h3>
            <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all w-48 md:w-64" />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? ( <tr><td colSpan={6} className="p-16 text-center text-gray-400 animate-pulse font-medium">Synchronizing records...</td></tr> ) : 
               permits.length === 0 ? ( <tr><td colSpan={6} className="p-16 text-center text-gray-400 italic font-medium">No leave requests found.</td></tr> ) : 
               ( permits.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                                  {item.avatar ? <img src={item.avatar} alt={item.name} className="w-full h-full object-cover"/> : <HiUserCircle className="w-6 h-6 text-gray-300"/>}
                              </div>
                              <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-700 truncate">{item.name}</p>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">{item.position}</p>
                              </div>
                          </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">{item.startDate}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">{item.endDate}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-[#19A0FA]">{item.duration}</td>
                      <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleViewClick(item)} className="px-4 py-1.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-xs font-bold hover:bg-[#19A0FA] hover:text-white hover:border-[#19A0FA] transition-all uppercase tracking-widest shadow-sm">View</button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-gray-50 flex justify-end items-center">
          <nav className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors"><HiChevronLeft className="w-5 h-5" /></button>
            <button className="w-9 h-9 rounded-xl bg-[#19A0FA] text-white font-bold text-sm shadow-lg shadow-blue-200">1</button>
            <button className="p-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"><HiChevronRight className="w-5 h-5" /></button>
          </nav>
        </div>
      </main>

      {isModalOpen && selectedPermit && <LeavePermissionModal permit={selectedPermit} onClose={handleCloseModal} />}
    </div>
  );
}

function StatusBadge({ status }: { status: 'Approved' | 'Rejected' | 'Pending' }) {
  let className = 'px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ';
  switch (status) {
    case 'Approved': className += 'bg-green-100 text-green-700 border-green-200'; break;
    case 'Rejected': className += 'bg-red-100 text-red-700 border-red-200'; break;
    case 'Pending': className += 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse'; break;
  }
  return <span className={className}>{status}</span>;
}

type ModalProps = { permit: Permit; onClose: (shouldRefresh?: boolean) => void; };

function LeavePermissionModal({ permit, onClose }: ModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const getHeaders = () => {
      const token = localStorage.getItem('token');
      return { headers: { Authorization: `Bearer ${token}` } };
  }

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected' && !showRejectInput) { setShowRejectInput(true); return; }
    if (status === 'Rejected' && !rejectReason.trim()) { alert("Please provide a rejection reason."); return; }
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;

    setLoadingAction(true);
    try {
        const payload: any = { status: status.toUpperCase() }; 
        if (status === 'Rejected') payload.rejectedReason = rejectReason;
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/leaves/${permit.id}/status`, payload, getHeaders());
        alert(`✅ Request successfully ${status}`);
        onClose(true); 
    } catch (error) { alert("Failed to process request."); } 
    finally { setLoadingAction(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => onClose()}>
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-blue-50 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        
        <div className="bg-[#19A0FA] p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                <HiDocumentText className="w-7 h-7 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold leading-tight">Leave Request Detail</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Review & Manage Permit</p>
             </div>
          </div>
          <button onClick={() => onClose()} className="p-2 rounded-xl hover:bg-white/20 transition-colors"><HiXMark className="w-6 h-6 text-white" /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm">
                    {permit.avatar ? <img src={permit.avatar} alt="avatar" className="w-full h-full object-cover"/> : <HiUserCircle className="w-10 h-10 text-gray-200"/>}
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Employee Name</p>
                    <h4 className="text-lg font-bold text-gray-800 leading-none">{permit.name}</h4>
                    <p className="text-xs font-semibold text-[#19A0FA] mt-1">{permit.position}</p>
                 </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <DateItem label="Start Date" value={permit.startDate} />
                <DateItem label="End Date" value={permit.endDate} />
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reason / Alasan</label>
                <p className="text-sm text-gray-600 italic font-medium leading-relaxed">"{permit.reason}"</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <InfoItem label="Type of Leave" value={permit.leaveType} />
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <HiPhoto className="w-4 h-4" /> Supporting Evidence
              </label>
              <div className="w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden relative shadow-inner group transition-all hover:border-[#19A0FA]/30">
                {permit.evidenceUrl ? (
                  permit.evidenceUrl.startsWith('data:image') || permit.evidenceUrl.includes('.jpg') || permit.evidenceUrl.includes('.png') ? 
                  <img src={permit.evidenceUrl} alt="Evidence" className="w-full h-full object-contain p-2" /> : 
                  <div className="text-center p-4">
                    <HiDocumentText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <a href={permit.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all">Open Document</a>
                  </div>
                ) : (
                  <div className="text-center">
                    <HiPhoto className="w-10 h-10 text-gray-200 mx-auto" />
                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">No Attachment</p>
                  </div>
                )}
              </div>
            </div>
            
            {permit.status === 'Pending' && (
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Final Decision</label>
                  {showRejectInput && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                        <textarea className="w-full p-4 bg-red-50/30 border border-red-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500/20 outline-none placeholder:text-red-300 text-red-700 font-medium" placeholder="Describe the reason for rejection..." rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus/>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!showRejectInput && (
                      <button onClick={() => handleAction('Approved')} disabled={loadingAction} className="flex-1 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-green-600 hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-50 uppercase tracking-widest">Approve</button>
                    )}
                    <button onClick={() => handleAction('Rejected')} disabled={loadingAction} className="flex-1 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-100 disabled:opacity-50 uppercase tracking-widest">
                        {showRejectInput ? 'Confirm Reject' : 'Reject'}
                    </button>
                    {showRejectInput && (
                      <button onClick={()=>setShowRejectInput(false)} className="px-6 py-3 text-xs font-bold text-gray-400 hover:bg-gray-100 rounded-2xl transition-all uppercase">Cancel</button>
                    )}
                  </div>
                </div>
            )}

            {permit.status === 'Rejected' && permit.rejectedReason && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in zoom-in-95">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Rejection Feedback:</p>
                    <p className="text-sm text-red-800 font-medium">"{permit.rejectedReason}"</p>
                </div>
            )}

            {permit.status === 'Approved' && (
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100 text-center animate-in zoom-in-95">
                    <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-2 uppercase tracking-widest">
                        ✅ Verified Request
                    </p>
                </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
           <button onClick={() => onClose()} className="px-10 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-bold hover:bg-black transition-all shadow-lg uppercase tracking-[0.2em]">Close Preview</button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

function DateItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <div className="relative">
        <HiOutlineCalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input type="text" value={value} disabled className="w-full pl-10 pr-3 py-3 border border-gray-100 rounded-2xl bg-gray-50/50 text-gray-600 text-sm font-bold shadow-inner"/>
      </div>
    </div>
  );
}