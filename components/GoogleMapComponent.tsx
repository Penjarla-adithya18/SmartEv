'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import type { EVStation } from '@/lib/stationsData'
import { useTheme } from './ThemeProvider'
import {
  AlertCircle,
  Compass,
  MapPin,
  Navigation,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowUpRight,
  Plus,
  Minus,
  ExternalLink,
  GripVertical,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GoogleMapProps {
  stations: EVStation[]
  selectedStation?: EVStation | null
  onSelectStation?: (station: EVStation) => void
  userLocation?: { lat: number; lng: number } | null
  showDirectionsTo?: EVStation | null
  waypoints?: EVStation[]
  onAddWaypoint?: (station: EVStation) => void
  onRemoveWaypoint?: (stationId: string) => void
  height?: string
  zoom?: number
  center?: { lat: number; lng: number }
  className?: string
}

// Dark map style matching SmartEV dark theme (#0b1220)
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b1220' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1220' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a99ad' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#031327' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
]

export default function GoogleMapComponent({
  stations,
  selectedStation,
  onSelectStation,
  userLocation,
  showDirectionsTo,
  waypoints = [],
  onAddWaypoint,
  onRemoveWaypoint,
  height = '100%',
  zoom = 13,
  center = { lat: 16.5449, lng: 81.5212 }, // Default Bhimavaram, Andhra Pradesh
  className = '',
}: GoogleMapProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number }>(
    userLocation || center || { lat: 16.5505, lng: 81.5065 }
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)
  const [locating, setLocating] = useState(false)

  // Expose global handler for InfoWindow HTML button clicks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).__addStopOnRoute = (stationId: string) => {
        const found = stations.find((s) => s.id === stationId)
        if (found && onAddWaypoint) {
          onAddWaypoint(found)
        }
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__addStopOnRoute
      }
    }
  }, [stations, onAddWaypoint])

  const [cardPos, setCardPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 })

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: cardPos.x,
      initialY: cardPos.y,
    }
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const dx = clientX - dragStartRef.current.startX
      const dy = clientY - dragStartRef.current.startY
      setCardPos({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      })
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleMove)
      window.addEventListener('touchend', handleEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return

    if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
      setLoadError('Google Maps API key missing in .env.local')
      return
    }

    setOptions({
      apiKey: apiKey,
      version: 'weekly',
    })

    let cancelled = false

    Promise.all([
      importLibrary('maps'),
      importLibrary('routes'),
      importLibrary('places'),
    ])
      .then(() => {
        if (cancelled || !mapRef.current) return
        const initialCenter = center || { lat: 16.5449, lng: 81.5212 }
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: zoom,
          styles: theme === 'dark' ? DARK_MAP_STYLE : [],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })

        infoWindowRef.current = new google.maps.InfoWindow()
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#06b6d4',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        })

        setMap(mapInstance)
        setIsLoaded(true)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Google Maps load error:', err)
        setLoadError(err.message || 'Failed to load Google Maps API')
      })

    return () => {
      cancelled = true
    }
  }, [apiKey])

  // Dynamically update map style on theme toggle
  useEffect(() => {
    if (map) {
      map.setOptions({ styles: theme === 'dark' ? DARK_MAP_STYLE : [] })
    }
  }, [theme, map])

  // Get status color helper
  const getStatusColor = (status: EVStation['status']) => {
    switch (status) {
      case 'available':
        return '#10b981' // emerald
      case 'busy':
        return '#f59e0b' // amber
      case 'full':
        return '#ef4444' // red
      default:
        return '#64748b' // slate
    }
  }

  // Create SVG Data URL for Custom Marker Pin
  const createMarkerSvg = (station: EVStation, isSelected: boolean) => {
    const color = getStatusColor(station.status)
    const stroke = isSelected ? '#38bdf8' : '#ffffff'
    const strokeWidth = isSelected ? 3 : 2
    const size = isSelected ? 44 : 36

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 38 48" fill="none">
        <path d="M19 0C8.50659 0 0 8.50659 0 19C0 30.25 14.5 45.25 17.875 47.375C18.5625 47.8125 19.4375 47.8125 20.125 47.375C23.5 45.25 38 30.25 38 19C38 8.50659 29.4934 0 19 0Z" fill="${color}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="19" cy="18" r="10" fill="#0b1220" />
        <path d="M18 11L13 19H18.5L17.5 25L23.5 16H18L19.5 11Z" fill="#38bdf8" />
      </svg>
    `
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
  }

  // Update Station Markers on Map
  useEffect(() => {
    if (!map || !isLoaded || typeof google === 'undefined') return

    // Clear removed markers
    markersRef.current.forEach((marker, id) => {
      if (!stations.some((s) => s.id === id)) {
        marker.setMap(null)
        markersRef.current.delete(id)
      }
    })

    // Add or update markers
    stations.forEach((station) => {
      const isSelected = selectedStation?.id === station.id
      const position = { lat: station.latitude, lng: station.longitude }

      let marker = markersRef.current.get(station.id)

      if (!marker) {
        marker = new google.maps.Marker({
          position,
          map,
          title: station.name,
          icon: {
            url: createMarkerSvg(station, isSelected),
            scaledSize: new google.maps.Size(isSelected ? 44 : 36, isSelected ? 44 : 36),
            anchor: new google.maps.Point(isSelected ? 22 : 18, isSelected ? 44 : 36),
          },
        })

        marker.addListener('click', () => {
          onSelectStation?.(station)
          openInfoWindow(map, marker!, station)
        })

        markersRef.current.set(station.id, marker)
      } else {
        marker.setPosition(position)
        marker.setIcon({
          url: createMarkerSvg(station, isSelected),
          scaledSize: new google.maps.Size(isSelected ? 44 : 36, isSelected ? 44 : 36),
          anchor: new google.maps.Point(isSelected ? 22 : 18, isSelected ? 44 : 36),
        })
        if (isSelected) {
          marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1)
        }
      }
    })
  }, [map, isLoaded, stations, selectedStation])

  // Center & Open InfoWindow when selectedStation changes externally
  useEffect(() => {
    if (!map || !selectedStation) return
    const marker = markersRef.current.get(selectedStation.id)
    if (marker) {
      map.panTo(marker.getPosition()!)
      openInfoWindow(map, marker, selectedStation)
    }
  }, [selectedStation, map])

  // Auto-request browser geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const livePos = { lat: position.coords.latitude, lng: position.coords.longitude }
          setCurrentPos(livePos)
          if (map) map.panTo(livePos)
        },
        (err) => {
          console.log('Browser geolocation prompt skipped or denied, using JBR Convention location.')
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
  }, [map, userLocation])

  // Geolocation / User Position Marker ("Your Location" Symbol)
  useEffect(() => {
    if (!map || !isLoaded || typeof google === 'undefined') return
    const pos = userLocation || currentPos || { lat: 16.5505, lng: 81.5065 }

    const locationSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="24" cy="24" r="10" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
        <circle cx="24" cy="24" r="4" fill="#ffffff"/>
      </svg>
    `
    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(locationSvg)

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: pos,
        map,
        title: '🎯 Your Location: Near JBR Convention, Bhimavaram',
        zIndex: google.maps.Marker.MAX_ZINDEX + 10,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 24),
        },
      })
    } else {
      userMarkerRef.current.setPosition(pos)
    }
  }, [map, isLoaded, userLocation, currentPos])

  // Render Driving Directions when requested (with road corridor waypoints)
  useEffect(() => {
    if (!map || !isLoaded || typeof google === 'undefined') return

    if (showDirectionsTo) {
      const origin = userLocation || currentPos || { lat: 16.5414, lng: 81.5273 }
      const destination = { lat: showDirectionsTo.latitude, lng: showDirectionsTo.longitude }

      const routeWaypoints: google.maps.DirectionsWaypoint[] = (waypoints || []).map((wp) => ({
        location: new google.maps.LatLng(wp.latitude, wp.longitude),
        stopover: true,
      }))

      const ds = new google.maps.DirectionsService()
      ds.route(
        {
          origin,
          destination,
          waypoints: routeWaypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result)
            let totalMeters = 0
            let totalSecs = 0
            result.routes[0]?.legs.forEach((leg) => {
              totalMeters += leg.distance?.value || 0
              totalSecs += leg.duration?.value || 0
            })
            const km = (totalMeters / 1000).toFixed(1) + ' km'
            const mins = Math.round(totalSecs / 60)
            const hrs = Math.floor(mins / 60)
            const remMins = mins % 60
            const durationText = hrs > 0 ? `${hrs} hr ${remMins} min` : `${mins} min`

            setRouteInfo({
              distance: km,
              duration: durationText,
            })
          } else {
            console.warn('Directions request failed:', status)
          }
        }
      )
    } else {
      directionsRendererRef.current?.set('directions', null)
      setRouteInfo(null)
    }
  }, [map, isLoaded, showDirectionsTo, waypoints, currentPos, center])

  // Open InfoWindow Popup HTML with "Add as Stop on Route" & Highway Amenities
  const openInfoWindow = (
    mapInstance: google.maps.Map,
    marker: google.maps.Marker,
    station: EVStation
  ) => {
    if (!infoWindowRef.current) return

    const statusBadge =
      station.status === 'available'
        ? '<span style="background:rgba(16,185,129,0.15);color:#10b981;padding:3px 10px;border-radius:9999px;font-weight:600;font-size:11px;border:1px solid rgba(16,185,129,0.3);">● Available (' +
          station.availablePorts +
          '/' +
          station.totalPorts +
          ')</span>'
        : station.status === 'busy'
        ? '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 10px;border-radius:9999px;font-weight:600;font-size:11px;border:1px solid rgba(245,158,11,0.3);">◷ Busy (' +
          station.waitMinutes +
          'm wait)</span>'
        : '<span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:3px 10px;border-radius:9999px;font-weight:600;font-size:11px;border:1px solid rgba(239,68,68,0.3);">✕ Full</span>'

    const htmlContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 270px; color: #0b1220;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
          <div>
            <h4 style="margin: 0; font-weight: 700; font-size: 14px; color: #0b1220;">${station.name}</h4>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">${station.address}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px;">
          <div>${statusBadge}</div>
          <span style="font-size: 11px; font-weight: 700; color: #0284c7;">⚡ ${station.powerKw} kW DC</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 8px; background: #f1f5f9; padding: 6px 8px; border-radius: 8px; color: #334155;">
          <div><strong>Price:</strong> ₹${station.pricePerKwh}/kWh</div>
          <div><strong>Rating:</strong> ⭐ ${station.rating || 4.5}</div>
        </div>
        <div style="margin-bottom: 6px;">
          <button
            onclick="window.__addStopOnRoute && window.__addStopOnRoute('${station.id}')"
            style="width: 100%; text-align: center; background: #10b981; color: white; border: none; cursor: pointer; padding: 7px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            ➕ Add as Stop on Route
          </button>
        </div>
        <div style="display: flex; gap: 6px;">
          <a href="/booking?station=${station.slug}" style="flex: 1; text-align: center; background: #0284c7; color: white; text-decoration: none; padding: 6px 8px; border-radius: 6px; font-weight: 600; font-size: 11px;">Reserve</a>
          <a href="/stations/${station.slug}" style="flex: 1; text-align: center; background: #e2e8f0; color: #0f172a; text-decoration: none; padding: 6px 8px; border-radius: 6px; font-weight: 600; font-size: 11px;">Details</a>
        </div>
      </div>
    `

    infoWindowRef.current.setContent(htmlContent)
    infoWindowRef.current.open(mapInstance, marker)
  }

  // Handle Geolocation Click
  const handleLocateUser = () => {
    if (navigator.geolocation) {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          if (map) {
            map.panTo(userPos)
            map.setZoom(14)
          }
          setLocating(false)
        },
        () => {
          setLocating(false)
        }
      )
    }
  }

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (map) {
      const z = map.getZoom() || 13
      map.setZoom(z + 1)
    }
  }

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (map) {
      const z = map.getZoom() || 13
      map.setZoom(z - 1)
    }
  }

  const handleStartNavigation = (st?: EVStation | null) => {
    const target = st || showDirectionsTo || selectedStation
    if (target && map) {
      map.setZoom(15)
      map.panTo({ lat: target.latitude, lng: target.longitude })
    }
  }

  if (loadError) {
    return (
      <div
        style={{ height }}
        className={`flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0b1220] p-6 text-center text-slate-300 ${className}`}
      >
        <AlertCircle className="size-10 text-amber-400" />
        <h3 className="mt-3 font-bold text-white text-lg">Google Maps Unavailable</h3>
        <p className="mt-1 max-w-md text-xs text-slate-400">{loadError}</p>
        <p className="mt-3 text-xs text-cyan-400">
          Make sure your <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>.env.local</code> is valid.
        </p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 ${className}`} style={{ height }}>
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0b1220] text-slate-400">
          <RefreshCw className="size-8 animate-spin text-cyan-400" />
          <p className="mt-3 text-sm font-medium">Loading Google Maps...</p>
        </div>
      )}

      {/* Map Element */}
      <div ref={mapRef} className="h-full w-full bg-[#0b1220]" />

      {/* Map Floating Controls: My Location + Zoom In (+) / Zoom Out (-) */}
      <div className="absolute left-4 top-4 z-30 pointer-events-auto flex items-center gap-2">
        <button
          onClick={handleLocateUser}
          disabled={locating}
          title="Find My Location"
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220]/90 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-slate-800 active:scale-95"
        >
          <Navigation className={`size-3.5 text-cyan-400 ${locating ? 'animate-bounce' : ''}`} />
          {locating ? 'Locating...' : 'My Location'}
        </button>

        {/* Zoom In (+) & Zoom Out (-) Controls */}
        <div className="flex items-center rounded-xl border border-slate-700 bg-[#0b1220]/90 p-1 shadow-xl backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            title="Zoom In (+)"
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-white hover:bg-slate-800 active:bg-cyan-500/20 active:scale-95 transition"
          >
            <Plus className="size-4 text-cyan-400 font-bold" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-0.5" />
          <button
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-white hover:bg-slate-800 active:bg-cyan-500/20 active:scale-95 transition"
          >
            <Minus className="size-4 text-cyan-400 font-bold" />
          </button>
        </div>
      </div>

      {/* Draggable Route directions info overlay below fullscreen button */}
      {routeInfo && (
        <div
          style={{ transform: `translate3d(${cardPos.x}px, ${cardPos.y}px, 0)` }}
          className="absolute top-16 right-4 z-30 select-none rounded-2xl border border-cyan-500/40 bg-[#0b1220]/95 p-3.5 text-xs text-white shadow-2xl backdrop-blur-md space-y-2.5 min-w-[250px] transition-shadow cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div
              onMouseDown={handleStartDrag}
              onTouchStart={handleStartDrag}
              className="flex items-center gap-1.5 text-cyan-300 font-semibold cursor-grab active:cursor-grabbing flex-1"
              title="Drag to move card"
            >
              <GripVertical className="size-4 text-slate-400 shrink-0" />
              <Compass className="size-4 animate-pulse text-cyan-400" />
              Active Route
            </div>
            <button
              onClick={() => handleStartNavigation()}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-emerald-400 transition shadow shrink-0"
            >
              🚀 Start Nav
            </button>
          </div>

          <div className="flex justify-between text-slate-300 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block">Distance</span>
              <p className="font-bold text-white text-sm">{routeInfo.distance}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Est. Time</span>
              <p className="font-bold text-cyan-400 text-sm">{routeInfo.duration}</p>
            </div>
          </div>

          {/* Corridor Waypoints List */}
          {waypoints && waypoints.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Corridor Stops ({waypoints.length}):
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {waypoints.map((wp, idx) => (
                  <div
                    key={wp.id}
                    className="flex items-center justify-between gap-1 text-[11px] bg-slate-900/90 px-2 py-1 rounded-lg border border-emerald-500/30"
                  >
                    <span className="truncate max-w-[170px] text-slate-200">
                      ⚡ Stop {idx + 1}: {wp.name}
                    </span>
                    {onRemoveWaypoint && (
                      <button
                        type="button"
                        onClick={() => onRemoveWaypoint(wp.id)}
                        className="text-slate-400 hover:text-rose-400 font-bold px-1 rounded transition"
                        title="Remove stop"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Legend Overlay */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b1220]/90 px-4 py-2.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-xl backdrop-blur-md">
        <span className="flex items-center gap-1.5 font-bold text-sky-500">
          <span className="size-3 rounded-full bg-sky-400 border-2 border-white ring-2 ring-sky-500/30" />
          🎯 Your Location
        </span>
        <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          Available
        </span>
        <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
          <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
          Busy
        </span>
        <span className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
          <span className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
          Full
        </span>
      </div>
    </div>
  )
}
