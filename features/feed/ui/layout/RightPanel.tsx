"use client";

import { Search } from "lucide-react";
import { Avatar } from "../primitives/Avatar";

const suggestedUsers = [
  { name: "Mai Linh", username: "mailinh", note: "Thiết kế sản phẩm" },
  { name: "Hoàng Nguyễn", username: "hoangdev", note: "Frontend engineer" },
  { name: "Khoa Trần", username: "khoapm", note: "Product & indie maker" },
];

const topics = ["Thiết kế", "Công nghệ", "Chuyện đi làm"];

export function RightPanel() {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[calc(var(--header-height)+1rem)] space-y-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Tìm kiếm"
            className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
          />
        </label>

        <section className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Gợi ý cho bạn</h2>
            <button type="button" className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Xem thêm</button>
          </div>
          <ul className="space-y-4">
            {suggestedUsers.map((person) => (
              <li key={person.username} className="flex items-center gap-3">
                <Avatar name={person.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{person.name}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">{person.note}</p>
                </div>
                <button type="button" className="rounded-lg bg-[var(--text-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--surface)] transition-opacity hover:opacity-80">
                  Theo dõi
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-1">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Chủ đề hôm nay</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button key={topic} type="button" className="rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
                {topic}
              </button>
            ))}
          </div>
        </section>

        <p className="px-1 text-[11px] leading-5 text-[var(--text-muted)]">© 2026 NewFeed · Quyền riêng tư · Điều khoản</p>
      </div>
    </aside>
  );
}
