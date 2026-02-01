'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HiHome, HiCalendarDays, HiCalendar,     
  HiClipboardDocumentList, HiBanknotes, 
  HiCog6Tooth, HiArrowRightOnRectangle 
} from 'react-icons/hi2';

export default function EmployeeSidebar() {
  const pathname = usePathname(); 
  const router = useRouter();

  const menus = [
    { name: 'Dashboard', href: '/employee_dashboard', icon: HiHome },
    { name: 'Attendance', href: '/employee_attendance', icon: HiCalendarDays },
    { name: 'Schedule', href: '/employee_schedule', icon: HiCalendar }, 
    { name: 'Leave / Permit', href: '/employee_leaves', icon: HiClipboardDocumentList },
    { name: 'Salary', href: '/employee_salary', icon: HiBanknotes },
    { name: 'Setting', href: '/employee_settings', icon: HiCog6Tooth },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    // 🔥 Hapus 'fixed' agar mengikuti alur flex dari layout parent (seperti Admin)
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col z-20 shadow-sm overflow-y-auto custom-scrollbar">
      
      <div className="h-20 flex-shrink-0 flex items-center px-6 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image src="/logoworkify2.png" alt="Logo Workify" fill className="object-contain" />
          </div>
          <h1 className="text-xl font-extrabold text-[#19A0FA] tracking-tight">
            Workify<span className="text-gray-400 text-[10px] font-bold uppercase ml-1 tracking-tighter">Emp</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {menus.map((menu) => {
          const isActive = pathname === menu.href || pathname?.startsWith(menu.href + '/');
          return (
            <Link key={menu.href} href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive ? 'bg-[#19A0FA] text-white shadow-lg' : 'text-gray-500 hover:bg-blue-50/50 hover:text-[#19A0FA]' 
              }`}
            >
              <menu.icon className="w-5 h-5" />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all">
          <HiArrowRightOnRectangle className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}