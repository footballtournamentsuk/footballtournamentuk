import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_URL = 'https://api.resend.com/emails'

interface SupportRequest {
  name: string
  email: string
  subject: string
  message: string
  pageUrl?: string
}

// Simple in-memory rate limiting (reset on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5 // 5 requests per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  limit.count++
  return true
}

function validateSupportRequest(data: any): SupportRequest | null {
  console.log('Validation input data:', data)
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    console.log('Validation failed: name', { name: data.name, type: typeof data.name, length: data.name?.trim()?.length })
    return null
  }
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    console.log('Validation failed: email', { email: data.email, type: typeof data.email, hasAt: data.email?.includes('@') })
    return null
  }
  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length < 5) {
    console.log('Validation failed: subject', { subject: data.subject, type: typeof data.subject, length: data.subject?.trim()?.length })
    return null
  }
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    console.log('Validation failed: message', { message: data.message, type: typeof data.message, length: data.message?.trim()?.length })
    return null
  }
  
  console.log('Validation passed successfully')
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    pageUrl: data.pageUrl || 'Unknown'
  }
}

function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.error('RESEND_API_KEY environment variable not found')
    throw new Error('RESEND_API_KEY not found')
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Football Tournaments UK <info@footballtournamentsuk.co.uk>',
      to: [to],
      subject,
      html,
      reply_to: replyTo || 'info@footballtournamentsuk.co.uk',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return await response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const supportRequest = validateSupportRequest(body)
    
    if (!supportRequest) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { name, email, subject, message, pageUrl } = supportRequest
    const sanitizedName = sanitizeHtml(name)
    const sanitizedSubject = sanitizeHtml(subject)
    const sanitizedMessage = sanitizeHtml(message).replace(/\n/g, '<br>')
    const sanitizedPageUrl = sanitizeHtml(pageUrl)

    // Internal notification email
    const internalSubject = `Support Request: ${sanitizedSubject}`
    const internalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Support Request</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${sanitizedSubject}</p>
          <p><strong>Page URL:</strong> ${sanitizedPageUrl}</p>
          <div style="margin-top: 20px;">
            <strong>Message:</strong>
            <div style="background: #ffffff; padding: 15px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #2563eb;">
              ${sanitizedMessage}
            </div>
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This message was sent from the Football Tournaments UK support form.
        </p>
      </div>
    `

    // Auto-reply email
    const replySubject = `We've received your message: ${sanitizedSubject}`
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for contacting us</h2>
        <p>Hi ${sanitizedName},</p>
        <p>We've received your message about "<strong>${sanitizedSubject}</strong>" and will get back to you shortly.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p><strong>Your message:</strong></p>
          <p>${sanitizedMessage}</p>
        </div>
        <p>Our team typically responds within 24 hours during business days.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          <strong>Football Tournaments UK Team</strong><br>
          <a href="mailto:info@footballtournamentsuk.co.uk" style="color: #2563eb;">info@footballtournamentsuk.co.uk</a>
        </p>
      </div>
    `

    // Send both emails
    await Promise.all([
      sendEmail('info@footballtournamentsuk.co.uk', internalSubject, internalHtml, email),
      sendEmail(email, replySubject, replyHtml, 'info@footballtournamentsuk.co.uk')
    ])

    return new Response(
      JSON.stringify({ success: true, message: 'Support request sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Support email error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send support request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})