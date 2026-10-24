'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GoogleMapComponent from '@/components/GoogleMapComponent'
import { getStationBySlug, INITIAL_STATIONS, type EVStation } from '@/lib/stationsData'
import {
  ArrowLeft,
  BatteryCharging,
  Compass,
  MapPin,
  Sparkles,
  Star,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react'

export default function StationDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const router = useRouter()
  // React 19 / Next 16 params unwrapping
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ slug: string }>) : (params as { slug: string })
  const slug = resolvedParams.slug

  const station: EVStation = getStationBySlug(slug) || {
    id: slug,
    slug: slug,
    name: decodeURIComponent(slug).replace(/-/g, ' '),
    latitude: 16.5449,
    longitude: 81.5212,
    address: 'Bhimavaram, Andhra Pradesh',
    city: 'Bhimavaram',
    rating: 4.7,
    totalPorts: 8,
    availablePorts: 5,
    pricePerKwh: 12,
    powerKw: 180,
    fastCharging: true,
    connectors: ['CCS2', 'Type 2'],
    status: 'available',
    waitMinutes: 0,
    aiScore: 94,
    image: INITIAL_STATIONS[0].image,
    operatingHours: '24/7 Open',
    network: 'SmartEV Express',
  }

  const [connector, setConnector] = useState(station.connectors[0] || 'CCS2')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('11:30')
  const [duration, setDuration] = useState(45)
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const [customInputVal, setCustomInputVal] = useState('45')
  const [showRoute, setShowRoute] = useState(false)

  const estAmount = useMemo(() => {
    const effectiveKw = Math.min(station.powerKw, 60)
    return +(effectiveKw * (duration / 60) * station.pricePerKwh).toFixed(2)
  }, [station.powerKw, station.pricePerKwh, duration])

  function startBooking() {
    const q = new URLSearchParams({
      station: station.slug,
      connector,
      date,
      time,
      duration: String(duration),
    }).toString()
    router.push(`/booking?${q}`)
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b1220] text-slate-900 dark:text-foreground pb-12 transition-colors">
      <div className="mx-auto max-w-6xl px-5 pt-8 lg:px-8 space-y-6">
        {/* Navigation back button */}
        <Link
          href="/stations"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to Stations
        </Link>

        {/* Station Hero Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={station.image}
                alt={station.name}
                className="h-28 w-40 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {station.name}
                  </h1>
                  <span className="flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 text-xs font-bold text-amber-500 dark:text-amber-400 border border-amber-400/20">
                    <Star className="size-3 fill-amber-400" />
                    {station.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="size-4 text-cyan-500 dark:text-cyan-400" />
                  {station.address}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ● {station.availablePorts}/{station.totalPorts} Available
                  </span>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 font-semibold text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
                    ⚡ {station.powerKw} kW Fast Charging
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 font-medium">
                    {station.operatingHours}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 sm:items-end">
              <button
                onClick={() => setShowRoute(!showRoute)}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20"
              >
                <Compass className="size-4" />
                {showRoute ? 'Hide Route' : 'Get Directions'}
              </button>
              <button
                onClick={startBooking}
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Reserve Slot Now
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid: Specs + Map + Booking Box */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Google Map View Section */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="size-4 text-cyan-500 dark:text-cyan-400" />
                  Exact Station Location & Directions
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">{station.city}</span>
              </div>
              <div className="h-80 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <GoogleMapComponent
                  stations={[station]}
                  selectedStation={station}
                  showDirectionsTo={showRoute ? station : null}
                  height="100%"
                  zoom={14}
                  center={{ lat: station.latitude, lng: station.longitude }}
                />
              </div>
            </section>

            {/* Select Connector */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-lg">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Select Connector Type</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {station.connectors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setConnector(c)}
                    className={`rounded-xl border p-4 text-left transition ${
                      connector === c
                        ? 'border-cyan-500 bg-cyan-500/10 text-slate-900 dark:text-white ring-1 ring-cyan-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      {c}
                      {connector === c && <CheckCircle2 className="size-4 text-cyan-500 dark:text-cyan-400" />}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {station.powerKw} kW DC Ultra Fast
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Select Date, Time Slot & Session Duration */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-lg space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Select Date & Charging Time Slot</h2>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Time Slot</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  >
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Session Duration Selector */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Session Duration
                  </label>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    {duration} mins
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setDuration(mins)
                        setIsCustomDuration(false)
                        setCustomInputVal(String(mins))
                      }}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        !isCustomDuration && duration === mins
                          ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomDuration(true)}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      isCustomDuration
                        ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    ✏️ Custom
                  </button>
                </div>

                {isCustomDuration && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Custom Minutes:
                      </span>
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(10, duration - 5)
                            setDuration(next)
                            setCustomInputVal(String(next))
                          }}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={10}
                          max={360}
                          step={5}
                          value={customInputVal}
                          onChange={(e) => {
                            setCustomInputVal(e.target.value)
                            const val = parseInt(e.target.value, 10)
                            if (!isNaN(val) && val >= 5 && val <= 360) {
                              setDuration(val)
                            }
                          }}
                          className="w-14 text-center text-xs font-bold bg-transparent outline-none py-1"
                        />
                        <span className="text-xs text-slate-400 pr-1.5">min</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.min(360, duration + 5)
                            setDuration(next)
                            setCustomInputVal(String(next))
                          }}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={240}
                      step={5}
                      value={duration}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setDuration(val)
                        setCustomInputVal(String(val))
                      }}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Booking Summary */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-lg">
              <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-200 dark:border-slate-800 pb-3">
                Reservation Summary
              </h3>
              <dl className="mt-4 text-xs text-slate-600 dark:text-slate-300 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Station:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Connector:</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-300">{connector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Power Speed:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{station.powerKw} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{date} at {time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Session Duration:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{duration} mins</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">Est. Amount:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{estAmount}</span>
                </div>
              </dl>
              <button
                onClick={startBooking}
                className="mt-6 w-full rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Proceed to Book Slot
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
