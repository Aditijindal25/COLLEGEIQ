
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";

type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type SavedCollege = {
  id: number;
  name: string;
  location: string;
  state: string;
  rating: number;
  placement: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!data.user) {
          router.replace("/auth");
          return;
        }

        setUser(data.user);

        const savedResponse = await fetch("/api/saved-colleges", { cache: "no-store" });
        if (savedResponse.ok) setSavedColleges(await savedResponse.json());
      } catch (error) {
        console.error("Failed to load profile:", error);
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50">

      <SiteNav user={user} />

      {/* ================= PROFILE ================= */}

      <section className="px-6 py-12">

        <div className="mx-auto max-w-4xl">

          {/* HEADER */}

          <div className="mb-8">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Account
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Your Profile
            </h2>

            <p className="mt-3 text-slate-500">
              Manage your CollegeIQ account and preferences.
            </p>

          </div>

          {/* PROFILE CARD */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* TOP */}

            <div className="bg-slate-950 px-6 py-10 text-white sm:px-10">

              <div className="flex flex-col items-center gap-5 sm:flex-row">

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-950 shadow-lg">
                  {getInitials(user.name)}
                </div>

                <div className="text-center sm:text-left">

                  <p className="text-sm font-medium text-slate-400">
                    CollegeIQ Member
                  </p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {user.name}
                  </h3>

                  <p className="mt-2 text-slate-300">
                    {user.email}
                  </p>

                </div>

              </div>

            </div>

            {/* INFORMATION */}

            <div className="p-6 sm:p-10">

              <h3 className="text-lg font-bold text-slate-950">
                Account Information
              </h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {/* NAME */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Full Name
                  </p>

                  <p className="mt-2 font-semibold text-slate-950">
                    {user.name}
                  </p>

                </div>

                {/* EMAIL */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email Address
                  </p>

                  <p className="mt-2 break-all font-semibold text-slate-950">
                    {user.email}
                  </p>

                </div>

                {/* MEMBER SINCE */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Member Since
                  </p>

                  <p className="mt-2 font-semibold text-slate-950">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                </div>

                {/* ACCOUNT STATUS */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account Status
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <p className="font-semibold text-slate-950">
                      Active
                    </p>

                  </div>

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="mt-10 border-t border-slate-200 pt-8">

                <h3 className="text-lg font-bold text-slate-950">
                  Quick Actions
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <Link
                    href="/"
                    className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <p className="text-lg font-bold text-slate-950">
                      🔎 Discover Colleges
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Search colleges and explore detailed information.
                    </p>
                  </Link>

                  <Link
                    href="/compare"
                    className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <p className="text-lg font-bold text-slate-950">
                      ⚖️ Compare Colleges
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Compare colleges based on important factors.
                    </p>
                  </Link>

                  <Link
                    href="/predictor"
                    className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <p className="text-lg font-bold text-slate-950">
                      🎯 College Predictor
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Find colleges based on your exam and rank.
                    </p>
                  </Link>

                </div>

              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Your shortlist</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">Saved colleges</h3>
                  </div>
                  <Link href="/colleges" className="text-sm font-bold text-slate-700 hover:text-slate-950">Discover more →</Link>
                </div>

                {savedColleges.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
                    <p className="font-semibold text-slate-900">No saved colleges yet.</p>
                    <p className="mt-2 text-sm text-slate-500">Save promising options while you explore.</p>
                    <Link href="/colleges" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Discover colleges</Link>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {savedColleges.map((college) => (
                      <div key={college.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <h4 className="font-bold text-slate-950">{college.name}</h4>
                        <p className="mt-1 text-sm text-slate-500">{college.location}, {college.state}</p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-700">★ {college.rating} · {college.placement > 0 ? `${college.placement} LPA` : "Placement unavailable"}</span>
                          <Link href={`/colleges/${college.id}`} className="font-bold text-slate-900">Open →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        © 2026 CollegeIQ · Built by Aditi Jindal
      </footer>

    </main>
  );
}

