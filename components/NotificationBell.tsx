import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm text-gray-700 z-50">
          <div className="font-bold text-gray-900 mb-1">Notifications</div>
          <div className="text-gray-500">Belum ada notifikasi.</div>
        </div>
      )}
    </div>
  );
}
