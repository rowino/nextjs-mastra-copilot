import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    name?: string;
    email: string;
    image?: string | null;
  };
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const fallbackLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size])}>
      {user.image && (
        <AvatarImage src={user.image} alt={user.name || user.email} />
      )}
      <AvatarFallback className="bg-white/20 text-white">
        {fallbackLetter}
      </AvatarFallback>
    </Avatar>
  );
}
