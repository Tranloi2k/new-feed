import { BadgeCheck } from "lucide-react";
import { cn } from "../utils/cn";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("h-4 w-4 text-[var(--accent)] fill-[var(--accent-soft)]", className)}
      aria-label="Đã xác minh"
    />
  );
}
