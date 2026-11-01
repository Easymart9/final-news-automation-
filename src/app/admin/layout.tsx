import React from 'react';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/AdminSidebar';
import { getAdminSessionToken } from '@/lib/admin-session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session_token');
  const sessionToken = getAdminSessionToken();
  const isAuthenticated = Boolean(sessionToken && token?.value === sessionToken);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {isAuthenticated ? (
        <div className="min-h-screen flex">
          <AdminSidebar />
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#f8fafc]">
            {children}
          </main>
        </div>
      ) : (
        <div className="w-full min-h-screen bg-[#f8fafc]">
          {children}
        </div>
      )}
    </div>
  );
}
