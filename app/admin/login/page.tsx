'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const secretKeyRequired = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '5566'

  const [step, setStep] = useState<'secret_passcode' | 'admin_credentials'>('secret_passcode')
  const [passcode, setPasscode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Check if security key was already verified in this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isVerified = sessionStorage.getItem('smartev_admin_secret_verified')
      if (isVerified === 'true') {
        setStep('admin_credentials')
      }
    }
  }, [])

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (passcode.trim() === secretKeyRequired) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('smartev_admin_secret_verified', 'true')
      }
      setStep('admin_credentials')
    } else {
      setErrorMsg('Access Denied: Invalid Security Key.')
      setPasscode('')
    }
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('smartev_admin_authenticated', 'true')
        }
        router.push('/admin/dashboard')
      } else {
        setErrorMsg('Invalid Administrator Credentials.')
        setIsLoading(false)
      }
    }, 600)
  }

  return (
    <main className="min-h-screen bg-[#070c14] text-foreground flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header Shield Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_25px_#06b6d4_/_0.2]">
            <ShieldCheck className="size-7 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Security Portal</h1>
          <p className="mt-1 text-xs text-slate-400">Restricted Administrator Authentication Gateway</p>
        </div>

        {/* Form Container Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-7 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 p-3.5 text-xs font-semibold text-red-400">
              <ShieldAlert className="size-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {step === 'secret_passcode' ? (
            /* Step 1: Security Key Requirement (5566) */
            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>Restricted Area. Enter Security Key (5566) to proceed.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-cyan-400" />
                  Security Key
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 4-digit security key..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono tracking-widest text-center"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Verify Key <ArrowRight className="size-4" />
              </button>
            </form>
          ) : (
            /* Step 2: Administrator Credentials Login */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold mb-2">
                <UserCheck className="size-4 shrink-0" />
                Security Key Verified. Enter Admin Credentials.
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Admin Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {isLoading ? 'Authenticating System...' : 'Login to Admin Dashboard'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          SmartEV Protected Gateway • Security Key Required
        </p>
      </div>
    </main>
  )
}
