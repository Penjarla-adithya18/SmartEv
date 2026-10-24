"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GoogleMapComponent from '@/components/GoogleMapComponent'
import { INITIAL_STATIONS } from '@/lib/stationsData'
import {
  Timer,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Navigation,
  Zap,
} from 'lucide-react'

function TrackBookingContent() {
  const search = useSearchParams()
  const bookingParam = search.get('booking') || 'EV-88421'
  const [eta, setEta] = useState(8) // minutes
  const [distance, setDistance] = useState(3.2) // km
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  // 15-Minute En-Route Grace Period Timer (900 seconds)
  const [graceSeconds, setGraceSeconds] = useState(15 * 60)

  useEffect(() => {
    const t = setInterval(() => {
      setGraceSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const mins = Math.floor(graceSeconds / 60)
  const secs = graceSeconds % 60
  const countdownFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progressPercent = Math.max(0, (graceSeconds / (15 * 60)) * 100)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smartev_active_booking')
        if (saved) {
          setBookingDetails(JSON.parse(saved))
        }
      } catch (e) {
        console.warn('Failed reading booking from localStorage', e)
      }
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setEta((e) => Math.max(0, e - 1))
      setDistance((d) => Math.max(0, +(d - 0.4).toFixed(1)))
    }, 45000)
    return () => clearInterval(t)
  }, [])

  const targetStation = INITIAL_STATIONS[0]
  const stationName = bookingDetails?.stationName || targetStation.name
  const bookingId = bookingDetails?.id || bookingParam

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner Alert */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900/80 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Navigation className="size-4 animate-pulse" />
          </span>
          <div>
            <h4 className="font-bold text-white text-sm">En Route to Reserved Charger</h4>
            <p className="text-slate-400 text-xs">
              Live turn-by-turn tracking & charging slot reservation status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            Port #3 Reserved (150kW CCS2)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Map & Route Column */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl space-y-4">
          <div className="h-80 w-full overflow-hidden rounded-xl border border-slate-800">
            <GoogleMapComponent
              stations={[targetStation]}
              selectedStation={targetStation}
              showDirectionsTo={targetStation}
              height="100%"
              zoom={13}
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <div>
              <div className="text-xs text-slate-400">Booking Reference</div>
              <div className="text-lg font-bold text-white font-mono">{bookingId}</div>
              <p className="text-xs text-cyan-400 mt-0.5">{stationName}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Estimated Arrival (ETA)</div>
              <div className="text-2xl font-bold text-cyan-300">{eta} mins</div>
              <div className="text-xs text-slate-500">{distance} km remaining</div>
            </div>
          </div>
        </div>

        {/* Live 15-Minute Grace Period Timer & Slot Lock */}
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Timer className="size-4 animate-spin text-cyan-400" style={{ animationDuration: '6s' }} />
                15-Min Grace Period
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  graceSeconds > 300
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                    : graceSeconds > 120
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                    : 'border-rose-500/40 bg-rose-500/15 text-rose-400 animate-pulse'
                }`}
              >
                {graceSeconds > 0 ? '● Slot Locked' : '✕ Expired'}
              </span>
            </div>

            {/* Countdown Digits */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Time Remaining to Claim Slot:</div>
              <div className="font-mono text-4xl font-black text-white tracking-tight">
                {countdownFormatted}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${
                    graceSeconds > 300 ? 'bg-emerald-500' : graceSeconds > 120 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Arrive within 15 minutes of slot start. Your port is held without release.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Vehicle:</span>
                <span className="font-semibold text-white uppercase">{bookingDetails?.vehicleNo || 'AP39 EV 9921'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Port Number:</span>
                <span className="font-semibold text-emerald-400">Port #3 (CCS2 150kW)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Driver:</span>
                <span className="font-semibold text-white">{bookingDetails?.driverName || 'Rajesh Varma'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button className="w-full rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shadow-lg">
              ⚡ I've Arrived & Start Charging
            </button>
            <Link
              href="/booking/confirmation"
              className="w-full text-center rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              View Booking QR Pass
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen p-6 lg:p-8 bg-[#0b1220] text-foreground">
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading tracking map...</div>}>
        <TrackBookingContent />
      </Suspense>
    </main>
  )
}
