"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OTPInput } from "./otp-input";

interface TwoFactorSetupProps {
  totpURI: string;
  backupCodes: string[];
  onVerify: (code: string) => Promise<void>;
  onClose: () => void;
}

export function TwoFactorSetup({
  totpURI,
  backupCodes,
  onVerify,
  onClose,
}: TwoFactorSetupProps) {
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codesCopied, setCodesCopied] = useState(false);

  const extractSecret = (uri: string): string => {
    try {
      const url = new URL(uri);
      return url.searchParams.get("secret") || "";
    } catch {
      return "";
    }
  };

  const secret = extractSecret(totpURI);

  const handleCopyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCodesCopied(true);
      setTimeout(() => setCodesCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy backup codes:", err);
    }
  };

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await onVerify(otpValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-2 rounded-lg">
          <QRCodeSVG value={totpURI} size={180} />
        </div>
        <p className="text-sm text-white/70 text-center">
          Scan with your authenticator app
        </p>
      </div>

      {secret && (
        <div className="space-y-2">
          <p className="text-sm text-white/70">
            Or enter this code manually:
          </p>
          <div className="bg-white/5 border border-white/10 rounded-md p-3">
            <code className="text-sm font-mono text-white break-all">
              {secret}
            </code>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/90">
            Backup codes
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleCopyBackupCodes}
          >
            {codesCopied ? (
              <>
                <Check className="size-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4 mr-1" />
                Copy codes
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-white/50">
          Save these codes in a secure location. Each code can only be used once.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded px-3 py-2"
            >
              <code className="text-sm font-mono text-white">{code}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/90">
            Enter verification code
          </p>
          <OTPInput
            value={otpValue}
            onChange={setOtpValue}
            disabled={isVerifying}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white"
            onClick={onClose}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleVerify}
            disabled={isVerifying || otpValue.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Enable"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
