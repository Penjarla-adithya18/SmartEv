import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { verifyDynamicOtp, normalizePhone } from '@/lib/otpStore'

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json()
    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and verification code are required' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)
    const disableTwilio = process.env.DISABLE_TWILIO_SMS === 'true'
    const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    const authToken = process.env.TWILIO_AUTH_TOKEN || ''
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || ''

    const isTwilioConfigured =
      !disableTwilio &&
      Boolean(accountSid) &&
      Boolean(authToken) &&
      Boolean(serviceSid) &&
      !accountSid.includes('your_twilio') &&
      !authToken.includes('your_twilio')

    if (isTwilioConfigured) {
      const client = twilio(accountSid, authToken)
      const verificationCheck = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: normalizedPhone, code: code.toString().trim() })

      if (verificationCheck.status === 'approved') {
        return NextResponse.json({
          success: true,
          status: 'approved',
          simulation: false,
          message: 'Phone number verified successfully with Twilio',
        })
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired OTP verification code' },
          { status: 400 }
        )
      }
    } else {
      // Static Mode (Twilio Bypassed to preserve credits)
      const inputCode = code.toString().trim()

      // Allow static test codes '1234', '123456', '0000' or verify stored dynamic OTP
      if (inputCode === '1234' || inputCode === '123456' || inputCode === '0000') {
        return NextResponse.json({
          success: true,
          status: 'approved',
          simulation: true,
          message: 'Static test OTP verified successfully (Twilio paused)',
        })
      }

      const verification = verifyDynamicOtp(normalizedPhone, inputCode)
      if (verification.valid) {
        return NextResponse.json({
          success: true,
          status: 'approved',
          simulation: true,
          message: 'Static OTP verified successfully',
        })
      } else {
        return NextResponse.json(
          { error: verification.reason || 'Invalid OTP code. Try code 1234.' },
          { status: 400 }
        )
      }
    }
  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed verifying OTP' },
      { status: 500 }
    )
  }
}
