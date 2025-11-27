import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "max-w-md w-full rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-white/70">{subtitle}</p>
        )}
      </div>

      {children}

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  )
}
