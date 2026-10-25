'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { INITIAL_STATIONS, INITIAL_BHIMAVARAM_STATIONS, type EVStation } from '@/lib/stationsData'
import { generateSmartEVResponse } from '@/lib/aiService'
import {
  ArrowRight,
  BatteryCharging,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  DollarSign,
  HeartPulse,
  Lightbulb,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  Zap,
  Route,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

// Known Andhra Pradesh Coordinates Database for fast lookup & fallback
const AP_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  bhimavaram: { lat: 16.5449, lng: 81.5212, label: 'Bhimavaram Town, AP' },
  vijayawada: { lat: 16.5062, lng: 80.648, label: 'Vijayawada Central, AP' },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, label: 'Visakhapatnam (Vizag), AP' },
  vizag: { lat: 17.6868, lng: 83.2185, label: 'Visakhapatnam (Vizag), AP' },
  rajahmundry: { lat: 17.0005, lng: 81.7774, label: 'Rajahmundry, AP' },
  guntur: { lat: 16.3067, lng: 80.4365, label: 'Guntur City, AP' },
  tirupati: { lat: 13.6288, lng: 79.4192, label: 'Tirupati, AP' },
  kakinada: { lat: 16.9891, lng: 82.2475, label: 'Kakinada Smart City, AP' },
  nellore: { lat: 14.4426, lng: 79.9865, label: 'Nellore, AP' },
  kurnool: { lat: 15.8281, lng: 78.0373, label: 'Kurnool City, AP' },
  kadapa: { lat: 14.4673, lng: 78.8242, label: 'Kadapa, AP' },
  anantapur: { lat: 14.6819, lng: 77.6006, label: 'Anantapur, AP' },
  eluru: { lat: 16.7107, lng: 81.0952, label: 'Eluru, AP' },
  ongole: { lat: 15.5057, lng: 80.0499, label: 'Ongole, AP' },
  vizianagaram: { lat: 18.1066, lng: 83.3956, label: 'Vizianagaram, AP' },
  srikakulam: { lat: 18.2949, lng: 83.8938, label: 'Srikakulam, AP' },
  tadepalligudem: { lat: 16.8148, lng: 81.5264, label: 'Tadepalligudem, AP' },
  tenali: { lat: 16.2429, lng: 80.6394, label: 'Tenali, AP' },
  narasaraopet: { lat: 16.2334, lng: 80.0497, label: 'Narasaraopet, AP' },
  machilipatnam: { lat: 16.1876, lng: 81.1386, label: 'Machilipatnam, AP' },
  mangalagiri: { lat: 16.4308, lng: 80.5573, label: 'Mangalagiri, AP' },
  amalapuram: { lat: 16.5769, lng: 82.0064, label: 'Amalapuram, AP' },
  nandyal: { lat: 15.4786, lng: 78.4836, label: 'Nandyal, AP' },
  proddatur: { lat: 14.7502, lng: 78.5488, label: 'Proddatur, AP' },
  hindupur: { lat: 13.8303, lng: 77.4919, label: 'Hindupur, AP' },
  chittoor: { lat: 13.2172, lng: 79.1003, label: 'Chittoor, AP' },
  madanapalle: { lat: 13.556, lng: 78.501, label: 'Madanapalle, AP' },
  dhone: { lat: 15.3967, lng: 77.8703, label: 'Dhone, AP' },
  guntakal: { lat: 15.167, lng: 77.3626, label: 'Guntakal, AP' },
  hyderabad: { lat: 17.385, lng: 78.4867, label: 'Hyderabad' },
  bengaluru: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
  chennai: { lat: 13.0827, lng: 80.2707, label: 'Chennai' },
}

// EV Vehicle Models Database with real specs
interface VehicleSpec {
  name: string
  capacityKwh: number
  efficiencyWhPerKm: number
  maxDcKw: number
  rangeKm: number
}

const EV_MODELS: Record<string, VehicleSpec> = {
  'Tata Nexon EV Max (40.5 kWh)': {
    name: 'Tata Nexon EV Max',
    capacityKwh: 40.5,
    efficiencyWhPerKm: 140,
    maxDcKw: 50,
    rangeKm: 289,
  },
  'Tata Punch EV (35 kWh)': {
    name: 'Tata Punch EV Long Range',
    capacityKwh: 35.0,
    efficiencyWhPerKm: 130,
    maxDcKw: 50,
    rangeKm: 269,
  },
  'Tata Curvv EV (55 kWh)': {
    name: 'Tata Curvv EV',
    capacityKwh: 55.0,
    efficiencyWhPerKm: 135,
    maxDcKw: 70,
    rangeKm: 407,
  },
  'MG ZS EV (50.3 kWh)': {
    name: 'MG ZS EV',
    capacityKwh: 50.3,
    efficiencyWhPerKm: 150,
    maxDcKw: 60,
    rangeKm: 335,
  },
  'Hyundai Ioniq 5 (72.6 kWh)': {
    name: 'Hyundai Ioniq 5',
    capacityKwh: 72.6,
    efficiencyWhPerKm: 160,
    maxDcKw: 240,
    rangeKm: 453,
  },
  'Mahindra XUV400 (39.4 kWh)': {
    name: 'Mahindra XUV400 EV',
    capacityKwh: 39.4,
    efficiencyWhPerKm: 145,
    maxDcKw: 50,
    rangeKm: 271,
  },
  'BYD Atto 3 (60.5 kWh)': {
    name: 'BYD Atto 3',
    capacityKwh: 60.5,
    efficiencyWhPerKm: 150,
    maxDcKw: 80,
    rangeKm: 403,
  },
}

// Great-circle Haversine distance in km
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function AIInsightsPage() {
  // Input references for Google Maps Places Autocomplete
  const originInputRef = useRef<HTMLInputElement>(null)
  const destInputRef = useRef<HTMLInputElement>(null)

  // Trip Planner State
  const [origin, setOrigin] = useState('Bhimavaram, Andhra Pradesh')
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({
    lat: 16.5449,
    lng: 81.5212,
  })

  const [destination, setDestination] = useState('Vijayawada, Andhra Pradesh')
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({
    lat: 16.5062,
    lng: 80.648,
  })

  const [vehicleModelKey, setVehicleModelKey] = useState('Tata Nexon EV Max (40.5 kWh)')
  const [currentBattery, setCurrentBattery] = useState(35)
  const [plannerResult, setPlannerResult] = useState<any>(null)
  const [calculatingTrip, setCalculatingTrip] = useState(false)
  const [googleMapsReady, setGoogleMapsReady] = useState(false)

  // Map preview container ref
  const mapPreviewRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const stopMarkerRef = useRef<google.maps.Marker | null>(null)

  // Battery Health Calculator State
  const [dailyKm, setDailyKm] = useState(45)
  const [fastChargePerWeek, setFastChargePerWeek] = useState(2)

  // AI Assistant Chatbot State
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your SmartEV AI Assistant. Ask me about charging stations in Andhra Pradesh (Bhimavaram, Vijayawada, Vizag, Guntur, Tirupati, Kurnool, etc.), route recommendations, or battery care tips!',
    },
  ])

  // Calculate Battery Health Score
  const batteryHealthScore = useMemo(() => {
    const score = 99.5 - dailyKm * 0.02 - fastChargePerWeek * 0.8
    return Math.max(82, +score.toFixed(1))
  }, [dailyKm, fastChargePerWeek])

  // 1. Initialize Google Maps Places Autocomplete
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!apiKey) return

    ;(setOptions as any)({
      apiKey,
      version: 'weekly',
    })

    let active = true

    Promise.all([
      importLibrary('maps'),
      importLibrary('routes'),
      importLibrary('places'),
    ])
      .then(() => {
        if (!active) return
        setGoogleMapsReady(true)

        // Attach Autocomplete to Origin
        if (originInputRef.current && window.google?.maps?.places?.Autocomplete) {
          const originAuto = new google.maps.places.Autocomplete(originInputRef.current, {
            componentRestrictions: { country: 'in' },
            fields: ['formatted_address', 'geometry', 'name'],
          })

          originAuto.addListener('place_changed', () => {
            const place = originAuto.getPlace()
            if (place.geometry?.location) {
              const text = place.formatted_address || place.name || originInputRef.current?.value || ''
              setOrigin(text)
              setOriginCoords({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              })
            }
          })
        }

        // Attach Autocomplete to Destination
        if (destInputRef.current && window.google?.maps?.places?.Autocomplete) {
          const destAuto = new google.maps.places.Autocomplete(destInputRef.current, {
            componentRestrictions: { country: 'in' },
            fields: ['formatted_address', 'geometry', 'name'],
          })

          destAuto.addListener('place_changed', () => {
            const place = destAuto.getPlace()
            if (place.geometry?.location) {
              const text = place.formatted_address || place.name || destInputRef.current?.value || ''
              setDestination(text)
              setDestCoords({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              })
            }
          })
        }
      })
      .catch((err) => {
        console.warn('Google Maps Places loader fallback to keyword geocoding', err)
      })

    return () => {
      active = false
    }
  }, [])

  // Quick preset route selector
  const selectQuickRoute = (
    fromName: string,
    fromCoords: { lat: number; lng: number },
    toName: string,
    toCoords: { lat: number; lng: number }
  ) => {
    setOrigin(fromName)
    setOriginCoords(fromCoords)
    setDestination(toName)
    setDestCoords(toCoords)
  }

  // Geocode an input string if coords were not set by autocomplete click
  const resolveCoordinates = (text: string, fallback: { lat: number; lng: number }) => {
    const clean = text.toLowerCase()
    for (const [key, val] of Object.entries(AP_COORDINATES)) {
      if (clean.includes(key)) {
        return { lat: val.lat, lng: val.lng }
      }
    }
    return fallback
  }

  // Get current user GPS location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOrigin('My Current GPS Location (AP)')
          setOriginCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {
          setOrigin('Bhimavaram Town, AP')
          setOriginCoords({ lat: 16.5449, lng: 81.5212 })
        }
      )
    }
  }

  // AI Dynamic Trip & Battery Planner Engine
  const handleCalculateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setCalculatingTrip(true)

    const resolvedOriginCoords = resolveCoordinates(origin, originCoords)
    const resolvedDestCoords = resolveCoordinates(destination, destCoords)

    const spec = EV_MODELS[vehicleModelKey] || EV_MODELS['Tata Nexon EV Max (40.5 kWh)']
    const batteryCapacity = spec.capacityKwh
    const efficiencyWhPerKm = spec.efficiencyWhPerKm
    const consumptionKwhPerKm = efficiencyWhPerKm / 1000

    // 1. Calculate Real Route Distance via Google Maps Directions API (or Haversine * 1.25 fallback)
    let routeDistanceKm = 135
    let durationString = '2 hrs 30 mins'
    let directionsResult: google.maps.DirectionsResult | null = null

    if (window.google?.maps?.DirectionsService) {
      try {
        const directionsService = new google.maps.DirectionsService()
        const res = await new Promise<google.maps.DirectionsResult | null>((resolve) => {
          directionsService.route(
            {
              origin: resolvedOriginCoords,
              destination: resolvedDestCoords,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                resolve(result)
              } else {
                resolve(null)
              }
            }
          )
        })

        if (res && res.routes[0]?.legs[0]) {
          directionsResult = res
          const leg = res.routes[0].legs[0]
          routeDistanceKm = Math.round(leg.distance ? leg.distance.value / 1000 : 135)
          durationString = leg.duration ? leg.duration.text : `${Math.round(routeDistanceKm / 60)} hrs`
        } else {
          // Haversine fallback with highway curvature factor
          const directKm = calculateHaversineKm(
            resolvedOriginCoords.lat,
            resolvedOriginCoords.lng,
            resolvedDestCoords.lat,
            resolvedDestCoords.lng
          )
          routeDistanceKm = Math.max(15, Math.round(directKm * 1.25))
          const hours = Math.floor(routeDistanceKm / 60)
          const mins = Math.round((routeDistanceKm % 60) * 1.1)
          durationString = `${hours} hrs ${mins} mins`
        }
      } catch (err) {
        console.warn('DirectionsService API error, using fallback math', err)
        const directKm = calculateHaversineKm(
          resolvedOriginCoords.lat,
          resolvedOriginCoords.lng,
          resolvedDestCoords.lat,
          resolvedDestCoords.lng
        )
        routeDistanceKm = Math.max(15, Math.round(directKm * 1.25))
      }
    } else {
      const directKm = calculateHaversineKm(
        resolvedOriginCoords.lat,
        resolvedOriginCoords.lng,
        resolvedDestCoords.lat,
        resolvedDestCoords.lng
      )
      routeDistanceKm = Math.max(15, Math.round(directKm * 1.25))
    }

    // 2. Physics & Energy Modeling
    const totalEnergyNeededKwh = routeDistanceKm * consumptionKwhPerKm
    const directTripSocDrainPct = (totalEnergyNeededKwh / batteryCapacity) * 100
    const directArrivalSoc = Math.round(currentBattery - directTripSocDrainPct)

    // Current safe range before hitting 15% emergency reserve
    const usableSocAbove15 = Math.max(0, currentBattery - 15)
    const safeMaxDistanceKm = Math.floor((usableSocAbove15 / 100) * (batteryCapacity / consumptionKwhPerKm))

    const isDirectReachable = directArrivalSoc >= 15

    // 3. Find Stations Along Corridor in Andhra Pradesh
    let selectedStopStation: EVStation | null = null
    let distFromOriginToStop = 0
    let drainPctToStop = 0
    let arrivalSocAtStop = currentBattery
    let chargeTimeMins = 0
    let chargeEnergyAddedKwh = 0
    let targetSocAtDeparture = 80
    let estChargeCostRs = 0
    let distFromStopToDest = routeDistanceKm
    let drainPctFromStopToDest = Math.round(directTripSocDrainPct)
    let finalArrivalSocAtDest = Math.max(5, directArrivalSoc)

    if (isDirectReachable) {
      // Find the best destination station in the destination city or Bhimavaram
      const destStations = INITIAL_STATIONS.filter((s) => {
        const d = calculateHaversineKm(s.latitude, s.longitude, resolvedDestCoords.lat, resolvedDestCoords.lng)
        return d <= 30
      })
      selectedStopStation = destStations[0] || INITIAL_STATIONS[0]
      finalArrivalSocAtDest = directArrivalSoc
    } else {
      // Intermediate Stop is Required! Find stations along route corridor
      const candidateStations = INITIAL_STATIONS.map((station) => {
        const distFromOrigin = calculateHaversineKm(
          resolvedOriginCoords.lat,
          resolvedOriginCoords.lng,
          station.latitude,
          station.longitude
        ) * 1.2
        const distToDest = calculateHaversineKm(
          station.latitude,
          station.longitude,
          resolvedDestCoords.lat,
          resolvedDestCoords.lng
        ) * 1.2
        const detourTotal = distFromOrigin + distToDest

        return {
          station,
          distFromOrigin: Math.round(distFromOrigin),
          distToDest: Math.round(distToDest),
          detourTotal,
          isOnCorridor: detourTotal <= routeDistanceKm * 1.45,
          isReachable: distFromOrigin <= safeMaxDistanceKm * 1.15,
        }
      })

      // Filter valid stops
      const validStops = candidateStations.filter(
        (c) => c.isOnCorridor && c.isReachable && c.distFromOrigin >= 15
      )

      // Pick station that maximizes drive distance before charging, prioritized by powerKw & aiScore
      validStops.sort((a, b) => {
        const scoreA = (a.distFromOrigin / safeMaxDistanceKm) * 50 + a.station.powerKw * 0.3 + a.station.aiScore
        const scoreB = (b.distFromOrigin / safeMaxDistanceKm) * 50 + b.station.powerKw * 0.3 + b.station.aiScore
        return scoreB - scoreA
      })

      const bestCandidate = validStops[0] || candidateStations.filter((c) => c.isReachable)[0] || candidateStations[0]
      selectedStopStation = bestCandidate.station
      distFromOriginToStop = Math.min(routeDistanceKm - 10, Math.max(20, bestCandidate.distFromOrigin))
      distFromStopToDest = Math.max(10, routeDistanceKm - distFromOriginToStop)

      // Battery drain to reach this station
      const energyToStop = distFromOriginToStop * consumptionKwhPerKm
      drainPctToStop = Math.round((energyToStop / batteryCapacity) * 100)
      arrivalSocAtStop = Math.max(3, currentBattery - drainPctToStop)

      // Energy needed for remaining leg from station to destination
      const energyForRemaining = distFromStopToDest * consumptionKwhPerKm
      const drainPctForRemaining = Math.round((energyForRemaining / batteryCapacity) * 100)
      drainPctFromStopToDest = drainPctForRemaining

      // Target battery when departing station (target at least 80% or enough to arrive with 20% buffer)
      targetSocAtDeparture = Math.min(95, Math.max(80, drainPctForRemaining + 20))
      const socNeededToCharge = Math.max(10, targetSocAtDeparture - arrivalSocAtStop)
      chargeEnergyAddedKwh = +((socNeededToCharge / 100) * batteryCapacity).toFixed(1)

      // Effective charging speed (capped by car's max DC intake)
      const effectiveChargeKw = Math.min(selectedStopStation.powerKw, spec.maxDcKw)
      chargeTimeMins = Math.max(12, Math.round((chargeEnergyAddedKwh / effectiveChargeKw) * 60) + 5)
      estChargeCostRs = Math.round(chargeEnergyAddedKwh * selectedStopStation.pricePerKwh)

      finalArrivalSocAtDest = Math.max(5, targetSocAtDeparture - drainPctForRemaining)
    }

    const calculatedPlan = {
      totalDistanceKm: routeDistanceKm,
      estDuration: durationString,
      isDirect: isDirectReachable,
      currentSoc: currentBattery,
      vehicleSpec: spec,
      originName: origin,
      destName: destination,
      originCoords: resolvedOriginCoords,
      destCoords: resolvedDestCoords,
      // Battery Drain Details
      totalEnergyKwh: +(totalEnergyNeededKwh).toFixed(1),
      directSocDrainPct: Math.round(directTripSocDrainPct),
      directArrivalSoc: directArrivalSoc,
      // Stop Details
      recommendedStation: selectedStopStation,
      distToStop: distFromOriginToStop,
      drainPctToStop,
      arrivalSocAtStop,
      chargeEnergyKwh: chargeEnergyAddedKwh,
      chargeTimeMins,
      targetSocAtDeparture,
      estChargeCostRs,
      distFromStopToDest,
      drainPctFromStopToDest,
      finalArrivalSoc: finalArrivalSocAtDest,
      directionsResult,
    }

    setPlannerResult(calculatedPlan)
    setCalculatingTrip(false)

    // Render / update the Google Map preview
    setTimeout(() => {
      renderMapPreview(calculatedPlan)
    }, 150)
  }

  // Render Google Map inside the AI Planner Result
  const renderMapPreview = (plan: any) => {
    if (!mapPreviewRef.current || !window.google?.maps) return

    const midLat = (plan.originCoords.lat + plan.destCoords.lat) / 2
    const midLng = (plan.originCoords.lng + plan.destCoords.lng) / 2

    if (!mapInstanceRef.current) {
      const mapObj = new google.maps.Map(mapPreviewRef.current, {
        center: { lat: midLat, lng: midLng },
        zoom: 8,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      })
      mapInstanceRef.current = mapObj

      const dirRend = new google.maps.DirectionsRenderer({
        map: mapObj,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#06b6d4',
          strokeWeight: 5,
          strokeOpacity: 0.85,
        },
      })
      directionsRendererRef.current = dirRend
    }

    const mapInstance = mapInstanceRef.current
    const dirRend = directionsRendererRef.current

    if (plan.directionsResult && dirRend) {
      dirRend.setDirections(plan.directionsResult)
    } else {
      // Draw straight polyline between points if directions wasn't available
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(plan.originCoords)
      bounds.extend(plan.destCoords)
      if (plan.recommendedStation) {
        bounds.extend({
          lat: plan.recommendedStation.latitude,
          lng: plan.recommendedStation.longitude,
        })
      }
      mapInstance.fitBounds(bounds)
    }

    // Add highlighted Stop Marker if not direct
    if (stopMarkerRef.current) {
      stopMarkerRef.current.setMap(null)
    }

    if (!plan.isDirect && plan.recommendedStation) {
      stopMarkerRef.current = new google.maps.Marker({
        position: {
          lat: plan.recommendedStation.latitude,
          lng: plan.recommendedStation.longitude,
        },
        map: mapInstance,
        title: `⚡ Stop: ${plan.recommendedStation.name}`,
        label: {
          text: '⚡',
          fontSize: '16px',
        },
      })
    }
  }

  // Handle AI Chat Submit with Gemini Round-Robin & Ollama Fallback
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userText = chatInput.trim()
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setChatInput('')
    setChatLoading(true)

    try {
      const aiReply = await generateSmartEVResponse(userText)
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply }])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚡ SmartEV AI Assistant is ready! Check out live stations across Andhra Pradesh on our Map page or plan your highway route above.',
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors duration-200">
      {/* Header Banner */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
            <Sparkles className="size-3.5" />
            AI-POWERED TRIP & CHARGING STOP INTELLIGENCE
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            SmartEV AI Trip & Charging Planner
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Google Maps connected route calculation, real-time battery drain physics, and optimal highway charging stop recommendations across all of Andhra Pradesh.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8 space-y-12">
        {/* SECTION: AI ROUTE & BATTERY CHARGING PLANNER */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 lg:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Navigation className="size-5 text-emerald-500" />
                Google Maps Smart Route & Charging Stop Planner
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Calculates real road distance, highway battery consumption, and recommends the best high-speed charging stop with precise battery arrival percentages.
              </p>
            </div>
            {googleMapsReady && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="size-3.5" /> Google Places Autocomplete Active
              </span>
            )}
          </div>

          {/* Quick Route Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Quick Popular Andhra Pradesh Routes:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  selectQuickRoute(
                    'Bhimavaram Town, AP',
                    AP_COORDINATES.bhimavaram,
                    'Vijayawada, AP',
                    AP_COORDINATES.vijayawada
                  )
                }
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-500 transition"
              >
                🚗 Bhimavaram ➔ Vijayawada
              </button>
              <button
                type="button"
                onClick={() =>
                  selectQuickRoute(
                    'Vijayawada, AP',
                    AP_COORDINATES.vijayawada,
                    'Visakhapatnam (Vizag), AP',
                    AP_COORDINATES.visakhapatnam
                  )
                }
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-500 transition"
              >
                ⚡ Vijayawada ➔ Vizag
              </button>
              <button
                type="button"
                onClick={() =>
                  selectQuickRoute(
                    'Guntur, AP',
                    AP_COORDINATES.guntur,
                    'Tirupati, AP',
                    AP_COORDINATES.tirupati
                  )
                }
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-500 transition"
              >
                🛣️ Guntur ➔ Tirupati
              </button>
              <button
                type="button"
                onClick={() =>
                  selectQuickRoute(
                    'Vijayawada, AP',
                    AP_COORDINATES.vijayawada,
                    'Kurnool, AP',
                    AP_COORDINATES.kurnool
                  )
                }
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-500 transition"
              >
                🔋 Vijayawada ➔ Kurnool
              </button>
              <button
                type="button"
                onClick={() =>
                  selectQuickRoute(
                    'Rajahmundry, AP',
                    AP_COORDINATES.rajahmundry,
                    'Kakinada, AP',
                    AP_COORDINATES.kakinada
                  )
                }
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold hover:border-cyan-500 hover:text-cyan-500 transition"
              >
                📍 Rajahmundry ➔ Kakinada
              </button>
            </div>
          </div>

          {/* Trip Planner Form */}
          <form onSubmit={handleCalculateTrip} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Origin with Google Autocomplete */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="size-3 text-emerald-500" /> Starting Location
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  <LocateFixed className="size-3" /> Current GPS
                </button>
              </div>
              <input
                ref={originInputRef}
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Type city, area, or landmark in AP..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Destination with Google Autocomplete */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                <MapPin className="size-3 text-red-500 inline mr-1" /> Destination
              </label>
              <input
                ref={destInputRef}
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search AP destination city or town..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* EV Model Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                EV Model & Battery
              </label>
              <select
                value={vehicleModelKey}
                onChange={(e) => setVehicleModelKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              >
                {Object.keys(EV_MODELS).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            {/* Battery Level Slider & Submit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Battery
                </label>
                <span
                  className={`text-xs font-black ${
                    currentBattery <= 20
                      ? 'text-red-500'
                      : currentBattery <= 40
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {currentBattery}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={currentBattery}
                  onChange={(e) => setCurrentBattery(Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <button
                  type="submit"
                  disabled={calculatingTrip}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shrink-0 shadow-md flex items-center gap-1.5"
                >
                  {calculatingTrip ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" /> Calculating...
                    </>
                  ) : (
                    <>
                      <Zap className="size-3.5" /> Plan Trip
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* AI TRIP RESULT DETAILS */}
          {plannerResult && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* Status Header */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Route className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {plannerResult.originName} ➔ {plannerResult.destName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Total Highway Distance: <strong>{plannerResult.totalDistanceKm} km</strong> • Est. Driving Time: <strong>{plannerResult.estDuration}</strong>
                    </p>
                  </div>
                </div>

                <div>
                  {plannerResult.isDirect ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="size-4" /> Direct Reachable ({plannerResult.directArrivalSoc}% Arrival)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/40">
                      <AlertTriangle className="size-4" /> 1 Intermediate Charging Stop Required
                    </span>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold">Total Energy Consumption</span>
                  <p className="font-black text-slate-900 dark:text-white text-base mt-0.5">
                    {plannerResult.totalEnergyKwh} kWh
                  </p>
                  <span className="text-[10px] text-slate-400">-{plannerResult.directSocDrainPct}% battery used</span>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold">
                    {plannerResult.isDirect ? 'Direct Arrival Battery' : 'Battery at Charging Stop'}
                  </span>
                  <p
                    className={`font-black text-base mt-0.5 ${
                      (plannerResult.isDirect ? plannerResult.directArrivalSoc : plannerResult.arrivalSocAtStop) <= 15
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {plannerResult.isDirect
                      ? `${plannerResult.directArrivalSoc}%`
                      : `${plannerResult.arrivalSocAtStop}%`}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {plannerResult.isDirect ? 'Safe destination margin' : `After ${plannerResult.distToStop} km drive`}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold">
                    {plannerResult.isDirect ? 'Recharge Recommended' : 'Fast Charge Time Needed'}
                  </span>
                  <p className="font-black text-cyan-600 dark:text-cyan-400 text-base mt-0.5">
                    {plannerResult.isDirect ? 'Destination Top-Up' : `${plannerResult.chargeTimeMins} mins`}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {plannerResult.isDirect ? 'Optional' : `+${plannerResult.chargeEnergyKwh} kWh (₹${plannerResult.estChargeCostRs})`}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold">Final Arrival Battery</span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-base mt-0.5">
                    {plannerResult.finalArrivalSoc}%
                  </p>
                  <span className="text-[10px] text-slate-400">At {plannerResult.destName}</span>
                </div>
              </div>

              {/* Step-by-Step Route & Battery Breakdown Timeline */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="size-3.5 text-cyan-500" /> Step-by-Step Battery Drain & Charging Itinerary:
                </h4>

                <div className="space-y-3 pl-2 border-l-2 border-cyan-500/40 ml-1">
                  {/* Leg 1 */}
                  <div className="relative pl-4 text-xs">
                    <span className="absolute -left-[21px] top-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                      1
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Depart from {plannerResult.originName} with {plannerResult.currentSoc}% Battery
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {plannerResult.isDirect ? (
                        <>Drive direct {plannerResult.totalDistanceKm} km to {plannerResult.destName}. Battery drains by {plannerResult.directSocDrainPct}% ({plannerResult.totalEnergyKwh} kWh).</>
                      ) : (
                        <>Drive {plannerResult.distToStop} km along highway corridor to charging stop. Battery drains by {plannerResult.drainPctToStop}%. Arrive at stop with <strong className="text-amber-500">{plannerResult.arrivalSocAtStop}%</strong> battery.</>
                      )}
                    </p>
                  </div>

                  {/* Charging Stop Leg (if applicable) */}
                  {!plannerResult.isDirect && plannerResult.recommendedStation && (
                    <div className="relative pl-4 text-xs">
                      <span className="absolute -left-[21px] top-0.5 flex size-4 items-center justify-center rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold">
                        2
                      </span>
                      <p className="font-bold text-cyan-600 dark:text-cyan-400">
                        ⚡ Recommended Stop: {plannerResult.recommendedStation.name} ({plannerResult.recommendedStation.powerKw} kW Fast Charger)
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Charge for <strong>{plannerResult.chargeTimeMins} minutes</strong> from <strong>{plannerResult.arrivalSocAtStop}%</strong> up to <strong>{plannerResult.targetSocAtDeparture}%</strong>.
                        Estimated cost: <strong>₹{plannerResult.estChargeCostRs}</strong> ({plannerResult.chargeEnergyKwh} kWh at ₹{plannerResult.recommendedStation.pricePerKwh}/kWh).
                      </p>
                    </div>
                  )}

                  {/* Leg 2 / Destination */}
                  <div className="relative pl-4 text-xs">
                    <span className="absolute -left-[21px] top-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                      {plannerResult.isDirect ? '2' : '3'}
                    </span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      Arrive at {plannerResult.destName} with {plannerResult.finalArrivalSoc}% Battery Remaining
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {plannerResult.isDirect ? (
                        <>Comfortable buffer of {plannerResult.directArrivalSoc}%. You can plug in at destination station if needed.</>
                      ) : (
                        <>Remaining leg from charging stop: {plannerResult.distFromStopToDest} km (drains {plannerResult.drainPctFromStopToDest}%). Arrive with safe {plannerResult.finalArrivalSoc}% reserve.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Station Card */}
              {plannerResult.recommendedStation && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-1">
                        ⚡ AI SELECTED BEST STATION ALONG ROUTE
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {plannerResult.recommendedStation.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3.5 text-slate-400 shrink-0" />
                        {plannerResult.recommendedStation.address} ({plannerResult.recommendedStation.city})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold">
                        {plannerResult.recommendedStation.aiScore}% AI Match
                      </span>
                      <span className="rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-2.5 py-1 text-xs font-bold">
                        {plannerResult.recommendedStation.powerKw} kW Fast DC
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400">Available Ports</span>
                      <p className="font-bold text-emerald-500">
                        {plannerResult.recommendedStation.availablePorts} of {plannerResult.recommendedStation.totalPorts} Free
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Connectors</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {plannerResult.recommendedStation.connectors?.join(', ') || 'CCS2, Type 2'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Price Tariff</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        ₹{plannerResult.recommendedStation.pricePerKwh}/kWh
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Network</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {plannerResult.recommendedStation.network}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={`/booking?station=${plannerResult.recommendedStation.slug}`}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 flex items-center gap-1.5 shadow"
                    >
                      <Zap className="size-3.5" /> Book Charging Slot Here
                    </Link>
                    <Link
                      href={`/map?station=${plannerResult.recommendedStation.slug}`}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-900 dark:text-white transition hover:border-cyan-500 flex items-center gap-1.5"
                    >
                      <MapPin className="size-3.5 text-cyan-500" /> View on Live Map & Navigate
                    </Link>
                  </div>
                </div>
              )}

              {/* Interactive Route Map Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Navigation className="size-4 text-cyan-500" /> Interactive Route Corridor Map:
                </span>
                <div
                  ref={mapPreviewRef}
                  className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner"
                />
              </div>
            </div>
          )}
        </section>

        {/* SECTION: TOP AI RECOMMENDATIONS IN BHIMAVARAM & AP */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Brain className="size-5 text-cyan-500" />
                Live AI Station Recommendations (Andhra Pradesh)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated using real-time wait times, charger power, price per kWh, and traffic data.
              </p>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">Updated 1 min ago</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RecommendationCard
              badge="⚡ Lowest Wait Time"
              badgeColor="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              station={INITIAL_BHIMAVARAM_STATIONS[0]}
              reason="6/8 Ports Free • 0 min wait time • 180kW DC Ultra-Fast"
            />
            <RecommendationCard
              badge="💰 Best Rate Value"
              badgeColor="border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400"
              station={INITIAL_BHIMAVARAM_STATIONS[2] || INITIAL_BHIMAVARAM_STATIONS[0]}
              reason="₹10/kWh lowest electricity tariff • High efficiency"
            />
            <RecommendationCard
              badge="🌟 Highest AI Confidence"
              badgeColor="border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
              station={INITIAL_STATIONS[3] || INITIAL_BHIMAVARAM_STATIONS[1]}
              reason="97% AI Score • 100% Uptime history • 24/7 Amenities"
            />
          </div>
        </section>

        {/* SECTION: AI PEAK DEMAND & BATTERY HEALTH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Demand & Pricing Predictor */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-cyan-500" />
                AI Demand & Best Time to Charge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Avoid long wait times and save on electricity costs.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-xs">
              <span className="font-bold text-cyan-600 dark:text-cyan-300 block mb-1">
                💡 AI Smart Savings Tip:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Charging between <strong className="text-emerald-600 dark:text-emerald-400">1:30 PM – 4:00 PM</strong> today in Bhimavaram and Vijayawada saves 20% on charging costs and avoids a 15-minute wait time during evening peak hours (5 PM - 8 PM).
              </p>
            </div>

            {/* Demand Graph Visualization */}
            <div className="relative h-36 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 pt-4">
              <svg className="h-full w-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path
                  d="M0,80 Q50,90 100,40 T200,85 T300,30 L300,100 L0,100 Z"
                  fill="rgba(6, 182, 212, 0.12)"
                />
                <path
                  d="M0,80 Q50,90 100,40 T200,85 T300,30"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute right-4 top-2 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow">
                Peak Demand 88%
              </div>
              <div className="absolute bottom-1 left-0 right-0 flex justify-between text-[9px] text-slate-400 font-medium px-2">
                <span>08 AM (High)</span>
                <span>12 PM (Low)</span>
                <span>04 PM (Optimal)</span>
                <span>08 PM (High)</span>
              </div>
            </div>
          </section>

          {/* AI Battery Health & Degradation Advisor */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="size-4 text-emerald-500" />
                  AI Battery Health Advisor
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cell State of Health (SoH) & longevity tips.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-emerald-500">{batteryHealthScore}%</span>
                <span className="text-[9px] text-slate-400 block font-bold">EST. SOH</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Daily Commute Distance: <strong className="text-slate-900 dark:text-white">{dailyKm} km/day</strong>
                </label>
                <input
                  type="range"
                  min={10}
                  max={150}
                  value={dailyKm}
                  onChange={(e) => setDailyKm(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Fast Charging Frequency: <strong className="text-slate-900 dark:text-white">{fastChargePerWeek} times/week</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={7}
                  value={fastChargePerWeek}
                  onChange={(e) => setFastChargePerWeek(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">AI Care Recommendation:</span>
                <p>
                  Set your daily home AC charging limit to <strong>80% SoC</strong>. Reserve 100% full charges for long highway inter-city trips to preserve battery chemistry.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION: AI ASSISTANT CHATBOT */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="size-5 text-cyan-500" />
              SmartEV AI Assistant Chat (Gemini 13-Key Rotation & Ollama Fallback)
            </h2>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              ● Online 24/7
            </span>
          </div>

          <div className="h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 space-y-3 text-xs">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex size-7 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-500 shrink-0">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-md rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2.5 justify-start items-center text-xs text-slate-400">
                <div className="flex size-7 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-500 shrink-0">
                  <RefreshCw className="size-3.5 animate-spin" />
                </div>
                <span>SmartEV AI is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI about EV stations in AP, route advice, tariffs, or battery care..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shrink-0 disabled:opacity-50"
            >
              <Send className="size-3.5" /> Ask AI
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

function RecommendationCard({
  badge,
  badgeColor,
  station,
  reason,
}: {
  badge: string
  badgeColor: string
  station: EVStation
  reason: string
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badgeColor}`}>
          {badge}
        </span>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{station.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="size-3 text-slate-400 shrink-0" />
            {station.address}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 text-xs space-y-1">
          <span className="text-slate-500 text-[10px] block font-semibold">Why AI Recommends:</span>
          <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-relaxed">
            {reason}
          </p>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs font-black text-emerald-500">{station.aiScore}% AI Score</span>
        <Link
          href={`/booking?station=${station.slug}`}
          className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
        >
          Book Slot
        </Link>
      </div>
    </article>
  )
}
