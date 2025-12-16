"use client";
import Image from "next/image";
import { useState } from "react";
import CommentSection from "./CommentSection";
import { MAX_CONTENT_LENGTH } from "../constant";

interface PostProps {
  postId: string;
  author: string;
  avatarUrl: string;
  time: string;
  content: string;
  shareCount: number;
  commentCount: number;
  likeCount: number;
  mediaUrls: string[];
}

export default function Post({
  postId,
  author,
  avatarUrl,
  time,
  content,
  commentCount,
  shareCount,
  likeCount,
  mediaUrls,
}: PostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongContent = content && content.length > MAX_CONTENT_LENGTH;
  const [isShowCommentSection, setIsShowCommentSection] = useState(false);

  const formatContent = (text: string) => {
    if (!text) return null;

    const parts = text.split(/(\s+)/);

    return parts.map((part, index) => {
      // Check if part is a hashtag
      if (part.match(/^#\w+/)) {
        return (
          <span
            key={index}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      // Preserve whitespace and newlines
      return <span key={index}>{part}</span>;
    });
  };

  const displayContent = () => {
    if (!content) return null;

    if (isLongContent && !isExpanded) {
      const truncatedContent = content.substring(0, MAX_CONTENT_LENGTH) + "...";
      return formatContent(truncatedContent);
    }

    return formatContent(content);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4"
      role="article"
    >
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={author}
                  className="w-full h-full object-cover"
                  height={40}
                  width={40}
                />
              ) : (
                author[0]
              )}
            </div>
            <div>
              <div className="font-semibold text-sm">{author}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {time}
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>

        <div className="text-sm mb-3 whitespace-pre-wrap break-words">
          {displayContent()}
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-blue-600 dark:text-blue-400 hover:underline font-medium ${
                isExpanded && "ml-1"
              }`}
            >
              {isExpanded ? "Ẩn bớt" : "Xem thêm"}
            </button>
          )}
        </div>
      </div>
      {/* Post Media */}
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="w-full">
          {mediaUrls.length === 1 ? (
            // Single media
            <div className="relative w-full">
              {mediaUrls[0].match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  className="w-full max-h-[600px] object-contain bg-black"
                  controls
                  autoPlay
                  muted
                  loop
                >
                  <source src={mediaUrls[0]} />
                  {/* <track
                    src="/path/to/captions.vtt"
                    kind="subtitles"
                    srcLang="en"
                    label="English"
                  /> */}
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="relative w-full min-h-[400px] max-h-[600px] bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={mediaUrls[0]}
                    alt="Post media"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 680px"
                    priority={false}
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "100%",
                    }}
                  />
                </div>
              )}
            </div>
          ) : mediaUrls.length === 2 ? (
            // Two media items - side by side
            <div className="grid grid-cols-2 gap-0.5">
              {mediaUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden"
                >
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 340px"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : mediaUrls.length === 3 ? (
            // Three media items - one large, two small
            <div className="grid grid-cols-2 gap-0.5">
              <div className="row-span-2 relative aspect-square overflow-hidden">
                {mediaUrls[0].match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={mediaUrls[0]}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={mediaUrls[0]}
                    alt="Media 1"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 340px"
                  />
                )}
              </div>
              {mediaUrls.slice(1, 3).map((url, index) => (
                <div
                  key={index + 1}
                  className="relative aspect-square overflow-hidden"
                >
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`Media ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 340px"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Four or more media items - 2x2 grid with "+X" overlay
            <div className="grid grid-cols-2 gap-0.5">
              {mediaUrls.slice(0, 4).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden"
                >
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 340px"
                    />
                  )}
                  {index === 3 && mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        +{mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Post Stats */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="text-blue-500">👍</span>
            {/* <span className="text-red-500">❤️</span> */}
            <span>{likeCount}</span>
          </div>
          <div className="flex gap-3">
            <span>{commentCount} bình luận</span>
            <span>{shareCount} chia sẻ</span>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 dark:border-gray-700" />
      {/* Post Actions */}
      <div className="flex justify-around p-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-1 justify-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
          </svg>
          <span className="font-medium text-sm">Thích</span>
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-1 justify-center"
          onClick={() => {
            setIsShowCommentSection((prev) => !prev);
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
          <span className="font-medium text-sm">Bình luận</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-1 justify-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
          <span className="font-medium text-sm">Chia sẻ</span>
        </button>
      </div>
      {/* Comment Section */}
      {isShowCommentSection && <CommentSection postId={postId} />}
    </div>
  );
}
