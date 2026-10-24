'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  INITIAL_STATIONS,
  INITIAL_BHIMAVARAM_STATIONS,
  getOwnerAddedStations,
  type EVStation,
} from '@/lib/stationsData'
import {
  ArrowRight,
  BatteryCharging,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  HelpCircle,
  Info,
  MapPin,
  Scale,
  Sparkles,
  Star,
  XCircle,
  Zap,
  Building2,
  Sliders,
  AlertTriangle,
  ArrowUpDown,
  Gauge,
  ShieldCheck,
  Flame,
  Award,
  History,
  Trash2,
  X,
} from 'lucide-react'

// Popular Indian EV Specs for accurate vehicle intake calculations
interface VehicleSpec {
  name: string
  capacityKwh: number
  maxDcKw: number
  maxAcKw: number
}

const VEHICLE_PRESETS: Record<string, VehicleSpec> = {
  'Tata Nexon EV Max': { name: 'Tata Nexon EV Max', capacityKwh: 40.5, maxDcKw: 50, maxAcKw: 7.2 },
  'Tata Punch EV LR': { name: 'Tata Punch EV LR', capacityKwh: 35.0, maxDcKw: 50, maxAcKw: 7.2 },
  'Tata Curvv EV': { name: 'Tata Curvv EV', capacityKwh: 55.0, maxDcKw: 70, maxAcKw: 7.2 },
  'MG ZS EV': { name: 'MG ZS EV', capacityKwh: 50.3, maxDcKw: 60, maxAcKw: 7.4 },
  'Hyundai Ioniq 5': { name: 'Hyundai Ioniq 5', capacityKwh: 72.6, maxDcKw: 240, maxAcKw: 11.0 },
  'Mahindra XUV400': { name: 'Mahindra XUV400', capacityKwh: 39.4, maxDcKw: 50, maxAcKw: 7.2 },
  'BYD Atto 3': { name: 'BYD Atto 3', capacityKwh: 60.5, maxDcKw: 80, maxAcKw: 7.0 },
  'Custom Vehicle': { name: 'Custom EV Battery', capacityKwh: 60.0, maxDcKw: 150, maxAcKw: 11.0 },
}

export default function ComparePage() {
  const [stations, setStations] = useState<EVStation[]>(INITIAL_STATIONS)

  // Fetch full stations list on mount
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const all = await getOwnerAddedStations()
        if (active && all && all.length > 0) {
          setStations(all)
        }
      } catch (e) {
        console.warn('Failed to load owner stations in compare', e)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Unique list of cities from available stations
  const citiesList = useMemo(() => {
    const set = new Set<string>()
    stations.forEach((s) => {
      if (s.city) set.add(s.city)
    })
    return Array.from(set).sort()
  }, [stations])

  // City selection for Station A and Station B
  const [city1, setCity1] = useState<string>('Bhimavaram')
  const [city2, setCity2] = useState<string>('Vijayawada')

  // Filtered station lists by selected city
  const stationsForCity1 = useMemo(() => {
    if (city1 === 'all') return stations
    return stations.filter((s) => s.city.toLowerCase() === city1.toLowerCase())
  }, [stations, city1])

  const stationsForCity2 = useMemo(() => {
    if (city2 === 'all') return stations
    return stations.filter((s) => s.city.toLowerCase() === city2.toLowerCase())
  }, [stations, city2])

  // Station selection for side-by-side comparison
  const [station1Id, setStation1Id] = useState<string>('bv-s1')
  const [station2Id, setStation2Id] = useState<string>('vja-s1')

  // Auto-update station ID if city changes and current selection is not in that city
  useEffect(() => {
    if (stationsForCity1.length > 0 && !stationsForCity1.some((s) => s.id === station1Id)) {
      setStation1Id(stationsForCity1[0].id)
    }
  }, [stationsForCity1, station1Id])

  useEffect(() => {
    if (stationsForCity2.length > 0 && !stationsForCity2.some((s) => s.id === station2Id)) {
      setStation2Id(stationsForCity2[0].id)
    }
  }, [stationsForCity2, station2Id])

  const station1 = useMemo(
    () => stations.find((s) => s.id === station1Id) || stations[0] || INITIAL_BHIMAVARAM_STATIONS[0],
    [stations, station1Id]
  )

  const station2 = useMemo(
    () => stations.find((s) => s.id === station2Id) || stations[1] || INITIAL_BHIMAVARAM_STATIONS[1],
    [stations, station2Id]
  )

  // Battery Charge Calculator State
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string>('Tata Nexon EV Max')
  const [batteryKwh, setBatteryKwh] = useState<number>(40.5)
  const [startPct, setStartPct] = useState<number>(15)
  const [targetPct, setTargetPct] = useState<number>(85)

  // Update battery size when vehicle model changes
  const handleVehicleChange = (modelKey: string) => {
    setSelectedVehicleKey(modelKey)
    if (modelKey !== 'Custom Vehicle') {
      const spec = VEHICLE_PRESETS[modelKey]
      if (spec) setBatteryKwh(spec.capacityKwh)
    }
  }

  // Energy needed in kWh
  const energyNeeded = useMemo(() => {
    if (targetPct <= startPct) return 0
    const pctToCharge = (targetPct - startPct) / 100
    return +(batteryKwh * pctToCharge).toFixed(1)
  }, [batteryKwh, startPct, targetPct])

  // Non-linear CC-CV EV Charging Curve & Overhead Physics Engine
  // Accounts for:
  // 1. Vehicle BMS maximum intake power vs charger rating
  // 2. High-speed CC phase (0% -> 80%) at ~92% inverter efficiency
  // 3. Tapered CV trickle phase (80% -> 100%) where current drops sharply (~38% of max power)
  // 4. DC handshake & pre-charge thermal check overhead (3 mins for DC, 1 min for AC)
  const calcAccurateChargeTime = (chargerKw: number, isAc = false) => {
    if (!chargerKw || chargerKw <= 0 || targetPct <= startPct) return 0

    const currentVehicle = VEHICLE_PRESETS[selectedVehicleKey]
    const vehicleMaxKw = isAc ? (currentVehicle?.maxAcKw || 7.2) : (currentVehicle?.maxDcKw || 150)
    const effectiveKw = Math.min(chargerKw, vehicleMaxKw)

    // Phase 1: High speed CC charge up to 80%
    const fastStart = Math.min(startPct, 80)
    const fastEnd = Math.min(targetPct, 80)
    const fastPct = Math.max(0, fastEnd - fastStart)
    const fastEnergyKwh = batteryKwh * (fastPct / 100)
    const fastHours = fastEnergyKwh / (effectiveKw * 0.92)

    // Phase 2: Tapered trickle CV charge above 80% to 100%
    const taperStart = Math.max(startPct, 80)
    const taperEnd = Math.max(targetPct, 80)
    const taperPct = Math.max(0, taperEnd - taperStart)
    const taperEnergyKwh = batteryKwh * (taperPct / 100)
    // In the 80-100% zone, charging speed averages only ~38% of rated power
    const taperedPowerKw = Math.max(7, effectiveKw * 0.38)
    const taperHours = taperEnergyKwh / (taperedPowerKw * 0.88)

    // Overhead session setup
    const overheadMins = chargerKw >= 50 ? 3 : 1
    const totalMinutes = Math.round((fastHours + taperHours) * 60 + (energyNeeded > 0 ? overheadMins : 0))

    return Math.max(2, totalMinutes)
  }

  // Cost calculation factoring in ~8% grid-to-battery thermal & inverter conversion loss
  const calcAccurateTotalCost = (pricePerKwh: number) => {
    if (targetPct <= startPct || energyNeeded <= 0) return 0
    const billedUnitsKwh = energyNeeded * 1.08 // 8% standard AC-DC thermal loss
    return Math.round(billedUnitsKwh * pricePerKwh)
  }

  // Comparison History State (saved to localStorage)
  interface ComparisonHistoryItem {
    id: string
    station1Id: string
    station1Name: string
    city1: string
    station2Id: string
    station2Name: string
    city2: string
    date: string
  }

  const [history, setHistory] = useState<ComparisonHistoryItem[]>([])

  // Load history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smartev_comparison_history')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed)
            return
          }
        }
      } catch (e) {
        console.warn('Failed to parse comparison history', e)
      }
      // Initial default comparison history items
      const initialHistory: ComparisonHistoryItem[] = [
        {
          id: 'bv-s1-vs-vja-s1',
          station1Id: 'bv-s1',
          station1Name: 'Bhimavaram EV Super Hub',
          city1: 'Bhimavaram',
          station2Id: 'vja-s1',
          station2Name: 'Vijayawada Highway Hub',
          city2: 'Vijayawada',
          date: 'Recent',
        },
        {
          id: 'vja-s1-vs-vzg-s1',
          station1Id: 'vja-s1',
          station1Name: 'Vijayawada Highway Hub',
          city1: 'Vijayawada',
          station2Id: 'vzg-s1',
          station2Name: 'Vizag RK Beach Ultra Hub',
          city2: 'Visakhapatnam',
          date: 'Recent',
        },
        {
          id: 'gnt-s1-vs-tpt-s1',
          station1Id: 'gnt-s1',
          station1Name: 'Guntur Inner Ring Road Hub',
          city1: 'Guntur',
          station2Id: 'tpt-s1',
          station2Name: 'Tirupati Alipiri Hub',
          city2: 'Tirupati',
          date: 'Recent',
        },
      ]
      setHistory(initialHistory)
      try {
        localStorage.setItem('smartev_comparison_history', JSON.stringify(initialHistory))
      } catch {}
    }
  }, [])

  // Auto-record current comparison to history
  useEffect(() => {
    if (!station1 || !station2 || station1.id === station2.id) return
    const id = `${station1.id}-vs-${station2.id}`

    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.id !== id && item.id !== `${station2.id}-vs-${station1.id}`
      )
      const newItem: ComparisonHistoryItem = {
        id,
        station1Id: station1.id,
        station1Name: station1.name,
        city1: station1.city,
        station2Id: station2.id,
        station2Name: station2.name,
        city2: station2.city,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      const updated = [newItem, ...filtered].slice(0, 8)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('smartev_comparison_history', JSON.stringify(updated))
        } catch {}
      }
      return updated
    })
  }, [station1Id, station2Id, station1, station2])

  // Restore a comparison from history
  const restoreHistory = (item: ComparisonHistoryItem) => {
    setCity1(item.city1)
    setCity2(item.city2)
    setTimeout(() => {
      setStation1Id(item.station1Id)
      setStation2Id(item.station2Id)
    }, 40)
  }

  // Clear all history
  const clearHistory = () => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smartev_comparison_history')
    }
  }

  // Remove individual history item
  const removeHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = history.filter((h) => h.id !== id)
    setHistory(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartev_comparison_history', JSON.stringify(updated))
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors duration-200">
      {/* Header Banner */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
            <Scale className="size-3.5" />
            ANDHRA PRADESH EV CHARGER BENCHMARK & COMPARISON TOOL
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Compare EV Stations & Speed Performance
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Compare charging speeds, electricity tariffs, port availability, and realistic non-linear CC-CV charging times across different cities in Andhra Pradesh.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8 space-y-12">
        {/* SECTION 1: SIDE-BY-SIDE STATION COMPARISON WITH CITY/LOCATION FILTERS */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Zap className="size-5 text-emerald-500" />
                Cross-City & Station Comparison
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select cities and compare station performance metrics side-by-side across Andhra Pradesh.
              </p>
            </div>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              ⚡ {stations.length} AP Stations Available
            </span>
          </div>

          {/* Comparison History Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/70 p-4 backdrop-blur-sm shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <History className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    Comparison History
                    <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                      {history.length} Compared
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    What you have previously compared. Click any comparison to instantly reload both stations.
                  </p>
                </div>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg transition"
                >
                  <Trash2 className="size-3" />
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No comparison history yet. When you compare stations, they will be saved here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {history.map((item) => {
                  const isCurrent =
                    (station1Id === item.station1Id && station2Id === item.station2Id) ||
                    (station1Id === item.station2Id && station2Id === item.station1Id)

                  return (
                    <div
                      key={item.id}
                      onClick={() => restoreHistory(item)}
                      className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                        isCurrent
                          ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/15 shadow-sm ring-1 ring-cyan-500/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Station 1 */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{item.station1Name}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded shrink-0">
                              {item.city1}
                            </span>
                          </div>

                          <div className="my-1 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <ArrowUpDown className="size-3 text-cyan-500" />
                            <span>COMPARED AGAINST</span>
                          </div>

                          {/* Station 2 */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                            <span className="size-2 rounded-full bg-cyan-500 shrink-0" />
                            <span className="truncate">{item.station2Name}</span>
                            <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded shrink-0">
                              {item.city2}
                            </span>
                          </div>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={(e) => removeHistoryItem(e, item.id)}
                          title="Remove from history"
                          className="shrink-0 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          {item.date}
                        </span>
                        {isCurrent ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-0.5">
                            <Check className="size-3" /> Active Now
                          </span>
                        ) : (
                          <span className="text-cyan-600 dark:text-cyan-400 font-medium group-hover:underline">
                            Compare Again →
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Location & Station Selectors Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Station A Selector with Location/City */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" /> Station A Configuration
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stationsForCity1.length} stations in city
                </span>
              </div>

              {/* City A Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  📍 Step 1: Select City / Region
                </label>
                <select
                  value={city1}
                  onChange={(e) => setCity1(e.target.value)}
                  className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 outline-none focus:border-emerald-500"
                >
                  <option value="all">📍 All Andhra Pradesh Cities</option>
                  {citiesList.map((city) => (
                    <option key={city} value={city}>
                      📍 {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Station A Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  ⚡ Step 2: Choose Station in {city1 === 'all' ? 'AP' : city1}
                </label>
                <select
                  value={station1Id}
                  onChange={(e) => setStation1Id(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  {stationsForCity1.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city}) — {s.powerKw}kW • ₹{s.pricePerKwh}/kWh
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Station B Selector with Location/City */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-cyan-500" /> Station B Configuration
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stationsForCity2.length} stations in city
                </span>
              </div>

              {/* City B Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  📍 Step 1: Select City / Region
                </label>
                <select
                  value={city2}
                  onChange={(e) => setCity2(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 outline-none focus:border-cyan-500"
                >
                  <option value="all">📍 All Andhra Pradesh Cities</option>
                  {citiesList.map((city) => (
                    <option key={city} value={city}>
                      📍 {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Station B Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  ⚡ Step 2: Choose Station in {city2 === 'all' ? 'AP' : city2}
                </label>
                <select
                  value={station2Id}
                  onChange={(e) => setStation2Id(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  {stationsForCity2.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city}) — {s.powerKw}kW • ₹{s.pricePerKwh}/kWh
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StationCompareCard
              station={station1}
              otherStation={station2}
              energyNeeded={energyNeeded}
              calcTime={(kw) => calcAccurateChargeTime(kw, !station1.fastCharging)}
              calcCost={calcAccurateTotalCost}
              badgeColor="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              label="Station A"
              city={station1.city}
            />
            <StationCompareCard
              station={station2}
              otherStation={station1}
              energyNeeded={energyNeeded}
              calcTime={(kw) => calcAccurateChargeTime(kw, !station2.fastCharging)}
              calcCost={calcAccurateTotalCost}
              badgeColor="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
              label="Station B"
              city={station2.city}
            />
          </div>
        </section>

        {/* SECTION 2: HIGH-ACCURACY BATTERY CHARGE TIME & COST CALCULATOR (0-100% INDEPENDENT BARS) */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 lg:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Clock className="size-5 text-cyan-500" />
                Accurate EV Battery Charge Time & Cost Calculator
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Non-linear CC-CV battery charging curve physics, vehicle BMS intake bottlenecks, and independent 0% to 100% full-range sliders.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              ⚡ CC-CV Charging Physics Active
            </span>
          </div>

          {/* Quick Range Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Quick State of Charge (SoC) Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStartPct(10)
                  setTargetPct(80)
                }}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  startPct === 10 && targetPct === 80
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                ⚡ 10% ➔ 80% (Highway Optimum)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartPct(20)
                  setTargetPct(80)
                }}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  startPct === 20 && targetPct === 80
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                🔋 20% ➔ 80% (Daily Care Standard)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartPct(10)
                  setTargetPct(100)
                }}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  startPct === 10 && targetPct === 100
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                🛣️ 10% ➔ 100% (Full Highway Prep)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartPct(0)
                  setTargetPct(100)
                }}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  startPct === 0 && targetPct === 100
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                🔄 0% ➔ 100% (Complete Full Cycle)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartPct(40)
                  setTargetPct(80)
                }}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  startPct === 40 && targetPct === 80
                    ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                ☕ 40% ➔ 80% (Quick Coffee Top-Up)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Input Controls */}
            <div className="space-y-5 lg:col-span-1 border-r-0 lg:border-r border-slate-200 dark:border-slate-800 pr-0 lg:pr-6">
              {/* Vehicle Model Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  EV Model & Battery Intake
                </label>
                <select
                  value={selectedVehicleKey}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  {Object.keys(VEHICLE_PRESETS).map((key) => (
                    <option key={key} value={key}>
                      {VEHICLE_PRESETS[key].name} ({VEHICLE_PRESETS[key].capacityKwh} kWh • Max {VEHICLE_PRESETS[key].maxDcKw}kW DC)
                    </option>
                  ))}
                </select>
              </div>

              {/* Battery Capacity Adjustment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Battery Capacity
                  </label>
                  <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                    {batteryKwh} kWh
                  </span>
                </div>
                <div className="flex gap-2">
                  {[30, 40.5, 50.3, 60, 72.6, 80].map((kwh) => (
                    <button
                      key={kwh}
                      type="button"
                      onClick={() => setBatteryKwh(kwh)}
                      className={`flex-1 rounded-xl border py-1.5 text-[11px] font-bold transition ${
                        batteryKwh === kwh
                          ? 'border-cyan-500 bg-cyan-500 text-slate-950 shadow'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {kwh}
                    </button>
                  ))}
                </div>
              </div>

              {/* START PERCENTAGE BAR (0 TO 100) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Starting Battery %
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={startPct}
                      onChange={(e) => setStartPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-12 text-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 py-0.5"
                    />
                    <span className="text-xs font-bold text-emerald-500">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={startPct}
                  onChange={(e) => setStartPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>0% (Empty)</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* TARGET/END PERCENTAGE BAR (0 TO 100) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    Target / Ending Battery %
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={targetPct}
                      onChange={(e) => setTargetPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-12 text-center text-xs font-extrabold text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 py-0.5"
                    />
                    <span className="text-xs font-bold text-cyan-500">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={targetPct}
                  onChange={(e) => setTargetPct(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>80% (Fast Limit)</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              {/* Warning if start >= target */}
              {startPct >= targetPct ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Start % is greater than or equal to Target %. Set Target higher to calculate charge time.</span>
                </div>
              ) : (
                /* Energy Calculation Summary Box */
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Net Energy Added:</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      +{energyNeeded} kWh
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span>Charge Window:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {startPct}% ➔ {targetPct}% (+{targetPct - startPct}%)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Est. Grid Units Billed:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400">
                      ~{(energyNeeded * 1.08).toFixed(1)} kWh (with 8% AC/DC loss)
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Calculated Charging Times Across Power Levels */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="size-4 text-cyan-500" />
                  Calculated Charging Times & Costs by Charger Power
                </h3>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Tapering applied for 80%–100% zone
                </span>
              </div>

              {/* Interactive Multi-Speed Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <CalcResultCard
                  label="7.4 kW Home AC"
                  kw={7.4}
                  minutes={calcAccurateChargeTime(7.4, true)}
                  cost={calcAccurateTotalCost(9.5)}
                  badge="Slow Home AC"
                  color="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
                  note="Overnight wallbox"
                />
                <CalcResultCard
                  label="60 kW DC Fast"
                  kw={60}
                  minutes={calcAccurateChargeTime(60)}
                  cost={calcAccurateTotalCost(11)}
                  badge="Fast Commercial"
                  color="border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20"
                  note="City fast charging"
                />
                <CalcResultCard
                  label="120 kW Super DC"
                  kw={120}
                  minutes={calcAccurateChargeTime(120)}
                  cost={calcAccurateTotalCost(12.5)}
                  badge="Super Fast Hub"
                  color="border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/20"
                  note="Highway corridor"
                />
                <CalcResultCard
                  label="180–240 kW Ultra"
                  kw={180}
                  minutes={calcAccurateChargeTime(180)}
                  cost={calcAccurateTotalCost(12)}
                  badge="Ultra Fast Hub"
                  color="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                  note="Express expressway"
                />
              </div>

              {/* CC-CV Charging Curve Educational Explainer */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-500/10 p-4 text-xs space-y-2">
                <span className="font-bold text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                  <Info className="size-4" /> Why is charging from 80% to 100% significantly slower?
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Lithium-ion batteries charge rapidly in the <strong>Constant Current (CC) phase</strong> up to 80%. Beyond 80%, the EV&apos;s Battery Management System (BMS) automatically reduces current to prevent cell degradation and overheating (the <strong>Constant Voltage / Trickle phase</strong>). To optimize time and cost, highway drivers routinely charge to <strong>80% SoC</strong> and continue their trip.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: EV PLUG CONNECTOR STANDARDS GUIDE */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BatteryCharging className="size-5 text-cyan-500" />
              EV Plug Connectors & Vehicle Compatibility Guide
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ensure your EV model is compatible with the charger standard before booking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ConnectorGuideCard
              name="CCS Combo 2 (CCS2)"
              type="DC Fast & Ultra-Fast"
              maxKw="350 kW"
              compatibleEVs="Tata Nexon EV, MG ZS EV, Hyundai Ioniq 5, BYD Atto 3, Kia EV6, Mahindra XUV400"
              badge="Most Popular in AP"
              badgeBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            />

            <ConnectorGuideCard
              name="Type 2 (IEC 62196)"
              type="AC Slow / Destination"
              maxKw="22 kW"
              compatibleEVs="Tata Tiago EV, Punch EV, MG Comet EV, All Indian AC EVs & 2-Wheelers"
              badge="Universal AC Standard"
              badgeBg="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
            />

            <ConnectorGuideCard
              name="CHAdeMO"
              type="DC Fast Charger"
              maxKw="100 kW"
              compatibleEVs="Nissan Leaf, Older imported Japanese EVs"
              badge="Legacy DC"
              badgeBg="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
            />

            <ConnectorGuideCard
              name="GB/T Standard"
              type="DC Fast Charger"
              maxKw="150 kW"
              compatibleEVs="Commercial Fleet EVs, E-Buses, Mahindra e-Verito"
              badge="Commercial Fleets"
              badgeBg="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function StationCompareCard({
  station,
  otherStation,
  energyNeeded,
  calcTime,
  calcCost,
  badgeColor,
  label,
  city,
}: {
  station: EVStation
  otherStation: EVStation
  energyNeeded: number
  calcTime: (kw: number) => number
  calcCost: (price: number) => number
  badgeColor: string
  label: string
  city: string
}) {
  const estMinutes = calcTime(station.powerKw)
  const estCost = calcCost(station.pricePerKwh)

  const isFaster = station.powerKw > otherStation.powerKw
  const isCheaper = station.pricePerKwh < otherStation.pricePerKwh
  const isHigherRated = station.rating > otherStation.rating

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badgeColor}`}>
                {label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <MapPin className="size-3 text-cyan-500" />
                {city}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{station.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="size-3 text-slate-400 shrink-0" />
              {station.address}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="flex items-center gap-1 text-sm font-black text-emerald-500">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {station.rating}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{station.aiScore}% AI Match</span>
          </div>
        </div>

        {/* Feature Badges Comparison Highlights */}
        <div className="flex flex-wrap gap-1.5">
          {isFaster && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Award className="size-3" /> Faster Speed (+{station.powerKw - otherStation.powerKw}kW)
            </span>
          )}
          {isCheaper && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Award className="size-3" /> Lower Tariff (Save ₹{(otherStation.pricePerKwh - station.pricePerKwh).toFixed(1)}/kWh)
            </span>
          )}
          {isHigherRated && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Award className="size-3" /> Higher Driver Rating
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            {station.network}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <dt className="text-slate-500 dark:text-slate-400 text-[10px]">Charging Power</dt>
            <dd className="font-extrabold text-cyan-600 dark:text-cyan-300 text-base mt-0.5">
              {station.powerKw} kW
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <dt className="text-slate-500 dark:text-slate-400 text-[10px]">Rate per kWh</dt>
            <dd className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
              ₹{station.pricePerKwh}
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <dt className="text-slate-500 dark:text-slate-400 text-[10px]">Est. Time (+{energyNeeded} kWh)</dt>
            <dd className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base mt-0.5">
              ~{estMinutes} mins
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
            <dt className="text-slate-500 dark:text-slate-400 text-[10px]">Est. Charge Session Cost</dt>
            <dd className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
              ₹{estCost}
            </dd>
          </div>
        </dl>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-xs space-y-2">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Available Ports:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {station.availablePorts} of {station.totalPorts} Free
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Connectors:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {station.connectors.join(', ')}
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Operating Hours:</span>
            <span className="font-medium text-slate-900 dark:text-slate-200">{station.operatingHours}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-2">
        <Link
          href={`/stations/${station.slug}`}
          className="flex-1 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-2.5 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          View Details
        </Link>
        <Link
          href={`/booking?station=${station.slug}`}
          className="flex-1 text-center rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow"
        >
          Book Slot
        </Link>
      </div>
    </article>
  )
}

function CalcResultCard({
  label,
  kw,
  minutes,
  cost,
  badge,
  color,
  note,
}: {
  label: string
  kw: number
  minutes: number
  cost: number
  badge: string
  color: string
  note: string
}) {
  return (
    <div className={`rounded-2xl border p-4 space-y-2.5 shadow-sm ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {badge}
        </span>
        <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400">
          {kw} kW
        </span>
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label}</h4>
      <p className="text-[10px] text-slate-500">{note}</p>
      <div className="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Est. Time:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {minutes > 0 ? `~${minutes} mins` : '0 min'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Est. Cost:</span>
          <span className="font-black text-slate-900 dark:text-white">
            ₹{cost}
          </span>
        </div>
      </div>
    </div>
  )
}

function ConnectorGuideCard({
  name,
  type,
  maxKw,
  compatibleEVs,
  badge,
  badgeBg,
}: {
  name: string
  type: string
  maxKw: string
  compatibleEVs: string
  badge: string
  badgeBg: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-3">
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badgeBg}`}>
        {badge}
      </span>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white text-base">{name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{type}</p>
      </div>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 text-xs">
        <span className="text-slate-500 text-[10px] block">Max Speed Output</span>
        <span className="font-extrabold text-cyan-600 dark:text-cyan-300 text-sm">{maxKw}</span>
      </div>

      <div className="text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold mb-1">
          Compatible Vehicles:
        </span>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
          {compatibleEVs}
        </p>
      </div>
    </div>
  )
}
