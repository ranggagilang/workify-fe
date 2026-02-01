'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  HiChevronRight,
  HiBriefcase,
  HiUser,
  HiDevicePhoneMobile, 
  HiEnvelope,
  HiMapPin,
  HiArrowLeft,
  HiOutlineUserPlus
} from 'react-icons/hi2';

export default function AddEmployeePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    departmentId: '', 
    gender: 'Male',
    address: ''
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(res.data.data);
      } catch (error) {
        console.error("Gagal load departemen", error);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            departmentId: Number(formData.departmentId),
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        alert("Sukses! Karyawan berhasil ditambahkan.\nPassword Default: 123456");
        router.push('/information');

    } catch (error: any) {
        alert(error.response?.data?.message || "Gagal menambah karyawan");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/information" className="hover:text-[#19A0FA] transition-colors flex items-center gap-1">
          <HiUser className="w-4 h-4" /> Employee Database
        </Link>
        <HiChevronRight className="w-4 h-4" />
        <span className="font-semibold text-gray-800">Add New Employee</span>
      </div>

      {/* 🔥 Kotak Card Utama (Membungkus Form dan Tombol Action) */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            
            {/* PANEL KIRI (Informasi) */}
            <div className="lg:w-1/3 bg-gray-50/50 p-8 border-r border-gray-100 space-y-6">
              <div>
                  <div className="w-12 h-12 bg-[#19A0FA] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
                    <HiOutlineUserPlus className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">Registration</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mt-2">
                  Daftarkan anggota tim baru Anda dengan mengisi profil lengkap untuk akses sistem HRIS.
                  </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-50 shadow-sm">
                  <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <HiBriefcase className="w-4 h-4"/> System Policy
                  </h4>
                  <ul className="text-xs text-gray-500 space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                        NIP dibuat otomatis.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                        Password: <strong className="text-gray-700">123456</strong>
                      </li>
                  </ul>
              </div>
            </div>

            {/* FORM KANAN (Input Data) */}
            <div className="lg:w-2/3 p-8 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Identitas Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nama Lengkap</label>
                      <div className="relative">
                        <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input required name="name" onChange={handleChange} type="text" placeholder="Budi Santoso" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                      <div className="relative">
                        <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input required name="email" onChange={handleChange} type="email" placeholder="budi@company.com" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">No. HP</label>
                      <div className="relative">
                        <HiDevicePhoneMobile className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input required name="phone" onChange={handleChange} type="tel" placeholder="0812..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Alamat</label>
                      <div className="relative">
                        <HiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input name="address" onChange={handleChange} type="text" placeholder="Jl. Sudirman" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Pekerjaan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Departemen</label>
                      <select required name="departmentId" onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all appearance-none cursor-pointer">
                          <option value="">-- Pilih Departemen --</option>
                          {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Jabatan</label>
                      <div className="relative">
                        <HiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input required name="position" onChange={handleChange} type="text" placeholder="Manager" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#19A0FA]/20 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔥 TOMBOL ACTION (Sekarang di dalam area card putih) */}
              <div className="flex justify-end items-center gap-4 pt-8 mt-10 border-t border-gray-50">
                <button type="button" onClick={() => router.push('/information')} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-all">Discard</button>
                <button type="submit" disabled={loading} className="bg-[#092D49] text-white px-10 py-3.5 rounded-xl text-xs font-bold hover:shadow-xl transition-all disabled:bg-gray-400 uppercase tracking-[0.2em]">
                  {loading ? 'Saving...' : 'Register Staff'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}