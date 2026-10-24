'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  MessageSquare,
  Phone,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function DriverLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!phone.trim() || phone.length < 10) {
      setErrorMsg('Please enter a valid phone number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/twilio/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed sending OTP')

      if (data.dynamicOtp) {
        setNotice(`Dynamic OTP generated for ${phone}: ${data.dynamicOtp}`)
      } else {
        setNotice(data.message || `SMS OTP sent to ${phone}`)
      }
      setStep('otp')
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send OTP. Try demo login below.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!otpCode.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/twilio/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Invalid OTP code.')

      // Save driver session
      localStorage.setItem('smartev_driver_phone', phone)
      router.push('/driver/profile')
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoPhone = ''
    localStorage.setItem('smartev_driver_phone', demoPhone)
    router.push('/driver/profile')
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-foreground flex items-center justify-center p-5 transition-colors">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 lg:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500">
              <Phone className="size-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Driver Login</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fast & secure phone authentication via Twilio SMS OTP
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-3.5 text-xs text-red-500 font-medium">
              {errorMsg}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 size-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-9 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <MessageSquare className="size-4" />
                {loading ? 'Sending Twilio OTP...' : 'Send Twilio SMS OTP Code'}
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  ⚡ 1-Click Demo Driver Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 text-xs text-cyan-600 dark:text-cyan-300 flex items-center justify-between">
                <span>{notice}</span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="font-bold underline text-cyan-500 text-[11px]"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <KeyRound className="size-4 text-emerald-500" /> Enter 6-Digit SMS OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit dynamic OTP..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-center text-lg font-bold font-mono tracking-widest text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Access Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
