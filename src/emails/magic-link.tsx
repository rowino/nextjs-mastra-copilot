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

interface MagicLinkEmailProps {
  magicLink: string;
  expiresInMinutes?: number;
}

export function MagicLinkEmail({
  magicLink = "https://example.com/magic-link",
  expiresInMinutes = 10,
}: MagicLinkEmailProps) {
  const previewText = "Click here to sign in to your account";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Sign In to Your Account</Heading>
          <Text style={styles.text}>
            Click the button below to securely sign in to your account. No
            password needed!
          </Text>

          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={magicLink}>
              Sign In
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
            {magicLink}
          </Text>

          <Text style={styles.text}>
            This link will expire in <strong>{expiresInMinutes} minutes</strong>.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            If you didn&apos;t request this link, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MagicLinkEmail;
