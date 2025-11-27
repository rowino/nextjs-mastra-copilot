"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AuthInputProps
  extends Omit<React.ComponentProps<"input">, "className"> {
  label: string
  error?: string
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-white/90"
        >
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus-visible:ring-white/20",
              isPassword && "pr-10",
              error && "border-red-400/50"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-white/50 hover:bg-white/10 hover:text-white/80"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"
