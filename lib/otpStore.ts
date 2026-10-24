// Server-side In-Memory Store for Dynamic 6-Digit OTPs
interface OtpRecord {
  code: string
  expiresAt: number
  attempts: number
}

// Global store to persist across API requests in Node server process
const globalForOtp = global as unknown as { otpStore?: Map<string, OtpRecord> }

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>()
if (process.env.NODE_ENV !== 'production') globalForOtp.otpStore = otpStore

// Format phone number to clean E.164 string
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length > 10 && !phone.startsWith('+')) return `+${digits}`
  return phone.startsWith('+') ? phone : `+${digits}`
}

// Generate dynamic 6-digit random OTP (e.g. "849201")
export function generateDynamicOtp(phone: string): string {
  const normalized = normalizePhone(phone)
  // Generate random 6-digit code between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes validity

  otpStore.set(normalized, {
    code,
    expiresAt,
    attempts: 0,
  })

  return code
}

// Verify dynamic 6-digit OTP
export function verifyDynamicOtp(phone: string, code: string): { valid: boolean; reason?: string } {
  const normalized = normalizePhone(phone)
  const record = otpStore.get(normalized)

  if (!record) {
    return { valid: false, reason: 'No OTP requested for this phone number. Please click Send OTP.' }
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized)
    return { valid: false, reason: 'OTP has expired (valid for 5 minutes). Please request a new OTP.' }
  }

  if (record.attempts >= 5) {
    otpStore.delete(normalized)
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' }
  }

  if (record.code === code.trim()) {
    // Successfully verified -> delete OTP to prevent re-use
    otpStore.delete(normalized)
    return { valid: true }
  } else {
    record.attempts += 1
    return { valid: false, reason: `Incorrect OTP code (${5 - record.attempts} attempts remaining).` }
  }
}
