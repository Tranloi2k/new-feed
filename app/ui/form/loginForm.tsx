"use client";

import { authenticate } from "@/features/auth/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import {
  APP_NAME,
  APP_TAGLINE,
} from "@/features/auth/constants";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8">
        <div>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--text-primary)] text-sm font-black tracking-[-0.08em] text-[var(--surface)]">NF</div>
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">Đăng nhập vào {APP_NAME}</h2>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            {APP_TAGLINE}
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-soft)]">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {state.error}
              </div>
            )}

            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email hoặc tên đăng nhập"
                required
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Mật khẩu"
                required
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[var(--text-primary)] py-3 font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <hr className="border-[color:var(--border)]" />

            <div className="text-center">
              <Link
                href="/signup"
                className="inline-block rounded-xl border border-[color:var(--border-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
              >
                Tạo tài khoản mới
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
