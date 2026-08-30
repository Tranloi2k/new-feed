"use client";

import Image from "next/image";
import { cn } from "../utils/cn";

const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

export function PostMedia({
  mediaUrls = [],
  alt = "Nội dung hình ảnh của bài viết",
}: {
  mediaUrls?: string[] | null;
  alt?: string;
}) {
  const urls = (mediaUrls ?? []).filter(Boolean);
  if (!urls.length) return null;

  if (urls.length === 1) {
    const url = urls[0];
    return (
      <div className="relative mt-3 overflow-hidden rounded-xl bg-black/5">
        {isVideo(url) ? (
          <video
            className="max-h-[min(70vh,560px)] w-full object-contain"
            controls
            playsInline
            preload="metadata"
          >
            <source src={url} />
          </video>
        ) : (
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
            <Image
              src={url}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 680px) 100vw, 680px"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 grid gap-1 overflow-hidden rounded-[var(--radius-lg)]",
        urls.length === 2 ? "grid-cols-2" : "grid-cols-2"
      )}
    >
      {urls.slice(0, 4).map((url, index) => (
        <div
          key={index}
          className={cn(
            "relative aspect-square overflow-hidden bg-[var(--surface-muted)]",
            urls.length === 3 && index === 0 && "row-span-2"
          )}
        >
          {isVideo(url) ? (
            <video src={url} controls className="h-full w-full object-cover" />
          ) : (
            <Image
              src={url}
              alt={`${alt}, ảnh ${index + 1}`}
              fill
              className="object-cover"
              sizes="340px"
            />
          )}
          {index === 3 && urls.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-bold text-white">
              +{urls.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
