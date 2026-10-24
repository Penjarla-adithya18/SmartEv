'use client'

import { FileText, Shield, Zap } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-10 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-300">
            <FileText className="size-3.5" /> LEGAL AGREEMENT
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Effective Date: August 2026. Rules and terms governing slot reservations, charging station listings, and driver usage.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 pt-10 lg:px-8 space-y-8 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. EV Slot Reservations</h2>
          <p>
            Drivers must arrive within 10 minutes of their confirmed booking slot. Unclaimed slots will automatically be released back to the live public queue.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Station Owner Responsibilities</h2>
          <p>
            Station owners listing their chargers on SmartEV must maintain accurate plug count info, connector working condition, and operational hours.
          </p>
        </div>
      </div>
    </main>
  )
}
