import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetProps {
  resetUrl: string
  siteName?: string
}

export const PasswordReset = ({
  resetUrl,
  siteName = "Football Tournaments UK",
}: PasswordResetProps) => (
  <Html>
    <Head />
    <Preview>Reset your password for Football Tournaments UK</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={title}>⚽ {siteName}</Heading>
        </Section>
        
        <Section style={section}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            We received a request to reset the password for your Football Tournaments UK account.
          </Text>
          <Text style={text}>
            If you made this request, click the button below to set a new password. If you didn't request a password reset, you can safely ignore this email.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            For your security, this password reset link will expire in 1 hour.
          </Text>
          
          <Text style={smallText}>
            <strong>Security tip:</strong> If you're having trouble accessing your account, make sure you're using the email address you registered with. You can always contact our support team if you need assistance.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            <strong>Football Tournaments UK</strong><br/>
            <a href="mailto:info@footballtournamentsuk.co.uk" style={footerLink}>
              info@footballtournamentsuk.co.uk
            </a>
          </Text>
          <Text style={footerSmall}>
            If you did not request this, please ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordReset

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
}

const title = {
  color: '#5a9f47', // Football green
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const section = {
  padding: '0 24px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5a9f47', // Football green
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  display: 'inline-block',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '20px 0 0',
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '40px',
  paddingTop: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#5a9f47',
  textDecoration: 'none',
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
}