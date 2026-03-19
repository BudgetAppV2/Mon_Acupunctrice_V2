'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LightBulbIcon as LightBulbOutline,
  CalendarIcon as CalendarOutline,
  BoltIcon as BoltOutline,
  UserIcon as UserOutline,
} from '@heroicons/react/24/outline';
import {
  LightBulbIcon as LightBulbSolid,
  CalendarIcon as CalendarSolid,
  BoltIcon as BoltSolid,
  UserIcon as UserSolid,
} from '@heroicons/react/24/solid';

const TABS = [
  { href: '/idees', label: 'Idées', outline: LightBulbOutline, solid: LightBulbSolid },
  { href: '/calendrier', label: 'Calendrier', outline: CalendarOutline, solid: CalendarSolid },
  { href: '/blitz', label: 'Blitz', outline: BoltOutline, solid: BoltSolid },
  { href: '/profil', label: 'Profil', outline: UserOutline, solid: UserSolid },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="pb-[calc(49px+env(safe-area-inset-bottom))]">
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-t border-gray-200">
        <div
          className="grid grid-cols-4 items-end"
          style={{ height: 'calc(49px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {TABS.map(({ href, label, outline: Outline, solid: Solid }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            const Icon = active ? Solid : Outline;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center h-[49px] gap-0.5 transition-colors ${
                  active ? 'text-sage' : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
