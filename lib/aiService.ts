// AI LLM Service: Multi-Key Gemini Round-Robin & Ollama Local Server Fallback

let currentKeyIndex = 0

// Parse Gemini API Key Pool
function getGeminiKeys(): string[] {
  const envKeys = process.env.NEXT_PUBLIC_GEMINI_API_KEYS || process.env.GEMINI_API_KEY || ''
  const keys = envKeys
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k && k !== 'YOUR_GEMINI_API_KEY_HERE')
  return keys
}

// Get Next Gemini API Key in Round-Robin Sequence
export function getNextGeminiKey(): string | null {
  const keys = getGeminiKeys()
  if (keys.length === 0) return null
  const key = keys[currentKeyIndex % keys.length]
  currentKeyIndex = (currentKeyIndex + 1) % keys.length
  return key
}

// 1. Call Gemini API with Key Rotation & Quota Auto-Retry
async function callGeminiApi(prompt: string, maxAttempts = 3): Promise<string | null> {
  const systemContext = `You are SmartEV AI Assistant ⚡ trained for EV charging stations across all medium and large towns and cities in Andhra Pradesh (Bhimavaram, Vijayawada, Visakhapatnam, Rajahmundry, Guntur, Tirupati, Kakinada, Nellore, Kurnool, Kadapa, Anantapur, Eluru, Ongole, Vizianagaram, Srikakulam, Tadepalligudem, Tenali, Narasaraopet, Machilipatnam, Mangalagiri, Amalapuram, Nandyal, Proddatur, Hindupur, Chittoor, Madanapalle, Dhone, Guntakal). Answer concisely with helpful EV battery, highway routes, and charger advice.`

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const apiKey = getNextGeminiKey()
    if (!apiKey) break

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemContext}\n\nUser Question: ${prompt}` },
                ],
              },
            ],
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text.trim()
      } else {
        console.warn(`Gemini API key round-robin attempt ${attempt + 1} failed (${res.status}), rotating key...`)
      }
    } catch (err) {
      console.warn(`Gemini API fetch error on attempt ${attempt + 1}`, err)
    }
  }
  return null
}

// 2. Call Local Ollama Server (llama3.1:8b)
async function callOllamaLocalServer(prompt: string): Promise<string | null> {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b'

  try {
    const res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `System: You are SmartEV AI Assistant trained on Bhimavaram EV stations and battery care.\nUser: ${prompt}\nAI:`,
        stream: false,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.response) return data.response.trim()
    }
  } catch (e) {
    // Ollama not running locally
  }
  return null
}

// 3. Fallback Smart EV Knowledge Base
function getSmartEVKnowledgeFallback(userPrompt: string): string {
  const q = userPrompt.toLowerCase()
  if (q.includes('fastest') || q.includes('fast') || q.includes('speed')) {
    return '⚡ The fastest charger in Bhimavaram is the Bhimavaram EV Super Hub (180 kW DC Ultra-Fast, CCS2 & Type 2) on J P Road.'
  } else if (q.includes('location') || q.includes('tatavarthy') || q.includes('jbr') || q.includes('where')) {
    return '📍 Your location is set near Tatavarthy Hostel / JBR Convention area in Bhimavaram (16.5448° N, 81.5212° E).'
  } else if (q.includes('price') || q.includes('cost') || q.includes('kwh') || q.includes('rate')) {
    return '💰 EV charging tariffs range from ₹10 to ₹13.50 per kWh in Bhimavaram and Vijayawada. Upgrade to Driver Pass Pro to get 15% OFF!'
  } else if (q.includes('certificate') || q.includes('owner') || q.includes('license') || q.includes('register')) {
    return '📜 Station owners upload an Authorized EV Station Certificate (e.g. AP-EV-AUTH-884920) for official government license verification before listing on the live map.'
  } else if (q.includes('battery') || q.includes('health') || q.includes('soh')) {
    return '🔋 To maximize battery longevity: Limit fast charging above 80% SoC, avoid leaving your battery at 0% or 100% for long periods, and charge in shaded locations.'
  } else if (q.includes('andhra') || q.includes('cities') || q.includes('route') || q.includes('trip') || q.includes('tirupati') || q.includes('guntur') || q.includes('kurnool') || q.includes('vizag') || q.includes('nellore')) {
    return '🗺️ SmartEV covers all major AP highways and cities (NH16, NH44, NH40 corridors) with over 50+ fast charging hubs in Visakhapatnam, Vijayawada, Guntur, Tirupati, Kurnool, Nellore, Rajahmundry, Kakinada, Kadapa, Anantapur, and beyond!'
  }
  return '🤖 SmartEV AI Assistant (Gemini 13-Key Round-Robin & Ollama Local fallback active). How can I assist your EV route today?'
}

// Main Smart EV AI Orchestrator Function
export async function generateSmartEVResponse(prompt: string): Promise<string> {
  // 1. Try Gemini API with Round-Robin 13-Key Rotation
  const geminiReply = await callGeminiApi(prompt)
  if (geminiReply) return geminiReply

  // 2. Try Ollama Local Server
  const ollamaReply = await callOllamaLocalServer(prompt)
  if (ollamaReply) return ollamaReply

  // 3. Smart EV Knowledge Fallback
  return getSmartEVKnowledgeFallback(prompt)
}
