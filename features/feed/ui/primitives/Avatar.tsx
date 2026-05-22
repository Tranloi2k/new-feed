"use client";

import Image from "next/image";
import { cn } from "../utils/cn";
import { isValidImageSrc } from "../utils/image-url";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  showOnline?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
};

export function Avatar({
  src,
  name,
  size = "md",
  showOnline,
  className,
}: AvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() || "U";
  const imageSrc = isValidImageSrc(src) ? src!.trim() : null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full ring-2 ring-[color:var(--border)] bg-gradient-to-br from-[var(--accent)] to-violet-500 font-semibold text-white flex items-center justify-center",
          sizes[size]
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--success)]"
          aria-label="Đang hoạt động"
        />
      )}
    </div>
  );
}
