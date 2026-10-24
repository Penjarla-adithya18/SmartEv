'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Driver Support')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-foreground pb-16 transition-colors">
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-10 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Mail className="size-3.5" /> GET IN TOUCH WITH US
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Contact SmartEV Support
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Have questions about station onboarding, Twilio OTP SMS verification, or charging reservations? We are here 24/7.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pt-10 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Contact Information</h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Bhimavaram Office</strong>
                    <span>J P Road, Near Town Railway Station, Bhimavaram, AP - 534202</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">24/7 Helpline</strong>
                    <span>+91 1800-555-SMARTEV (+91 1800-555-76278)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-cyan-500 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Support Email</strong>
                    <span>support@smartev.in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm">
            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thank you for reaching out to SmartEV. Our support team in Bhimavaram will reply to your email within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rajesh Varma"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rajesh@example.com"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Driver Support">Driver Support & Slot Booking</option>
                    <option value="Station Owner Inquiry">Station Owner Registration Inquiry</option>
                    <option value="Twilio OTP Assistance">Twilio OTP Assistance</option>
                    <option value="API Partnership">Developer API Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Message *</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <Send className="size-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
