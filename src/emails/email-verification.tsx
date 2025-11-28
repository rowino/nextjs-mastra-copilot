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

interface EmailVerificationProps {
  verificationLink: string;
  userName?: string;
}

export function EmailVerificationEmail({
  verificationLink = "https://example.com/verify-email",
  userName,
}: EmailVerificationProps) {
  const previewText = "Verify your email address";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Welcome!</Heading>
          {userName && (
            <Text style={styles.text}>Hi {userName},</Text>
          )}
          <Text style={styles.text}>
            Thanks for signing up! Please verify your email address to get
            started:
          </Text>

          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={verificationLink}>
              Verify Email
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
            {verificationLink}
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            If you didn&apos;t create an account, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailVerificationEmail;
