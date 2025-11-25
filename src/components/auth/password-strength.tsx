import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: Requirement[] = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Contains number",
      met: /\d/.test(password),
    },
  ];

  return (
    <ul className="space-y-1.5 text-sm">
      {requirements.map((requirement) => (
        <li
          key={requirement.label}
          className="flex items-center gap-2"
        >
          {requirement.met ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <X className="size-3.5 text-white/50" />
          )}
          <span
            className={cn(
              "transition-colors",
              requirement.met ? "text-green-500" : "text-white/50"
            )}
          >
            {requirement.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
