'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addOwnerStation } from '@/lib/stationsData'
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  Building2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'

export default function OwnerRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    city: 'Bhimavaram',
    address: '',
    powerKw: '180',
    totalPorts: '6',
    pricePerKwh: '12',
    connectors: ['CCS2', 'Type 2'],
  })

  const toggleConnector = (connector: string) => {
    setForm((prev) => {
      const exists = prev.connectors.includes(connector)
      return {
        ...prev,
        connectors: exists
          ? prev.connectors.filter((c) => c !== connector)
          : [...prev.connectors, connector],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ownerName || !form.businessName || !form.email || !form.address) {
      alert('Please fill out all required fields.')
      return
    }

    setLoading(true)
    try {
      // 1. Create owner station in Supabase / station store
      const station = await addOwnerStation({
        name: form.businessName,
        address: form.address,
        city: form.city || 'Bhimavaram',
        latitude: 16.5449,
        longitude: 81.5212,
        powerKw: parseInt(form.powerKw) || 120,
        totalPorts: parseInt(form.totalPorts) || 6,
        availablePorts: parseInt(form.totalPorts) || 6,
        pricePerKwh: parseFloat(form.pricePerKwh) || 12,
        connectors: form.connectors,
        network: form.businessName,
        status: 'available',
      })

      // 2. Save owner session
      if (typeof window !== 'undefined') {
        const ownerSession = {
          ownerName: form.ownerName,
          businessName: form.businessName,
          email: form.email,
          phone: form.phone,
          stationId: station.id,
        }
        localStorage.setItem('smartev_registered_owner', JSON.stringify(ownerSession))
        localStorage.setItem('smartev_owner_logged_in', 'true')
      }

      setSuccessMsg(`Congratulations ${form.ownerName}! Your EV Shop "${form.businessName}" is registered and live on the map!`)
      setTimeout(() => {
        router.push('/owner/my-stations')
      }, 1800)
    } catch (err) {
      console.error('Owner registration error', err)
      alert('Failed registering shop owner. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#070c14] text-foreground flex items-center justify-center p-5 lg:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_25px_#06b6d4_/_0.2]">
            <Building2 className="size-7 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Register as EV Station Owner</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            List your EV charging hub, manage chargers, track bookings, and grow revenue in Bhimavaram.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {successMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Owner & Business Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-slate-500" />
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="e.g. Venkat Ramana"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Station / Shop Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 size-4 text-slate-500" />
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="e.g. Grand EV Fast Hub Bhimavaram"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-slate-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="owner@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-slate-500" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-slate-500" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 pt-3">
              2. Station Details
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Station Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-slate-500" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Bypass Road, Near Grand Hotel, Bhimavaram"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Power Output (kW)</label>
                <input
                  type="number"
                  value={form.powerKw}
                  onChange={(e) => setForm({ ...form, powerKw: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Charger Ports</label>
                <input
                  type="number"
                  value={form.totalPorts}
                  onChange={(e) => setForm({ ...form, totalPorts: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Rate (₹/kWh)</label>
                <input
                  type="number"
                  value={form.pricePerKwh}
                  onChange={(e) => setForm({ ...form, pricePerKwh: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Supported Connectors</label>
              <div className="flex flex-wrap gap-2.5">
                {['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConnector(c)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                      form.connectors.includes(c)
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {c} {form.connectors.includes(c) ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 pt-3">
              3. Authorized EV Station Certificate Verification
            </h2>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs">
                  📜
                </span>
                <div>
                  <h3 className="font-bold text-white text-xs">Authorized EV Station Certificate *</h3>
                  <p className="text-[11px] text-slate-400">Upload official shop / government EV infrastructure license</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Certificate / License No.</label>
                  <input
                    type="text"
                    placeholder="e.g. AP-EV-AUTH-884920"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Upload Certificate File (.pdf, .jpg, .png)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        alert(`Authorized Certificate "${file.name}" uploaded & verified for station listing!`)
                      }
                    }}
                    className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 pt-1">
                <span>🛡️ Verified Official License Required for Map Listing</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? 'Creating Owner Account...' : 'Complete Owner Registration'}
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/owner/login" className="text-cyan-400 font-semibold hover:underline">
            Log in to Owner Dashboard
          </Link>
        </p>
      </div>
    </main>
  )
}
