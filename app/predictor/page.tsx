"use client";

import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import CollegeCard, { CollegeCardData } from "@/components/CollegeCard";

type PredictorCollege = CollegeCardData & { description?: string };

export default function Predictor() {
  const [exam, setExam] = useState("JEE");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [preferredCourse, setPreferredCourse] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<PredictorCollege[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    const userRank = Number(rank);
    if (!rank.trim() || !Number.isFinite(userRank) || userRank < 1) return;

    try {
      setLoading(true);
      setSearched(true);
      setError("");
      const response = await fetch("/api/colleges", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const colleges: PredictorCollege[] = await response.json();
      const ratingFloor = userRank <= 10000 ? 4.5 : userRank <= 50000 ? 4.3 : userRank <= 100000 ? 4 : 0;

      const ranked = colleges
        .filter((college) => college.rating >= ratingFloor)
        .filter((college) => !location || `${college.location} ${college.state}`.toLowerCase().includes(location.toLowerCase()))
        .filter((college) => !preferredCourse || college.courses?.some((course) => course.name.toLowerCase().includes(preferredCourse.toLowerCase())))
        .sort((a, b) => (b.rating + b.placement / 10) - (a.rating + a.placement / 10));

      setResults(ranked.slice(0, 6));
    } catch (predictorError) {
      console.error(predictorError);
      setError("Something went wrong while creating your shortlist.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50">
      <SiteNav />
      <header className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">College predictor</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">Turn your rank into a shortlist.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">A transparent starting point based on your rank, college ratings, placements, course interests and location preference.</p>
        </div>
      </header>

      <section className="px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Step 1 of 1</p><h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Tell us what you are looking for</h2></div>
            <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-bold text-[var(--primary-dark)]">Rule-based match</span>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Exam<select value={exam} onChange={(event) => setExam(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"><option>JEE</option><option>JEE Advanced</option><option>NEET</option></select></label>
            <label className="text-sm font-semibold text-[var(--text-primary)]">Your rank<input required type="number" min="1" value={rank} onChange={(event) => setRank(event.target.value)} placeholder="Example: 12000" className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]" /></label>
            <label className="text-sm font-semibold text-[var(--text-primary)]">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select></label>
            <label className="text-sm font-semibold text-[var(--text-primary)]">Preferred course<input value={preferredCourse} onChange={(event) => setPreferredCourse(event.target.value)} placeholder="Optional, e.g. Computer Science" className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]" /></label>
            <label className="text-sm font-semibold text-[var(--text-primary)] sm:col-span-2">Preferred city or state<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional, e.g. Delhi or Karnataka" className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]" /></label>
          </div>
          <p className="mt-5 text-sm text-[var(--text-muted)]">Your {exam} rank and {category} category are used as context. This is a database-based estimate, not an admission guarantee.</p>
          <button type="button" onClick={handlePredict} disabled={loading || !rank.trim()} className="mt-7 w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-white transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Building your shortlist..." : "Find matching colleges"}</button>
        </div>
      </section>

      {searched && !loading ? <section className="px-5 pb-16 sm:px-6"><div className="mx-auto max-w-6xl"><div className="mb-7"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Results</p><h2 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">Colleges to explore</h2><p className="mt-2 text-[var(--text-secondary)]">Based on your {exam} rank of <strong>{rank}</strong> and {category} category.</p></div>{error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">{error}</div> : results.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{results.map((college) => <CollegeCard key={college.id} college={college} />)}</div> : <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center"><h3 className="text-xl font-bold">No direct matches yet</h3><p className="mt-2 text-[var(--text-secondary)]">Try a broader location or a larger rank value.</p></div>}</div></section> : null}
      <footer className="border-t border-[var(--border)] bg-white px-5 py-8 text-center text-sm text-[var(--text-muted)]">CollegeIQ · Find. Compare. Decide.</footer>
    </main>
  );
}
