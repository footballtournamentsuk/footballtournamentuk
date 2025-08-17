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

interface EmailVerificationProps {
  confirmationUrl: string
  siteName?: string
}

export const EmailVerification = ({
  confirmationUrl,
  siteName = "Football Tournaments UK",
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address to complete your registration</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={title}>⚽ {siteName}</Heading>
        </Section>
        
        <Section style={section}>
          <Heading style={h1}>Verify Your Email Address</Heading>
          <Text style={text}>
            Welcome to Football Tournaments UK! We're excited to have you join our community of football enthusiasts.
          </Text>
          <Text style={text}>
            To complete your registration and start discovering amazing football tournaments, please verify your email address by clicking the button below:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Verify Email Address
            </Button>
          </Section>
          
          <Text style={text}>
            Once verified, you'll be able to:
          </Text>
          <Text style={listText}>
            • Browse and search football tournaments across the UK<br/>
            • Create and manage your own tournaments<br/>
            • Connect with other football organizers<br/>
            • Access exclusive tournament features
          </Text>
          
          <Text style={smallText}>
            This verification link will expire in 24 hours. If you didn't create an account with Football Tournaments UK, please ignore this email.
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

export default EmailVerification

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

const listText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
  paddingLeft: '20px',
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