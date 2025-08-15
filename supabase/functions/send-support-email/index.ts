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
  console.log('=== Send Support Email Function Started ===')
  console.log('Request method:', req.method)
  
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
    console.log('Processing POST request...')

    // Parse request body
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    const { name, email, subject, message, pageUrl } = body as SupportRequest

    // Validate required fields
    if (!name?.trim()) {
      console.log('Validation error: name missing or empty')
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email?.trim() || !email.includes('@')) {
      console.log('Validation error: email missing or invalid')
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!subject?.trim()) {
      console.log('Validation error: subject missing or empty')
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!message?.trim()) {
      console.log('Validation error: message missing or empty')  
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('All validation passed, preparing to send email...')

    // Initialize Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.error('RESEND_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Resend API key found, initializing...')
    const resend = new Resend(resendKey)

    // Send email using Resend
    console.log('Sending email to info@footballtournamentsuk.co.uk...')
    
    const emailResponse = await resend.emails.send({
      from: 'Football Tournaments UK <no-reply@footballtournamentsuk.co.uk>',
      to: ['info@footballtournamentsuk.co.uk'],
      subject: `[Support] ${subject.trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Support Request</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Email:</strong> ${email.trim()}</p>
            <p><strong>Subject:</strong> ${subject.trim()}</p>
            ${pageUrl ? `<p><strong>Page URL:</strong> ${pageUrl}</p>` : ''}
            <div style="margin-top: 20px;">
              <strong>Message:</strong>
              <div style="background: #ffffff; padding: 15px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #2563eb;">
                ${message.trim().replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            This message was sent from the Football Tournaments UK support form.
          </p>
        </div>
      `,
      reply_to: email.trim()
    })

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Support request sent successfully',
        id: emailResponse.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('=== EMAIL SENDING ERROR ===')
    console.error('Error type:', error.constructor?.name)
    console.error('Error message:', error.message)
    console.error('Error details:', error)
    console.error('===============================')

    return new Response(
      JSON.stringify({ 
        error: 'Failed to send support request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})