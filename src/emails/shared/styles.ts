export const main = {
  backgroundColor: "var(--color-text-inverted)",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export const container = {
  backgroundColor: "var(--color-bg-elevated)",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  border: "1px solid var(--color-border-base)",
};

export const h1 = {
  color: "var(--color-primary)",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "0 0 20px",
};

export const text = {
  color: "var(--color-text-primary)",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

export const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

export const button = {
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

export const hr = {
  borderColor: "var(--color-border-base)",
  margin: "32px 0",
};

export const footer = {
  color: "var(--color-text-secondary)",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "12px 0",
};

export const code = {
  backgroundColor: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border-base)",
  borderRadius: "6px",
  color: "var(--color-primary)",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "8px",
  padding: "16px 24px",
  fontFamily: "monospace",
  textAlign: "center" as const,
  margin: "24px 0",
  display: "inline-block",
};

export const alert = {
  backgroundColor: "#fee",
  border: "1px solid #fcc",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "16px 0",
};

export const alertText = {
  color: "#c33",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};
