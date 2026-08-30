"use client";

import { resetPasswordAction } from "@/features/auth/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { APP_NAME } from "@/features/auth/constants";

const inputClass =
  "w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8">
        <div>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--text-primary)] text-sm font-black tracking-[-0.08em] text-[var(--surface)]">
            NF
          </div>
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
            Đặt lại mật khẩu
          </h2>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Nhập email hoặc tên đăng nhập {APP_NAME} của bạn cùng mật khẩu mới.
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-soft)]">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                {state.success}
              </div>
            )}

            <div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="Email hoặc tên đăng nhập"
                required
                className={inputClass}
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mật khẩu mới"
                required
                className={inputClass}
              />
            </div>

            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[var(--text-primary)] py-3 font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            </button>

            <hr className="border-[color:var(--border)]" />

            <div className="text-center">
              <Link
                href="/login"
                className="inline-block rounded-xl border border-[color:var(--border-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
