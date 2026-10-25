'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  RotateCcw,
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

  const initialGreeting: Message = {
    id: '1',
    sender: 'ai',
    text:
      '👋 Hello! I am **SmartEV AI Assistant** ⚡.\n\n' +
      'I am trained on **every feature** of this website:\n' +
      '• 🗺️ Road Corridor Multi-Stop Waypoints\n' +
      '• ⚖️ Station Comparison & CC-CV Battery Calculator\n' +
      '• 📈 Dynamic AI Demand Forecast (24-hr slider)\n' +
      '• ⏱️ Live 15-Minute Grace Period Timer\n' +
      '• 📅 1-Click Google Calendar & .ICS Sync\n' +
      '• 🛵 Electric 2-Wheelers (Ola, Ather, 15A plugs)\n' +
      '• 📜 Owner Portal & Certificate Upload\n\n' +
      'Tap any quick button below or ask me anything!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  const [messages, setMessages] = useState<Message[]>([initialGreeting])

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, typing])

  const handleClearChat = () => {
    setMessages([
      {
        ...initialGreeting,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMsg).trim()
    if (!prompt) return

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
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '⚡ I am online and ready! Ask me about fastest chargers, demand forecasts, comparing stations, or 15-min grace period timers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setTyping(false)
    }
  }

  // Quick feature chips
  const quickChips = [
    { label: '⚡ Fastest Chargers', query: 'Where is the fastest charger in Bhimavaram or AP?' },
    { label: '🛣️ Corridor Stops', query: 'How does the Road Corridor multi-stop waypoint feature work?' },
    { label: '⚖️ Compare & Calculator', query: 'Tell me about the EV station compare and battery calculator feature' },
    { label: '📈 Demand Forecast', query: 'How does the AI Demand Forecast and peak hours slider work?' },
    { label: '⏱️ 15-Min Grace Timer', query: 'What is the live 15-minute grace period countdown timer?' },
    { label: '📅 Google Calendar', query: 'How does 1-click Google Calendar integration work?' },
    { label: '🛵 Electric Bikes', query: 'How are electric bikes and scooters supported in SmartEV?' },
    { label: '💰 Tariffs & Pricing', query: 'What are current charging prices and Driver Pass Pro benefits?' },
    { label: '📜 Owner License', query: 'How does owner station registration and certificate verification work?' },
    { label: '🔋 Battery Tips', query: 'What are best practices for EV battery health and longevity?' },
  ]

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
        <div className="w-[360px] sm:w-[420px] h-[550px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl flex flex-col overflow-hidden transition-colors animate-in fade-in zoom-in-95 duration-200">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0f172a] px-4 py-3 flex items-center justify-between text-white border-b border-slate-700 shrink-0">
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
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> Online • All Features Trained
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Restart Chat"
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="size-5" />
              </button>
            </div>
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
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-semibold rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>
                  <span className="text-[9px] opacity-60 block text-right font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-1">
                <Bot className="size-4 text-emerald-500 animate-spin" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">SmartEV AI is typing instantly...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap shrink-0">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSendMessage(chip.query)}
                className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask anything about SmartEV features, rates, routes..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 transition shrink-0"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
