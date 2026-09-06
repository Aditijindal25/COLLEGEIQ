"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SiteNavProps = {
  user?: { name: string } | null;
};

export default function SiteNav({ user = null }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("collegeiq-theme") === "dark" ? "dark" : "light";
  });
  const [currentUser, setCurrentUser] = useState(user);
  const [userLoading, setUserLoading] = useState(!user);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("collegeiq-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;

        const data = await response.json();
        return data.user ?? null;
      })
      .then((nextUser) => {
        if (active) setCurrentUser(nextUser);
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      })
      .finally(() => {
        if (active) setUserLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const initials = currentUser?.name
    ? currentUser.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <nav className="site-nav sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="site-mark flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white">C</span>
          <span>
            <span className="block text-xl font-bold tracking-tight text-[var(--text-primary)]">CollegeIQ</span>
            <span className="block text-[10px] font-bold tracking-[0.16em] text-[var(--text-muted)]">FIND. COMPARE. DECIDE.</span>
          </span>
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="site-menu-button rounded-lg border border-[var(--border)] px-3 py-2 text-xl text-[var(--text-primary)] md:hidden"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "×" : "☰"}
        </button>

        <div className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-2 border-b border-[var(--border)] bg-white p-4 shadow-lg md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          <Link href="/colleges" className="site-nav-link" onClick={() => setOpen(false)}>Discover</Link>
          <Link href="/rankings" className="site-nav-link" onClick={() => setOpen(false)}>Rankings</Link>
          <Link href="/compare" className="site-nav-link" onClick={() => setOpen(false)}>Compare</Link>
          <Link href="/predictor" className="site-nav-link" onClick={() => setOpen(false)}>Predictor</Link>
          <button type="button" className="theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          {userLoading ? (
            <span className="h-10 w-24 animate-pulse rounded-lg bg-slate-100" aria-label="Loading account" />
          ) : currentUser ? (
            <Link href="/profile" className="site-user-link" onClick={() => setOpen(false)}>
              <span className="site-avatar">{initials}</span>
              <span className="hidden text-left sm:block">{currentUser.name}</span>
            </Link>
          ) : (
            <Link href="/auth" className="site-primary-button" onClick={() => setOpen(false)}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
