"use client";

import { authenticate } from "@/app/lib/actions/auth";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

export default function LoginForm() {
  const router = useRouter();

  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-4xl font-bold text-blue-600 mb-2">
            facebook
          </h2>
          <p className="text-center text-lg text-gray-600 dark:text-gray-400">
            Facebook giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống
            của bạn.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <form action={formAction} className="space-y-4">
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <input
                id="email"
                name="email"
                placeholder="Email hoặc số điện thoại"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mật khẩu"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="text-center">
              <a href="#" className="text-blue-600 hover:underline text-sm">
                Quên mật khẩu?
              </a>
            </div>

            <hr className="border-gray-300 dark:border-gray-600" />

            <div className="text-center">
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                onClick={() => router.push("/signup")}
              >
                Tạo tài khoản mới
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          <a href="#" className="font-bold hover:underline">
            Tạo Trang
          </a>{" "}
          dành cho người nổi tiếng, thương hiệu hoặc doanh nghiệp.
        </p>
      </div>
    </div>
  );
}
