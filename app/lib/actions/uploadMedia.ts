"use server";
import { cookies } from "next/headers";

export const uploadFiles = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/media/upload`, {
      method: "POST",
      credentials: "include", // Tự động gửi cookies
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Upload failed with status ${response.status}`
      );
    }

    const result = await response.json();

    if (!result.data?.files || !Array.isArray(result.data.files)) {
      throw new Error("Invalid response format from upload API");
    }

    return result.data.files.map((file: any) => file.url);
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
