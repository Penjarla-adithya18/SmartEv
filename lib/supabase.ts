import { createClient } from '@supabase/supabase-js'
import type { EVStation } from './stationsData'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-supabase-project')

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to convert database row format to EVStation format
export function mapRowToEVStation(row: any): EVStation {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    address: row.address,
    city: row.city || 'Bhimavaram',
    rating: Number(row.rating || 4.8),
    totalPorts: Number(row.total_ports || 4),
    availablePorts: Number(row.available_ports || 4),
    pricePerKwh: Number(row.price_per_kwh || 12),
    powerKw: Number(row.power_kw || 150),
    fastCharging: Boolean(row.fast_charging),
    connectors: Array.isArray(row.connectors) ? row.connectors : ['CCS2', 'Type 2'],
    status: row.status || 'available',
    waitMinutes: Number(row.wait_minutes || 0),
    aiScore: Number(row.ai_score || 90),
    image: row.image_url || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60',
    operatingHours: row.operating_hours || '24/7 Open',
    network: row.network || 'Owner Network',
  }
}

// Fetch all owner-added stations from Supabase
export async function getStationsFromSupabase(): Promise<EVStation[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch stations error:', error.message)
      return null
    }
    return data ? data.map(mapRowToEVStation) : []
  } catch (err) {
    console.warn('Failed to query Supabase:', err)
    return null
  }
}

// Save a new owner station into Supabase
export async function saveStationToSupabase(station: Partial<EVStation>): Promise<EVStation | null> {
  if (!supabase) return null
  try {
    const slug = station.slug || (station.name || 'station').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
    const payload = {
      slug,
      name: station.name || 'Owner Charging Station',
      latitude: station.latitude || 16.5449,
      longitude: station.longitude || 81.5212,
      address: station.address || 'Bhimavaram',
      city: station.city || 'Bhimavaram',
      rating: station.rating || 4.8,
      total_ports: station.totalPorts || 4,
      available_ports: station.availablePorts || 4,
      price_per_kwh: station.pricePerKwh || 12,
      power_kw: station.powerKw || 120,
      fast_charging: station.fastCharging ?? true,
      connectors: station.connectors || ['CCS2', 'Type 2'],
      status: station.status || 'available',
      wait_minutes: station.waitMinutes || 0,
      ai_score: station.aiScore || 90,
      image_url: station.image || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60',
      operating_hours: station.operatingHours || '24/7 Open',
      network: station.network || 'Owner Network',
    }

    const { data, error } = await supabase.from('stations').insert([payload]).select().single()
    if (error) {
      console.warn('Supabase insert station error:', error.message)
      return null
    }
    return data ? mapRowToEVStation(data) : null
  } catch (err) {
    console.warn('Failed to insert into Supabase:', err)
    return null
  }
}
