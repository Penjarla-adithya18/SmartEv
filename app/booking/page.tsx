'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStationBySlug, INITIAL_BHIMAVARAM_STATIONS, type EVStation } from '@/lib/stationsData'
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  KeyRound,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'

const MORNING_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
const AFTERNOON_SLOTS = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
const EVENING_SLOTS = ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '08:00 PM']

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} mins`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h} ${h === 1 ? 'hr' : 'hrs'}`
  return `${h} ${h === 1 ? 'hr' : 'hrs'} ${m} mins`
}

function calculateEndTime(slot: string, durationMins: number): string {
  try {
    const parts = slot.trim().split(' ')
    const timePart = parts[0]
    const modifier = parts[1] || 'AM'
    if (!timePart) return ''
    const [hStr, mStr] = timePart.split(':')
    let hours = parseInt(hStr, 10) || 0
    const minutes = parseInt(mStr, 10) || 0
    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    const totalMinutes = hours * 60 + minutes + durationMins
    const endH = Math.floor(totalMinutes / 60) % 24
    const endM = totalMinutes % 60
    const period = endH >= 12 ? 'PM' : 'AM'
    const displayH = endH % 12 === 0 ? 12 : endH % 12
    const displayM = endM < 10 ? `0${endM}` : `${endM}`
    return `${displayH}:${displayM} ${period}`
  } catch (e) {
    return ''
  }
}

function BookingFlowContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stationParam = searchParams.get('station') || 'bhimavaram-ev-super-hub'
  const station: EVStation = getStationBySlug(stationParam) || INITIAL_BHIMAVARAM_STATIONS[0]

  // Form State
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || new Date().toISOString().slice(0, 10))
  const [selectedSlot, setSelectedSlot] = useState(() => searchParams.get('time') || '11:30 AM')
  const initialDuration = useMemo(() => {
    const d = searchParams.get('duration')
    return d ? parseInt(d, 10) || 45 : 45
  }, [searchParams])

  const [durationMinutes, setDurationMinutes] = useState(initialDuration)
  const [isCustomDuration, setIsCustomDuration] = useState(() => ![15, 30, 45, 60, 90].includes(initialDuration))
  const [customInputVal, setCustomInputVal] = useState(String(initialDuration))

  const [driverName, setDriverName] = useState('')
  const [phone, setPhone] = useState('+919876543210')
  const [vehicleNo, setVehicleNo] = useState('')
  const [connector, setConnector] = useState(station.connectors[0] || 'CCS2')

  // Twilio OTP State
  const [otpStep, setOtpStep] = useState<'details' | 'otp_verification'>('details')
  const [otpCode, setOtpCode] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [twilioNotice, setTwilioNotice] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Calculate estimated total amount
  const estimatedAmount = useMemo(() => {
    // kW * (minutes / 60) * pricePerKwh
    const effectiveKw = Math.min(station.powerKw, 60)
    const estKwh = effectiveKw * (durationMinutes / 60)
    return +(estKwh * station.pricePerKwh).toFixed(2)
  }, [station, durationMinutes])

  const estimatedEnergyKwh = useMemo(() => {
    const effectiveKw = Math.min(station.powerKw, 60)
    return +(effectiveKw * (durationMinutes / 60)).toFixed(1)
  }, [station.powerKw, durationMinutes])

  // Send Twilio OTP API call
  const handleSendTwilioOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!driverName.trim()) {
      setErrorMsg('Please enter driver name.')
      return
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMsg('Please enter a valid phone number (e.g. +91 98765 43210).')
      return
    }

    setSendingOtp(true)
    try {
      const res = await fetch('/api/twilio/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed sending Twilio OTP')
      }

      if (data.dynamicOtp) {
        setTwilioNotice(`Dynamic OTP generated for ${phone}: ${data.dynamicOtp}`)
      } else {
        setTwilioNotice(data.message || 'SMS OTP sent via Twilio')
      }
      setOtpStep('otp_verification')
    } catch (err: any) {
      console.error('Send OTP error', err)
      setErrorMsg(err.message || 'Could not send Twilio OTP. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  // Verify Twilio OTP API call & Confirm Booking
  const handleVerifyOtpAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!otpCode.trim()) {
      setErrorMsg('Please enter the 6-digit SMS OTP code.')
      return
    }

    setVerifyingOtp(true)
    try {
      const res = await fetch('/api/twilio/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code.')
      }

      // Generate Booking ID and redirect
      const bookingId = `EV-${Math.floor(100000 + Math.random() * 900000)}`
      const bookingRecord = {
        id: bookingId,
        stationName: station.name,
        address: station.address,
        driverName,
        phone,
        vehicleNo,
        date: selectedDate,
        timeSlot: selectedSlot,
        durationMinutes,
        connector,
        amount: estimatedAmount,
        otp: '1234',
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('smartev_active_booking', JSON.stringify(bookingRecord))
      }

      router.push(`/booking/confirmation?booking=${bookingId}`)
    } catch (err: any) {
      console.error('Verify OTP error', err)
      setErrorMsg(err.message || 'Verification failed. Try code 1234 or 123456.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pt-8 lg:px-8 space-y-6">
      {/* Back button */}
      <Link
        href="/stations"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to Stations
      </Link>

      {/* Station Summary Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={station.image}
              alt={station.name}
              className="h-20 w-28 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                ● Available Now ({station.availablePorts}/{station.totalPorts})
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{station.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="size-3.5 text-cyan-500 shrink-0" />
                {station.address}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0">
            <span className="text-xs text-slate-500 block">Rate & Speed</span>
            <span className="text-lg font-extrabold text-cyan-600 dark:text-cyan-300">
              ₹{station.pricePerKwh}/kWh • {station.powerKw} kW
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: DATE & TIME SLOT SELECTION */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="size-4 text-emerald-500" />
            1. Select Date & Charging Time Slot
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{selectedDate}</span>
        </div>

        {/* Date Quick Selector */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              selectedDate === new Date().toISOString().slice(0, 10)
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
          </button>

          <button
            onClick={() => {
              const tm = new Date()
              tm.setDate(tm.getDate() + 1)
              setSelectedDate(tm.toISOString().slice(0, 10))
            }}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              selectedDate !== new Date().toISOString().slice(0, 10)
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            Tomorrow
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

        {/* Time Slot Chips */}
        <div className="space-y-4 pt-2">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider">
              Morning Slots
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {MORNING_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border py-2 text-xs font-bold transition ${
                    selectedSlot === slot
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider">
              Afternoon Slots
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {AFTERNOON_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border py-2 text-xs font-bold transition ${
                    selectedSlot === slot
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider">
              Evening Slots
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EVENING_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border py-2 text-xs font-bold transition ${
                    selectedSlot === slot
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slot Duration & Connector */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="size-3.5 text-cyan-500" />
                Charging Session Duration
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose a preset or set a custom charging duration for your session.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                ⚡ {durationMinutes} mins ({formatDuration(durationMinutes)})
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                🕒 Until {calculateEndTime(selectedSlot, durationMinutes)}
              </span>
            </div>
          </div>

          {/* Duration Presets + Custom Button */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setDurationMinutes(mins)
                  setIsCustomDuration(false)
                  setCustomInputVal(String(mins))
                }}
                className={`rounded-xl border py-2.5 text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                  !isCustomDuration && durationMinutes === mins
                    ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow-md ring-2 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <span>{mins} Mins</span>
                <span className={`text-[10px] ${!isCustomDuration && durationMinutes === mins ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                  {formatDuration(mins)}
                </span>
              </button>
            ))}

            {/* Custom Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCustomDuration(true)}
              className={`rounded-xl border py-2.5 text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                isCustomDuration
                  ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              <span>✏️ Custom</span>
              <span className={`text-[10px] ${isCustomDuration ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {isCustomDuration ? `${durationMinutes}m` : 'Set Time'}
              </span>
            </button>
          </div>

          {/* Custom Duration Controls Panel */}
          {isCustomDuration && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    Custom Session Duration:
                  </span>
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(10, durationMinutes - 5)
                        setDurationMinutes(next)
                        setCustomInputVal(String(next))
                      }}
                      className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-sm transition"
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
                        if (!isNaN(val) && val >= 5 && val <= 480) {
                          setDurationMinutes(val)
                        }
                      }}
                      onBlur={() => {
                        const val = parseInt(customInputVal, 10)
                        if (isNaN(val) || val < 10) {
                          setDurationMinutes(10)
                          setCustomInputVal('10')
                        } else if (val > 360) {
                          setDurationMinutes(360)
                          setCustomInputVal('360')
                        }
                      }}
                      className="w-16 text-center text-xs font-bold text-slate-900 dark:text-white bg-transparent outline-none py-1.5"
                    />
                    <span className="text-xs text-slate-400 pr-2">mins</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(360, durationMinutes + 5)
                        setDurationMinutes(next)
                        setCustomInputVal(String(next))
                      }}
                      className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-sm transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(360, durationMinutes + 15)
                      setDurationMinutes(next)
                      setCustomInputVal(String(next))
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(360, durationMinutes + 30)
                      setDurationMinutes(next)
                      setCustomInputVal(String(next))
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(360, durationMinutes + 60)
                      setDurationMinutes(next)
                      setCustomInputVal(String(next))
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                  >
                    +1 hr
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDurationMinutes(120)
                      setCustomInputVal('120')
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                  >
                    2 hrs
                  </button>
                </div>
              </div>

              {/* Slider for smooth dragging */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={10}
                  max={240}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setDurationMinutes(val)
                    setCustomInputVal(String(val))
                  }}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10 mins (Quick Top-up)</span>
                  <span>60 mins (1 hr)</span>
                  <span>120 mins (2 hrs)</span>
                  <span>240 mins (4 hrs Full Charge)</span>
                </div>
              </div>

              {/* Real-time stats for the custom duration */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Est. Energy Delivery:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ~{estimatedEnergyKwh} kWh
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Session Window:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {selectedSlot} – {calculateEndTime(selectedSlot, durationMinutes)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Estimated Cost:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-bold">
                    ₹{estimatedAmount}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Plug Connector */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Plug Connector
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {station.connectors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConnector(c)}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition flex items-center justify-between ${
                    connector === c
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span>{c}</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {station.powerKw} kW
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: DRIVER DETAILS & TWILIO SMS OTP */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="size-4 text-cyan-500" />
            2. Driver Name & Twilio Phone Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verification OTP code will be sent to your phone via Twilio SMS.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 p-3.5 text-xs font-semibold text-red-500">
            <span>{errorMsg}</span>
          </div>
        )}

        {otpStep === 'details' ? (
          /* Driver details input form */
          <form onSubmit={handleSendTwilioOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Driver Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Rajesh Varma"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number (Twilio SMS) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. AP 37 EV 8842"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500 uppercase"
                />
              </div>
            </div>

            {/* Price Summary before OTP */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Estimated Total Amount:</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{estimatedAmount}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ~{estimatedEnergyKwh} kWh at ₹{station.pricePerKwh}/kWh ({connector})
                </span>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white block">{selectedSlot} on {selectedDate}</span>
                <p className="text-cyan-600 dark:text-cyan-400 font-bold">{durationMinutes} mins ({formatDuration(durationMinutes)})</p>
                <span className="text-[10px] text-slate-400">Ends at {calculateEndTime(selectedSlot, durationMinutes)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <MessageSquare className="size-4" />
              {sendingOtp ? 'Sending Twilio SMS OTP...' : 'Send Twilio SMS Verification Code'}
            </button>
          </form>
        ) : (
          /* Twilio 6-digit OTP verification form */
          <form onSubmit={handleVerifyOtpAndConfirm} className="space-y-4">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 text-xs text-cyan-600 dark:text-cyan-300 flex items-center justify-between">
              <span className="font-medium">{twilioNotice || `Twilio SMS OTP sent to ${phone}`}</span>
              <button
                type="button"
                onClick={() => setOtpStep('details')}
                className="text-[11px] font-bold underline text-cyan-500"
              >
                Change Phone
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <KeyRound className="size-4 text-emerald-500" />
                Enter Dynamic SMS OTP Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit dynamic OTP..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-base text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono tracking-widest text-center"
                autoFocus
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center">
                A unique random 6-digit dynamic OTP is generated for each request.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSendTwilioOtp}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-white"
              >
                Resend OTP
              </button>

              <button
                type="submit"
                disabled={verifyingOtp}
                className="flex-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP & Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-foreground pb-12 transition-colors">
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading booking portal...</div>}>
        <BookingFlowContent />
      </Suspense>
    </main>
  )
}
