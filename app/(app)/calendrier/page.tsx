'use client';

import CalendarView from '@/components/features/calendar/CalendarView';

export default function CalendrierPage() {
  return (
    <div className="min-h-screen bg-sand">
      <header className="px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-sage">Calendrier</h1>
      </header>
      <CalendarView />
    </div>
  );
}
