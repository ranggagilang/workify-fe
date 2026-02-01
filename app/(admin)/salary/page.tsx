'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiMagnifyingGlass,
  HiOutlineUserCircle,
  HiXMark,
  HiOutlineCalculator,
  HiOutlineCalendar,
  HiCheckCircle,
  HiOutlinePrinter,
  HiUser,
  HiOutlineUsers,
  HiCurrencyDollar,
  HiOutlineCog8Tooth
} from 'react-icons/hi2';

// --- TIPE DATA ---
type Employee = {
  id: number;
  name: string;
  image: string | null;
  position: string;
  phone: string;
  salaryInfo?: {
    basicSalary: number;
    fixedAllowance: number;
    bankName: string;
    bankAccount: string;
  }
};

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'PAYROLL' | 'SETTINGS'>('PAYROLL');

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER & TABS NAVIGATION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#19A0FA]/20">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
             <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <HiCurrencyDollar className="text-[#19A0FA] w-8 h-8"/> Salary & Payroll
                </h1>
                <p className="text-gray-500 text-sm">Kelola aturan gaji, data pokok, dan proses penggajian bulanan.</p>
             </div>
         </div>

         <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-fit overflow-x-auto no-scrollbar">
             <button 
                onClick={() => setActiveTab('PAYROLL')}
                className={`flex-1 flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'PAYROLL' ? 'bg-white text-[#19A0FA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 <HiOutlineCalculator className="w-5 h-5"/> Payroll Process
             </button>
             <button 
                onClick={() => setActiveTab('MASTER')}
                className={`flex-1 flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'MASTER' ? 'bg-white text-[#19A0FA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 <HiOutlineUsers className="w-5 h-5"/> Master Gaji
             </button>
             <button 
                onClick={() => setActiveTab('SETTINGS')}
                className={`flex-1 flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'SETTINGS' ? 'bg-white text-[#19A0FA] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 <HiOutlineCog8Tooth className="w-5 h-5"/> Salary Settings
             </button>
         </div>
      </div>

      {activeTab === 'PAYROLL' && <PayrollView getHeaders={getHeaders} />}
      {activeTab === 'MASTER' && <MasterDataView getHeaders={getHeaders} />}
      {activeTab === 'SETTINGS' && <SalarySettingsView getHeaders={getHeaders} />}

    </div>
  );
}

// ==========================================
// 1. VIEW: SALARY SETTINGS (Aturan Global)
// ==========================================
function SalarySettingsView({ getHeaders }: any) {
    const [settings, setSettings] = useState({
        overtimeRate: 0,
        latePenalty: 0,
        transportAllowance: 0,
        mealAllowance: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/salary/settings`, getHeaders())
            .then(res => { if(res.data.data) setSettings(res.data.data); })
            .catch(() => console.log("Belum ada setting gaji."));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/salary/settings`, settings, getHeaders());
            alert("✅ Aturan gaji perusahaan berhasil disimpan!");
        } catch (err) { 
            alert("Gagal menyimpan aturan gaji."); 
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-2">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Global Salary Rules</h3>
                <p className="text-sm text-gray-500">Parameter di bawah ini menjadi dasar perhitungan otomatis Payroll.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Denda Terlambat (Rp)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition"
                            value={settings.latePenalty === 0 ? '' : settings.latePenalty}
                            onChange={e => setSettings({...settings, latePenalty: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Upah Lembur / Jam (Rp)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition"
                            value={settings.overtimeRate === 0 ? '' : settings.overtimeRate}
                            onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Tunj. Transport / Hari (Rp)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition"
                            value={settings.transportAllowance === 0 ? '' : settings.transportAllowance}
                            onChange={e => setSettings({...settings, transportAllowance: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Tunj. Makan / Hari (Rp)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition"
                            value={settings.mealAllowance === 0 ? '' : settings.mealAllowance}
                            onChange={e => setSettings({...settings, mealAllowance: Number(e.target.value)})}
                        />
                    </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                    <button type="submit" disabled={loading} className="bg-[#19A0FA] text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition">
                        {loading ? "Menyimpan..." : "Simpan Aturan"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ==========================================
// 2. VIEW: PAYROLL PROCESS
// ==========================================
function PayrollView({ getHeaders }: any) {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchPayrolls(); }, [selectedMonth, selectedYear]);

  const fetchPayrolls = async () => {
      setLoading(true);
      try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payroll?month=${selectedMonth}&year=${selectedYear}`, getHeaders());
          setPayrolls(res.data.data);
      } catch (err) { console.error("Err load"); } 
      finally { setLoading(false); }
  };

  const handleGenerate = async () => {
      if(!confirm(`Generate gaji periode ${selectedMonth}-${selectedYear}?`)) return;
      setGenerating(true);
      try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payroll/generate`, { month: selectedMonth, year: selectedYear }, getHeaders());
          alert(res.data.message);
          fetchPayrolls();
      } catch (err: any) { alert("Gagal: " + (err.response?.data?.message || "Cek pengaturan gaji")); } 
      finally { setGenerating(false); }
  };

  const handleMarkPaid = async (id: number) => {
      if(!confirm("Tandai sudah dibayar?")) return;
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/payroll/${id}/pay`, {}, getHeaders());
      fetchPayrolls();
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(num));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2">
               <HiOutlineCalendar className="text-gray-400"/>
               <select value={selectedMonth} onChange={(e)=>setSelectedMonth(Number(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer">
                   {[...Array(12)].map((_, i) => (<option key={i} value={i+1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>))}
               </select>
               <select value={selectedYear} onChange={(e)=>setSelectedYear(Number(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer">
                   <option value="2025">2025</option><option value="2026">2026</option>
               </select>
           </div>
           <button onClick={handleGenerate} disabled={generating} className="px-6 py-2 bg-[#19A0FA] text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center gap-2 shadow-md">
               <HiOutlineCalculator className="w-5 h-5"/> {generating ? "Processing..." : "Generate Payroll"}
           </button>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-[#19A0FA]/20 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-[#19A0FA] text-white">
                      <tr>
                          <th className="px-6 py-4 uppercase font-bold text-[10px]">Karyawan</th>
                          <th className="px-6 py-4 uppercase font-bold text-[10px] text-right">Gaji Pokok</th>
                          <th className="px-6 py-4 uppercase font-bold text-[10px] text-right">Tunjangan</th>
                          <th className="px-6 py-4 uppercase font-bold text-[10px] text-right">Potongan</th>
                          <th className="px-6 py-4 uppercase font-bold text-[10px] text-right">Total Bersih</th>
                          <th className="px-6 py-4 uppercase text-center">Status</th>
                          <th className="px-6 py-4 uppercase text-center">Aksi</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {loading ? <tr><td colSpan={7} className="p-10 text-center text-gray-400 italic">Memuat payroll...</td></tr> : 
                       payrolls.length === 0 ? <tr><td colSpan={7} className="p-10 text-center text-gray-400 font-medium">Belum ada data bulan ini.</td></tr> :
                       payrolls.map((p) => (
                          <tr key={p.id} className="hover:bg-blue-50/30 transition">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      {p.user?.image ? <img src={p.user.image} className="w-9 h-9 rounded-full object-cover"/> : <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center"><HiUser className="text-gray-400"/></div>}
                                      <div><p className="font-bold text-gray-800">{p.user?.name}</p><p className="text-[10px] text-gray-400 font-mono">H:{p.attendanceDays} | L:{p.overtimeHours}j | T:{p.lateCount}</p></div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600">{formatRupiah(p.basicSalary)}</td>
                              <td className="px-6 py-4 text-right text-green-600">+{formatRupiah(p.totalAllowance)}</td>
                              <td className="px-6 py-4 text-right text-red-500">-{formatRupiah(p.totalDeduction)}</td>
                              <td className="px-6 py-4 text-right font-bold text-blue-600">{formatRupiah(p.netSalary)}</td>
                              <td className="px-6 py-4 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                              <td className="px-6 py-4 text-center flex justify-center gap-1">
                                  {p.status === 'PENDING' && <button onClick={() => handleMarkPaid(p.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><HiCheckCircle size={20}/></button>}
                                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><HiOutlinePrinter size={20}/></button>
                              </td>
                          </tr>
                       ))}
                  </tbody>
              </table>
          </div>
       </div>
    </div>
  );
}

// ==========================================
// 3. VIEW: MASTER DATA GAJI
// ==========================================
function MasterDataView({ getHeaders }: any) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState({ basicSalary: 0, fixedAllowance: 0, bankName: '', bankAccount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees`, getHeaders()); 
        const data = res.data.data.map((user: any) => ({
            id: user.id, 
            name: user.name, 
            image: user.image, 
            position: user.position || 'Staff',
            // 🟢 PERBAIKAN: Mapping data employeeSalary dari backend (hasil include/select)
            salaryInfo: user.employeeSalary ? {
                basicSalary: Number(user.employeeSalary.basicSalary || 0),
                fixedAllowance: Number(user.employeeSalary.fixedAllowance || 0),
                bankName: user.employeeSalary.bankName || '', 
                bankAccount: user.employeeSalary.bankAccount || ''
            } : null
        }));
        setEmployees(data);
    } catch (err) { console.error("Gagal load data karyawan"); } 
    finally { setLoading(false); }
  };

  const handleEditClick = (emp: Employee) => {
      setSelectedEmp(emp);
      setForm({
          basicSalary: emp.salaryInfo?.basicSalary || 0,
          fixedAllowance: emp.salaryInfo?.fixedAllowance || 0,
          // 🟢 OTOMATIS: Mengambil bankName & bankAccount yang diisi Employee dari Settings mereka
          bankName: emp.salaryInfo?.bankName || '', 
          bankAccount: emp.salaryInfo?.bankAccount || ''
      });
      setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/salary/employee`, { userId: selectedEmp?.id, ...form }, getHeaders());
          alert("✅ Data gaji berhasil disimpan!");
          setIsModalOpen(false); 
          fetchEmployees(); // Refresh list
      } catch (err) { alert("Gagal menyimpan data gaji."); } 
      finally { setSaving(false); }
  };

  const filteredData = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-sm">
           <div className="relative">
               <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Cari karyawan..." value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100" />
           </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-[#19A0FA]/20 overflow-hidden">
          <table className="min-w-full text-sm">
             <thead className="bg-[#19A0FA] text-white font-bold uppercase text-[10px]">
                <tr>
                   <th className="px-6 py-4 text-left">Employee</th>
                   <th className="px-6 py-4 text-left">Posisi</th>
                   <th className="px-6 py-4 text-right">Gaji Pokok</th>
                   <th className="px-6 py-4 text-right">Tunjangan</th>
                   <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                   <tr key={item.id} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                          {item.image ? <img src={item.image} className="w-8 h-8 rounded-full object-cover"/> : <HiOutlineUserCircle size={32} className="text-gray-300"/>}
                          <span className="font-bold text-gray-700">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{item.position}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600">
                          {item.salaryInfo && item.salaryInfo.basicSalary > 0 ? formatRupiah(item.salaryInfo.basicSalary) : <span className="text-gray-300 italic text-xs">Not Set</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                          {item.salaryInfo ? formatRupiah(item.salaryInfo.fixedAllowance) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                          <button onClick={() => handleEditClick(item)} className="px-4 py-1.5 bg-blue-50 text-[#19A0FA] rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition border border-blue-100">
                              Atur
                          </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {isModalOpen && selectedEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                  <div className="bg-[#19A0FA] p-5 flex justify-between items-center text-white font-bold uppercase tracking-tight">
                      <h3>ATUR GAJI: {selectedEmp.name}</h3>
                      <button onClick={()=>setIsModalOpen(false)}><HiXMark size={24}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase block tracking-widest">Gaji Pokok</label>
                              <input 
                                  type="number" required 
                                  className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition"
                                  value={form.basicSalary === 0 ? '' : form.basicSalary} 
                                  onChange={e => setForm({...form, basicSalary: Number(e.target.value)})}
                                  placeholder="0"
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-400 uppercase block tracking-widest">Tunj. Tetap</label>
                              <input 
                                  type="number" 
                                  className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition"
                                  value={form.fixedAllowance === 0 ? '' : form.fixedAllowance} 
                                  onChange={e => setForm({...form, fixedAllowance: Number(e.target.value)})}
                                  placeholder="0"
                              />
                          </div>
                      </div>

                      <div className="p-5 bg-gray-50 rounded-2xl space-y-4 border border-dashed border-gray-200">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Rekening (Dari Employee)</p>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">Bank</label>
                                  <input 
                                    placeholder="Nama Bank" 
                                    className="w-full bg-white border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100" 
                                    value={form.bankName} 
                                    onChange={e=>setForm({...form, bankName: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase">No. Rekening</label>
                                  <input 
                                    placeholder="No. Rekening" 
                                    className="w-full bg-white border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100" 
                                    value={form.bankAccount} 
                                    onChange={e=>setForm({...form, bankAccount: e.target.value})}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                          <button type="button" onClick={()=>setIsModalOpen(false)} className="px-6 py-2 text-gray-400 font-bold hover:text-gray-600">BATAL</button>
                          <button type="submit" disabled={saving} className="px-10 py-3 bg-[#19A0FA] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition">
                              {saving ? "SAVING..." : "SIMPAN GAJI"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
       )}
    </div>
  );
}