import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import * as styles from "./shared/styles";

interface TwoFactorOTPEmailProps {
  otp: string;
  userName?: string;
  expiresInMinutes?: number;
}

export function TwoFactorOTPEmail({
  otp = "123456",
  userName,
  expiresInMinutes = 5,
}: TwoFactorOTPEmailProps) {
  const previewText = `Your two-factor authentication code is ${otp}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Two-Factor Authentication</Heading>
          {userName && (
            <Text style={styles.text}>Hi {userName},</Text>
          )}
          <Text style={styles.text}>
            Use the following code to complete your two-factor authentication:
          </Text>

          <Section style={styles.buttonContainer}>
            <div style={styles.code}>{otp}</div>
          </Section>

          <Text style={styles.text}>
            This code will expire in <strong>{expiresInMinutes} minutes</strong>.
          </Text>

          <Section style={styles.alert}>
            <Text style={styles.alertText}>
              <strong>Security Alert:</strong> If you didn&apos;t attempt to sign
              in, your account may be compromised. Please change your password
              immediately.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            This is an automated security message from your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default TwoFactorOTPEmail;
