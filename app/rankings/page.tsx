"use client";

import { useEffect, useMemo, useState } from "react";
import SiteNav from "@/components/SiteNav";

type Ranking = { name: string; rank: number; score: number | null };

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"rank" | "name">("rank");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rankings", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Ranking request failed");
        return response.json();
      })
      .then((data) => setRankings(data.rankings))
      .catch(() => setError("Ranking data is temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rankings.filter((item) => !query || item.name.toLowerCase().includes(query)).sort((a, b) => sort === "rank" ? a.rank - b.rank : a.name.localeCompare(b.name));
  }, [rankings, search, sort]);

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50">
      <SiteNav />
      <header className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">NIRF 2025</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">See how institutions rank.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">A transparent ranking reference from the supplied NIRF 2025 dataset. Use it as a starting signal, then explore fees, courses and outcomes before deciding.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input aria-label="Search rankings" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search an institution..." className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]" />
            <select aria-label="Sort rankings" value={sort} onChange={(event) => setSort(event.target.value as "rank" | "name")} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"><option value="rank">Sort by rank</option><option value="name">Sort A-Z</option></select>
          </div>
        </div>
      </header>
      <section className="px-5 py-10 sm:px-6"><div className="mx-auto max-w-5xl">
        {loading ? <div className="space-y-3">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-white" />)}</div> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">{error}</div> : <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]"><div className="border-b border-[var(--border)] px-5 py-4 text-sm font-semibold text-[var(--text-secondary)]">{filtered.length} institutions · Source: NIRF 2025</div>{filtered.map((item) => <div key={`${item.rank}-${item.name}`} className="flex items-center gap-4 border-b border-[var(--border)] px-5 py-5 last:border-0"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] font-bold text-[var(--primary-dark)]">{item.rank}</div><div className="min-w-0"><h2 className="font-bold text-[var(--text-primary)]">{item.name}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">NIRF 2025 rank · Verify current fees, courses and admissions on the institution website.</p></div></div>)}</div>}
      </div></section>
    </main>
  );
}
