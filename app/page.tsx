'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GoogleMapComponent from '@/components/GoogleMapComponent'
import {
  getOwnerAddedStations,
  INITIAL_BHIMAVARAM_STATIONS,
  type EVStation,
} from '@/lib/stationsData'
import {
  ArrowRight,
  BarChart3,
  BatteryCharging,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Globe2,
  Lightbulb,
  MapPin,
  Search,
  Sparkles,
  Zap,
  Clock,
  Flame,
  TrendingUp,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<EVStation[]>(INITIAL_BHIMAVARAM_STATIONS)
  const [selectedStation, setSelectedStation] = useState<EVStation>(INITIAL_BHIMAVARAM_STATIONS[0])
  const [city, setCity] = useState('Bhimavaram')

  // Dynamic AI Demand Forecast State
  const [forecastCity, setForecastCity] = useState('Bhimavaram')
  const [forecastDay, setForecastDay] = useState<'today' | 'tomorrow' | 'weekend'>('today')
  const [forecastHour, setForecastHour] = useState<number>(() => {
    const current = new Date().getHours()
    return current >= 0 && current <= 23 ? current : 14
  })

  // 24-Hour Demand Calculation & Dynamic SVG Profile
  const forecastData = useMemo(() => {
    // Base 24-hour demand baseline percentages across hours 0..23
    const baseCurve = [
      22, 19, 17, 16, 20, 28, 48, 68, 86, 92, 88, 82,
      76, 72, 70, 74, 84, 94, 91, 85, 74, 58, 42, 30
    ]

    // City offset based on traffic and station density
    let cityOffset = 0
    if (forecastCity === 'Vijayawada' || forecastCity === 'Visakhapatnam') cityOffset = 5
    else if (forecastCity === 'Tirupati' || forecastCity === 'Guntur') cityOffset = 3
    else if (forecastCity === 'Kurnool' || forecastCity === 'Nellore') cityOffset = 1
    else if (forecastCity === 'Bhimavaram') cityOffset = -2

    // Day offset
    const curve = baseCurve.map((base, idx) => {
      let val = base + cityOffset
      if (forecastDay === 'tomorrow') {
        val += (idx % 2 === 0 ? 2 : -2)
      } else if (forecastDay === 'weekend') {
        // Weekend peak shifts to late morning (11am-2pm) and evening (6pm-10pm)
        if (idx >= 10 && idx <= 14) val += 9
        if (idx >= 18 && idx <= 22) val += 7
        if (idx >= 5 && idx <= 8) val -= 16
      }
      return Math.min(98, Math.max(14, Math.round(val)))
    })

    const currentDemand = curve[forecastHour]
    const peakDemand = Math.max(...curve)
    const peakHour = curve.indexOf(peakDemand)

    // Calculate SVG curve coordinates (viewBox 0 0 300 100)
    // padding x: 10 to 290, y: 88 (0% demand) to 14 (100% demand)
    const points = curve.map((d, i) => {
      const x = Math.round(10 + (i / 23) * 280)
      const y = Math.round(88 - (d / 100) * 74)
      return { x, y, demand: d, hour: i }
    })

    // Create smooth bezier path
    let pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const midX = (prev.x + curr.x) / 2
      pathD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
    }
    const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

    const selectedPoint = points[forecastHour]

    return {
      curve,
      points,
      pathD,
      areaD,
      currentDemand,
      peakDemand,
      peakHour,
      selectedPoint,
    }
  }, [forecastCity, forecastDay, forecastHour])

  const formatHourLabel = (h: number) => {
    if (h === 0) return '12:00 AM'
    if (h === 12) return '12:00 PM'
    return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const loaded = await getOwnerAddedStations()
        if (active && loaded && loaded.length > 0) {
          setStations(loaded)
          setSelectedStation(loaded[0])
        }
      } catch (e) {
        console.warn('Failed loading owner stations on home page', e)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filteredStations = useMemo(() => {
    if (!query.trim()) return stations.slice(0, 2)
    const q = query.toLowerCase()
    return stations.filter(
      (s) => (s.name || '').toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q)
    )
  }, [query, stations])

  function handleSearchSubmit() {
    router.push(`/stations?query=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground font-sans transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-100 dark:bg-[#070c14] border-b border-slate-200 dark:border-slate-800/80 pb-20 pt-16 lg:pb-24 lg:pt-20 transition-colors">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            {/* AI Network Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
              <Zap className="size-3.5 fill-cyan-500 dark:fill-cyan-300 text-cyan-500 dark:text-cyan-300" />
              AI-POWERED EV CHARGING NETWORK
            </div>

            {/* Main Headline */}
            <h1 className="max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-6xl">
              Find. Charge. Go. <br />
              <span className="text-emerald-600 dark:text-emerald-400">Smarter</span> with AI
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Real-time availability, AI recommendations, and seamless charging experience across the globe.
            </p>

            {/* Hero Search Box */}
            <div className="mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row">
              <div className="relative flex flex-1 items-center rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 text-slate-500 border border-slate-200 dark:border-slate-800 shadow-lg">
                <MapPin className="size-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit()
                  }}
                  placeholder="Search by location, station name.."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>

              <button
                onClick={handleSearchSubmit}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 shadow-sm shrink-0"
              >
                <Search className="size-4 stroke-[2.5]" />
                Find Stations
              </button>
            </div>

            {/* Metric Stats Bar */}
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-6 border-t border-slate-300 dark:border-slate-800/80 pt-8 sm:grid-cols-4">
              <div>
                <div className="flex items-center gap-1.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
                  <BatteryCharging className="size-4" />
                  12,458+
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">Stations Worldwide</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-base font-bold text-cyan-600 dark:text-cyan-300">
                  <Zap className="size-4" />
                  28,745+
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">Charging Points</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-base font-bold text-amber-600 dark:text-amber-400">
                  <CircleUserRound className="size-4" />
                  1.2M+
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">Happy Users</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-base font-bold text-cyan-600 dark:text-cyan-400">
                  <Globe2 className="size-4" />
                  65M+ kg
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">CO₂ Saved</p>
              </div>
            </div>
          </div>

          {/* Right side: Google Map Card Visualization */}
          <div className="relative h-[430px] w-full overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl">
            <GoogleMapComponent
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(st) => setSelectedStation(st)}
              height="100%"
              zoom={13}
            />

            {/* Floating Info Overlay Card */}
            <div className="absolute top-4 right-4 z-10 hidden sm:block max-w-[260px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070c14]/95 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{selectedStation.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedStation.address || 'Bhimavaram'}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Available</p>
                  <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedStation.availablePorts}/{selectedStation.totalPorts}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Price</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">₹{selectedStation.pricePerKwh}/kWh</p>
                </div>
              </div>

              <Link
                href={`/stations/${selectedStation.slug}`}
                className="mt-3 block w-full text-center rounded-xl bg-cyan-500 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                View Details <ArrowRight className="ml-1 inline size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section className="bg-slate-50 dark:bg-[#f5f8fb] px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Real-time Availability"
            description="Live status of all charging stations and connectors worldwide."
            actionText="Explore Stations"
            actionHref="/stations"
            icon={BatteryCharging}
            iconBg="bg-emerald-50 text-emerald-600"
          />

          <FeatureCard
            title="AI Recommendations"
            description="Get the best station based on wait time, price, traffic & your preferences."
            actionText="Try AI Insights"
            actionHref="/ai-insights"
            icon={Lightbulb}
            iconBg="bg-cyan-50 text-cyan-600"
          />

          <FeatureCard
            title="Smart Booking"
            description="Reserve your slot in advance and skip the wait at busy stations."
            actionText="Book a Slot"
            actionHref="/stations"
            icon={CalendarDays}
            iconBg="bg-blue-50 text-blue-600"
          />

          <FeatureCard
            title="Analytics & Insights"
            description="AI-powered analytics for owners and smart demand forecasting."
            actionText="View Insights"
            actionHref="/owner"
            icon={BarChart3}
            iconBg="bg-purple-50 text-purple-600"
          />
        </div>
      </section>

      {/* TOP STATIONS & AI DEMAND FORECAST */}
      <section className="bg-slate-100 dark:bg-[#f5f8fb] px-5 py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
          {/* Top Stations List */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Top Stations Near You</h2>
              <p className="mt-1 text-xs text-slate-500">Live availability and real-time insights</p>
            </div>

            <div className="flex flex-col gap-4">
              {filteredStations.map((station) => (
                <article
                  key={station.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                    <img
                      src={station.image}
                      alt={station.name}
                      className="h-24 w-full sm:w-36 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{station.name}</h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold text-cyan-700 border border-cyan-200">
                          <Sparkles className="size-3 text-cyan-600" />
                          AI Recommended
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="size-3 text-slate-400" />
                        {station.address}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 border border-emerald-100">
                          ● {station.availablePorts}/{station.totalPorts} Available
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700 border border-blue-100">
                          ◷ {station.waitMinutes} min wait
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                          ◎ ₹{station.pricePerKwh}/kWh
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-black text-emerald-500">{station.aiScore}%</p>
                      <p className="text-[9px] font-bold text-slate-400 tracking-wider">AI SCORE</p>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <Link
                        href={`/stations/${station.slug}`}
                        className="rounded-xl border border-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                      >
                        View Details <ArrowRight className="ml-1 inline size-3" />
                      </Link>
                      <Link
                        href={`/booking?station=${station.slug}`}
                        className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Dynamic AI Demand Forecast Card */}
          <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm h-fit space-y-5 transition-colors">
            {/* Top Bar with City Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                <Sparkles className="size-4" />
                AI Demand Forecast
              </div>
              <div className="relative">
                <select
                  value={forecastCity}
                  onChange={(e) => setForecastCity(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-1.5 pl-3 pr-7 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none focus:border-cyan-500"
                >
                  <option value="Bhimavaram">Bhimavaram</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Rajahmundry">Rajahmundry</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Tirupati">Tirupati</option>
                  <option value="Kurnool">Kurnool</option>
                  <option value="Nellore">Nellore</option>
                  <option value="Kakinada">Kakinada</option>
                  <option value="Kadapa">Kadapa</option>
                  <option value="Anantapur">Anantapur</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2 size-3.5 text-slate-400" />
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setForecastDay('today')}
                className={`py-1.5 rounded-lg text-center transition ${
                  forecastDay === 'today'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setForecastDay('tomorrow')}
                className={`py-1.5 rounded-lg text-center transition ${
                  forecastDay === 'tomorrow'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setForecastDay('weekend')}
                className={`py-1.5 rounded-lg text-center transition ${
                  forecastDay === 'weekend'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Weekend
              </button>
            </div>

            {/* Dynamic Real-time Demand Metrics */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {forecastData.currentDemand >= 80 ? (
                    <>
                      <Flame className="size-4 text-rose-500" />
                      High Demand Peak
                    </>
                  ) : forecastData.currentDemand >= 50 ? (
                    <>
                      <TrendingUp className="size-4 text-amber-500" />
                      Moderate Flow
                    </>
                  ) : (
                    <>
                      <Zap className="size-4 text-emerald-500" />
                      Off-Peak Window
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatHourLabel(forecastHour)} •{' '}
                  {forecastData.currentDemand >= 80
                    ? 'Est. wait: 15–20 mins'
                    : forecastData.currentDemand >= 50
                    ? 'Est. wait: 3–5 mins'
                    : 'Instant port access (0m wait)'}
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                  forecastData.currentDemand >= 80
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : forecastData.currentDemand >= 50
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {forecastData.currentDemand}%
              </div>
            </div>

            {/* Dynamic SVG Demand Graph Curve */}
            <div className="relative h-32 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2">
              <svg className="h-full w-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="homeDemandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d={forecastData.areaD} fill="url(#homeDemandGradient)" />
                {/* Curve Line */}
                <path
                  d={forecastData.pathD}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Selected Hour Vertical Indicator */}
                <line
                  x1={forecastData.selectedPoint.x}
                  y1="10"
                  x2={forecastData.selectedPoint.x}
                  y2="90"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Active Dot */}
                <circle
                  cx={forecastData.selectedPoint.x}
                  cy={forecastData.selectedPoint.y}
                  r="5"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>

              {/* Peak Marker Badge */}
              <div className="absolute top-2 right-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                Peak: {formatHourLabel(forecastData.peakHour)} ({forecastData.peakDemand}%)
              </div>

              {/* X-Axis Hour Labels */}
              <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] text-slate-400 font-medium select-none">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>
            </div>

            {/* Interactive Time Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="size-3.5 text-cyan-500" />
                  Hour of Day:
                </span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                  {formatHourLabel(forecastHour)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value={forecastHour}
                onChange={(e) => setForecastHour(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: '8 AM Peak', h: 8 },
                  { label: '2 PM Midday', h: 14 },
                  { label: '7 PM Rush', h: 19 },
                  { label: '11 PM Cheap', h: 23 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => setForecastHour(btn.h)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition font-medium ${
                      forecastHour === btn.h
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <span className="font-bold block text-emerald-700 dark:text-emerald-200">
                ⚡ Optimal Charging Recommendation
              </span>
              Charge between <strong>11:00 PM – 6:00 AM</strong> in {forecastCity} to save up to 25% on peak grid tariffs and avoid charging queues.
            </div>

            <Link
              href="/forecast"
              className="block w-full text-center rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shadow-sm"
            >
              View Full 7-Day Forecast <ArrowRight className="ml-1 inline size-3.5" />
            </Link>
          </aside>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-900 dark:bg-[#05080e] text-slate-400 text-xs py-14 transition-colors">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Zap className="size-5 text-emerald-400 fill-emerald-400" />
                SmartEV
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                Building the world's most intelligent and accessible EV charging network.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/stations" className="hover:text-white transition">
                    Find Stations
                  </Link>
                </li>
                <li>
                  <Link href="/ai-insights" className="hover:text-white transition">
                    AI Insights
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/help" className="hover:text-white transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} SmartEV Infrastructure. All rights reserved.</p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  actionText,
  actionHref,
  icon: Icon,
  iconBg,
}: {
  title: string
  description: string
  actionText: string
  actionHref: string
  icon: typeof Zap
  iconBg: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
      <div>
        <div className={`mb-4 flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>

      <Link
        href={actionHref}
        className="mt-6 inline-flex items-center text-xs font-bold text-emerald-600 hover:underline"
      >
        {actionText} <ArrowRight className="ml-1 size-3.5" />
      </Link>
    </article>
  )
}
