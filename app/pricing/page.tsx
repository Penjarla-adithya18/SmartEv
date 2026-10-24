'use client'

import Link from 'next/link'
import { ArrowRight, Check, Zap, BatteryCharging, Shield, Sparkles } from 'lucide-react'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-10 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Zap className="size-3.5" /> TRANSPARENT EV PRICING
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl">
            Simple Pay-As-You-Go & Membership Plans
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            No hidden fees, no surge penalties. Pay exact electricity tariffs per kWh or upgrade to Driver Pass Pro for 15% discount on all stations.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-12 lg:px-8 space-y-12">
        {/* Pricing Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay As You Go</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Free / Standard</h3>
              <p className="text-xs text-slate-500">Perfect for casual EV drivers and town commutes.</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₹10 – ₹13.50 <span className="text-xs text-slate-500 font-normal">/ kWh</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> Real-time charger availability map
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> Pay via UPI / Cards / Wallet
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> Twilio SMS OTP slot booking
                </li>
              </ul>
            </div>
            <Link
              href="/stations"
              className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 py-3 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Start Charging Free
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-[#0f172a] p-6 shadow-xl flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider">
              MOST POPULAR
            </span>
            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Driver Pass Pro</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Driver Pass Pro</h3>
              <p className="text-xs text-slate-500">For daily commuters and frequent highway chargers.</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₹499 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> <strong>15% OFF per kWh</strong> on all DC fast chargers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> Priority 1-click slot reservation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> AI route stop optimization & forecast
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" /> Zero booking cancellation fees
                </li>
              </ul>
            </div>
            <Link
              href="/booking"
              className="w-full text-center rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-md"
            >
              Get Pro Pass
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Station Owners</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Owner Network</h3>
              <p className="text-xs text-slate-500">List your charging station & earn passive income.</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                0% Fee <span className="text-xs text-slate-500 font-normal">first 3 months</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-cyan-500 shrink-0" /> Automated payouts & load balancing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-cyan-500 shrink-0" /> Real-time power usage dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-cyan-500 shrink-0" /> Dynamic tariff customization
                </li>
              </ul>
            </div>
            <Link
              href="/submit-station"
              className="w-full text-center rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Add Your Station
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
