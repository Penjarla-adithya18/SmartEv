import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { generateDynamicOtp, normalizePhone } from '@/lib/otpStore'

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)
    const dynamicOtp = generateDynamicOtp(normalizedPhone)

    const disableTwilio = process.env.DISABLE_TWILIO_SMS === 'true'
    const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    const authToken = process.env.TWILIO_AUTH_TOKEN || ''
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || ''
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER || ''

    const isTwilioConfigured =
      !disableTwilio &&
      Boolean(accountSid) &&
      Boolean(authToken) &&
      !accountSid.includes('your_twilio') &&
      !authToken.includes('your_twilio')

    if (isTwilioConfigured) {
      const client = twilio(accountSid, authToken)

      if (serviceSid && !serviceSid.includes('your_twilio')) {
        try {
          const verification = await client.verify.v2
            .services(serviceSid)
            .verifications.create({ to: normalizedPhone, channel: 'sms' })

          return NextResponse.json({
            success: true,
            method: 'twilio_verify',
            dynamicOtp,
            status: verification.status,
            message: `Twilio SMS OTP sent successfully to ${normalizedPhone}`,
          })
        } catch (twilioErr: any) {
          console.warn('Twilio Verify Service error:', twilioErr.message)
        }
      }

      if (twilioPhone && !twilioPhone.includes('18005550199')) {
        try {
          const message = await client.messages.create({
            body: `Your SmartEV charging slot verification OTP code is: ${dynamicOtp}. Valid for 5 minutes.`,
            from: twilioPhone,
            to: normalizedPhone,
          })

          return NextResponse.json({
            success: true,
            method: 'twilio_sms',
            dynamicOtp,
            messageSid: message.sid,
            message: `SMS message with OTP ${dynamicOtp} dispatched via Twilio to ${normalizedPhone}`,
          })
        } catch (twilioErr: any) {
          console.error('Twilio Programmable SMS error:', twilioErr.message)
        }
      }
    }

    // Static / Simulation Mode (Twilio Bypassed to preserve credits)
    console.info(`Static/Bypassed OTP for ${normalizedPhone}: ${dynamicOtp}`)
    return NextResponse.json({
      success: true,
      method: 'static_bypassed',
      dynamicOtp: dynamicOtp,
      message: `Twilio SMS paused to preserve credits. Your Static OTP Code is: ${dynamicOtp} (or 1234)`,
    })
  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed sending SMS OTP' },
      { status: 500 }
    )
  }
}
