'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GoogleMapComponent from '@/components/GoogleMapComponent'
import { INITIAL_STATIONS, getOwnerAddedStations, type EVStation } from '@/lib/stationsData'
import {
  ArrowRight,
  BatteryCharging,
  Compass,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  Star,
} from 'lucide-react'

function StationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams ? searchParams.get('query') || '' : ''

  const [stations, setStations] = useState<EVStation[]>(INITIAL_STATIONS)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedStation, setSelectedStation] = useState<EVStation | null>(INITIAL_STATIONS[0])
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const ownerStations = await getOwnerAddedStations()
        if (active && ownerStations && ownerStations.length > 0) {
          setStations(ownerStations)
          setSelectedStation(ownerStations[0])
        }
      } catch (e) {
        console.warn('Failed loading owner stations', e)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const q = searchQuery.toLowerCase()
      const matchText =
        !q ||
        station.name.toLowerCase().includes(q) ||
        station.address.toLowerCase().includes(q) ||
        station.city.toLowerCase().includes(q)

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && station.status === 'available') ||
        (statusFilter === 'fast' && station.powerKw >= 100)

      return matchText && matchStatus
    })
  }, [stations, searchQuery, statusFilter])

  return (
    <>
      {/* Header Banner */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] px-5 py-8 lg:px-8 transition-colors">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                <Sparkles className="size-3.5" />
                LIVE CHARGING STATIONS
              </div>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
                Explore EV Charging Stations
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Find available fast chargers, check live availability, and reserve your slot.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'split'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapIcon className="size-3.5" />
                Map & List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="size-3.5" />
                Grid View
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by station name, neighborhood, or city..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === 'all'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                All Stations ({stations.length})
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === 'available'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                ● Available Now
              </button>
              <button
                onClick={() => setStatusFilter('fast')}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === 'fast'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                ⚡ Ultra Fast (100kW+)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_480px]">
            {/* Stations List Column */}
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Found <span className="text-slate-900 dark:text-white font-bold">{filteredStations.length}</span> EV charging locations
              </p>

              <div className="flex flex-col gap-4">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation?.id === station.id
                  return (
                    <article
                      key={station.id}
                      onClick={() => setSelectedStation(station)}
                      className={`cursor-pointer overflow-hidden rounded-2xl border p-5 transition ${
                        isSelected
                          ? 'border-cyan-500 bg-slate-100 dark:bg-slate-800/90 shadow-xl ring-1 ring-cyan-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <img
                          src={station.image}
                          alt={station.name}
                          className="h-28 w-full sm:w-36 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-base">{station.name}</h3>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                                {station.address}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                                <Star className="size-3.5 fill-amber-400" />
                                {station.rating}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${
                                station.status === 'available'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              ● {station.availablePorts}/{station.totalPorts} Ports Free
                            </span>

                            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 text-[11px] font-medium">
                              ⚡ {station.powerKw} kW
                            </span>

                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              ₹{station.pricePerKwh}/kWh
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{station.connectors.join(' • ')}</span>
                            <div className="flex gap-2">
                              <Link
                                href={`/stations/${station.slug}`}
                                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                View Details
                              </Link>
                              <Link
                                href={`/booking?station=${station.slug}`}
                                className="rounded-xl bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                              >
                                Reserve
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            {/* Google Map Panel Column */}
            <aside className="sticky top-4 h-[650px] overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl">
              <GoogleMapComponent
                stations={filteredStations}
                selectedStation={selectedStation}
                onSelectStation={(st) => setSelectedStation(st)}
                height="100%"
              />
            </aside>
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStations.map((station) => (
              <article
                key={station.id}
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={station.image}
                  alt={station.name}
                  className="h-36 w-full rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
                <div className="mt-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{station.name}</h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                      <Star className="size-3.5 fill-amber-400" />
                      {station.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{station.address}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      ● {station.availablePorts}/{station.totalPorts} Available
                    </span>
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-cyan-600 dark:text-cyan-300 font-medium">
                      ⚡ {station.powerKw} kW
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">₹{station.pricePerKwh}/kWh</span>
                    <div className="flex gap-2">
                      <Link
                        href={`/stations/${station.slug}`}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/booking?station=${station.slug}`}
                        className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default function StationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b1220] text-slate-900 dark:text-foreground pb-12 transition-colors">
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading stations map...</div>}>
        <StationsContent />
      </Suspense>
    </main>
  )
}
