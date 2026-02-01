'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiLockClosed } from 'react-icons/hi2';

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
            confirmNewPassword: formData.confirmNewPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Gagal mengubah password');

      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
          const user = JSON.parse(userStr);
          user.mustChangePassword = false;
          localStorage.setItem('user', JSON.stringify(user));
      }

      alert('Password berhasil diubah! Mengalihkan ke Dashboard...');
      
      const user = userStr ? JSON.parse(userStr) : {};
      if (user.role === 'ADMIN') router.push('/admindashboard');
      else if (user.role === 'SUPERADMIN') router.push('/superadmindashboard');
      else router.push('/employee_dashboard'); 

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        // 👇 Ganti Background di sini
        backgroundImage: "url('/building-background.jpg')", 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 👇 Overlay Hitam Transparan (Biar teks/kartu lebih kontras) */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Card Container (Kasih relative z-10 biar di atas background) */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiLockClosed className="w-8 h-8 text-[#19A0FA]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Ganti Password</h2>
          <p className="text-gray-500 text-sm mt-2">
            Demi keamanan, silakan ganti password default Anda sebelum melanjutkan.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Field Password Lama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password Lama</label>
            <input
              type="password"
              name="oldPassword"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#19A0FA] focus:border-[#19A0FA] outline-none transition-all"
              placeholder="Masukkan password saat ini (123456)"
              value={formData.oldPassword}
              onChange={handleChange}
            />
          </div>

          {/* Field Password Baru */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
            <input
              type="password"
              name="newPassword"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#19A0FA] focus:border-[#19A0FA] outline-none transition-all"
              placeholder="Minimal 6 karakter"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          {/* Field Konfirmasi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ulangi Password Baru</label>
            <input
              type="password"
              name="confirmNewPassword"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#19A0FA] focus:border-[#19A0FA] outline-none transition-all"
              placeholder="Ketik ulang password baru"
              value={formData.confirmNewPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#19A0FA] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}