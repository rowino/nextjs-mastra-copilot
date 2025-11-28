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

interface EmailOTPProps {
  otp: string;
  type: "sign-in" | "sign-up";
  expiresInMinutes?: number;
}

export function EmailOTPEmail({
  otp = "123456",
  type = "sign-in",
  expiresInMinutes = 10,
}: EmailOTPProps) {
  const action = type === "sign-in" ? "sign in" : "sign up";
  const previewText = `Your ${action} code is ${otp}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </Heading>
          <Text style={styles.text}>
            Use the following code to {action} to your account:
          </Text>

          <Section style={styles.buttonContainer}>
            <div style={styles.code}>{otp}</div>
          </Section>

          <Text style={styles.text}>
            This code will expire in <strong>{expiresInMinutes} minutes</strong>.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            If you didn&apos;t request this code, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailOTPEmail;
