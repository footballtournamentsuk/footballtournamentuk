import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { EmailVerification } from './_templates/email-verification.tsx'
import { PasswordReset } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('AUTH_HOOK_SECRET') as string
const emailFrom = Deno.env.get('EMAIL_FROM') || 'info@footballtournamentsuk.co.uk'

Deno.serve(async (req) => {
  console.log('Auth email webhook received')
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      try {
        wh.verify(payload, headers)
      } catch (error) {
        console.error('Webhook verification failed:', error)
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const webhookData = JSON.parse(payload)
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2))

    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = webhookData

    console.log('Processing auth email:', {
      email: user.email,
      action_type: email_action_type,
      redirect_to,
    })

    let html: string
    let subject: string

    // Build the confirmation/reset URL - always use production domain
    const appUrl = 'https://footballtournamentsuk.co.uk'
    const finalRedirectTo = redirect_to && !redirect_to.includes('localhost') ? redirect_to : appUrl
    const confirmationUrl = `${appUrl}/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${finalRedirectTo}`

    if (email_action_type === 'signup' || email_action_type === 'email_change') {
      // Email verification
      html = await renderAsync(
        React.createElement(EmailVerification, {
          confirmationUrl,
          siteName: 'Football Tournaments UK',
        })
      )
      subject = email_action_type === 'signup' 
        ? 'Welcome! Please verify your email address'
        : 'Verify your new email address'
    } else if (email_action_type === 'recovery') {
      // Password reset
      html = await renderAsync(
        React.createElement(PasswordReset, {
          resetUrl: confirmationUrl,
          siteName: 'Football Tournaments UK',
        })
      )
      subject = 'Reset your password - Football Tournaments UK'
    } else {
      console.error('Unknown email action type:', email_action_type)
      return new Response('Unknown email action type', { status: 400 })
    }

    console.log('Sending email via Resend:', {
      from: `Football Tournaments UK <${emailFrom}>`,
      to: user.email,
      subject,
    })

    const { data, error } = await resend.emails.send({
      from: `Football Tournaments UK <${emailFrom}>`,
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(JSON.stringify({ success: true, messageId: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Auth email error:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})