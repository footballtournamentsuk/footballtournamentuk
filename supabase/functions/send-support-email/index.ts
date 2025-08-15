import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

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
  // Handle CORS preflight requests
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
    const body = await req.json()
    const { name, email, subject, message, pageUrl } = body as SupportRequest

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.error('RESEND_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resend = new Resend(resendKey)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
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
    })

    if (error) {
      console.error('Resend error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ id: data?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: error.message ?? 'Server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})