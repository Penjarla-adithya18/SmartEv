'use client'

import { ShieldCheck, Lock, Eye, Server } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-10 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" /> DATA PROTECTION & PRIVACY
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            SmartEV Privacy Policy
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Last Updated: August 2026. How we collect, use, and protect driver geolocation, phone OTP data, and station records.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 pt-10 lg:px-8 space-y-8 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="size-4 text-emerald-500" /> 1. Information We Collect
          </h2>
          <p>
            When you use SmartEV, we collect limited essential information required to facilitate EV charger discovery, turn-by-turn navigation, and slot reservations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-slate-400">
            <li><strong>Geolocation Data:</strong> Used strictly to pinpoint your position on the map and display distance to stations in Bhimavaram.</li>
            <li><strong>Mobile Phone Number:</strong> Used via Twilio SMS API to send dynamic verification OTPs for slot bookings.</li>
            <li><strong>Vehicle Specifications:</strong> Vehicle battery size and connector preference for AI Insights calculations.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="size-4 text-cyan-500" /> 2. Data Usage & Security
          </h2>
          <p>
            Your data is encrypted in transit and at rest using SSL/TLS protocols and Supabase Database RLS security policies. We never sell your personal data or phone number to third-party advertisers.
          </p>
        </div>
      </div>
    </main>
  )
}
