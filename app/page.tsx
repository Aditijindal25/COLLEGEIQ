
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CollegeCard from "@/components/CollegeCard";
import SiteNav from "@/components/SiteNav";
import DecisionPath from "@/components/DecisionPath";
import GoalLauncher from "@/components/GoalLauncher";
import { formatCurrency, formatRating, getCollegeLocation, getPlacementLabel } from "@/lib/collegeDisplay";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type College = {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  placement: number;
  description?: string;
  website?: string;
  courses?: {
    id: string;
    name: string;
    duration: string;
    degree: string;
  }[];
};

export default function Home() {
  // =========================
  // SEARCH STATE
  // =========================

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [featured, setFeatured] = useState<College[]>([]);

  // =========================
  // USER STATE
  // =========================

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // =========================
  // GET LOGGED-IN USER
  // =========================

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    fetch("/api/colleges", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((colleges: College[]) => {
        setFeatured([...colleges].sort((a, b) => b.rating - a.rating).slice(0, 3));
      })
      .catch((error) => console.error("Failed to load featured colleges:", error));
  }, []);

  // =========================
  // SEARCH COLLEGES
  // =========================

  const handleSearch = async () => {
    if (!search.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const response = await fetch("/api/colleges", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }

      const colleges: College[] = await response.json();

      const query = search.toLowerCase().trim();

      const filtered = colleges.filter((college) => {
        const collegeName =
          college.name?.toLowerCase() || "";

        const location =
          college.location?.toLowerCase() || "";

        const state =
          college.state?.toLowerCase() || "";

        const courses =
          college.courses
            ?.map(
              (course) =>
                course.name?.toLowerCase() || ""
            )
            .join(" ") || "";

        return (
          collegeName.includes(query) ||
          location.includes(query) ||
          state.includes(query) ||
          courses.includes(query)
        );
      });

      setResults(filtered);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // POPULAR SEARCH
  // =========================

  const handlePopularSearch = (collegeName: string) => {
    setSearch(collegeName);

    setTimeout(() => {
      const searchButton =
        document.getElementById(
          "college-search-button"
        ) as HTMLButtonElement | null;

      searchButton?.click();
    }, 50);
  };

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50 text-slate-900">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      {userLoading ? <div className="h-[73px] animate-pulse border-b border-[var(--border)] bg-white" /> : <SiteNav user={user} />}


      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="dashboard-hero relative overflow-hidden px-5 pb-14 pt-8 sm:px-6 sm:pt-10">
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="site-mark flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white">C</span>
            </div>
            <div className="hidden items-center gap-6 md:flex">
              <Link href="/colleges" className="site-nav-link text-[13px]">Discover</Link>
              <Link href="/rankings" className="site-nav-link text-[13px]">Rankings</Link>
              <Link href="/compare" className="site-nav-link text-[13px]">Compare</Link>
              <Link href="/predictor" className="site-nav-link text-[13px]">Predictor</Link>
              <button type="button" className="theme-toggle" aria-label="Switch to light mode">
                Light mode
              </button>
              <Link href="/auth" className="site-primary-button">Sign In</Link>
            </div>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.05fr_1.45fr]">
            <div className="pt-2">
              <h2 className="text-[4.4rem] font-black leading-[0.84] tracking-[-0.07em] text-white sm:text-[6.2rem]">
                clarity.
              </h2>

              <p className="mt-8 max-w-[34rem] text-2xl leading-[1.5] text-slate-200">
                Choosing a college is a major decision. CollegeIQ brings important information together so you can spend less time searching and more time making the right choice.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="dashboard-hero-card min-h-[200px] rounded-[26px] p-6">
                <span className="dashboard-hero-number">03</span>
                <h3 className="mt-8 text-3xl font-semibold text-slate-900">Smarter Discovery</h3>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Find colleges based on your interests and goals.
                </p>
              </div>

              <div className="dashboard-hero-card min-h-[200px] rounded-[26px] p-6">
                <span className="dashboard-hero-number">04</span>
                <h3 className="mt-8 text-3xl font-semibold text-slate-900">Better Decisions</h3>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Turn scattered information into a clearer decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-cta px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-700">
            Your college journey starts here
          </p>

          <h3 className="mt-4 text-[3.2rem] font-bold tracking-[-0.06em] text-slate-900 sm:text-[6.5rem] sm:leading-[0.9]">
            Ready to find your college?
          </h3>

          <p className="mx-auto mt-5 max-w-3xl text-xl leading-8 text-slate-700">
            Explore your options, compare colleges, and make your next decision with confidence.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/colleges" className="dashboard-cta-primary rounded-xl px-8 py-4 text-lg font-bold text-white">
              Explore Colleges
            </Link>
            <Link href="/predictor" className="dashboard-cta-secondary rounded-xl px-8 py-4 text-lg font-bold text-slate-900">
              Try College Predictor
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#123b37] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f6a65f]">
            The CollegeIQ Method
          </p>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Move from a broad search to a confident shortlist in four focused steps.
          </h3>

          <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <div className="h-full rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-[#f6a65f]">01</span>
                <span aria-hidden="true" className="text-lg text-white/70">→</span>
              </div>

              <h4 className="mt-6 text-2xl font-bold text-white">Discover</h4>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Find colleges that fit your goals.
              </p>

              <Link href="/colleges" className="mt-4 inline-block text-sm font-bold text-[#f6a65f] transition hover:text-[#f8c28c]">
                Start here →
              </Link>
            </div>

            <div className="h-full rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-[#f6a65f]">02</span>
                <span aria-hidden="true" className="text-lg text-white/70">→</span>
              </div>

              <h4 className="mt-6 text-2xl font-bold text-white">Shortlist</h4>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Save the options worth a closer look.
              </p>

              <Link href="/colleges" className="mt-4 inline-block text-sm font-bold text-[#f6a65f] transition hover:text-[#f8c28c]">
                Start here →
              </Link>
            </div>

            <div className="h-full rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-[#f6a65f]">03</span>
                <span aria-hidden="true" className="text-lg text-white/70">→</span>
              </div>

              <h4 className="mt-6 text-2xl font-bold text-white">Compare</h4>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                See the trade-offs side by side.
              </p>

              <Link href="/compare" className="mt-4 inline-block text-sm font-bold text-[#f6a65f] transition hover:text-[#f8c28c]">
                Start here →
              </Link>
            </div>

            <div className="h-full rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-[#f6a65f]">04</span>
                <span aria-hidden="true" className="text-lg text-white/70">→</span>
              </div>

              <h4 className="mt-6 text-2xl font-bold text-white">Predict</h4>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Turn your rank into a realistic starting point.
              </p>

              <Link href="/predictor" className="mt-4 inline-block text-sm font-bold text-[#f6a65f] transition hover:text-[#f8c28c]">
                Start here →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* WHY COLLEGEIQ */}
      {/* ================================================= */}

      <section className="border-y border-slate-200 bg-white px-5 py-10 sm:px-6">

        <div className="mx-auto max-w-6xl">

          <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_1.9fr]">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                Why CollegeIQ
              </p>

              <h3 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[4rem] sm:leading-[0.95]">
                Make decisions
                <span className="block">with more clarity.</span>
              </h3>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-700">
                Choosing a college is a major decision.
                CollegeIQ brings important information together
                so you can spend less time searching and more
                time making the right choice.
              </p>

            </div>


            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">

              {/* 01 */}

              <div className="min-h-[170px] rounded-[20px] bg-[#dfeae7] p-4 text-slate-900 shadow-sm">

                <p className="text-[2rem] font-bold leading-none text-slate-950">
                  01
                </p>

                <h4 className="mt-4 text-[1.05rem] font-bold text-slate-950">
                  Clear Information
                </h4>

                <p className="mt-2 text-sm leading-5 text-slate-800">
                  Important college information in one place.
                </p>

              </div>


              {/* 02 */}

              <div className="min-h-[170px] rounded-[20px] bg-[#dfeae7] p-4 text-slate-900 shadow-sm">

                <p className="text-[2rem] font-bold leading-none text-slate-950">
                  02
                </p>

                <h4 className="mt-4 text-[1.05rem] font-bold text-slate-950">
                  Easy Comparison
                </h4>

                <p className="mt-2 text-sm leading-5 text-slate-800">
                  Compare your options without jumping between websites.
                </p>

              </div>


              {/* 03 */}

              <div className="min-h-[170px] rounded-[20px] bg-[#dfeae7] p-4 text-slate-900 shadow-sm">

                <p className="text-[2rem] font-bold leading-none text-slate-950">
                  03
                </p>

                <h4 className="mt-4 text-[1.05rem] font-bold text-slate-950">
                  Smarter Discovery
                </h4>

                <p className="mt-2 text-sm leading-5 text-slate-800">
                  Find colleges based on your interests and goals.
                </p>

              </div>


              {/* 04 */}

              <div className="min-h-[170px] rounded-[20px] bg-[#dfeae7] p-4 text-slate-900 shadow-sm">

                <p className="text-[2rem] font-bold leading-none text-slate-950">
                  04
                </p>

                <h4 className="mt-4 text-[1.05rem] font-bold text-slate-950">
                  Better Decisions
                </h4>

                <p className="mt-2 text-sm leading-5 text-slate-800">
                  Turn scattered information into a clearer decision.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* CTA */}
      {/* ================================================= */}

      <section className="bg-[#dfeae7] px-5 py-10 text-slate-900 sm:px-6">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-600">
            Your college journey starts here
          </p>

          <h3 className="mt-4 text-[2.6rem] font-bold tracking-[-0.05em] sm:text-[4rem] sm:leading-[0.95]">
            Ready to find your college?
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-slate-700">
            Explore your options, compare colleges, and make your next decision with confidence.
          </p>


          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/colleges"
              className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Explore Colleges
            </Link>

            <Link
              href="/predictor"
              className="rounded-xl border border-slate-700 bg-transparent px-7 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-white/10"
            >
              Try College Predictor
            </Link>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="bg-[#dfeae7] px-0 py-2 text-slate-700">

        <div className="mx-auto flex max-w-[100vw] flex-col gap-2 border-t border-slate-600/80 pt-2 px-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2.5">

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              N
            </div>

            <p className="text-[1.4rem] font-bold leading-none text-slate-950">
              CollegeIQ
            </p>

            <p className="text-xs text-slate-700">
              Compare. Decide.
            </p>

          </div>

          <p className="text-center text-sm text-slate-700 sm:text-left">
            © 2026 CollegeIQ · Built by Aditi Jindal
          </p>

        </div>

      </footer>

    </main>
  );
}

