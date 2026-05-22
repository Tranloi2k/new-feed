"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import {
  signup,
  logout as backendLogout,
  getCurrentUser,
} from "@/features/auth/lib/auth";

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function getCurrentUserAction() {
  return await getCurrentUser();
}

export async function authenticate(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/home",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email hoặc mật khẩu không đúng." };
        default:
          return { error: "Đã xảy ra lỗi. Vui lòng thử lại." };
      }
    }
    throw error;
  }
}

export async function register(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!username || !email || !password) {
    return { error: "Vui lòng điền đầy đủ thông tin bắt buộc." };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp." };
  }

  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự." };
  }

  try {
    await signup({
      username,
      email,
      password,
      ...(fullName ? { fullName } : {}),
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/home",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng thử đăng nhập.",
      };
    }

    const message =
      error instanceof Error ? error.message : "Đăng ký thất bại.";
    return { error: message };
  }

  return { success: "Đăng ký thành công." };
}

export async function logoutAction() {
  try {
    await backendLogout();
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Logout failed" };
  }
}
