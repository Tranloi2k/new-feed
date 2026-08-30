"use client";

import { register } from "@/features/auth/actions/auth";
import AuthShell from "@/features/auth/ui/AuthShell";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

const fieldClassName =
  "h-12 w-full rounded-[5px] border border-[color:var(--border)] bg-transparent px-3.5 text-[15px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] disabled:opacity-60";

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(register, undefined);
  const [values, setValues] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Chỉ mất một phút để bắt đầu chia sẻ và kết nối trên NewFeed."
      footer={
        <p>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-[var(--text-primary)] hover:underline">Đăng nhập</Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div role="alert" className="rounded-[5px] border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Họ và tên <span className="font-normal text-[var(--text-muted)]">(tuỳ chọn)</span>
            </label>
            <input id="fullName" name="fullName" type="text" autoComplete="name" placeholder="Nguyễn Văn A" value={values.fullName} onChange={(event) => updateValue("fullName", event.target.value)} disabled={isPending} className={fieldClassName} />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">Tên đăng nhập</label>
            <input id="username" name="username" type="text" autoComplete="username" placeholder="username" required value={values.username} onChange={(event) => updateValue("username", event.target.value)} disabled={isPending} className={fieldClassName} />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required value={values.email} onChange={(event) => updateValue("email", event.target.value)} disabled={isPending} className={fieldClassName} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
            <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Tối thiểu 6 ký tự" required minLength={6} value={values.password} onChange={(event) => updateValue("password", event.target.value)} disabled={isPending} className={fieldClassName} />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Xác nhận mật khẩu</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" required minLength={6} value={values.confirmPassword} onChange={(event) => updateValue("confirmPassword", event.target.value)} disabled={isPending} className={fieldClassName} />
          </div>
        </div>

        <p className="text-xs leading-5 text-[var(--text-muted)]">
          Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư của NewFeed.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-[5px] bg-[var(--text-primary)] px-4 text-sm font-semibold text-[var(--surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          {!isPending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>
    </AuthShell>
  );
}
