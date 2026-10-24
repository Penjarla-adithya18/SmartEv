'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  BatteryCharging,
  MapPin,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Minimize2,
} from 'lucide-react'
import { generateSmartEVResponse } from '@/lib/aiService'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
}

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am SmartEV AI Assistant ⚡ trained on Bhimavaram charging stations, rates, locations (Tatavarthy Hostel / JBR), Twilio OTP, and battery health advice. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const generateAIResponse = (userPrompt: string): string => {
    const q = userPrompt.toLowerCase()

    if (q.includes('fastest') || q.includes('fast') || q.includes('speed')) {
      return '⚡ The fastest charger in Bhimavaram is the Bhimavaram EV Super Hub on J P Road, offering 180 kW DC Ultra-Fast charging (CCS2 & Type 2) with 6 out of 8 ports currently free!'
    } else if (q.includes('location') || q.includes('tatavarthy') || q.includes('jbr') || q.includes('where am i')) {
      return '📍 Your present location is set near Tatavarthy Hostel / JBR Convention area in Bhimavaram (16.5448° N, 81.5212° E). Stations like Adithya EV and Bhimavaram EV Super Hub are within 2.5 km!'
    } else if (q.includes('price') || q.includes('cost') || q.includes('tariff') || q.includes('kwh') || q.includes('rate')) {
      return '💰 EV charging tariffs in Bhimavaram range from ₹10 to ₹13.50 per kWh. Adithya EV offers ₹10/kWh, while Bhimavaram EV Super Hub is ₹12/kWh. Upgrade to Driver Pass Pro to get 15% OFF all stations!'
    } else if (q.includes('otp') || q.includes('twilio') || q.includes('phone') || q.includes('sms')) {
      return '📱 Verification is powered via Twilio SMS OTP. Dynamic 6-digit verification codes are sent directly to your phone. (Static test mode is currently active with code 1234 to save Twilio credits).'
    } else if (q.includes('certificate') || q.includes('owner') || q.includes('license') || q.includes('register')) {
      return '📜 Station owners registering on SmartEV upload an Authorized EV Station Certificate (e.g. AP-EV-AUTH-884920) for official government license verification before listing on the live map.'
    } else if (q.includes('battery') || q.includes('health') || q.includes('soh') || q.includes('degradation')) {
      return '🔋 To maximize EV battery longevity: Limit DC fast charging above 80% SoC, avoid leaving your battery at 0% or 100% for prolonged periods, and charge in shaded locations during peak summer heat.'
    } else if (q.includes('book') || q.includes('reserve') || q.includes('slot')) {
      return '📅 Booking a slot takes 15 seconds: Click "Reserve" on any station, select your date, time slot, and connector, verify your phone via OTP, and receive your digital QR pass!'
    } else {
      return `🤖 Thanks for your question! I am trained on SmartEV Bhimavaram stations, live map navigation, battery health tips, and Twilio SMS verification. You can ask me about "fastest charger", "charging prices", "battery care", or "station certificates".`
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputMsg
    if (!prompt.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputMsg('')
    setTyping(true)

    try {
      const aiReplyText = await generateSmartEVResponse(prompt)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.warn('AI chatbot response error', err)
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-slate-950 font-extrabold text-xs shadow-2xl transition-transform hover:scale-105 active:scale-95 border border-white/20"
        >
          <Bot className="size-5 text-slate-950 fill-current animate-bounce" />
          <span>SmartEV AI Assistant</span>
          <span className="flex size-2.5 rounded-full bg-emerald-300 ring-4 ring-emerald-500/30" />
        </button>
      )}

      {/* Expanded AI Chat Widget Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[390px] h-[520px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl flex flex-col overflow-hidden transition-colors animate-in fade-in zoom-in-95 duration-200">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0f172a] px-4 py-3.5 flex items-center justify-between text-white border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Bot className="size-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  SmartEV AI Assistant
                  <Sparkles className="size-3.5 text-cyan-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> Online • Trained for Bhimavaram
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50 dark:bg-[#070c14]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 font-bold shrink-0 mt-0.5">
                    <Zap className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] opacity-60 block text-right font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <Bot className="size-4 text-emerald-500 animate-spin" />
                <span>SmartEV AI is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              onClick={() => handleSendMessage('Where is the fastest charger?')}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
            >
              ⚡ Fastest Charger
            </button>
            <button
              onClick={() => handleSendMessage('What are current charging prices?')}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
            >
              💰 Prices per kWh
            </button>
            <button
              onClick={() => handleSendMessage('How do battery health tips work?')}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
            >
              🔋 Battery Health
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask SmartEV AI about chargers, rates..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shrink-0"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
