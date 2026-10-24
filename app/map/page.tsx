'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GoogleMapComponent from '@/components/GoogleMapComponent'
import {
  INITIAL_STATIONS,
  getOwnerAddedStations,
  BHIMAVARAM_CENTER,
  type EVStation,
} from '@/lib/stationsData'
import {
  ArrowRight,
  BatteryCharging,
  Check,
  ChevronDown,
  Compass,
  Filter,
  Layers,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Radio,
} from 'lucide-react'

export default function MapPage() {
  const router = useRouter()
  const [stations, setStations] = useState<EVStation[]>(INITIAL_STATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStation, setSelectedStation] = useState<EVStation | null>(INITIAL_STATIONS[0])
  const [directionsTarget, setDirectionsTarget] = useState<EVStation | null>(null)
  const [waypoints, setWaypoints] = useState<EVStation[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  // Filter state
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available'>('all')
  const [minPowerKw, setMinPowerKw] = useState<number>(0)
  const [selectedConnector, setSelectedConnector] = useState<string>('all')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(BHIMAVARAM_CENTER)

  // Fetch owner-added stations from Supabase / store
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

  // AP City Coordinates Mapping
  const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    Bhimavaram: { lat: 16.5449, lng: 81.5212 },
    Vijayawada: { lat: 16.5062, lng: 80.648 },
    Visakhapatnam: { lat: 17.7125, lng: 83.315 },
    Rajahmundry: { lat: 17.0005, lng: 81.7774 },
    Guntur: { lat: 16.3067, lng: 80.4365 },
    Tirupati: { lat: 13.6288, lng: 79.4192 },
    Kakinada: { lat: 16.9891, lng: 82.2475 },
    Nellore: { lat: 14.4426, lng: 79.9865 },
    Kurnool: { lat: 15.8281, lng: 78.0373 },
    Kadapa: { lat: 14.4673, lng: 78.8242 },
    Anantapur: { lat: 14.6819, lng: 77.6006 },
    Eluru: { lat: 16.7107, lng: 81.0952 },
    Ongole: { lat: 15.5057, lng: 80.0499 },
    Vizianagaram: { lat: 18.1066, lng: 83.3956 },
    Srikakulam: { lat: 18.2949, lng: 83.8938 },
    Tadepalligudem: { lat: 16.8148, lng: 81.5264 },
    Tenali: { lat: 16.2429, lng: 80.6394 },
    Narasaraopet: { lat: 16.2334, lng: 80.0497 },
    Machilipatnam: { lat: 16.1876, lng: 81.1386 },
    Mangalagiri: { lat: 16.4308, lng: 80.5573 },
    Amalapuram: { lat: 16.5769, lng: 82.0064 },
    Nandyal: { lat: 15.4786, lng: 78.4836 },
    Proddatur: { lat: 14.7502, lng: 78.5488 },
    Hindupur: { lat: 13.8303, lng: 77.4919 },
    Chittoor: { lat: 13.2172, lng: 79.1003 },
    Madanapalle: { lat: 13.556, lng: 78.501 },
    Dhone: { lat: 15.3967, lng: 77.8703 },
    Guntakal: { lat: 15.167, lng: 77.3626 },
  }

  // Change Map Center when City is Selected
  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (city !== 'all' && CITY_COORDINATES[city]) {
      setMapCenter(CITY_COORDINATES[city])
    }
  }

  // Filter stations based on criteria
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchSearch =
        !searchQuery.trim() ||
        (station.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (station.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (station.city || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchCity =
        selectedCity === 'all' ||
        (station.city || '').toLowerCase().includes(selectedCity.toLowerCase())
      const matchStatus = filterStatus === 'all' || station.status === 'available'
      const matchPower = station.powerKw >= minPowerKw
      const matchConnector =
        selectedConnector === 'all' || station.connectors.includes(selectedConnector)

      return (
        matchSearch &&
        matchCity &&
        matchStatus &&
        matchPower &&
        matchConnector
      )
    })
  }, [stations, searchQuery, selectedCity, filterStatus, minPowerKw, selectedConnector])

  const toggleDirections = (station: EVStation) => {
    if (directionsTarget?.id === station.id) {
      setDirectionsTarget(null)
      setWaypoints([])
    } else {
      setDirectionsTarget(station)
      setSelectedStation(station)
    }
  }

  // Add intermediate charging stop on active road corridor route
  const handleAddWaypoint = (station: EVStation) => {
    if (!directionsTarget) {
      setDirectionsTarget(station)
      setSelectedStation(station)
      return
    }
    if (directionsTarget.id === station.id) return
    if (!waypoints.some((w) => w.id === station.id)) {
      setWaypoints((prev) => [...prev, station])
    }
  }

  const handleRemoveWaypoint = (stationId: string) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== stationId))
  }

  const handleClearRoute = () => {
    setDirectionsTarget(null)
    setWaypoints([])
  }

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#0b1220] text-slate-900 dark:text-foreground transition-colors duration-200">
      {/* Top Floating Filter Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/90 px-4 py-3 shadow-md backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location, station, area..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setFilterStatus(filterStatus === 'all' ? 'available' : 'all')}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  filterStatus === 'available'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                Available Only
              </button>

              <button
                onClick={() => setMinPowerKw(minPowerKw === 0 ? 100 : 0)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  minPowerKw >= 100
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                ⚡ Fast Charge (100kW+)
              </button>

              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300 outline-none focus:border-cyan-500"
              >
                <option value="all">📍 All AP Cities</option>
                <option value="Bhimavaram">Bhimavaram</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Visakhapatnam">Visakhapatnam (Vizag)</option>
                <option value="Rajahmundry">Rajahmundry</option>
                <option value="Guntur">Guntur</option>
                <option value="Tirupati">Tirupati</option>
                <option value="Kakinada">Kakinada</option>
                <option value="Nellore">Nellore</option>
                <option value="Kurnool">Kurnool</option>
                <option value="Kadapa">Kadapa</option>
                <option value="Anantapur">Anantapur</option>
                <option value="Eluru">Eluru</option>
                <option value="Ongole">Ongole</option>
                <option value="Vizianagaram">Vizianagaram</option>
                <option value="Srikakulam">Srikakulam</option>
                <option value="Tadepalligudem">Tadepalligudem</option>
                <option value="Tenali">Tenali</option>
                <option value="Narasaraopet">Narasaraopet</option>
                <option value="Machilipatnam">Machilipatnam</option>
                <option value="Mangalagiri">Mangalagiri</option>
                <option value="Amalapuram">Amalapuram</option>
                <option value="Nandyal">Nandyal</option>
                <option value="Proddatur">Proddatur</option>
                <option value="Hindupur">Hindupur</option>
                <option value="Chittoor">Chittoor</option>
                <option value="Madanapalle">Madanapalle</option>
                <option value="Dhone">Dhone</option>
                <option value="Guntakal">Guntakal</option>
              </select>

              <select
                value={selectedConnector}
                onChange={(e) => setSelectedConnector(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="all">All Connectors</option>
                <option value="CCS2">CCS2</option>
                <option value="Type 2">Type 2</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
              Showing <span className="text-slate-900 dark:text-white font-bold">{filteredStations.length}</span> stations
            </span>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            >
              <SlidersHorizontal className="size-3.5 text-cyan-500 dark:text-cyan-400" />
              List ({filteredStations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Active Road Corridor Multi-Stop Route Bar */}
      {(directionsTarget || waypoints.length > 0) && (
        <div className="border-b border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/40 px-4 py-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Navigation className="size-4" />
              Road Corridor Route:
            </span>
            <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800">
              📍 Origin (Your Location)
            </span>
            {waypoints.map((wp, idx) => (
              <span
                key={wp.id}
                className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/40"
              >
                ➔ ⚡ Stop {idx + 1}: {wp.name}
                <button
                  type="button"
                  onClick={() => handleRemoveWaypoint(wp.id)}
                  className="text-slate-400 hover:text-rose-500 font-black ml-1 text-sm leading-none"
                  title="Remove this waypoint"
                >
                  ×
                </button>
              </span>
            ))}
            {directionsTarget && (
              <span className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg font-bold border border-cyan-500/40">
                ➔ 🏁 Destination: {directionsTarget.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearRoute}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 rounded-lg transition"
            >
              Clear Route
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Split View Sidebar + Google Map */}
      <div className="grid h-[calc(100vh-125px)] grid-cols-1 lg:grid-cols-[390px_1fr] overflow-hidden">
        {/* Sidebar with full vertical scrolling */}
        <aside
          className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] transition-all duration-300 h-full min-h-0 overflow-hidden ${
            mobileSidebarOpen
              ? 'absolute inset-0 z-30 flex w-full bg-white dark:bg-[#0f172a]'
              : 'hidden lg:flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">EV Charging Stations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive live station map • Road Corridor stops
              </p>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Scrollable Stations List Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {filteredStations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MapPin className="mx-auto size-8 text-slate-400 mb-2" />
                <p className="font-medium text-sm text-slate-600 dark:text-slate-300">No stations match filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterStatus('all')
                    setMinPowerKw(0)
                    setSelectedConnector('all')
                  }}
                  className="mt-3 text-xs text-cyan-600 dark:text-cyan-400 underline font-bold"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredStations.map((station) => {
                const isSelected = selectedStation?.id === station.id
                const isDirecting = directionsTarget?.id === station.id
                const isWaypoint = waypoints.some((w) => w.id === station.id)

                return (
                  <article
                    key={station.id}
                    onClick={() => {
                      setSelectedStation(station)
                      if (window.innerWidth < 1024) setMobileSidebarOpen(false)
                    }}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? 'border-cyan-500 bg-slate-100 dark:bg-slate-800/80 shadow-lg'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{station.name}</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[210px]">{station.address}</span>
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          station.status === 'available'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : station.status === 'busy'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                        }`}
                      >
                        ● {station.availablePorts}/{station.totalPorts}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                      <div>
                        <span className="text-slate-500 block text-[10px]">SPEED</span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-300">{station.powerKw} kW</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">PRICE</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{station.pricePerKwh}/kWh</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">SCORE</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{station.aiScore}%</span>
                      </div>
                    </div>

                    {/* Action buttons: Route, Add as Stop, Start Nav, Book Slot */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-200 dark:border-slate-800/50 pt-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDirections(station)
                        }}
                        className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border transition ${
                          isDirecting
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Compass className="size-3" />
                        {isDirecting ? 'Clear' : 'Route'}
                      </button>

                      {/* Add as Stop on Route */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddWaypoint(station)
                        }}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                          isWaypoint
                            ? 'border-emerald-500 bg-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title="Add this station as an intermediate charging stop"
                      >
                        <Plus className="size-3" />
                        {isWaypoint ? 'Stop Added' : 'Add Stop'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDirections(station)
                          if (window.innerWidth < 1024) setMobileSidebarOpen(false)
                        }}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition"
                      >
                        🚀 Start
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/booking?station=${station.slug}`)
                        }}
                        className="rounded-lg bg-cyan-500 px-3 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-cyan-400"
                      >
                        Book Slot
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </aside>

        {/* Interactive Google Map */}
        <section className="relative h-full w-full">
          <GoogleMapComponent
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
            userLocation={userLocation}
            showDirectionsTo={directionsTarget}
            waypoints={waypoints}
            onAddWaypoint={handleAddWaypoint}
            onRemoveWaypoint={handleRemoveWaypoint}
            center={mapCenter}
            height="100%"
          />
        </section>
      </div>
    </div>
  )
}
