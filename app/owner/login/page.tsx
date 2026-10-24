'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartev_owner_logged_in', 'true')
      }
      router.push('/owner/my-stations')
    }, 600)
  }

  return (
    <main className="min-h-screen bg-[#070c14] text-foreground flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_25px_#06b6d4_/_0.2]">
            <Building2 className="size-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Station Owner Login</h1>
          <p className="mt-1 text-xs text-slate-400">Access your EV station management portal</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-7 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In to Owner Portal'} <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an owner account yet?{' '}
          <Link href="/owner/register" className="text-cyan-400 font-semibold hover:underline">
            Register your EV shop
          </Link>
        </p>
      </div>
    </main>
  )
}
