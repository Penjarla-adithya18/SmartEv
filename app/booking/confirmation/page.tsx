"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Compass,
  MapPin,
  QrCode,
  Phone,
  User,
  Calendar,
  Clock,
  Zap,
  Timer,
  ExternalLink,
  Download,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

function BookingConfirmationContent() {
  const search = useSearchParams()
  const bookingIdParam = search.get('booking') || 'EV-88421'

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

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    bookingIdParam
  )}`

  // 1-Click Google Calendar URL Generator
  const getGoogleCalendarUrl = () => {
    const stationName = bookingDetails?.stationName || 'Bhimavaram EV Super Hub'
    const title = `⚡ SmartEV Reservation: ${stationName}`
    const location = `${stationName}, Andhra Pradesh`
    const details = [
      `SmartEV Guaranteed EV Charging Slot Reservation`,
      `Booking Pass ID: ${bookingIdParam}`,
      `Vehicle Number: ${bookingDetails?.vehicleNo || 'EV'}`,
      `Port: Port #3 (CCS2 150kW Ultra Fast)`,
      `Duration: ${bookingDetails?.durationMinutes || 45} mins`,
      `Verified Driver: ${bookingDetails?.driverName || 'Driver'}`,
      `Emergency Helpline: +91 88865 43210 (24/7 SmartEV)`,
    ].join('\n')

    // Construct start & end ISO timestamps
    const now = new Date()
    const startTime = new Date(now.getTime() + 15 * 60 * 1000) // 15 mins grace arrival
    const durationMinutes = bookingDetails?.durationMinutes ? parseInt(bookingDetails.durationMinutes, 10) : 45
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

    const formatGDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const datesParam = `${formatGDate(startTime)}/${formatGDate(endTime)}`

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${datesParam}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
  }

  // 1-Click iCal (.ics) Calendar Download
  const handleDownloadIcs = () => {
    const stationName = bookingDetails?.stationName || 'Bhimavaram EV Super Hub'
    const now = new Date()
    const startTime = new Date(now.getTime() + 15 * 60 * 1000)
    const durationMinutes = bookingDetails?.durationMinutes ? parseInt(bookingDetails.durationMinutes, 10) : 45
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

    const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SmartEV Network//Booking//EN',
      'BEGIN:VEVENT',
      `UID:${bookingIdParam}@smartev.in`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(startTime)}`,
      `DTEND:${formatIcsDate(endTime)}`,
      `SUMMARY:⚡ SmartEV Charging: ${stationName}`,
      `DESCRIPTION:Booking ID: ${bookingIdParam} • Port #3 CCS2`,
      `LOCATION:${stationName}, Andhra Pradesh`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `SmartEV-Booking-${bookingIdParam}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xl">
        {/* Green Verified Banner Header */}
        <div className="bg-emerald-500 px-6 py-6 text-center text-slate-950">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-slate-950/10">
            <CheckCircle2 className="size-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Booking Confirmed!</h1>
          <p className="mt-1 text-xs font-semibold opacity-90">
            Twilio SMS Verified • Slot Locked In
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Live 15-Minute Grace Period Countdown Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                <Timer className="size-4 animate-spin text-cyan-500" style={{ animationDuration: '6s' }} />
                En Route Grace Period
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  graceSeconds > 300
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : graceSeconds > 120
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'border-rose-500/40 bg-rose-500/20 text-rose-700 dark:text-rose-300 animate-pulse'
                }`}
              >
                {graceSeconds > 0 ? '● Port Hold Guaranteed' : '✕ Grace Expired'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {countdownFormatted}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">mins remaining</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Charger Port #3 is reserved exclusively for your vehicle.
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  graceSeconds > 300 ? 'bg-emerald-500' : graceSeconds > 120 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* QR Pass */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <div className="inline-block bg-white p-3 rounded-xl shadow-md border">
              <img src={qrSrc} width={150} height={150} alt="Booking QR Pass" />
            </div>
            <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-400">
              SCAN QR TO CHECK-IN AT CHARGER<br />
              Booking Pass ID: <strong className="text-slate-900 dark:text-white font-mono">{bookingIdParam}</strong>
            </div>
          </div>

          {/* Booking Summary Info */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Station Name:</span>
              <strong className="text-slate-900 dark:text-white">{bookingDetails?.stationName || 'Bhimavaram EV Super Hub'}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Driver Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{bookingDetails?.driverName || 'Rajesh Varma'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Twilio Verified Phone:</span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">{bookingDetails?.phone || '+91 98765 43210'}</span>
            </div>

            {bookingDetails?.vehicleNo && (
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Vehicle No:</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">{bookingDetails.vehicleNo}</span>
              </div>
            )}

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Time Slot & Date:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {bookingDetails?.timeSlot || '11:30 AM'} on {bookingDetails?.date || 'Today'}
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Duration & Rate:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {bookingDetails?.durationMinutes || 45} mins ({bookingDetails?.connector || 'CCS2'}) • ₹{bookingDetails?.amount || 135}
              </span>
            </div>
          </div>

          {/* 1-Click Add to Google Calendar Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Trip Reminders & Calendar
            </span>
            <div className="flex gap-2">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm"
              >
                <Calendar className="size-4 text-cyan-500" />
                Add to Google Calendar
                <ExternalLink className="size-3 opacity-70" />
              </a>
              <button
                type="button"
                onClick={handleDownloadIcs}
                title="Download .ics calendar file for Apple & Outlook Calendar"
                className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <Download className="size-3.5" />
                .ICS
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/map"
              className="flex-1 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-2.5 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Get Directions
            </Link>
            <Link
              href="/booking/track"
              className="flex-1 text-center rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              Track Live Arrival
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen p-6 sm:p-8 bg-slate-50 dark:bg-[#070c14] text-foreground flex items-start justify-center transition-colors">
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading confirmation details...</div>}>
        <BookingConfirmationContent />
      </Suspense>
    </main>
  )
}
