"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_POST } from "../lib/graphql/mutations";
import { uploadFiles } from "../lib/actions/uploadMedia";

export default function CreatePost() {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "LINK">(
    "TEXT"
  );
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);

  const [createPost, { loading, error }] = useMutation(CREATE_POST, {
    context: {
      credentials: "include", // Đảm bảo gửi cookies
    },
    refetchQueries: ["GetNewsFeed"],
    onCompleted: (data) => {
      if (data.createPost.success) {
        // Reset form
        setContent("");
        setLocation("");
        setSelectedFiles([]);
        setPreviews([]);
        setPostType("TEXT");
        setShowModal(false);
      }
    },
    onError: (err) => {
      console.error("Error creating post:", err);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    const filePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setPreviews(filePreviews);

    if (files[0]?.type.startsWith("video/")) {
      setPostType("VIDEO");
    } else if (files[0]?.type.startsWith("image/")) {
      setPostType("IMAGE");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let mediaUrls: string[] = [];

      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }
      console.log(mediaUrls);
      if (postType !== "TEXT" && mediaUrls.length === 0) {
        alert("Vui lòng chọn file phương tiện cho loại bài viết này");
        setUploading(false);
        return;
      }

      await createPost({
        variables: {
          input: {
            content: content || null,
            postType: postType,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
            location: location || null,
          },
        },
      });
    } catch (err: any) {
      console.error("Error:", err);
      alert("Lỗi: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2 items-center mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Bạn đang nghĩ gì?
          </button>
        </div>
        <hr className="border-gray-200 dark:border-gray-700 mb-3" />
        <div className="flex justify-around">
          <button
            onClick={() => {
              setPostType("VIDEO");
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-1 justify-center"
          >
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23 4v2h-2v12h2v2H1v-2h2V6H1V4h22zm-4 2H5v12h14V6z" />
            </svg>
            <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">
              Video
            </span>
          </button>
          <button
            onClick={() => {
              setPostType("IMAGE");
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-1 justify-center"
          >
            <svg
              className="w-6 h-6 text-green-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">
              Ảnh/video
            </span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Tạo bài viết</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {/* Post Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Loại bài viết:
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as any)}
                  disabled={selectedFiles.length > 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="TEXT">Văn bản</option>
                  <option value="IMAGE">Hình ảnh</option>
                  <option value="VIDEO">Video</option>
                  <option value="LINK">Liên kết</option>
                </select>
              </div>

              {/* Content */}
              <div className="mb-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Bạn đang nghĩ gì?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Location */}
              <div className="mb-4">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Thêm vị trí..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* File Upload */}
              {(postType === "IMAGE" || postType === "VIDEO") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Tải lên:
                  </label>
                  <input
                    type="file"
                    multiple
                    accept={postType === "IMAGE" ? "image/*" : "video/*"}
                    onChange={handleFileSelect}
                    className="w-full"
                  />
                </div>
              )}

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      {preview.type === "video" ? (
                        <video
                          src={preview.url}
                          controls
                          className="w-full rounded-lg"
                        />
                      ) : (
                        <img
                          src={preview.url}
                          alt="preview"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error.message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Đang tải lên..."
                  : loading
                  ? "Đang đăng..."
                  : "Đăng bài"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
