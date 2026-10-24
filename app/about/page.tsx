'use client'

import Link from 'next/link'
import {
  Zap,
  Sparkles,
  ShieldCheck,
  BatteryCharging,
  Cpu,
  MapPin,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      {/* Hero Header */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-12 lg:px-8 text-center transition-colors">
        <div className="mx-auto max-w-4xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-3.5" /> REVOLUTIONIZING EV MOBILITY
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl">
            Building Andhra Pradesh’s Smartest AI-Powered EV Charging Network
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SmartEV bridges EV drivers and station owners in Bhimavaram with real-time connector tracking, dynamic Twilio SMS reservations, and predictive AI route optimization.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-12 lg:px-8 space-y-16">
        {/* Key Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm text-center space-y-1">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">48+</span>
            <p className="text-xs text-slate-500 font-medium">Connectors Pinned</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm text-center space-y-1">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">180 kW</span>
            <p className="text-xs text-slate-500 font-medium">Ultra Fast DC Speeds</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm text-center space-y-1">
            <span className="text-3xl font-black text-amber-500 dark:text-amber-400">99.8%</span>
            <p className="text-xs text-slate-500 font-medium">Uptime Guarantee</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm text-center space-y-1">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">1,500+</span>
            <p className="text-xs text-slate-500 font-medium">Drivers Served</p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">OUR MISSION</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Zero Charging Range Anxiety for Every EV Driver
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We empower drivers to easily discover available fast chargers, estimate battery arrival levels, reserve slots in advance, and pay transparent tariffs per kWh without unexpected surge costs.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> Live interactive map with exact user location coordinates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> Twilio SMS OTP phone verification for secure 1-click slot booking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> AI Insights battery health advisor & peak demand savings predictor
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500 font-bold">
                <Cpu className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Powered by Smart EV AI</h3>
                <p className="text-xs text-slate-500">Real-Time Machine Learning Engine</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our FastAPI AI microservice processes traffic flow, historical plug utilization, and grid power tariffs to give drivers personalized charging advice in Bhimavaram.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to Experience Smart EV Charging?</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Find nearby chargers in Bhimavaram or register your own station to earn revenue.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/stations"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Explore Stations
            </Link>
            <Link
              href="/submit-station"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Add Your Station
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
