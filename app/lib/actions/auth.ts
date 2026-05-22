"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { getCurrentUser } from "../services/auth";

export async function getCurrentUserAction() {
  return await getCurrentUser();
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo: "/home",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    // Call backend logout endpoint
    if (accessToken?.value) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Cookie: cookieStore.toString(),
        },
      });
    }

    // Delete cookies
    cookieStore.delete("access_token");
    cookieStore.delete("user_id");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Logout failed" };
  }
}
