"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { formatCurrency, formatRating, getCollegeLocation, getCollegeSearchUrl, getDegreeLabel, getPlacementLabel } from "@/lib/collegeDisplay";

type Course = { id: number; name: string; degree?: string; duration?: string };
type Review = { id: number; author: string; rating: number; comment: string };
type CollegeDetailsData = {
  id: number;
  name: string;
  location: string;
  state: string;
  fees: number;
  pgFees?: number;
  rating: number;
  placement: number;
  description?: string;
  website?: string;
  dataSource?: string;
  academicScore?: number;
  facultyScore?: number;
  infrastructureScore?: number;
  placementScore?: number;
  socialLifeScore?: number;
  courses: Course[];
  reviews: Review[];
};

export default function CollegeDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [college, setCollege] = useState<CollegeDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchCollege() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/colleges");

        if (!response.ok) {
          throw new Error("Failed to fetch colleges");
        }

        const colleges = await response.json() as CollegeDetailsData[];

        const foundCollege = colleges.find(
          (item) => String(item.id) === String(id)
        );

        if (!foundCollege) {
          setError("College not found");
          setCollege(null);
          return;
        }

        setCollege(foundCollege);

        const savedResponse = await fetch("/api/saved-colleges", { cache: "no-store" });
        if (savedResponse.ok) {
          const savedColleges = await savedResponse.json();
          setSaved(savedColleges.some((item: { id: number }) => item.id === foundCollege.id));
        }
      } catch (error) {
        console.error("Failed to load college:", error);
        setError("Failed to load college details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCollege();
    }
  }, [id]);

  async function toggleSaved() {
    if (!college) return;

    const response = await fetch("/api/saved-colleges", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collegeId: college.id }),
    });

    if (response.status === 401) {
      router.push("/auth");
      return;
    }

    if (response.ok) setSaved((current) => !current);
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-lg font-semibold text-slate-700">
            Loading college...
          </p>
        </div>
      </main>
    );
  }

  /* ================= ERROR ================= */

  if (error || !college) {
    return (
      <main className="dashboard-theme flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="text-6xl">🏫</div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            College not found
          </h1>

          <p className="mt-3 text-slate-600">
            We couldn&apos;t find the college you&apos;re looking for.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50">
      <SiteNav />

      {/* ================= COLLEGE HEADER ================= */}

      <section className="bg-slate-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            College Details
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {college.name}
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            Location: {getCollegeLocation(college.location, college.state)}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={toggleSaved} className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100">
              {saved ? "Saved to shortlist" : "Save college"}
            </button>
            <Link href="/compare" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
              Compare colleges
            </Link>
          </div>

          {/* Stats */}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">
                Rating
              </p>

              <p className="mt-2 text-2xl font-bold">
                ★ {formatRating(college.rating)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">
                Fees
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(college.fees)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">
                Average Placement
              </p>

              <p className="mt-2 text-2xl font-bold">
                {getPlacementLabel(college.placement)}
              </p>
            </div>
          </div>

          {(college.academicScore || college.facultyScore || college.infrastructureScore || college.placementScore || college.socialLifeScore) && (
            <div className="mt-5 rounded-2xl border border-slate-300 bg-white/80 p-5 text-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dataset signals · scored out of 10</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {[
                  ["Academic", college.academicScore],
                  ["Faculty", college.facultyScore],
                  ["Infrastructure", college.infrastructureScore],
                  ["Placement", college.placementScore],
                  ["Student life", college.socialLifeScore],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-bold">{value || "Not available"}</p>
                  </div>
                ))}
              </div>
              {college.pgFees ? <p className="mt-4 text-sm text-slate-600">PG fees: {formatCurrency(college.pgFees)}</p> : null}
            </div>
          )}
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">

          {/* ================= LEFT CONTENT ================= */}

          <div className="space-y-8 lg:col-span-2">

            {/* ABOUT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                About {college.name}
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                {college.description || "No description available."}
              </p>
            </div>

            {/* COURSES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Academics
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Courses & Programs
                </h2>
              </div>

              {college.courses?.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {college.courses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-400 hover:shadow-sm"
                    >
                      <h3 className="font-bold text-slate-900">
                        {course.name}
                      </h3>

                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>
                          🎓{" "}
                          <span className="font-medium">
                            Degree:
                          </span>{" "}
                          {getDegreeLabel(course.degree)}
                        </p>

                        <p>
                          ⏱️{" "}
                          <span className="font-medium">
                            Duration:
                          </span>{" "}
                          {course.duration || "Not available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-slate-500">
                  Course information is not available yet.
                </p>
              )}
            </div>

            {/* REVIEWS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Student Experiences
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Student Reviews
              </h2>

              {college.reviews?.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {college.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-900">
                          {review.author}
                        </h3>

                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                          ⭐ {review.rating}/5
                        </span>
                      </div>

                      <p className="mt-3 leading-7 text-slate-600">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No student reviews have been imported for this college yet. Use the research link below to check current public reviews.
                </div>
              )}
            </div>
          </div>

          {/* ================= SIDEBAR ================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-7 shadow-sm lg:sticky lg:top-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Quick Information
            </h2>

            <div className="mt-6 space-y-5">

              {/* LOCATION */}

              <div>
                <p className="text-sm text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {getCollegeLocation(college.location, college.state)}
                </p>
              </div>

              {/* FEES */}

              <div>
                <p className="text-sm text-slate-500">
                  Fees
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(college.fees)}
                </p>
              </div>

              {/* RATING */}

              <div>
                <p className="text-sm text-slate-500">
                  Rating
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  ★ {formatRating(college.rating)} / 5
                </p>
              </div>

              {/* PLACEMENT */}

              <div>
                <p className="text-sm text-slate-500">
                  Average Placement
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {getPlacementLabel(college.placement)}
                </p>
              </div>

              {/* COURSES COUNT */}

              <div>
                <p className="text-sm text-slate-500">
                  Programs
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {college.courses?.length || "No"} {college.courses?.length === 1 ? "program" : "programs"}
                </p>
              </div>

              {/* SOURCES */}

              {college.website ? (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-700"
                >
                  Visit Official Website →
                </a>
              ) : null}
              <a
                href={getCollegeSearchUrl(college.name, college.state)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block rounded-xl border border-slate-200 px-5 py-3 text-center font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Research this college on Google →
              </a>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Data source: {college.dataSource || "Source not recorded"}. Values are shown only when available in the source dataset.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-900 px-6 py-8 text-center text-sm text-slate-400">
        © 2026 CollegeIQ. Built for smarter college decisions.
      </footer>
    </main>
  );
}