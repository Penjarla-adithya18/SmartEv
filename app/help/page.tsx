'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, ChevronDown, Search, Zap, PhoneCall, Mail } from 'lucide-react'

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How do I book an EV charging slot in Bhimavaram?',
      a: 'Navigate to Stations or Map, pick your station (e.g., Bhimavaram EV Super Hub), select your preferred time slot and plug connector, enter your phone number, and verify the 6-digit SMS OTP to lock in your reservation.',
    },
    {
      q: 'What plug connectors are supported?',
      a: 'SmartEV stations support CCS Combo 2 (CCS2) for DC Fast Charging, Type 2 for AC Charging, CHAdeMO, and GB/T standards compatible with all Tata, MG, Hyundai, Mahindra, and BYD EV models.',
    },
    {
      q: 'How do station owners add their charging location?',
      a: 'Station owners can click "Add Your Station +" in the top navigation bar, fill in station name, address in Bhimavaram, charger power kW rating, electricity rate per kWh, and submit it directly to our live map.',
    },
    {
      q: 'What is the cancellation policy for slot reservations?',
      a: 'Slot reservations can be cancelled free of charge up to 15 minutes before your scheduled start time directly from your Driver Profile page.',
    },
    {
      q: 'How does the Twilio SMS verification work?',
      a: 'When booking a slot or logging in, a 6-digit dynamic OTP is sent via Twilio SMS to verify your mobile phone number securely without needing passwords.',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-10 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-300">
            <HelpCircle className="size-3.5" /> SMART EV HELP CENTER
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            How Can We Help You Today?
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Find quick answers to common questions about charging, slot reservations, station listings, and Twilio OTP verification.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 pt-10 lg:px-8 space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between font-bold text-slate-900 dark:text-white text-sm text-left"
                >
                  {faq.q}
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-cyan-500' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 text-center space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Still need assistance?</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our 24/7 support team is available to help drivers and station owners in Bhimavaram.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/contact"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
