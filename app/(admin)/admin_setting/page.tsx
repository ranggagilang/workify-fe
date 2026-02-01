'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation'; 
import axios from 'axios';
import {
  HiOutlinePencilSquare,
  HiOutlineUserCircle,
  HiOutlineKey,
  HiMapPin,                 
  HiOutlineDevicePhoneMobile, 
  HiBuildingOffice2,
  HiDocumentText, 
  HiTrash,
  HiPlus,
  HiArrowDownTray,
  HiCheckCircle,
  HiOutlinePhoto // Icon tambahan untuk upload logo
} from 'react-icons/hi2';

// --- TIPE DATA ---
type SettingTab = 'profile' | 'company' | 'letters' | 'log' | 'notification';

// Daftar Negara
const COUNTRY_OPTIONS = [
  "Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", "Philippines", "Other"
];

export default function SettingPage() {
  const searchParams = useSearchParams();
  
  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const letterInputRef = useRef<HTMLInputElement>(null);
  const companyLogoRef = useRef<HTMLInputElement>(null); // Ref baru untuk logo perusahaan
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);

  // Data State
  const [userData, setUserData] = useState<any>({});
  
  // State Form Company
  const [companyForm, setCompanyForm] = useState({
      name: '', phone: '', address: '',
      image: '', // Field baru untuk logo
      workingType: 'HYBRID',
      latitude: '', longitude: '', radiusKm: 0.1
  });

  // STATE BARU: LETTER TEMPLATES
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterForm, setLetterForm] = useState({ title: '', description: '', fileBase64: '' });
  
  const [logs, setLogs] = useState<any[]>([]);
  const [toggles, setToggles] = useState({
    emailNews: true, emailTips: false, emailResearch: true, emailReminders: false, pushReminders: true,
  });

  // --- 1. FETCH DATA UTAMA ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser || {});
        } catch (err) { console.error("Gagal baca LocalStorage", err); }
    }
    
    fetchSettings();
  }, []);

  // Fetch Templates khusus saat tab letters aktif
  useEffect(() => {
      if (activeTab === 'letters') fetchTemplates();
  }, [activeTab]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  const fetchSettings = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`, getHeaders());
        const { user, company, logs } = res.data.data;
        
        if (user) {
            setUserData(user);
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...user }));
        }
        
        if (company) {
            setCompanyForm({
                name: company.name || '',
                phone: company.phone || '',
                address: company.address || '',
                image: company.image || '', // Load logo perusahaan
                workingType: company.workingType || 'HYBRID', 
                latitude: company.latitude || '',
                longitude: company.longitude || '',
                radiusKm: company.radiusKm || 0.1
            });
        }

        if (logs) setLogs(logs);

    } catch (err: any) {
        console.error("Gagal fetch API:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // --- LOGIC UPLOAD LOGO PERUSAHAAN ---
  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Maksimal logo 2MB");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setCompanyForm({ ...companyForm, image: reader.result as string });
    };
  };

  // --- 2. LOGIC LETTER TEMPLATES ---
  const fetchTemplates = async () => {
      try {
          const res = await axios.get('http://localhost:4000/api/letters', getHeaders());
          setTemplates(res.data.data);
      } catch (e) { console.error("Gagal load templates"); }
  };

  const handleDownload = async (base64Data: string, fileName: string) => {
    try {
        if (!base64Data || !base64Data.includes(',')) {
            return alert("File rusak atau format salah di database.");
        }

        const response = await fetch(base64Data);
        const blob = await response.blob(); 

        let extension = '';
        if (blob.type.includes('pdf')) extension = '.pdf';
        else if (blob.type.includes('word') || blob.type.includes('officedocument')) extension = '.docx';
        else if (blob.type.includes('image')) extension = '.jpg';

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}${extension}`; 
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download Error:", error);
        alert("Gagal mendownload file.");
    }
  };

  const handleLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) return alert("Maksimal ukuran file 5MB");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
              setLetterForm({ ...letterForm, fileBase64: reader.result as string });
          };
      }
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!letterForm.title || !letterForm.fileBase64) return alert("Judul dan File wajib diisi!");
      
      setIsSaving(true);
      try {
          await axios.post('http://localhost:4000/api/letters', {
              title: letterForm.title,
              description: letterForm.description,
              fileUrl: letterForm.fileBase64
          }, getHeaders());
          
          alert("Template berhasil ditambahkan!");
          setIsLetterModalOpen(false);
          setLetterForm({ title: '', description: '', fileBase64: '' });
          fetchTemplates();
      } catch (e) {
          alert("Gagal upload template.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteLetter = async (id: number) => {
      if(!confirm("Yakin ingin menghapus template ini?")) return;
      try {
          await axios.delete(`http://localhost:4000/api/letters/${id}`, getHeaders());
          fetchTemplates();
      } catch (e) { alert("Gagal hapus data."); }
  };

  // --- 3. LOGIC PROFILE ---
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
          const payload = {
            name: userData.name, phone: userData.phone, bio: userData.bio,
            address: userData.address, city: userData.city, country: userData.country 
          };
          const res = await axios.put('http://localhost:4000/api/settings/profile', payload, getHeaders());
          const updatedUser = res.data.data;
          setUserData(updatedUser);
          
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
          window.dispatchEvent(new Event('userUpdated'));

          setIsEditing(false);
          alert("Profile updated successfully! ✅");
          fetchSettings(); 
      } catch (err: any) {
          alert(err.response?.data?.message || "Gagal update profile.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert(`⚠️ Gagal: Ukuran foto terlalu besar! Maksimal 2MB.`);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const base64String = reader.result;
        setUserData({ ...userData, image: base64String }); 
        try {
            await axios.post('http://localhost:4000/api/settings/avatar', { imageBase64: base64String }, getHeaders());
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, image: base64String }));
            window.dispatchEvent(new Event('userUpdated'));
        } catch (err: any) { alert("Gagal upload foto."); }
    };
  };

  // --- 4. LOGIC COMPANY SETTING ---
  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCompanyForm({
                    ...companyForm,
                    latitude: pos.coords.latitude.toString(),
                    longitude: pos.coords.longitude.toString()
                });
                alert("📍 Koordinat berhasil diambil!");
            },
            () => alert("Gagal mengambil lokasi. Pastikan GPS aktif.")
        );
    } else { alert("Browser tidak support GPS."); }
  };

  const handleSaveCompany = async () => {
    setIsSaving(true);
    try {
        await axios.put('http://localhost:4000/api/companies/profile', companyForm, getHeaders());
        alert("🏢 Pengaturan Kantor Berhasil Disimpan!");
    } catch (error) { alert("Gagal menyimpan pengaturan."); } 
    finally { setIsSaving(false); }
  };


  if (isLoading && !userData.email) return <div className="p-10 text-center text-[#19A0FA] font-bold">Loading Settings...</div>;

  return (
      <main className="flex items-stretch w-full bg-white rounded-xl shadow-sm border border-[#19A0FA]/20 min-h-[600px] overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 p-6 flex flex-col border-r border-[#19A0FA]/10 rounded-l-xl" style={{ backgroundColor: '#19A0FA' }}>
        <nav className="flex flex-col space-y-3">
          <SettingTabButton label="Profile Setting" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SettingTabButton label="Company Setting" isActive={activeTab === 'company'} onClick={() => setActiveTab('company')} />
          <SettingTabButton label="Document Templates" isActive={activeTab === 'letters'} onClick={() => setActiveTab('letters')} />
          <SettingTabButton label="Log Activity" isActive={activeTab === 'log'} onClick={() => setActiveTab('log')} />
          <SettingTabButton label="Notification" isActive={activeTab === 'notification'} onClick={() => setActiveTab('notification')} />
        </nav>
      </aside>

      {/* KONTEN */}
      <section className="flex-1 p-8 bg-white overflow-y-auto max-h-[800px]">
        
        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-[#19A0FA]/30 overflow-hidden">
              <div className="p-8 border-b border-[#19A0FA]/10 bg-blue-50/10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                      {userData.image ? (
                        <img src={userData.image} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-sm" />
                      ) : (
                        <div className="bg-white rounded-full p-1 ring-4 ring-blue-50/50 border border-blue-100">
                           <HiOutlineUserCircle className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 p-1.5 bg-[#19A0FA] text-white rounded-full shadow-sm group-hover:bg-blue-600 transition-colors">
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </div>
                      <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                    </div>
                    <div>
                      {isEditing ? (
                          <input name="name" value={userData.name || ''} onChange={handleUserChange} className="text-xl font-bold border-b border-blue-300 focus:outline-none mb-1 bg-transparent w-full" autoFocus />
                      ) : (
                          <h3 className="text-2xl font-bold text-gray-800">{userData.name || 'User Name'}</h3>
                      )}
                      <p className="text-gray-500 font-medium">{userData.role || 'Admin'}</p>
                      {userData.country && <p className="text-sm text-gray-400 mt-1">{userData.country}</p>}
                    </div>
                  </div>
                  {isEditing ? (
                      <div className="flex gap-2">
                          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                          <button onClick={handleSaveProfile} disabled={isSaving} className="px-4 py-2 bg-[#19A0FA] text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-600 transition-all">
                             {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                      </div>
                  ) : (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:border-[#19A0FA] hover:text-[#19A0FA] bg-white transition-all">Edit Profile</button>
                  )}
                </div>
              </div>
              <div className="p-8 space-y-10">
                <div className="relative">
                   <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="w-1 h-6 bg-[#19A0FA] rounded-full"></span> Personal Information
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <EditableItem label="Full Name" name="name" value={userData.name} isEditing={isEditing} onChange={handleUserChange} />
                      <EditableItem label="Email" name="email" value={userData.email} isEditing={false} onChange={handleUserChange} />
                      <EditableItem label="Phone" name="phone" value={userData.phone} isEditing={isEditing} onChange={handleUserChange} />
                      <EditableItem label="Bio" name="bio" value={userData.bio} isEditing={isEditing} onChange={handleUserChange} />
                   </div>
                </div>
                <div className="border-t border-gray-100"></div>
                <div>
                   <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="w-1 h-6 bg-[#19A0FA] rounded-full"></span> Address
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                      <EditableItem label="Address" name="address" value={userData.address} isEditing={isEditing} onChange={handleUserChange} />
                      <EditableItem label="City" name="city" value={userData.city} isEditing={isEditing} onChange={handleUserChange} />
                      <CountryEditableItem label="Country" name="country" value={userData.country} isEditing={isEditing} onChange={handleUserChange} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY SETTING */}
        {activeTab === 'company' && (
           <div className="bg-white rounded-xl shadow-sm border border-[#19A0FA]/30 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-gray-800">Company Settings</h3>
                   <button onClick={handleSaveCompany} disabled={isSaving} className="px-6 py-2 bg-[#19A0FA] text-white rounded-lg text-sm font-bold hover:bg-blue-600 shadow-sm">
                       {isSaving ? "Saving..." : "Save Changes"}
                   </button>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                       <h4 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><HiBuildingOffice2 className="w-5 h-5 text-[#19A0FA]"/> Profil Kantor</h4>
                       
                       {/* 👇 TAMBAHAN: UPLOAD LOGO PERUSAHAAN */}
                       <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <div className="relative group cursor-pointer" onClick={() => companyLogoRef.current?.click()}>
                            {companyForm.image ? (
                              <img src={companyForm.image} alt="Logo" className="w-16 h-16 rounded-xl object-cover shadow-sm border border-white" />
                            ) : (
                              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                                 <HiOutlinePhoto className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                            <input type="file" ref={companyLogoRef} className="hidden" accept="image/*" onChange={handleCompanyLogoChange} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">Logo Perusahaan</p>
                            <p className="text-[10px] text-gray-400 font-medium">Klik kotak untuk mengganti identitas brand di dashboard pusat.</p>
                          </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Company Name</label>
                           <input type="text" className="w-full border p-2 rounded-lg" value={companyForm.name} onChange={(e)=>setCompanyForm({...companyForm, name: e.target.value})}/>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Phone</label>
                           <input type="text" className="w-full border p-2 rounded-lg" value={companyForm.phone} onChange={(e)=>setCompanyForm({...companyForm, phone: e.target.value})}/>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Address</label>
                           <textarea className="w-full border p-2 rounded-lg" rows={3} value={companyForm.address} onChange={(e)=>setCompanyForm({...companyForm, address: e.target.value})}/>
                       </div>
                       <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                           <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Working Type</label>
                           <select className="w-full border p-2 rounded-lg bg-white font-medium text-gray-700" value={companyForm.workingType} onChange={(e)=>setCompanyForm({...companyForm, workingType: e.target.value})}>
                               <option value="HYBRID">🔹 Hybrid</option>
                               <option value="WFO">🏢 Full WFO</option>
                               <option value="WFA">🏠 Full WFA</option>
                           </select>
                           <p className="text-[10px] text-gray-500 mt-1">*Mengubah tombol absen di HP karyawan.</p>
                       </div>
                   </div>
                   <div className="space-y-6">
                       <h4 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><HiMapPin className="w-5 h-5 text-red-500"/> Lokasi Absensi</h4>
                       <div className="grid grid-cols-2 gap-4">
                           <div><label className="text-xs font-bold text-gray-500">Latitude</label><input type="text" className="w-full border p-2 rounded bg-gray-50" value={companyForm.latitude} onChange={(e)=>setCompanyForm({...companyForm, latitude: e.target.value})}/></div>
                           <div><label className="text-xs font-bold text-gray-500">Longitude</label><input type="text" className="w-full border p-2 rounded bg-gray-50" value={companyForm.longitude} onChange={(e)=>setCompanyForm({...companyForm, longitude: e.target.value})}/></div>
                       </div>
                       <button type="button" onClick={handleGetMyLocation} className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 flex justify-center items-center gap-2">
                           <HiOutlineDevicePhoneMobile className="w-5 h-5"/> 📍 Ambil Lokasi Saya Sekarang
                       </button>
                       <div>
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Radius Toleransi (KM)</label>
                           <div className="flex items-center gap-2"><input type="number" step="0.01" className="w-full border p-2 rounded-lg" value={companyForm.radiusKm} onChange={(e)=>setCompanyForm({...companyForm, radiusKm: Number(e.target.value)})}/><span className="text-sm font-bold text-gray-500">KM</span></div>
                       </div>
                       <div className="h-40 bg-gray-100 rounded-lg overflow-hidden relative border">
                           {companyForm.latitude && companyForm.longitude ? (
                               <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(companyForm.longitude)-0.002}%2C${parseFloat(companyForm.latitude)-0.002}%2C${parseFloat(companyForm.longitude)+0.002}%2C${parseFloat(companyForm.latitude)+0.002}&layer=mapnik&marker=${companyForm.latitude}%2C${companyForm.longitude}`}></iframe>
                           ) : <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Belum ada lokasi diset.</div>}
                       </div>
                   </div>
               </div>
           </div>
        )}

        {/* TAB 3: DOCUMENT TEMPLATES */}
        {activeTab === 'letters' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Manajemen Template Surat</h1>
                        <p className="text-sm text-gray-500">Upload template surat izin/cuti agar bisa didownload karyawan.</p>
                    </div>
                    <button onClick={()=>setIsLetterModalOpen(true)} className="px-4 py-2 bg-[#19A0FA] text-white rounded-lg font-bold flex gap-2 items-center hover:bg-blue-600 transition">
                        <HiPlus className="w-5 h-5"/> Upload Template
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.length === 0 && (
                        <div className="col-span-2 text-center py-10 bg-gray-50 border-2 border-dashed rounded-xl text-gray-400">Belum ada template surat.</div>
                    )}
                    {templates.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
                            <div className="flex gap-3 items-center">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-lg"><HiDocumentText className="w-6 h-6"/></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                                    <p className="text-xs text-gray-500">{item.description || 'Tidak ada deskripsi'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleDownload(item.fileUrl, item.title)}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                    title="Download File"
                                >
                                    <HiArrowDownTray className="w-5 h-5"/>
                                </button>
                                <button onClick={()=>handleDeleteLetter(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><HiTrash className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}
        
        {/* TAB LAINNYA */}
        {activeTab === 'log' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-[#19A0FA]/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b border-[#19A0FA]/10">Activity Log</h3>
            {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity recorded yet.</p>
            ) : (
                <div className="relative border-l-2 border-[#19A0FA]/20 ml-4 space-y-10">
                  {logs.map((log) => (
                      <TimelineItem key={log.id} time={new Date(log.createdAt).toLocaleString()} title={log.action} icon={HiOutlineKey}>
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </TimelineItem>
                  ))}
                </div>
            )}
          </div>
        )}
        {activeTab === 'notification' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#19A0FA]/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                   <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Alerts</h4>
                   <NotificationItem label="News & Updates" description="Get the latest news about features." isActive={toggles.emailNews} onToggle={() => setToggles({...toggles, emailNews: !toggles.emailNews})} />
                   <NotificationItem label="Reminders" description="Receive reminders for pending tasks." isActive={toggles.emailReminders} onToggle={() => setToggles({...toggles, emailReminders: !toggles.emailReminders})} />
                </div>
            </div>
        )}

      </section>

      {/* MODAL UPLOAD TEMPLATE SURAT */}
      {isLetterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Upload Template Baru</h3>
                  <form onSubmit={handleSaveLetter} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Judul Dokumen</label>
                          <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Form Cuti Tahunan" value={letterForm.title} onChange={e=>setLetterForm({...letterForm, title: e.target.value})} required/>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Keterangan</label>
                          <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Opsional" value={letterForm.description} onChange={e=>setLetterForm({...letterForm, description: e.target.value})}/>
                      </div>
                      <div onClick={()=>letterInputRef.current?.click()} className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50 rounded-xl transition">
                          {letterForm.fileBase64 ? (
                              <div className="text-green-600 font-bold flex flex-col items-center">
                                  <HiCheckCircle className="w-8 h-8 mb-2"/> File Siap Upload
                              </div>
                          ) : (
                              <div className="text-gray-400 flex flex-col items-center">
                                  <HiArrowDownTray className="w-8 h-8 mb-2"/>
                                  <span className="text-sm font-bold">Klik untuk Upload PDF</span>
                                  <span className="text-xs">Maks 5MB</span>
                              </div>
                          )}
                          <input 
                              ref={letterInputRef} 
                              type="file" 
                              accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              className="hidden" 
                              onChange={handleLetterFileChange}
                          />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={()=>setIsLetterModalOpen(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold">Batal</button>
                          <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-[#19A0FA] text-white font-bold rounded-lg hover:bg-blue-600 shadow-lg transition">
                              {isSaving ? "Menyimpan..." : "Simpan Template"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </main>
  );
}

// --- SUB-COMPONENTS ---

function SettingTabButton({ label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full text-center px-4 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${isActive ? 'bg-[#092D49] text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
      {label}
    </button>
  );
}

function EditableItem({ label, name, value, isEditing, onChange }: any) {
    return (
      <div className="group">
        <p className="text-xs font-bold uppercase tracking-wide mb-1 text-gray-500">{label}</p>
        {isEditing ? (
            <input name={name} value={value || ''} onChange={onChange} className="w-full text-base text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#19A0FA] focus:ring-1 focus:ring-[#19A0FA] transition-all"/>
        ) : (
            <p className="text-base text-gray-800 font-medium border-b border-transparent pb-1 min-h-[24px]">{value || '-'}</p>
        )}
      </div>
    );
}

function CountryEditableItem({ label, name, value, isEditing, onChange }: any) {
  return (
    <div className="group">
      <p className="text-xs font-bold uppercase tracking-wide mb-1 text-gray-500">{label}</p>
      {isEditing ? (
          <select name={name} value={value || ''} onChange={onChange} className="w-full text-base text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#19A0FA] focus:ring-1 focus:ring-[#19A0FA] transition-all bg-white">
              <option value="">Select Country</option>
              {COUNTRY_OPTIONS.map((country) => (<option key={country} value={country}>{country}</option>))}
          </select>
      ) : (
          <p className="text-base text-gray-800 font-medium border-b border-transparent pb-1 min-h-[24px]">{value || '-'}</p>
      )}
    </div>
  );
}

function TimelineItem({ time, title, icon: Icon, children }: any) {
  return (
    <div className="relative pl-8">
      <span className="absolute -left-3.5 top-0 flex items-center justify-center w-7 h-7 bg-white border-2 border-[#19A0FA] rounded-full shadow-sm z-10"><Icon className="w-3.5 h-3.5 text-[#19A0FA]" /></span>
      <div>
        <p className="text-xs text-gray-400 mb-1">{time}</p>
        <h4 className="text-base font-bold text-gray-800 mb-2">{title}</h4>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">{children}</div>
      </div>
    </div>
  );
}

function NotificationItem({ label, description, isActive, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-[#19A0FA]/30 transition-colors bg-white">
      <div><h4 className="font-bold text-gray-800">{label}</h4><p className="text-sm text-gray-500">{description}</p></div>
      <button onClick={onToggle} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-[#19A0FA]' : 'bg-gray-300'}`}><span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} /></button>
    </div>
  );
}