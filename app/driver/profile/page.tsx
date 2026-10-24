'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { INITIAL_BHIMAVARAM_STATIONS, type EVStation } from '@/lib/stationsData'
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  LogOut,
  MapPin,
  MessageSquare,
  QrCode,
  Send,
  ShieldAlert,
  Star,
  UserCheck,
  Zap,
} from 'lucide-react'

export default function DriverProfilePage() {
  const router = useRouter()
  const [driverPhone, setDriverPhone] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'bookings' | 'rating' | 'report'>('bookings')

  // Rating Form State
  const [ratingStationId, setRatingStationId] = useState('bv-s1')
  const [starCount, setStarCount] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  // Discrepancy Report Form State
  const [reportStationId, setReportStationId] = useState('bv-s1')
  const [discrepancyType, setDiscrepancyType] = useState('Plug Count Mismatch (Owner listed 6 plugs, but has only 3)')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmittedTicket, setReportSubmittedTicket] = useState<string | null>(null)

  // Booking history stored in local state
  const [myBookings, setMyBookings] = useState<any[]>([
    {
      id: 'EV-884210',
      stationName: 'Bhimavaram EV Super Hub',
      address: 'J P Road, Near Town Railway Station',
      date: '2026-08-09',
      timeSlot: '11:30 AM',
      durationMinutes: 45,
      amount: 135,
      status: 'Confirmed',
      connector: 'CCS2 180kW DC',
    },
    {
      id: 'EV-748291',
      stationName: 'Grand Arya EV Fast Charger',
      address: 'Bypass Road, Opposite Grand Arya Hotel',
      date: '2026-08-05',
      timeSlot: '04:00 PM',
      durationMinutes: 30,
      amount: 120,
      status: 'Completed',
      connector: 'CCS2 120kW DC',
    },
  ])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('smartev_driver_phone')
      if (savedPhone) {
        setDriverPhone(savedPhone)
        // Load active booking if saved
        const activeBooking = localStorage.getItem('smartev_active_booking')
        if (activeBooking) {
          try {
            const parsed = JSON.parse(activeBooking)
            setMyBookings((prev) => {
              if (prev.some((b) => b.id === parsed.id)) return prev
              return [parsed, ...prev]
            })
          } catch (e) {
            console.warn('Failed parsing active booking', e)
          }
        }
      } else {
        setDriverPhone(null)
      }
    }
  }, [router])

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('smartev_driver_phone')
    setDriverPhone(null)
    setShowLogoutModal(false)
    router.push('/')
  }

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRatingSubmitted(true)
    setTimeout(() => {
      setFeedbackText('')
      setRatingSubmitted(false)
      alert('Thank you! Your station rating and review have been submitted successfully.')
    }, 1000)
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportDetails.trim()) return

    const ticketId = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`
    setReportSubmittedTicket(ticketId)
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors relative">
      {/* Driver Header */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] px-5 py-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 font-bold text-lg">
              <UserCheck className="size-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Twilio Verified Driver
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {driverPhone || '+91 98765 43210'}
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition"
          >
            <LogOut className="size-3.5" /> Logout
          </button>
        </div>
      </section>

      {/* Logout Confirmation Modal Backdrop */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/15 text-red-500 font-bold">
                <LogOut className="size-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Confirm Driver Logout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200 dark:border-slate-800 py-3">
              Logging out will clear your active session for <strong className="text-slate-900 dark:text-white">{driverPhone || '+91 98765 43210'}</strong>. You will need to verify your phone number via Twilio SMS OTP to log back in.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition shadow"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-xs font-bold transition border-b-2 px-2 flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="size-4" /> My Bookings ({myBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('rating')}
            className={`pb-3 text-xs font-bold transition border-b-2 px-2 flex items-center gap-2 ${
              activeTab === 'rating'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="size-4" /> Rate & Feedback
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 text-xs font-bold transition border-b-2 px-2 flex items-center gap-2 ${
              activeTab === 'report'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="size-4" /> Report Station Issue
          </button>
        </div>

        {/* TAB 1: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active & Past Reservations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b, idx) => (
                <article
                  key={`${b.id}-${idx}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 block mb-0.5">Booking ID: {b.id}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{b.stationName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-slate-400 shrink-0" /> {b.address}
                      </p>
                    </div>

                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300'
                      }`}
                    >
                      ● {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Slot Time & Date</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {b.timeSlot} ({b.date})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Session Info</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {b.durationMinutes} mins • ₹{b.amount}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/booking/confirmation?booking=${b.id}`}
                      className="flex-1 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-2 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <QrCode className="inline size-3.5 mr-1" /> View QR Pass
                    </Link>
                    <Link
                      href="/map"
                      className="flex-1 text-center rounded-xl bg-cyan-500 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                    >
                      <Compass className="inline size-3.5 mr-1" /> Directions
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GIVE RATING & FEEDBACK */}
        {activeTab === 'rating' && (
          <div className="max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="size-5 text-amber-400 fill-amber-400" />
                Rate a Station & Give Driver Feedback
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your rating helps fellow drivers find reliable chargers in Bhimavaram.
              </p>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Station *
                </label>
                <select
                  value={ratingStationId}
                  onChange={(e) => setRatingStationId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
                >
                  {INITIAL_BHIMAVARAM_STATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Rating Star Score *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarCount(star)}
                      className={`flex size-10 items-center justify-center rounded-xl border transition ${
                        starCount >= star
                          ? 'border-amber-400 bg-amber-400/20 text-amber-400'
                          : 'border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Star className="size-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Review & Experience *
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share details about charging speed, connector condition, wait times, or amenities..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ratingSubmitted}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <Send className="size-4" /> {ratingSubmitted ? 'Submitting...' : 'Submit Rating & Review'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: REPORT STATION DISCREPANCY & ISSUES */}
        {activeTab === 'report' && (
          <div className="max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-5" />
                Report Station Discrepancy / Owner Issue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Notice an issue? Report discrepancies (e.g. owner listed 6 plugs but has only 3 plugs installed) directly to our verification team.
              </p>
            </div>

            {reportSubmittedTicket ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Discrepancy Report Submitted</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you! Your discrepancy ticket <strong className="font-mono text-emerald-500">{reportSubmittedTicket}</strong> has been logged into the Admin Verification Queue. Our team will verify and correct the station listing.
                </p>
                <button
                  onClick={() => {
                    setReportSubmittedTicket(null)
                    setReportDetails('')
                  }}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Station to Report *
                  </label>
                  <select
                    value={reportStationId}
                    onChange={(e) => setReportStationId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    {INITIAL_BHIMAVARAM_STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Discrepancy Category *
                  </label>
                  <select
                    value={discrepancyType}
                    onChange={(e) => setDiscrepancyType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Plug Count Mismatch (Owner listed 6 plugs, but has only 3)">
                      Plug Count Mismatch (Owner listed 6 plugs, but has only 3 plugs)
                    </option>
                    <option value="Broken or Non-Functional Connector">Broken or Non-Functional Connector</option>
                    <option value="Incorrect Tariff / Overcharging">Incorrect Tariff / Overcharging</option>
                    <option value="Station Closed / Incorrect Location">Station Closed / Incorrect Location</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Issue Details & Description *
                  </label>
                  <textarea
                    rows={4}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe the discrepancy (e.g. Owner claimed 6 plugs on app, but when I arrived at station there were only 3 working chargers installed)..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
                >
                  <AlertTriangle className="size-4" /> Submit Issue Ticket to Admin
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
