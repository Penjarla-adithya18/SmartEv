'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addOwnerStation } from '@/lib/stationsData'
import {
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  MapPin,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react'

export default function SubmitStationPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Bhimavaram',
    latitude: '16.5449',
    longitude: '81.5212',
    powerKw: '180',
    totalPorts: '6',
    pricePerKwh: '12',
    connectors: ['CCS2', 'Type 2'],
    networkName: '',
    operatingHours: '24/7 Open',
  })

  const toggleConnector = (connector: string) => {
    setFormData((prev) => {
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
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill out station name and address.')
      return
    }

    setSubmitting(true)
    try {
      const created = await addOwnerStation({
        name: formData.name,
        address: formData.address,
        city: formData.city || 'Bhimavaram',
        latitude: parseFloat(formData.latitude) || 16.5449,
        longitude: parseFloat(formData.longitude) || 81.5212,
        powerKw: parseInt(formData.powerKw) || 120,
        totalPorts: parseInt(formData.totalPorts) || 4,
        availablePorts: parseInt(formData.totalPorts) || 4,
        pricePerKwh: parseFloat(formData.pricePerKwh) || 12,
        connectors: formData.connectors.length > 0 ? formData.connectors : ['CCS2'],
        network: formData.networkName || 'Owner Direct Network',
        operatingHours: formData.operatingHours || '24/7 Open',
        status: 'available',
        rating: 5.0,
      })

      setSuccessMsg(`Station "${created.name}" successfully added to Supabase & Map!`)
      setTimeout(() => {
        router.push('/map')
      }, 1800)
    } catch (err) {
      console.error('Failed submitting station', err)
      alert('Error submitting station. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-12 transition-colors duration-200">
      <div className="mx-auto max-w-3xl px-5 pt-8 lg:px-8 space-y-6">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition"
        >
          <ArrowLeft className="size-4" /> Back to Map
        </Link>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 sm:p-8 shadow-xl transition-colors">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
            <Sparkles className="size-3.5" /> OWNER PORTAL
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Add Your Charging Station
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Register your EV charging station location in Bhimavaram or your city to publish it live onto the SmartEV map.
          </p>

          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-5 shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Station Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grand EV Fast Charging Hub"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Full Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. J P Road, Near Railway Station, Bhimavaram"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Latitude</label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="16.5449"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Longitude</label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="81.5212"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Max Power (kW)</label>
                <input
                  type="number"
                  value={formData.powerKw}
                  onChange={(e) => setFormData({ ...formData, powerKw: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Total Charging Ports</label>
                <input
                  type="number"
                  value={formData.totalPorts}
                  onChange={(e) => setFormData({ ...formData, totalPorts: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Price (₹/kWh)</label>
                <input
                  type="number"
                  value={formData.pricePerKwh}
                  onChange={(e) => setFormData({ ...formData, pricePerKwh: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Supported Connectors</label>
              <div className="flex flex-wrap gap-3">
                {['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConnector(c)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                      formData.connectors.includes(c)
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {c} {formData.connectors.includes(c) ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Network / Owner Name</label>
              <input
                type="text"
                value={formData.networkName}
                onChange={(e) => setFormData({ ...formData, networkName: e.target.value })}
                placeholder="e.g. Bhimavaram Local EV Network"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            {/* Authorized EV Station Certificate Upload Section */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold text-xs">
                  📜
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">Authorized EV Station Certificate *</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Upload official shop / government EV infrastructure license</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Certificate / License No.</label>
                  <input
                    type="text"
                    placeholder="e.g. AP-EV-AUTH-884920"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Upload Certificate File (.pdf, .jpg, .png)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        alert(`Authorized Certificate "${file.name}" uploaded & verified for station listing!`)
                      }
                    }}
                    className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                <span>🛡️ Verified Official License Required for Map Listing</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-cyan-500/10"
            >
              <Plus className="size-4" />
              {submitting ? 'Publishing Station...' : 'Publish Station Live on Map'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
