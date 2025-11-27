import { cn } from "@/lib/utils"

interface DividerProps {
  text?: string
  className?: string
}

export function Divider({
  text = "or continue with",
  className,
}: DividerProps) {
  return (
    <div className={cn("relative my-6", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/20" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-transparent px-4 text-white/50">{text}</span>
      </div>
    </div>
  )
}
