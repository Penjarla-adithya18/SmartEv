'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getOwnerAddedStations, type EVStation } from '@/lib/stationsData'
import {
  BatteryCharging,
  Building2,
  CheckCircle2,
  Compass,
  MapPin,
  Plus,
  Power,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react'

export default function MyStationsPage() {
  const [stations, setStations] = useState<EVStation[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getOwnerAddedStations()
      setStations(data)
    } catch (e) {
      console.warn('Error loading owner stations', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <main className="min-h-screen bg-[#070c14] text-foreground p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-1">
              <Building2 className="size-3.5" /> OWNER DASHBOARD
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              My EV Charging Stations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your stations in Bhimavaram and track real-time charger availability.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/submit-station"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus className="size-4" /> Add New Station
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              <Compass className="size-4" /> View Live Map
            </Link>
          </div>
        </div>

        {/* Stations List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading your stations...</div>
        ) : stations.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-12 text-center">
            <BatteryCharging className="mx-auto size-10 text-slate-600 mb-3" />
            <h2 className="text-lg font-bold text-white">No Stations Registered Yet</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Register your EV charging station in Bhimavaram to publish it live on the map for drivers.
            </p>
            <Link
              href="/submit-station"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              <Plus className="size-4" /> Register Your Station
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {stations.map((station) => (
              <article
                key={station.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{station.name}</h3>
                    <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="size-3.5 text-cyan-400 shrink-0" />
                      {station.address}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      station.status === 'available'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    ● {station.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-b border-slate-800/80 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">POWER</span>
                    <span className="font-bold text-cyan-300">{station.powerKw} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PORTS</span>
                    <span className="font-bold text-white">
                      {station.availablePorts}/{station.totalPorts} Free
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">RATE</span>
                    <span className="font-bold text-emerald-400">₹{station.pricePerKwh}/kWh</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {station.connectors.join(', ')}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/stations/${station.slug}`}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 font-semibold text-white hover:bg-slate-700"
                    >
                      View Live Pin
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
