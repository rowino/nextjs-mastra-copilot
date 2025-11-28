import {
  Body,
  Button,
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

interface PasswordResetEmailProps {
  resetLink: string;
  userName?: string;
  expiresInMinutes?: number;
}

export function PasswordResetEmail({
  resetLink = "https://example.com/reset-password",
  userName,
  expiresInMinutes = 30,
}: PasswordResetEmailProps) {
  const previewText = "Reset your password";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Reset Your Password</Heading>
          {userName && (
            <Text style={styles.text}>Hi {userName},</Text>
          )}
          <Text style={styles.text}>
            We received a request to reset your password. Click the button below
            to create a new password:
          </Text>

          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={resetLink}>
              Reset Password
            </Button>
          </Section>

          <Text style={styles.text}>
            Or copy and paste this link into your browser:
          </Text>
          <Text
            style={{
              ...styles.text,
              wordBreak: "break-all",
              color: "var(--color-primary)",
            }}
          >
            {resetLink}
          </Text>

          <Text style={styles.text}>
            This link will expire in <strong>{expiresInMinutes} minutes</strong>.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email. Your password will not be changed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordResetEmail;
