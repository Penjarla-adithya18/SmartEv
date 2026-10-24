'use client'

import { Code, Terminal, Zap, Check, Copy } from 'lucide-react'

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-300">
            <Code className="size-3.5" /> DEVELOPER API DOCUMENTATION v1.0
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            SmartEV Developer REST API
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Integrate live EV charging station availability, slot reservation endpoints, and Twilio SMS verification into your application.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 pt-8 lg:px-8 space-y-8">
        {/* Endpoint 1 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-black text-slate-950 font-mono">GET</span>
              <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white">/api/v1/stations</h3>
            </div>
            <span className="text-xs text-slate-500">Live Station Search & Availability</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Returns real-time connector availability, pricing per kWh, charger power, and AI scores for stations in Bhimavaram and nearby.
          </p>

          <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
            <pre>{`// Request Example
GET /api/v1/stations?city=Bhimavaram&status=available

// Response 200 OK
{
  "success": true,
  "stations": [
    {
      "id": "bv-s1",
      "name": "Bhimavaram EV Super Hub",
      "powerKw": 180,
      "pricePerKwh": 12,
      "availablePorts": 6,
      "totalPorts": 8,
      "aiScore": 96
    }
  ]
}`}</pre>
          </div>
        </div>

        {/* Endpoint 2 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-cyan-500 px-2.5 py-1 text-xs font-black text-slate-950 font-mono">POST</span>
              <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white">/api/twilio/send-otp</h3>
            </div>
            <span className="text-xs text-slate-500">Twilio SMS Verification</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Dispatches a 6-digit dynamic SMS verification OTP code to the recipient's phone number.
          </p>

          <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800">
            <pre>{`// Request Payload
POST /api/twilio/send-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}

// Response 200 OK
{
  "success": true,
  "status": "pending",
  "message": "Twilio SMS verification code sent to +919876543210"
}`}</pre>
          </div>
        </div>
      </div>
    </main>
  )
}
