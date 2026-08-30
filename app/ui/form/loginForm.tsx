"use client";

import { authenticate } from "@/features/auth/actions/auth";
import AuthShell from "@/features/auth/ui/AuthShell";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

type LoginFormProps = { registered?: boolean };

const fieldClassName =
  "h-12 w-full rounded-[5px] border border-[color:var(--border)] bg-transparent px-3.5 text-[15px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] disabled:opacity-60";

export default function LoginForm({ registered = false }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(authenticate, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthShell
      title="Chào mừng trở lại"
      description="Đăng nhập để tiếp tục xem bảng tin và trò chuyện cùng bạn bè."
      footer={
        <p>
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-semibold text-[var(--text-primary)] hover:underline">Đăng ký ngay</Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-5">
        {registered && !state?.error && (
          <div className="flex items-start gap-2.5 rounded-[5px] border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Tạo tài khoản thành công. Hãy đăng nhập để tiếp tục.</span>
          </div>
        )}

        {state?.error && (
          <div role="alert" className="rounded-[5px] border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email hoặc tên đăng nhập</label>
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="username"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            className={fieldClassName}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
            <Link href="/forgot-password" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Quên mật khẩu?</Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            className={fieldClassName}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-[5px] bg-[var(--text-primary)] px-4 text-sm font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          {!isPending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>
    </AuthShell>
  );
}
