'use client'; 

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  HiMagnifyingGlass,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineArrowTrendingDown,
  HiOutlineUserMinus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiPlus,
  HiCog6Tooth,
  HiXMark // 🔥 Menggunakan HiXMark dari hi2 agar tidak merah
} from 'react-icons/hi2';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function InformationPage() {
  // --- STATE ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Tambah Dept
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#19A0FA');

  // State Modal Edit Employee
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const resEmp = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees`, { headers });
      setEmployees(resEmp.data.data);

      const resDept = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`, { headers });
      setDepartments(resDept.data.data);

    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. LOGIC ACTIONS ---
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
        name: newDeptName,
        color: newDeptColor
      }, { headers: { Authorization: `Bearer ${token}` } });

      setShowDeptModal(false);
      setNewDeptName('');
      fetchData(); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal membuat departemen");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm("Yakin ingin menghapus karyawan ini?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        alert("Gagal menghapus karyawan.");
      }
    }
  };

  const openEditModal = (employee: any) => {
    setEditData({
      id: employee.id,
      name: employee.name,
      phone: employee.phone,
      position: employee.position,
      departmentId: employee.departmentId || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}s/employees/${editData.id}`, {
        name: editData.name,
        phone: editData.phone,
        position: editData.position,
        departmentId: Number(editData.departmentId)
      }, { headers: { Authorization: `Bearer ${token}` } });

      setShowEditModal(false);
      fetchData();
    } catch (error) {
      alert("Gagal update data karyawan.");
    }
  };

  const chartData = departments.map(dept => ({
    name: dept.name,
    value: dept._count?.users || 0,
    color: dept.color
  })).filter(item => item.value > 0);

  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">Loading Information...</div>;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* --- STAT CARDS --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={employees.length.toString()} update="Karyawan Terdaftar" icon={HiOutlineUsers} iconBgColor="bg-blue-500" />
        <StatCard title="Active Employees" value={employees.length.toString()} update="Status Aktif" icon={HiOutlineUserPlus} iconBgColor="bg-green-500" />
        <StatCard title="Turnover Rate" value="0%" update="Bulan Ini" icon={HiOutlineArrowTrendingDown} iconBgColor="bg-yellow-500" />
        <StatCard title="Resigned" value="0" update="Tahun Ini" icon={HiOutlineUserMinus} iconBgColor="bg-red-500" />
      </section>

      {/* --- KONTEN UTAMA --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART DEPARTMENTS */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative group">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
             <button onClick={() => setShowDeptModal(true)} className="text-[10px] flex items-center gap-1 bg-blue-50 text-[#19A0FA] hover:bg-blue-100 px-3 py-1 rounded-lg font-bold transition uppercase tracking-wider">
               <HiPlus className="w-3 h-3" /> Add New
             </button>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">Belum ada data</div>
            )}
          </div>
          <div className="space-y-3 mt-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: dept.color }}></span>
                    <span className="text-gray-600 font-medium truncate max-w-[120px]">{dept.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{dept._count?.users || 0} Staff</span>
              </div>
            ))}
          </div>
        </div>

        {/* LIST KARYAWAN */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-700">Employee List</h3>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by name..." className="pl-9 pr-4 py-2 w-full rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#19A0FA]/20 focus:bg-white transition-all" />
              </div>
              <Link href="/information/add_employee" className="px-4 py-2 bg-[#19A0FA] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 uppercase tracking-wider">
                <HiPlus className="w-4 h-4" /> New Staff
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-50">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">NIP</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-400">#{emp.employeeId}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                    {emp.image ? <img src={emp.image} className="w-full h-full object-cover" alt={emp.name} /> : <HiOutlineUserCircle className="w-full h-full text-gray-300" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-700 leading-none mb-1">{emp.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{emp.position || 'Staff'}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            {emp.department ? (
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-tighter" style={{ backgroundColor: emp.department.color }}>
                                    {emp.department.name}
                                </span>
                            ) : <span className="text-gray-300 text-[10px] italic">Unassigned</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(emp)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                    <HiOutlinePencilSquare className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDeleteEmployee(emp.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                    <HiOutlineTrash className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- MODAL ADD DEPARTMENT --- */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-blue-50 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">New Department</h2>
                    <button onClick={() => setShowDeptModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><HiXMark className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleAddDept} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dept Name</label>
                        <input required type="text" className="w-full border-gray-100 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm" placeholder="e.g. IT Developer" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Theme Color</label>
                        <input type="color" className="w-full h-12 p-1 rounded-xl cursor-pointer border-none bg-gray-50" value={newDeptColor} onChange={e => setNewDeptColor(e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-[#19A0FA] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL EDIT EMPLOYEE --- */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-blue-50 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Edit Staff Profile</h2>
                    <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><HiXMark className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleUpdateEmployee} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                            <input required type="text" className="w-full border-gray-100 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#19A0FA]/20 focus:bg-white transition-all text-sm font-semibold" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                            <input type="text" className="w-full border-gray-100 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#19A0FA]/20 focus:bg-white transition-all text-sm font-semibold" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Title</label>
                        <input type="text" className="w-full border-gray-100 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#19A0FA]/20 focus:bg-white transition-all text-sm font-semibold" value={editData.position} onChange={e => setEditData({...editData, position: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</label>
                        <select className="w-full border-gray-100 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#19A0FA]/20 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer" value={editData.departmentId} onChange={e => setEditData({...editData, departmentId: e.target.value})}>
                            <option value="">Unassigned</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-[#19A0FA] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all">Update Profile</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// Sub-Komponen StatCard (Tetap Sama untuk konsistensi)
function StatCard({ title, value, update, icon: Icon, iconBgColor }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-start justify-between hover:shadow-md transition-all duration-300 group cursor-default">
      <div className="flex flex-col min-w-0 overflow-hidden">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="font-bold text-gray-800 tracking-tight truncate text-2xl">
          {value}
        </p>
        <p className="text-[10px] font-semibold text-[#19A0FA] mt-1 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
          {update}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${iconBgColor} text-white shadow-lg shadow-current/20 flex-shrink-0 ml-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}