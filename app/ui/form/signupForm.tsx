"use client";

import { register } from "@/features/auth/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { APP_NAME, APP_TAGLINE } from "@/features/auth/constants";

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(register, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-[440px] space-y-8">
        <div>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--text-primary)] text-sm font-black tracking-[-0.08em] text-[var(--surface)]">NF</div>
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">Tham gia {APP_NAME}</h2>
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
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Họ và tên (tuỳ chọn)"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Tên đăng nhập"
                required
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                required
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Mật khẩu"
                required
                minLength={6}
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Xác nhận mật khẩu"
                required
                minLength={6}
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[var(--text-primary)] py-3 font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <p className="text-center text-sm text-[var(--text-secondary)]">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-[var(--text-primary)] hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
