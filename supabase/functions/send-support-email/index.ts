import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupportRequest {
  name: string
  email: string
  subject: string
  message: string
  pageUrl?: string
}

serve(async (req) => {
  console.log('=== Support Email Function Start ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    console.log('Parsing request body...')
    const body = await req.json()
    console.log('Request body received:', JSON.stringify(body))
    
    const { name, email, subject, message, pageUrl } = body as SupportRequest

    // Validate required fields
    console.log('Validating fields...')
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      console.log('Validation failed - missing fields')
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email.includes('@')) {
      console.log('Validation failed - invalid email')
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Resend API key
    console.log('Getting Resend API key...')
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.error('RESEND_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('Resend API key found, length:', resendKey.length)

    // Prepare email payload
    const emailPayload = {
      from: 'Support <info@footballtournamentsuk.co.uk>',
      to: ['info@footballtournamentsuk.co.uk'],
      reply_to: email.trim(),
      subject: `Support request from ${name.trim()}`,
      html: `
        <h2>New Support Request</h2>
        <p><b>Name:</b> ${name.trim()}</p>
        <p><b>Email:</b> ${email.trim()}</p>
        <p><b>Subject:</b> ${subject.trim()}</p>
        ${pageUrl ? `<p><b>Page URL:</b> ${pageUrl}</p>` : ''}
        <p><b>Message:</b><br/>${message.trim().replace(/\n/g, '<br/>')}</p>
      `,
    }
    
    console.log('Email payload prepared:', JSON.stringify(emailPayload))

    // Send email using direct fetch to Resend API
    console.log('Sending request to Resend API...')
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    console.log('Resend API response status:', response.status)
    console.log('Resend API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `Email service error: ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Email sent successfully:', JSON.stringify(data))

    return new Response(
      JSON.stringify({ id: data?.id, success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('=== FUNCTION ERROR ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('=====================')

    return new Response(
      JSON.stringify({ error: error.message ?? 'Server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})