
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

      <section className="dashboard-hero relative overflow-hidden px-5 pb-20 pt-16 sm:px-6 sm:pt-24">


        <div className="relative mx-auto max-w-5xl text-center">

          {/* Badge */}

          <div className="dashboard-signal mb-7 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm">

            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            Make a smarter college decision

          </div>


          {/* Heading */}

          <h2 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">

            Find the college

            <span className="dashboard-title-accent block text-slate-400">
              that&apos;s right for you.
            </span>

          </h2>


          {/* Description */}

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Discover colleges, compare fees and placements,
            explore courses, and find recommendations based on
            your goals.
          </p>


          {/* ================= SEARCH ================= */}

          <div className="mx-auto mt-10 max-w-3xl">

            <div className="dashboard-search flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">

              <div className="flex flex-1 items-center">

                <span className="pl-4 text-xl text-slate-400">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search colleges, cities or courses..."
                  className="w-full rounded-xl px-4 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
                />

              </div>


              <button
                id="college-search-button"
                onClick={handleSearch}
                disabled={loading}
                className="dashboard-action rounded-xl bg-slate-950 px-7 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Searching..."
                  : "Search Colleges"}
              </button>

            </div>


            {/* ================= POPULAR SEARCHES ================= */}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">

              <span className="mr-1 text-slate-500">
                Popular:
              </span>

              {[
                "IIT Delhi",
                "IIT Bombay",
                "IIT Madras",
                "NIT Trichy",
              ].map((college) => (

                <button
                  key={college}
                  onClick={() =>
                    handlePopularSearch(college)
                  }
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  {college}
                </button>

              ))}

            </div>

          </div>


          {/* ================================================= */}
          {/* SEARCH RESULTS */}
          {/* ================================================= */}

          {searched && !loading && (

            <div className="mx-auto mt-10 max-w-3xl text-left">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Search
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-white">
                    Search Results
                  </h3>

                </div>


                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {results.length} found
                </span>

              </div>


              {results.length > 0 ? (

                <div className="space-y-4">

                  {results.map((college) => (

                    <Link
                      key={college.id}
                      href={`/colleges/${college.id}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h4 className="text-xl font-bold text-slate-950">
                            {college.name}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            📍 {getCollegeLocation(college.location, college.state)}
                          </p>

                        </div>


                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                          ★ {formatRating(college.rating)}
                        </span>

                      </div>


                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-500">
                            Fees
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {formatCurrency(college.fees)}
                          </p>

                        </div>


                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-500">
                            Placement
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {getPlacementLabel(college.placement)}
                          </p>

                        </div>


                        <div className="col-span-2 rounded-xl bg-slate-50 p-3 sm:col-span-1">

                          <p className="text-xs text-slate-500">
                            Programs
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {college.courses?.length || 0}
                          </p>

                        </div>

                      </div>


                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-sm font-semibold text-slate-500">
                          View college details
                        </span>

                        <span className="font-bold transition group-hover:translate-x-1">
                          →
                        </span>

                      </div>

                    </Link>

                  ))}

                </div>

              ) : (

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

                  <div className="text-4xl">
                    🔍
                  </div>

                  <h4 className="mt-4 text-xl font-bold text-white">
                    No colleges found
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    Try searching for another college,
                    city, state, or course.
                  </p>

                </div>

              )}

            </div>

          )}

        </div>

      </section>

      <section className="home-proof px-5 py-7 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3 sm:gap-0">
          <div className="home-proof-item px-0 sm:px-7 first:sm:pl-0">
            <p className="home-proof-value text-3xl font-bold">700+</p>
            <p className="mt-1 text-sm text-white/60">Colleges ready to explore</p>
          </div>
          <div className="home-proof-item px-0 sm:px-7">
            <p className="home-proof-value text-3xl font-bold">3-way</p>
            <p className="mt-1 text-sm text-white/60">Comparison for real trade-offs</p>
          </div>
          <div className="home-proof-item px-0 sm:px-7 sm:last:pr-0">
            <p className="home-proof-value text-3xl font-bold">1 clear path</p>
            <p className="mt-1 text-sm text-white/60">From curiosity to shortlist</p>
          </div>
        </div>
      </section>


      <GoalLauncher />

      {featured.length > 0 && (
        <section className="px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">A considered starting point</p><h3 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">Explore top colleges.</h3></div>
              <Link href="/colleges" className="font-bold text-[var(--primary)] hover:text-[var(--primary-dark)]">View the directory →</Link>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">{featured.map((college) => <CollegeCard key={college.id} college={college} />)}</div>
          </div>
        </section>
      )}

      <DecisionPath />

      {/* ================================================= */}
      {/* EXPLORE */}
      {/* ================================================= */}

      <section className="px-5 py-20 sm:px-6">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Explore
            </p>

            <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Everything you need to choose better.
            </h3>

            <p className="mt-4 text-base leading-7 text-slate-600">
              One place to discover colleges, compare your
              options, and understand which institutions fit
              your goals.
            </p>

          </div>


          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {/* DISCOVER */}

            <Link
              href="/colleges"
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔎
              </div>

              <h4 className="mt-7 text-xl font-bold text-slate-950">
                Discover Colleges
              </h4>

              <p className="mt-3 leading-7 text-slate-600">
                Search colleges by location, fees, ratings,
                courses, placements, and more.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-bold text-slate-950">
                Explore colleges

                <span className="transition group-hover:translate-x-1">
                  →
                </span>

              </div>

            </Link>


            {/* COMPARE */}

            <Link
              href="/compare"
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                ⚖️
              </div>

              <h4 className="mt-7 text-xl font-bold text-slate-950">
                Compare Colleges
              </h4>

              <p className="mt-3 leading-7 text-slate-600">
                Put 2–3 colleges side by side and compare the
                factors that matter most.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-bold text-slate-950">
                Start comparing

                <span className="transition group-hover:translate-x-1">
                  →
                </span>

              </div>

            </Link>


            {/* PREDICTOR */}

            <Link
              href="/predictor"
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🎯
              </div>

              <h4 className="mt-7 text-xl font-bold text-slate-950">
                College Predictor
              </h4>

              <p className="mt-3 leading-7 text-slate-600">
                Enter your exam and rank to discover colleges
                that match your profile.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-bold text-slate-950">
                Predict colleges

                <span className="transition group-hover:translate-x-1">
                  →
                </span>

              </div>

            </Link>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* WHY COLLEGEIQ */}
      {/* ================================================= */}

      <section className="border-y border-slate-200 bg-white px-5 py-20 sm:px-6">

        <div className="mx-auto max-w-6xl">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Why CollegeIQ
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Make decisions with more clarity.
              </h3>

              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Choosing a college is a major decision.
                CollegeIQ brings important information together
                so you can spend less time searching and more
                time making the right choice.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              {/* 01 */}

              <div className="rounded-2xl bg-slate-50 p-6">

                <p className="text-2xl font-bold text-slate-950">
                  01
                </p>

                <h4 className="mt-4 font-bold text-slate-950">
                  Clear Information
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Important college information in one place.
                </p>

              </div>


              {/* 02 */}

              <div className="rounded-2xl bg-slate-50 p-6">

                <p className="text-2xl font-bold text-slate-950">
                  02
                </p>

                <h4 className="mt-4 font-bold text-slate-950">
                  Easy Comparison
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare your options without jumping between
                  websites.
                </p>

              </div>


              {/* 03 */}

              <div className="rounded-2xl bg-slate-50 p-6">

                <p className="text-2xl font-bold text-slate-950">
                  03
                </p>

                <h4 className="mt-4 font-bold text-slate-950">
                  Smarter Discovery
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Find colleges based on your interests and goals.
                </p>

              </div>


              {/* 04 */}

              <div className="rounded-2xl bg-slate-50 p-6">

                <p className="text-2xl font-bold text-slate-950">
                  04
                </p>

                <h4 className="mt-4 font-bold text-slate-950">
                  Better Decisions
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Turn scattered information into a clearer
                  decision.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* CTA */}
      {/* ================================================= */}

      <section className="bg-slate-950 px-5 py-20 text-white sm:px-6">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Your college journey starts here
          </p>

          <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Ready to find your college?
          </h3>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
            Explore your options, compare colleges, and make
            your next decision with confidence.
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
              className="rounded-xl border border-slate-700 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-900"
            >
              Try College Predictor
            </Link>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="bg-slate-950 px-5 py-10 text-slate-400 sm:px-6">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="font-bold text-white">
              CollegeIQ
            </p>

            <p className="mt-1 text-sm">
              Find. Compare. Decide.
            </p>

          </div>


          <div className="flex flex-wrap gap-5 text-sm">

            <Link
              href="/colleges"
              className="transition hover:text-white"
            >
              Discover
            </Link>

            <Link
              href="/compare"
              className="transition hover:text-white"
            >
              Compare
            </Link>

            <Link
              href="/predictor"
              className="transition hover:text-white"
            >
              Predictor
            </Link>

            {user && (
              <Link
                href="/profile"
                className="transition hover:text-white"
              >
                Profile
              </Link>
            )}

          </div>


          <p className="text-sm">
            © 2026 CollegeIQ · Built by Aditi Jindal
          </p>

        </div>

      </footer>

    </main>
  );
}

