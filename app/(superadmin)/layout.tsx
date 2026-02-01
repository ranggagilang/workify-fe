import SuperadminSidebar from '@/components/superadmin/superadminsidebar';
import SuperadminHeader from '@/components/superadmin/superadminheader';
import React from 'react';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // UBAH bg-gray-100 JADI bg-white
    <div className="flex bg-white h-screen w-screen overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="flex-shrink-0">
        <SuperadminSidebar /> 
      </div>

      {/* AREA KANAN */}
      <div className="flex-grow flex flex-col h-full relative">
        
        {/* HEADER */}
        <SuperadminHeader />
        
        {/* KONTEN UTAMA */}
        <main className="flex-grow p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}