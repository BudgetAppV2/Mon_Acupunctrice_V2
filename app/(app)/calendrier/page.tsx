'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import CalendarView from '@/components/features/calendar/CalendarView';

export default function CalendrierPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-sand">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-sage">Calendrier</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </header>

      <CalendarView />
    </div>
  );
}
