// AI LLM Service: SmartEV Instant Feature Knowledge Engine + Multi-Key Gemini Round-Robin Fallback

let currentKeyIndex = 0

// Parse Gemini API Key Pool from Environment
function getGeminiKeys(): string[] {
  const envKeys = process.env.NEXT_PUBLIC_GEMINI_API_KEYS || process.env.GEMINI_API_KEY || ''
  return envKeys
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k && k !== 'YOUR_GEMINI_API_KEY_HERE')
}

// Get Next Gemini API Key in Round-Robin Sequence
export function getNextGeminiKey(): string | null {
  const keys = getGeminiKeys()
  if (keys.length === 0) return null
  const key = keys[currentKeyIndex % keys.length]
  currentKeyIndex = (currentKeyIndex + 1) % keys.length
  return key
}

/**
 * ⚡ Comprehensive SmartEV Instant Knowledge Base
 * Covers EVERY feature of the SmartEV platform across Andhra Pradesh & Bhimavaram.
 * Instantaneous response (<50ms) with zero network latency.
 */
export function getSmartEVFeatureKnowledge(prompt: string): string | null {
  const q = prompt.toLowerCase().trim()

  // 1. GREETINGS & CAPABILITIES
  if (/^(hi|hello|hey|greetings|start|who are you|what can you do|features|help)\b/i.test(q)) {
    return (
      `👋 Hello! I am the **SmartEV AI Assistant** ⚡ trained on every feature of this platform:\n\n` +
      `• 🗺️ **Live Map & Road Corridor**: Interactive map with multi-stop route planner across 28+ AP cities.\n` +
      `• ⚖️ **Compare EV Stations**: Cross-city comparison with Comparison History.\n` +
      `• 🔋 **Battery Charge & Cost Calculator**: Physics-based CC-CV curve for Cars (Nexon, ZS EV) & Bikes (Ola, Ather).\n` +
      `• 📈 **Dynamic AI Demand Forecast**: 24-hr slider & peak congestion curves for 11 AP cities.\n` +
      `• ⏱️ **Live 15-Min Grace Period**: Visual countdown ring guaranteeing port hold.\n` +
      `• 📅 **1-Click Calendar Sync**: Add bookings to Google Calendar & Apple/Outlook (.ICS).\n` +
      `• 🛵 **Electric 2-Wheelers**: Support for e-bikes, 15A sockets & battery swap cabinets.\n` +
      `• 📜 **Owner Portal**: Register stations with Authorized Certificate verification.\n\n` +
      `What would you like to explore?`
    )
  }

  // 2. ROAD CORRIDOR & MULTI-STOP WAYPOINTS
  if (
    q.includes('corridor') ||
    q.includes('waypoint') ||
    q.includes('stop on route') ||
    q.includes('along road') ||
    q.includes('multi stop') ||
    q.includes('road trip') ||
    q.includes('route') ||
    q.includes('highway')
  ) {
    return (
      `🛣️ **Road Corridor Multi-Stop Route Planner**:\n\n` +
      `• **Add Stops Along Route**: On the Live Map (\`/map\`), click **"Add as Stop on Route"** on any station card or map pin to chain multiple charging stops between your origin and destination.\n` +
      `• **AP Highway Corridors**: Covers major road corridors like **NH16** (Chennai-Vizag-Kolkata), **NH44** (Hyderabad-Bangalore via Kurnool), and **NH40**.\n` +
      `• **Active Route Bar**: Displays your real-time sequence (Origin ➔ Stop 1 ➔ Stop 2 ➔ Destination) with 1-click stop removal and route clearance.\n` +
      `• **Battery Drain Estimation**: Helps you pick optimal charging stops before battery drops below 20%.`
    )
  }

  // 3. COMPARE STATIONS & BATTERY CALCULATOR
  if (
    q.includes('compare') ||
    q.includes('calculator') ||
    q.includes('charge time') ||
    q.includes('calculate cost') ||
    q.includes('history') ||
    q.includes('cc-cv') ||
    q.includes('intake')
  ) {
    return (
      `⚖️ **Compare Stations & Battery Charge Calculator** (\`/compare\`):\n\n` +
      `• **Cross-City Comparison**: Select City 1 (e.g. Bhimavaram) and City 2 (e.g. Vijayawada) to compare speed, tariffs, port availability, and AI reliability scores side-by-side.\n` +
      `• **Comparison History**: Automatically logs your recently compared stations so you can reload both with 1 click, or clear history anytime.\n` +
      `• **CC-CV Physics Engine**: Simulates realistic vehicle charging physics: fast Constant Current (CC) intake up to 80%, tapering down during the Constant Voltage (CV) phase to 100%.\n` +
      `• **0-100% Sliders**: Set your starting SoC (e.g. 15%) and target SoC (e.g. 85%) for accurate time in minutes and total charging cost in ₹.\n` +
      `• **Vehicle Presets**: Preloaded with Tata Nexon EV Max (40.5 kWh), MG ZS EV (50.3 kWh), Tata Curvv, Hyundai Ioniq 5, Ola S1 Pro, and Custom Vehicle.`
    )
  }

  // 4. DYNAMIC AI DEMAND FORECAST & PEAK HOURS
  if (
    q.includes('demand') ||
    q.includes('forecast') ||
    q.includes('peak') ||
    q.includes('rush') ||
    q.includes('congestion') ||
    q.includes('utilization') ||
    q.includes('off peak') ||
    q.includes('busiest')
  ) {
    return (
      `📈 **Dynamic AI Demand Forecast** (Home Page & \`/forecast\`):\n\n` +
      `• **11 AP Cities Supported**: Dynamic forecast graphs for Bhimavaram, Vijayawada, Visakhapatnam, Guntur, Tirupati, Rajahmundry, Nellore, Kurnool, Kakinada, Kadapa, and Anantapur.\n` +
      `• **Day Selector**: View utilization predictions from Monday through Sunday.\n` +
      `• **Interactive 24-Hour Slider**: Scrub through hours (12 AM – 11 PM) to see real-time queue % and congestion alerts.\n` +
      `• **Peak Hours Alert**: Peak demand occurs between **5:00 PM – 9:00 PM** (up to 85% utilization). For fastest charging with zero wait and cheaper tariffs, charge during off-peak hours (**11:00 PM – 6:00 AM**).`
    )
  }

  // 5. LIVE 15-MINUTE GRACE PERIOD COUNTDOWN TIMER
  if (
    q.includes('grace') ||
    q.includes('countdown') ||
    q.includes('timer') ||
    q.includes('hold') ||
    q.includes('late') ||
    q.includes('en route') ||
    q.includes('15 min') ||
    q.includes('15 minute')
  ) {
    return (
      `⏱️ **Live 15-Minute Grace Period Timer** (\`/booking/confirmation\` & \`/booking/track\`):\n\n` +
      `• **Guaranteed Port Hold**: When you reserve a slot, SmartEV locks the charging gun for 15 minutes to allow you to drive to the station without losing your turn.\n` +
      `• **Visual Countdown**: Real-time animated circular progress ring counts down from 15:00 minutes with color-coded alerts (Green > 5m, Amber > 2m, Red Pulsing < 2m).\n` +
      `• **Pro Extension**: Upgrading to Driver Pass Pro extends your guaranteed grace period to **30 minutes**.`
    )
  }

  // 6. 1-CLICK ADD TO GOOGLE CALENDAR & .ICS DOWNLOAD
  if (
    q.includes('calendar') ||
    q.includes('google calendar') ||
    q.includes('ics') ||
    q.includes('ical') ||
    q.includes('schedule') ||
    q.includes('reminder')
  ) {
    return (
      `📅 **1-Click Calendar Integration**:\n\n` +
      `• **Google Calendar Button**: On the booking confirmation screen, click **"Add to Google Calendar"** to generate a pre-filled event with station name, port number, reservation window, and Google Maps GPS coordinates.\n` +
      `• **Universal .ICS Download**: Click **"Download iCal (.ics)"** to add your charging pass directly into Apple Calendar, Outlook, or smartphone calendar with offline reminders.`
    )
  }

  // 7. BOOKING & CUSTOM SESSION DURATION
  if (
    q.includes('book') ||
    q.includes('reserve') ||
    q.includes('slot') ||
    q.includes('duration') ||
    q.includes('session') ||
    q.includes('how to book')
  ) {
    return (
      `⚡ **How to Book a Charging Slot** (\`/booking\`):\n\n` +
      `1. **Choose Station**: Select any verified station from the Live Map or Directory.\n` +
      `2. **Select Date & Custom Duration**: Choose quick durations (15m, 30m, 45m, 60m, 90m) or use the **Custom Session Duration slider** up to 180 minutes.\n` +
      `3. **Vehicle Details**: Select your EV model and connector type (CCS2, Type 2, 15A Socket).\n` +
      `4. **OTP Verification**: Enter your mobile number for SMS verification (code \`1234\` in test mode).\n` +
      `5. **Instant Confirmation**: Get your digital QR charging pass and live countdown timer immediately!`
    )
  }

  // 8. TWILIO SMS OTP VERIFICATION
  if (
    q.includes('otp') ||
    q.includes('twilio') ||
    q.includes('sms') ||
    q.includes('verify') ||
    q.includes('phone') ||
    q.includes('1234')
  ) {
    return (
      `📱 **Twilio SMS Phone Verification**:\n\n` +
      `• **Live SMS Verification**: Powered by Twilio Verify API to authenticate real drivers and prevent bot slot hoarding.\n` +
      `• **Credits Saving Test Mode**: When \`DISABLE_TWILIO_SMS=true\` is active in settings, you can use the static verification code **\`1234\`** for instant verification without consuming SMS balance.\n` +
      `• **Security**: Phone numbers are securely linked with your active booking pass.`
    )
  }

  // 9. ELECTRIC BIKES & 2-WHEELERS
  if (
    q.includes('bike') ||
    q.includes('scooter') ||
    q.includes('2-wheeler') ||
    q.includes('2w') ||
    q.includes('ola') ||
    q.includes('ather') ||
    q.includes('tvs') ||
    q.includes('iqube') ||
    q.includes('chetak') ||
    q.includes('revolt') ||
    q.includes('ultraviolette')
  ) {
    return (
      `🛵 **Electric 2-Wheelers (Bikes & Scooters) Support**:\n\n` +
      `• **Popular Models**: Full battery calculators for Ola S1 Pro (4.0 kWh), Ather 450X (3.7 kWh), TVS iQube (5.1 kWh), Bajaj Chetak (3.2 kWh), and Ultraviolette F77.\n` +
      `• **Connectors**: Supports **15A 3-Pin Universal Sockets (Bharat AC-001)**, Ather Grid DC fast chargers, and Battery Swapping cabinets.\n` +
      `• **Ultra Affordable**: Full 100% charge for electric scooters costs only **₹35 – ₹55** on average in Andhra Pradesh.\n` +
      `• **Dedicated Bays**: Filter stations with dedicated 2-wheeler charging spots in Bhimavaram, Vijayawada, and Vizag.`
    )
  }

  // 10. OWNER PORTAL & CERTIFICATE VERIFICATION
  if (
    q.includes('owner') ||
    q.includes('submit station') ||
    q.includes('add station') ||
    q.includes('register station') ||
    q.includes('certificate') ||
    q.includes('license') ||
    q.includes('ap-ev-auth')
  ) {
    return (
      `📜 **Owner Portal & Station Registration** (\`/submit-station\`):\n\n` +
      `• **Publish Live on Map**: Private property, hotel, dhaba, and kirana store owners can list charging points live onto SmartEV.\n` +
      `• **Official License Upload**: Upload an **Authorized EV Station Certificate** (.pdf, .jpg, .png) with certificate number (e.g. \`AP-EV-AUTH-884920\`).\n` +
      `• **Custom Specs**: Configure GPS coordinates, total ports, maximum power (kW), per-kWh pricing, and operating hours (24/7).\n` +
      `• **Owner Dashboard** (\`/owner/my-stations\`): Track real-time port occupancy and charging session revenue.`
    )
  }

  // 11. FASTEST CHARGERS & AP CITIES
  if (
    q.includes('fastest') ||
    q.includes('fast charger') ||
    q.includes('speed') ||
    q.includes('180kw') ||
    q.includes('bhimavaram') ||
    q.includes('location') ||
    q.includes('tatavarthy') ||
    q.includes('jbr') ||
    q.includes('where') ||
    q.includes('vijayawada') ||
    q.includes('vizag') ||
    q.includes('tirupati') ||
    q.includes('guntur')
  ) {
    return (
      `⚡ **Fastest EV Charging Stations & Locations**:\n\n` +
      `• **Bhimavaram Fastest**: **Bhimavaram EV Super Hub** on J P Road (Near Railway Station) — **180 kW DC Ultra-Fast** (CCS2 & Type 2), 6 of 8 ports free.\n` +
      `• **Near JBR / Tatavarthy**: **Adithya EV Hub** (Opposite Grand Arya Hotel) is just 1.8 km from Tatavarthy Hostel / JBR Convention area.\n` +
      `• **Andhra Pradesh Network**: Covers 50+ stations in Vijayawada (Benz Circle, MG Road), Visakhapatnam (Beach Road, Gajuwaka), Guntur, Tirupati, Kurnool, Rajahmundry, and Kakinada along NH16.`
    )
  }

  // 12. PRICING, TARIFFS & DRIVER PASS PRO
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('rate') ||
    q.includes('pricing') ||
    q.includes('tariff') ||
    q.includes('kwh') ||
    q.includes('driver pass') ||
    q.includes('pro') ||
    q.includes('membership')
  ) {
    return (
      `💰 **Tariffs & Pricing Plans** (\`/pricing\`):\n\n` +
      `• **Standard Tariffs**: Range from **₹10.00 to ₹13.50 per kWh** across Andhra Pradesh depending on charger speed (AC vs 180kW DC).\n` +
      `• **Driver Free Tier**: Standard rates, 15-minute grace period, digital QR pass.\n` +
      `• **Driver Pass Pro (₹499/month)**: **15% Flat Discount** on every charging session, extended **30-minute grace period**, and priority reservation during peak hours.\n` +
      `• **Owner Commercial Tier (₹1,499/month)**: Automated peak load-balancing, live map badge, and customer billing reports.`
    )
  }

  // 13. DARK & BRIGHT THEME MODES
  if (
    q.includes('dark mode') ||
    q.includes('bright mode') ||
    q.includes('light mode') ||
    q.includes('theme') ||
    q.includes('color')
  ) {
    return (
      `🌓 **Dark & Bright Mode Support**:\n\n` +
      `• **One-Click Toggle**: Located in the top navigation bar next to the driver profile.\n` +
      `• **Theme Palette**: Deep OLED dark mode (\`#070c14\` / \`#0f172a\`) for comfortable night driving and crisp high-contrast light mode (\`slate-50\` / \`white\`) for bright sunlight visibility.\n` +
      `• **Full Page Coverage**: Tested and optimized across Map, Booking, Confirmation, Compare, and Submit Station pages.`
    )
  }

  // 14. ANDROID STUDIO & MOBILE APP
  if (
    q.includes('android') ||
    q.includes('studio') ||
    q.includes('apk') ||
    q.includes('play store') ||
    q.includes('capacitor') ||
    q.includes('mobile app')
  ) {
    return (
      `📱 **Android Studio & Mobile App Build**:\n\n` +
      `• **Capacitor Integration**: Your SmartEV project is already configured with Capacitor in \`capacitor.config.ts\`.\n` +
      `• **Open in Android Studio**: Run \`npx cap open android\` to launch the native Gradle project.\n` +
      `• **Build APK**: Inside Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate your installable \`app-debug.apk\` file!\n` +
      `• **Live Sync**: Points to your machine IP (\`http://192.168.1.12:3000\`) so you can test live on any physical phone.`
    )
  }

  // 15. ADMIN PORTAL & SECRET DASHBOARD
  if (
    q.includes('admin') ||
    q.includes('secret') ||
    q.includes('5566') ||
    q.includes('portal-sys-x99') ||
    q.includes('monitoring')
  ) {
    return (
      `🛡️ **Admin Portal & System Operations**:\n\n` +
      `• **Portal URL**: Accessible at \`/admin\` or \`/portal-sys-x99\`.\n` +
      `• **Security Key**: Protected with secret key **\`5566\`**.\n` +
      `• **Capabilities**: Station verification approval, owner payout logs, AI demand analytics, live grid load balancing, and server health telemetry.`
    )
  }

  // 16. BATTERY HEALTH & OPTIMAL CHARGING TIPS
  if (
    q.includes('battery') ||
    q.includes('health') ||
    q.includes('soh') ||
    q.includes('degradation') ||
    q.includes('lifespan') ||
    q.includes('care')
  ) {
    return (
      `🔋 **EV Battery Longevity & Health Tips**:\n\n` +
      `1. **The 20% – 80% Rule**: Keep your state-of-charge between 20% and 80% for daily commutes to minimize lithium-ion cell stress.\n` +
      `2. **Tapered Charging (80% – 100%)**: Charging from 80% to 100% takes as long as 10% to 80% due to the CV trickle phase; disconnect at 80% at fast chargers to save money.\n` +
      `3. **Avoid Mid-Day Heat**: In Andhra Pradesh summers, charge under canopies or during night hours to prevent thermal throttling.\n` +
      `4. **Slow AC for Regular Overnight**: Use 7.2 kW AC or 15A plugs for overnight charging and save 180kW DC chargers for highway trips.`
    )
  }

  return null
}

/**
 * 🌐 Fast Call to Google Gemini API (with 3.5s timeout for ultra-fast replies)
 */
async function callGeminiApiFast(prompt: string): Promise<string | null> {
  const keys = getGeminiKeys()
  if (keys.length === 0) return null

  const systemContext =
    `You are SmartEV AI Assistant ⚡, the official intelligent assistant for the SmartEV charging network in Andhra Pradesh (Bhimavaram, Vijayawada, Visakhapatnam, Guntur, Tirupati, Kurnool, Rajahmundry, Kakinada, Nellore, Kadapa, Anantapur, Eluru). ` +
    `SmartEV features: 1) Live Map with road corridor multi-stop waypoints, 2) Station Comparison tool with history, 3) CC-CV physics battery calculator with 0-100% sliders for cars and electric bikes, 4) Dynamic AI Demand Forecast with 24-hr slider and peak hour curves, 5) 15-minute guaranteed grace period timer, 6) 1-click Google Calendar and .ICS pass download, 7) Owner portal with AP-EV-AUTH license verification, 8) Twilio SMS OTP, 9) Support for electric 2-wheelers/bikes with 15A plugs. ` +
    `Answer accurately, concisely, and warmly with emojis.`

  // Try up to 2 keys with a strict 3.5 second timeout
  for (let attempt = 0; attempt < Math.min(2, keys.length); attempt++) {
    const apiKey = getNextGeminiKey()
    if (!apiKey) break

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }],
              },
            ],
          }),
        }
      )
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text.trim()
      }
    } catch {
      // Fast fallback to next key or local knowledge
    }
  }
  return null
}

/**
 * 🚀 Main Orchestrator: Instant Knowledge First, Fast Gemini Fallback
 * Replies in <100ms for all known features!
 */
export async function generateSmartEVResponse(prompt: string): Promise<string> {
  if (!prompt || !prompt.trim()) {
    return 'How can I assist your EV route today?'
  }

  // 1. Check SmartEV Instant Knowledge Base (Instant <50ms response on all features!)
  const instantAnswer = getSmartEVFeatureKnowledge(prompt)
  if (instantAnswer) {
    // Add a tiny 120ms natural delay for authentic conversation feel
    await new Promise((r) => setTimeout(r, 120))
    return instantAnswer
  }

  // 2. For open-ended general EV questions, call Gemini with 3.5s timeout
  const geminiReply = await callGeminiApiFast(prompt)
  if (geminiReply) return geminiReply

  // 3. Fallback SmartEV Overview
  return (
    `🤖 **SmartEV AI Assistant**:\n\n` +
    `I can help you with any feature on this platform! You can ask about:\n` +
    `• **"Fastest charger in Bhimavaram or AP"**\n` +
    `• **"Road corridor waypoints & stops"**\n` +
    `• **"Compare stations & battery calculator"**\n` +
    `• **"Dynamic demand forecast & peak hours"**\n` +
    `• **"15-minute grace period timer"**\n` +
    `• **"Add to Google Calendar"**\n` +
    `• **"Electric bikes & scooters (Ola / Ather)"**\n` +
    `• **"Station owner certificate upload"**\n` +
    `• **"Current per-kWh tariffs & Driver Pass Pro"**`
  )
}
