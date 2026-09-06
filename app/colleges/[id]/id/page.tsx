
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCollegeLocation, getCollegeSearchUrl, getDegreeLabel, getPlacementLabel } from "@/lib/collegeDisplay";

type Course = {
  id: number;
  name: string;
  duration: string;
  degree: string;
};

type Review = {
  id: number;
  author: string;
  rating: number;
  comment: string;
};

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  placement: number;
  description: string;
  website: string;
  dataSource?: string;
  courses: Course[];
  reviews: Review[];
};

export default function CollegeDetails() {
  const params = useParams();
  const id = params.id;

  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollege() {
      try {
        const response = await fetch("/api/colleges");

        if (!response.ok) {
          throw new Error("Failed to fetch colleges");
        }

        const colleges: College[] = await response.json();

        const foundCollege = colleges.find(
          (item) => String(item.id) === String(id)
        );

        setCollege(foundCollege || null);
      } catch (error) {
        console.error("Failed to load college:", error);
        setCollege(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCollege();
    }
  }, [id]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="dashboard-theme min-h-screen bg-slate-50">

        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-4 sm:px-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                C
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  CollegeIQ
                </p>

                <p className="text-[10px] tracking-wider text-slate-500">
                  FIND. COMPARE. DECIDE.
                </p>
              </div>
            </Link>
          </div>
        </nav>

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-5 font-semibold text-slate-700">
              Loading college information...
            </p>

          </div>
        </div>

      </main>
    );
  }

  /* ================= NOT FOUND ================= */

  if (!college) {
    return (
      <main className="dashboard-theme min-h-screen bg-slate-50">

        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">

            <Link href="/" className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                C
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  CollegeIQ
                </p>

                <p className="text-[10px] tracking-wider text-slate-500">
                  FIND. COMPARE. DECIDE.
                </p>
              </div>

            </Link>

            <Link
              href="/colleges"
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Explore Colleges
            </Link>

          </div>
        </nav>

        <div className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="max-w-md text-center">

            <div className="text-6xl">
              🎓
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-950">
              College not found
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              We couldn&apos;t find the college you&apos;re looking for.
              Try exploring the college directory instead.
            </p>

            <Link
              href="/colleges"
              className="mt-7 inline-flex rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Colleges →
            </Link>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">

          <Link href="/" className="group flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white shadow-sm transition group-hover:scale-105">
              C
            </div>

            <div>
              <p className="font-bold tracking-tight text-slate-950">
                CollegeIQ
              </p>

              <p className="text-[10px] font-medium tracking-wider text-slate-500">
                FIND. COMPARE. DECIDE.
              </p>
            </div>

          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">

            <Link
              href="/colleges"
              className="transition hover:text-slate-950"
            >
              Discover
            </Link>

            <Link
              href="/compare"
              className="transition hover:text-slate-950"
            >
              Compare
            </Link>

            <Link
              href="/predictor"
              className="transition hover:text-slate-950"
            >
              Predictor
            </Link>

          </div>

          <Link
            href="/colleges"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-5"
          >
            <span className="hidden sm:inline">
              Back to Colleges
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>

        </div>

      </nav>


      {/* ================= COLLEGE HERO ================= */}

      <section className="relative overflow-hidden bg-slate-950 px-5 py-14 text-white sm:px-6 sm:py-20">

        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-slate-800/40 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-800/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">

          <div className="mb-7 flex items-center gap-2 text-sm text-slate-400">

            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <span>→</span>

            <Link
              href="/colleges"
              className="transition hover:text-white"
            >
              Colleges
            </Link>

            <span>→</span>

            <span className="text-slate-500">
              Details
            </span>

          </div>


          <div className="max-w-4xl">

            <div className="mb-5 inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              College Profile
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {college.name}
            </h1>

            <p className="mt-5 flex items-center gap-2 text-base text-slate-300 sm:text-lg">
              <span>📍</span>
              {getCollegeLocation(college.location, college.state)}
            </p>


            {/* Stats */}

            <div className="mt-9 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">

              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4">
                <p className="text-xs font-medium text-slate-500">
                  Rating
                </p>

                <p className="mt-1 text-lg font-bold">
                  ⭐ {college.rating}
                </p>
              </div>


              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4">
                <p className="text-xs font-medium text-slate-500">
                  Fees
                </p>

                <p className="mt-1 text-lg font-bold">
                  ₹{college.fees?.toLocaleString("en-IN")}
                </p>
              </div>


              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4">
                <p className="text-xs font-medium text-slate-500">
                  Placement
                </p>

                <p className="mt-1 text-lg font-bold">
                  {getPlacementLabel(college.placement)}
                </p>
              </div>


              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4">
                <p className="text-xs font-medium text-slate-500">
                  Programs
                </p>

                <p className="mt-1 text-lg font-bold">
                  {college.courses?.length || 0}
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= MAIN ================= */}

      <section className="px-5 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">

          {/* ================= LEFT ================= */}

          <div className="space-y-7 lg:col-span-2">

            {/* ABOUT */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🏛️
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Overview
                  </p>

                  <h2 className="text-2xl font-bold text-slate-950">
                    About the College
                  </h2>
                </div>

              </div>

              <p className="mt-6 leading-8 text-slate-600">
                {college.description}
              </p>

            </section>


            {/* COURSES */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🎓
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academics
                  </p>

                  <h2 className="text-2xl font-bold text-slate-950">
                    Courses & Programs
                  </h2>
                </div>

              </div>


              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                {college.courses?.map((course) => (
                  <div
                    key={course.id}
                    className="group rounded-2xl border border-slate-200 p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        💻
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {getDegreeLabel(course.degree)}
                      </span>

                    </div>

                    <h3 className="mt-5 font-bold leading-6 text-slate-950">
                      {course.name}
                    </h3>

                    <p className="mt-3 text-sm text-slate-500">
                      ⏱️ {course.duration}
                    </p>

                  </div>
                ))}

              </div>

            </section>


            {/* REVIEWS */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    💬
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Student Feedback
                    </p>

                    <h2 className="text-2xl font-bold text-slate-950">
                      Student Reviews
                    </h2>
                  </div>

                </div>

                <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 sm:block">
                  {college.reviews?.length || 0} Reviews
                </span>

              </div>


              <div className="mt-7 space-y-4">

                {college.reviews?.length > 0 ? (
                  college.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                            {review.author?.charAt(0).toUpperCase()}
                          </div>

                          <div>

                            <h3 className="font-bold text-slate-950">
                              {review.author}
                            </h3>

                            <p className="text-xs text-slate-500">
                              Student review
                            </p>

                          </div>

                        </div>

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700">
                          ⭐ {review.rating}/5
                        </span>

                      </div>

                      <p className="mt-4 leading-7 text-slate-600">
                        {review.comment}
                      </p>

                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                    No student reviews have been imported for this college yet.
                  </p>
                )}

              </div>

            </section>

          </div>


          {/* ================= SIDEBAR ================= */}

          <aside className="h-fit lg:sticky lg:top-24">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Information
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                At a glance
              </h2>


              <div className="mt-7 divide-y divide-slate-100">

                <div className="py-4 first:pt-0">

                  <p className="text-xs font-medium text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 font-semibold text-slate-950">
                    {getCollegeLocation(college.location, college.state)}
                  </p>

                </div>


                <div className="py-4">

                  <p className="text-xs font-medium text-slate-500">
                    Estimated Fees
                  </p>

                  <p className="mt-1 font-semibold text-slate-950">
                    ₹{college.fees?.toLocaleString("en-IN")}
                  </p>

                </div>


                <div className="py-4">

                  <p className="text-xs font-medium text-slate-500">
                    College Rating
                  </p>

                  <p className="mt-1 font-semibold text-slate-950">
                    ⭐ {college.rating}/5
                  </p>

                </div>


                <div className="py-4">

                  <p className="text-xs font-medium text-slate-500">
                    Placement
                  </p>

                  <p className="mt-1 font-semibold text-slate-950">
                    {getPlacementLabel(college.placement)}
                  </p>

                </div>


                <div className="py-4 last:pb-0">

                  <p className="text-xs font-medium text-slate-500">
                    Available Programs
                  </p>

                  <p className="mt-1 font-semibold text-slate-950">
                    {college.courses?.length || 0} Programs
                  </p>

                </div>

              </div>


              {/* WEBSITE BUTTON */}

              {college.website ? (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                >
                  Visit Official Website
                  <span>↗</span>
                </a>
              ) : null}

              <a
                href={getCollegeSearchUrl(college.name, college.state)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Research on Google ↗
              </a>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Data source: {college.dataSource || "Source not recorded"}. Missing values are not estimated.
              </p>


              <Link
                href="/compare"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Compare Colleges
              </Link>

            </div>


            {/* Small tip */}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-5">

              <p className="text-sm font-bold text-slate-900">
                💡 Quick Tip
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compare this college with other options before making
                your final decision.
              </p>

            </div>

          </aside>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="bg-slate-950 px-5 py-16 text-white sm:px-6">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Explore more options
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Still comparing your choices?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
            Explore more colleges or compare your shortlisted options
            side by side.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/colleges"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Explore Colleges
            </Link>

            <Link
              href="/compare"
              className="rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-900"
            >
              Compare Colleges
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 px-5 py-9 text-slate-400 sm:px-6">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-slate-800 pt-7 sm:flex-row sm:items-center sm:justify-between">

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

          </div>


          <p className="text-sm">
            © 2026 CollegeIQ · Built by Aditi Jindal
          </p>

        </div>

      </footer>

    </main>
  );
}

