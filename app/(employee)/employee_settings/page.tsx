'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    HiOutlineUser, 
    HiOutlineLockClosed, 
    HiOutlineCreditCard,
    HiCamera,
    HiCheckCircle,
    HiArrowRightOnRectangle
} from 'react-icons/hi2';

export default function EmployeeSettingsPage() {
  const [activeTab, setActiveTab] = useState('PROFILE'); // PROFILE | BANK | PASSWORD
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
      name: '', email: '', phone: '', address: '', image: '',
      bankName: '', bankAccount: '', accountHolder: ''
  });

  useEffect(() => {
      fetchProfile();
  }, []);

  const getHeaders = () => {
      const token = localStorage.getItem('token');
      return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchProfile = async () => {
      try {
          const headers = getHeaders();
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, headers);
          const user = res.data.data;
          
          setFormData(prev => ({
              ...prev,
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              address: user.address || '',
              image: user.image || '',
              bankName: user.employeeSalary?.bankName || '',
              bankAccount: user.employeeSalary?.bankAccount || '',
              accountHolder: user.employeeSalary?.accountHolder || user.name
          }));
      } catch (err) {
          console.error("Gagal load profile");
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
          const headers = getHeaders();
          
          if (activeTab === 'PROFILE') {
              await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings/profile`, {
                  name: formData.name, phone: formData.phone, address: formData.address
              }, headers);
          } 
          else if (activeTab === 'BANK') {
              await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings/bank`, {
                  bankName: formData.bankName,
                  bankAccount: formData.bankAccount,
                  accountHolder: formData.accountHolder
              }, headers);
          }

          alert("✅ Berhasil disimpan!");
      } catch (err: any) {
          alert("❌ Gagal menyimpan data.");
      } finally {
          setSaving(false);
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              setFormData(prev => ({ ...prev, image: base64 }));
              try {
                  await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/settings/avatar`, { imageBase64: base64 }, getHeaders());
              } catch (e) { alert("Gagal upload foto"); }
          };
      }
  };

  if(loading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading settings...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
        
       {/* HEADER */}
       <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-800">Pengaturan Akun</h1>
           <p className="text-gray-500 mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* SIDEBAR NAVIGATION (KIRI - LEBIH MODERN) */}
           <div className="lg:col-span-3 space-y-2">
               <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                   {[
                       { id: 'PROFILE', icon: HiOutlineUser, label: 'Profil Saya' },
                       { id: 'BANK', icon: HiOutlineCreditCard, label: 'Rekening Gaji' },
                       { id: 'PASSWORD', icon: HiOutlineLockClosed, label: 'Keamanan' }
                   ].map((menu) => (
                       <button 
                           key={menu.id}
                           onClick={()=>setActiveTab(menu.id)} 
                           className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all duration-200 ${
                               activeTab === menu.id 
                               ? 'bg-[#19A0FA] text-white shadow-md shadow-blue-200' 
                               : 'text-gray-600 hover:bg-gray-50'
                           }`}
                       >
                           <menu.icon className={`w-5 h-5 ${activeTab === menu.id ? 'text-white' : 'text-gray-400'}`}/> 
                           {menu.label}
                       </button>
                   ))}
               </div>

               {/* Tombol Logout (Opsional) */}
               <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mt-4">
                    <button className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-red-500 hover:bg-red-50 transition">
                        <HiArrowRightOnRectangle className="w-5 h-5"/> Logout
                    </button>
               </div>
           </div>

           {/* CONTENT AREA (KANAN - LEBIH LUAS) */}
           <div className="lg:col-span-9">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                   
                   {/* TAB 1: PROFILE */}
                   {activeTab === 'PROFILE' && (
                       <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                           <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-gray-100">
                               <div className="relative group cursor-pointer" onClick={()=>fileInputRef.current?.click()}>
                                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                       {formData.image ? 
                                           <img src={formData.image} className="w-full h-full object-cover"/> : 
                                           <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><HiOutlineUser className="w-16 h-16"/></div>
                                       }
                                   </div>
                                   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                       <HiCamera className="text-white w-8 h-8"/>
                                   </div>
                                   <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
                               </div>
                               <div className="text-center sm:text-left">
                                   <h2 className="text-2xl font-bold text-gray-800">{formData.name || 'User'}</h2>
                                   <p className="text-gray-500">{formData.email}</p>
                                   <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                       Active Employee
                                   </span>
                               </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                   <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                                   <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#19A0FA] transition outline-none" 
                                       value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
                                   <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#19A0FA] transition outline-none" 
                                       value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="08xxxxxxxx"
                                   />
                               </div>
                               <div className="col-span-full space-y-2">
                                   <label className="text-sm font-semibold text-gray-700">Alamat Domisili</label>
                                   <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#19A0FA] transition outline-none" 
                                       rows={3} value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} placeholder="Alamat lengkap..."
                                   />
                               </div>
                           </div>
                           
                           <div className="flex justify-end pt-4 border-t border-gray-100">
                               <button type="submit" disabled={saving} className="px-8 py-3 bg-[#19A0FA] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2">
                                   {saving ? 'Menyimpan...' : <><HiCheckCircle className="w-5 h-5"/> Simpan Perubahan</>}
                               </button>
                           </div>
                       </form>
                   )}

                   {/* TAB 2: BANK */}
                   {activeTab === 'BANK' && (
                       <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                           <div>
                               <h3 className="text-xl font-bold text-gray-800">Informasi Rekening Gaji</h3>
                               <p className="text-gray-500 text-sm mt-1">Pastikan data ini valid untuk kelancaran proses payroll bulanan.</p>
                           </div>

                           <div className="grid grid-cols-1 gap-6 max-w-2xl">
                               <div className="space-y-2">
                                   <label className="text-sm font-semibold text-gray-700">Nama Bank</label>
                                   <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#19A0FA] transition outline-none" 
                                       placeholder="Contoh: BCA, Mandiri, BRI" value={formData.bankName} onChange={e=>setFormData({...formData, bankName: e.target.value})}
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-semibold text-gray-700">Nomor Rekening</label>
                                   <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#19A0FA] transition outline-none font-mono font-medium" 
                                       placeholder="xxxxxxxxxx" value={formData.bankAccount} onChange={e=>setFormData({...formData, bankAccount: e.target.value})}
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-semibold text-gray-700">Atas Nama (Sesuai Buku Tabungan)</label>
                                   <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#19A0FA] transition outline-none" 
                                       placeholder="Nama Pemilik Rekening" value={formData.accountHolder} onChange={e=>setFormData({...formData, accountHolder: e.target.value})}
                                   />
                               </div>
                           </div>

                           <div className="flex justify-end pt-4 border-t border-gray-100">
                               <button type="submit" disabled={saving} className="px-8 py-3 bg-[#19A0FA] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2">
                                   {saving ? 'Menyimpan...' : <><HiCheckCircle className="w-5 h-5"/> Simpan Info Bank</>}
                               </button>
                           </div>
                       </form>
                   )}

                   {/* TAB 3: PASSWORD */}
                   {activeTab === 'PASSWORD' && (
                       <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#19A0FA] mb-4">
                               <HiOutlineLockClosed className="w-10 h-10"/>
                           </div>
                           <h3 className="text-xl font-bold text-gray-800">Keamanan Akun</h3>
                           <p className="text-gray-500 max-w-md mt-2">Untuk alasan keamanan, perubahan password saat ini hanya dapat dilakukan melalui link "Lupa Password" di halaman login.</p>
                           <button className="mt-6 px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                               Hubungi Admin
                           </button>
                       </div>
                   )}

               </div>
           </div>
       </div>
    </div>
  );
}