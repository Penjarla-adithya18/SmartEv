'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, User, UserCheck } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const pathname = usePathname()
  const [driverPhone, setDriverPhone] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('smartev_driver_phone')
      if (savedPhone) setDriverPhone(savedPhone)
    }
  }, [pathname])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Stations', href: '/stations' },
    { name: 'AI Insights', href: '/ai-insights' },
    { name: 'Map', href: '/map' },
    { name: 'Compare', href: '/compare' },
    { name: 'About', href: '/about' },
  ]

  return (
    <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#070c14]/90 sticky top-0 z-40 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          <Zap className="size-6 text-emerald-500 fill-emerald-500" />
          SmartEV
        </Link>

        {/* Nav Links with Dynamic Active Green Highlighting */}
        <nav className="hidden items-center gap-6 md:flex text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition pb-0.5 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Driver Profile Link */}
          <Link
            href={driverPhone ? '/driver/profile' : '/driver/login'}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            {driverPhone ? (
              <>
                <UserCheck className="size-3.5 text-emerald-500" />
                My Profile
              </>
            ) : (
              <>
                <User className="size-3.5 text-cyan-500" />
                Driver Login
              </>
            )}
          </Link>

          <Link
            href="/owner"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:text-white transition"
          >
            For Station Owners
          </Link>

          <Link
            href="/submit-station"
            className="flex items-center gap-1 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-sm"
          >
            Add Station +
          </Link>
        </div>
      </div>
    </header>
  )
}
