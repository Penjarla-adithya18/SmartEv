-- ========================================================
-- SmartEV Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- ========================================================

-- 1. Create EV Stations Table
CREATE TABLE IF NOT EXISTS public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bhimavaram',
  rating NUMERIC(3, 2) DEFAULT 4.8,
  total_ports INT NOT NULL DEFAULT 4,
  available_ports INT NOT NULL DEFAULT 4,
  price_per_kwh NUMERIC(6, 2) NOT NULL DEFAULT 12.00,
  power_kw INT NOT NULL DEFAULT 150,
  fast_charging BOOLEAN NOT NULL DEFAULT true,
  connectors TEXT[] NOT NULL DEFAULT ARRAY['CCS2', 'Type 2'],
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'full', 'offline')),
  wait_minutes INT DEFAULT 0,
  ai_score INT DEFAULT 90,
  image_url TEXT,
  operating_hours TEXT DEFAULT '24/7 Open',
  network TEXT DEFAULT 'Owner Network',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Chargers Table
CREATE TABLE IF NOT EXISTS public.chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  charger_type TEXT NOT NULL DEFAULT 'CCS2',
  power_kw INT NOT NULL DEFAULT 150,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'charging', 'reserved', 'offline')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  charger_id UUID REFERENCES public.chargers(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  vehicle_number TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  total_amount NUMERIC(8, 2),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  otp TEXT DEFAULT '1234',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access to stations & chargers
CREATE POLICY "Allow public read stations" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Allow public insert stations" ON public.stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stations" ON public.stations FOR UPDATE USING (true);

CREATE POLICY "Allow public read chargers" ON public.chargers FOR SELECT USING (true);
CREATE POLICY "Allow public insert chargers" ON public.chargers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Seed Initial Owner-Added Stations in Bhimavaram, Andhra Pradesh
INSERT INTO public.stations (slug, name, latitude, longitude, address, city, rating, total_ports, available_ports, price_per_kwh, power_kw, fast_charging, connectors, status, wait_minutes, ai_score, image_url, operating_hours, network)
VALUES
(
  'bhimavaram-ev-super-hub',
  'Bhimavaram EV Super Hub',
  16.5449,
  81.5212,
  'J P Road, Near Town Railway Station, Bhimavaram',
  'Bhimavaram',
  4.9,
  8,
  6,
  12.00,
  180,
  true,
  ARRAY['CCS2', 'Type 2', 'CHAdeMO'],
  'available',
  0,
  96,
  'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60',
  '24/7 Open',
  'Apex Energy Owner'
),
(
  'grand-arya-ev-station-bhimavaram',
  'Grand Arya EV Fast Charger',
  16.5412,
  81.5275,
  'Bypass Road, Opposite Grand Arya Hotel, Bhimavaram',
  'Bhimavaram',
  4.7,
  6,
  2,
  13.50,
  120,
  true,
  ARRAY['CCS2', 'Type 2'],
  'busy',
  10,
  88,
  'https://images.unsplash.com/photo-1558441719-23451ead6601?w=800&auto=format&fit=crop&q=60',
  '24/7 Open',
  'Grand Arya Group'
),
(
  'srkr-campus-green-charge-bhimavaram',
  'SRKR Engineering Campus Charge',
  16.5385,
  81.5035,
  'SRKR Engineering College Campus, China Amiram, Bhimavaram',
  'Bhimavaram',
  4.8,
  4,
  4,
  10.00,
  60,
  false,
  ARRAY['Type 2'],
  'available',
  0,
  92,
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60',
  '06:00 AM - 10:00 PM',
  'SRKR Green Initiative'
)
ON CONFLICT (slug) DO NOTHING;
