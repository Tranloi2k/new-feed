import type { ReactNode } from "react";
import Link from "next/link";
import { APP_NAME } from "@/features/auth/constants";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  footer: ReactNode;
};

export default function AuthShell({ children, title, description, footer }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--text-primary)]">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(320px,0.9fr)_minmax(520px,1.1fr)]">
        <aside className="hidden border-r border-[color:var(--border)] px-10 py-9 lg:flex lg:flex-col xl:px-16 xl:py-12">
          <Link href="/" className="inline-flex w-fit items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[var(--text-primary)] text-xs font-black tracking-[-0.08em] text-[var(--surface)]">NF</span>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">{APP_NAME}</span>
          </Link>

          <div className="my-auto max-w-md py-16">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Câu chuyện bắt đầu ở đây</p>
            <h2 className="text-4xl font-semibold leading-[1.12] tracking-[-0.045em] xl:text-5xl">
              Kết nối thật.<br />Chia sẻ điều đáng nhớ.
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-7 text-[var(--text-secondary)]">
              Một không gian đơn giản để theo dõi bạn bè, trò chuyện và lưu lại những khoảnh khắc của bạn.
            </p>
          </div>

          <p className="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} {APP_NAME}</p>
        </aside>

        <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[430px]">
            <Link href="/" className="mb-12 inline-flex items-center gap-3 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[var(--text-primary)] text-xs font-black tracking-[-0.08em] text-[var(--surface)]">NF</span>
              <span className="text-[15px] font-semibold">{APP_NAME}</span>
            </Link>

            <header className="mb-8">
              <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[34px]">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            </header>

            {children}

            <div className="mt-7 border-t border-[color:var(--border)] pt-6 text-sm text-[var(--text-secondary)]">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
