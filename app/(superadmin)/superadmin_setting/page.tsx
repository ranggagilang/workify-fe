// app/(superadmin)/setting/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import {
  HiOutlinePencilSquare,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineServer,
  HiOutlineLockClosed
} from 'react-icons/hi2';

type SettingTab = 'profile' | 'app_config' | 'security' | 'notification';

// Daftar Negara (Opsional)
const COUNTRY_OPTIONS = [
  "Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", "Philippines", "Other"
];

export default function SuperadminSettingPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATES ---
  const [userData, setUserData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dummy State untuk Tab Lain (Placeholder)
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [toggles, setToggles] = useState({
    newCompanyAlert: true,
    paymentAlert: true,
    serverAlert: true,
    marketingEmail: false,
  });

  const appConfig = {
    appName: 'Workify HRIS',
    supportEmail: 'support@workify.com',
    version: 'v2.4.0 (Stable)',
    timezone: '(GMT+07:00) Jakarta, Bangkok, Hanoi',
    language: 'English (US)',
  };

  // --- 1. FETCH DATA DARI DATABASE ---
  useEffect(() => {
    // Ambil dari LocalStorage dulu biar cepat tampil
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) { console.error(e); }
    }

    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Kita pakai endpoint yang sama dengan Admin, karena Superadmin juga User
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { user } = res.data.data;
      if (user) {
        setUserData(user);
        // Update LocalStorage agar sinkron
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...user }));
      }
    } catch (err) {
      console.error("Gagal fetch settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. HANDLE EDIT INPUT ---
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // --- 3. SAVE PROFILE ---
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: userData.name,
        phone: userData.phone,
        bio: userData.bio,
        address: userData.address,
        city: userData.city,
        country: userData.country
      };

      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = res.data.data;
      setUserData(updatedUser);

      // Update LocalStorage & Trigger Header Update
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
      window.dispatchEvent(new Event('userUpdated'));

      setIsEditing(false);
      alert("Profile updated successfully! ✅");
      fetchSettings();

    } catch (err: any) {
      console.error("Update Error:", err);
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. UPLOAD FOTO (Validasi 2MB) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Ukuran (Max 2MB)
    const MAX_MB = 2;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`⚠️ File too large! Max ${MAX_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const previousImage = userData.image; // Backup foto lama

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result;
      
      // Optimistic Update
      setUserData({ ...userData, image: base64String });

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/settings/avatar`, {
          imageBase64: base64String
        }, { headers: { Authorization: `Bearer ${token}` } });

        // Update LocalStorage & Trigger Header
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, image: base64String }));
        window.dispatchEvent(new Event('userUpdated'));

        fetchSettings();
      } catch (err: any) {
        console.error("Upload Error:", err);
        setUserData({ ...userData, image: previousImage }); // Revert jika gagal
        alert("Failed to upload image.");
      }
    };
  };

  return (
    <main className="flex items-stretch w-full bg-white rounded-xl shadow-sm border border-[#19A0FA]/20 min-h-[600px] overflow-hidden">

      {/* --- Sidebar Setting --- */}
      <aside
        className="w-64 flex-shrink-0 p-6 flex flex-col border-r border-[#19A0FA]/10 rounded-l-xl"
        style={{ backgroundColor: '#19A0FA' }}
      >
        <nav className="flex flex-col space-y-3">
          <SettingTabButton label="Profile Setting" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SettingTabButton label="App Configuration" isActive={activeTab === 'app_config'} onClick={() => setActiveTab('app_config')} />
          <SettingTabButton label="Security & Access" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />
          <SettingTabButton label="Notifications" isActive={activeTab === 'notification'} onClick={() => setActiveTab('notification')} />
        </nav>
      </aside>

      {/* --- Konten Kanan --- */}
      <section className="flex-1 p-8 bg-white overflow-y-auto max-h-[800px]">

        {/* 1. TAB PROFILE (EDITABLE) */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Header Card */}
            <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">My Profile</h3>
                {isEditing ? (
                   <div className="flex gap-2">
                       <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                       <button onClick={handleSaveProfile} disabled={isSaving} className="px-3 py-1.5 bg-[#19A0FA] text-white rounded-lg text-sm font-bold shadow hover:bg-blue-600 transition-all">
                           {isSaving ? 'Saving...' : 'Save Changes'}
                       </button>
                   </div>
                ) : (
                   <EditButton onClick={() => setIsEditing(true)} />
                )}
              </div>

              <div className="flex items-center gap-6">
                {/* Bagian Foto */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {userData.image ? (
                    <img src={userData.image} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#19A0FA] border border-blue-100">
                      <HiOutlineUserCircle className="w-12 h-12" />
                    </div>
                  )}
                  {/* Icon Edit Foto */}
                  <div className="absolute bottom-0 right-0 bg-[#19A0FA] p-1.5 rounded-full border border-white shadow hover:bg-blue-600 transition-colors group-hover:scale-110">
                    <HiOutlinePencilSquare className="w-4 h-4 text-white" />
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Bagian Nama/Role */}
                <div className="flex-1">
                  {isEditing ? (
                      <input 
                        name="name" 
                        value={userData.name || ''} 
                        onChange={handleUserChange} 
                        className="text-xl font-bold border-b border-blue-300 focus:outline-none mb-1 w-full"
                        placeholder="Full Name"
                      />
                  ) : (
                      <h4 className="text-xl font-bold text-gray-800">{userData.name || 'Super Admin'}</h4>
                  )}
                  
                  <p className="text-[#19A0FA] font-medium">{userData.role || 'Super Admin'}</p>
                  
                  {userData.country && <p className="text-gray-400 text-sm mt-1">{userData.country}</p>}
                </div>
              </div>
            </div>

            {/* Details Form */}
            <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Personal Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 {/* Email (Read Only) */}
                 <div className="group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-base text-gray-500 font-medium">{userData.email}</p>
                 </div>

                 <EditableItem label="Phone Number" name="phone" value={userData.phone} isEditing={isEditing} onChange={handleUserChange} />
                 <EditableItem label="Bio" name="bio" value={userData.bio} isEditing={isEditing} onChange={handleUserChange} />
                 <EditableItem label="Address" name="address" value={userData.address} isEditing={isEditing} onChange={handleUserChange} />
                 <EditableItem label="City" name="city" value={userData.city} isEditing={isEditing} onChange={handleUserChange} />
                 
                 {/* Country Select */}
                 <div className="group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Country</p>
                    {isEditing ? (
                        <select 
                            name="country"
                            value={userData.country || ''}
                            onChange={handleUserChange}
                            className="w-full text-base text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#19A0FA] bg-white"
                        >
                            <option value="">Select Country</option>
                            {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    ) : (
                        <p className="text-base text-gray-800 font-medium border-b border-transparent pb-1">{userData.country || '-'}</p>
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB APP CONFIGURATION (STATIC) */}
        {activeTab === 'app_config' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm space-y-6 divide-y divide-[#19A0FA]/10">
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Application Settings</h3>
                  <p className="text-sm text-gray-500">Global configuration for Workify App.</p>
                </div>
              </div>
              <ConfigItem label="Application Name" value={appConfig.appName} description="Displayed on browser tab and emails." />
              <ConfigItem label="Support Email" value={appConfig.supportEmail} description="Sender address for system emails." />
              <ConfigItem label="Default Timezone" value={appConfig.timezone} description="Base timeline for logs." />
              <ConfigItem label="Current Version" value={appConfig.version} description="System build version." />
            </div>

            <div className={`p-6 rounded-xl border transition-colors ${isMaintenance ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#19A0FA]/20'}`}>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-lg ${isMaintenance ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    <HiOutlineServer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500 max-w-md">
                      If active, all users (except Superadmin) will be blocked from accessing the dashboard. Use this for database migration.
                    </p>
                  </div>
                </div>
                <ToggleSwitch isActive={isMaintenance} onToggle={() => setIsMaintenance(!isMaintenance)} />
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB SECURITY (STATIC) */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Security Settings</h3>
              <div className="flex items-center justify-between py-4 border-b border-[#19A0FA]/10">
                <div className="flex items-center gap-3">
                  <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-700">Password</p>
                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="text-sm text-[#19A0FA] font-semibold hover:underline">Update Password</button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-[#19A0FA]/10">
                <div className="flex items-center gap-3">
                  <HiOutlineShieldCheck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-700">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Currently inactive</p>
                  </div>
                </div>
                <ToggleSwitch isActive={false} onToggle={() => { }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">My Login History</h3>
              <div className="space-y-4">
                <LoginHistoryItem device="Macbook Pro (Chrome)" location="Malang, ID" ip="192.168.1.1" time="Active Now" isCurrent />
                <LoginHistoryItem device="iPhone 14 (App)" location="Surabaya, ID" ip="202.14.55.1" time="2 hours ago" />
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB NOTIFICATION (STATIC) */}
        {activeTab === 'notification' && (
          <div className="bg-white p-6 rounded-xl border border-[#19A0FA]/20 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">System Alerts</h3>
              <p className="text-sm text-gray-500 mb-6">Decide what you want to be notified about via Email.</p>
              <div className="space-y-4">
                <NotificationItem
                  label="New Company Registration"
                  description="Get notified when a new company signs up for trial."
                  isActive={toggles.newCompanyAlert}
                  onToggle={() => setToggles({ ...toggles, newCompanyAlert: !toggles.newCompanyAlert })}
                />
                <NotificationItem
                  label="Payment Received"
                  description="Get notified when a subscription payment is successful."
                  isActive={toggles.paymentAlert}
                  onToggle={() => setToggles({ ...toggles, paymentAlert: !toggles.paymentAlert })}
                />
                <NotificationItem
                  label="Critical Server Issues"
                  description="Immediate alert if system downtime or high latency detected."
                  isActive={toggles.serverAlert}
                  onToggle={() => setToggles({ ...toggles, serverAlert: !toggles.serverAlert })}
                />
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function SettingTabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-center px-4 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm
        ${isActive
          ? 'bg-[#092D49] text-white font-bold'
          : 'bg-white text-gray-700 hover:bg-gray-100'}
      `}
    >{label}</button>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-[#19A0FA] hover:bg-gray-50 bg-white hover:text-blue-700 transition-colors">
      <HiOutlinePencilSquare className="w-4 h-4" /> Edit Profile
    </button>
  );
}

// Komponen Input yang Bisa Diedit
function EditableItem({ label, name, value, isEditing, onChange }: any) {
    return (
      <div className="group">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        {isEditing ? (
            <input 
                name={name}
                value={value || ''}
                onChange={onChange}
                className="w-full text-base text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#19A0FA] transition-all"
            />
        ) : (
            <p className="text-base text-gray-800 font-medium border-b border-transparent pb-1 min-h-[24px]">{value || '-'}</p>
        )}
      </div>
    );
}

function ConfigItem({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="flex justify-between items-center py-4">
      <div>
        <h4 className="text-base font-semibold text-gray-800">{label}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium">{value}</span>
        <button className="text-[#19A0FA] hover:text-blue-800 p-1 transition-colors">
          <HiOutlinePencilSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function NotificationItem({ label, description, isActive, onToggle }: any) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:border-[#19A0FA]/30 transition-colors">
      <div>
        <h4 className="text-sm font-bold text-gray-800">{label}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ToggleSwitch isActive={isActive} onToggle={onToggle} />
    </div>
  );
}

function LoginHistoryItem({ device, location, ip, time, isCurrent }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div>
          <p className="text-sm font-semibold text-gray-700">{device}</p>
          <p className="text-xs text-gray-500">{location} • {ip}</p>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500">{time}</span>
    </div>
  )
}

function ToggleSwitch({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-[#19A0FA]' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}