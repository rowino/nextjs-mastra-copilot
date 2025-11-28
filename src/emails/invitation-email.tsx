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

interface InvitationEmailProps {
  organizationName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
  expiresAt: Date;
}

export function InvitationEmail({
  organizationName,
  inviterName,
  role,
  inviteLink,
  expiresAt,
}: InvitationEmailProps) {
  const previewText = `You've been invited to join ${organizationName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Organization Invitation</Heading>
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join{" "}
            <strong>{organizationName}</strong> as a <strong>{role}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This invitation will expire on{" "}
            {expiresAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {expiresAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            .
          </Text>

          <Text style={footer}>
            If you weren&apos;t expecting this invitation, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InvitationEmail;

const main = {
  backgroundColor: "var(--color-text-inverted)",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "var(--color-bg-elevated)",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  border: "1px solid var(--color-border-base)",
};

const h1 = {
  color: "var(--color-primary)",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "0 0 20px",
};

const text = {
  color: "var(--color-text-primary)",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "var(--color-primary)",
  borderRadius: "6px",
  color: "var(--color-text-inverted)",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const hr = {
  borderColor: "var(--color-border-base)",
  margin: "32px 0",
};

const footer = {
  color: "var(--color-text-secondary)",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "12px 0",
};
