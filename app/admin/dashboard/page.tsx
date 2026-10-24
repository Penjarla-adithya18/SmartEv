'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  BarChart3,
  BatteryCharging,
  CheckCircle2,
  Lock,
  LogOut,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem('smartev_admin_secret_verified')
      const auth = sessionStorage.getItem('smartev_admin_authenticated')
      if (verified === 'true' && auth === 'true') {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('smartev_admin_secret_verified')
      sessionStorage.removeItem('smartev_admin_authenticated')
    }
    router.push('/')
  }

  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#070c14] flex items-center justify-center p-8 text-slate-400">
        Verifying Security Credentials...
      </main>
    )
  }

  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-[#0b1220] flex items-center justify-center p-6 text-foreground">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <Lock className="size-6 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">404 - Access Denied</h1>
          <p className="mt-2 text-sm text-slate-400">
            You do not have authorization to view this area.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#070c14] text-foreground p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <ShieldCheck className="size-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Admin Control Center</h1>
              <p className="text-xs text-slate-400">Bhimavaram & Regional EV Infrastructure Management</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700"
          >
            <LogOut className="size-4 text-red-400" /> End Admin Session
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Active Stations</span>
              <BatteryCharging className="size-4 text-emerald-400" />
            </div>
            <div className="mt-3 font-bold text-2xl text-white">18</div>
            <p className="mt-1 text-[11px] text-emerald-400 font-medium">● All Systems Online in Bhimavaram</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Charging Sessions</span>
              <Zap className="size-4 text-cyan-400" />
            </div>
            <div className="mt-3 font-bold text-2xl text-white">142</div>
            <p className="mt-1 text-[11px] text-slate-400">Today across all chargers</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Registered Owners</span>
              <Users className="size-4 text-amber-400" />
            </div>
            <div className="mt-3 font-bold text-2xl text-white">12</div>
            <p className="mt-1 text-[11px] text-slate-400">Verified Station Operators</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Grid Load</span>
              <Activity className="size-4 text-purple-400" />
            </div>
            <div className="mt-3 font-bold text-2xl text-white">74%</div>
            <p className="mt-1 text-[11px] text-cyan-400 font-medium">AI Load Balancing Active</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
          <h2 className="font-bold text-white text-base">Quick Admin Tools</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/map"
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-500/50"
            >
              <MapPin className="size-5 text-cyan-400 mb-2" />
              <div className="font-semibold text-white text-xs">Manage Live Map</div>
              <div className="text-[11px] text-slate-500 mt-1">View live station markers & pins</div>
            </Link>

            <Link
              href="/submit-station"
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-500/50"
            >
              <BatteryCharging className="size-5 text-emerald-400 mb-2" />
              <div className="font-semibold text-white text-xs">Add Station as Admin</div>
              <div className="text-[11px] text-slate-500 mt-1">Publish new charging station</div>
            </Link>

            <Link
              href="/owner"
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-500/50"
            >
              <Users className="size-5 text-amber-400 mb-2" />
              <div className="font-semibold text-white text-xs">Owner Management</div>
              <div className="text-[11px] text-slate-500 mt-1">Manage station operator accounts</div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
