"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/app", label: "总览" },
  { href: "/app/resume", label: "简历" },
  { href: "/app/applications", label: "投递" },
  { href: "/app/interview", label: "面试" },
];

export function AppShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6">
      <header className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/app" className="font-display text-xl">
            店职通
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => {
              const active =
                l.href === "/app" ? pathname === "/app" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    active ? "bg-sand text-ink" : "text-mist hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-mist">你好，{name}</span>
          <button onClick={logout} className="btn-secondary !py-1.5 !text-sm">
            退出
          </button>
        </div>
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}
