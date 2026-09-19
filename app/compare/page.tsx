"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { formatCurrency, formatRating, getCollegeLocation, getDegreeLabel, getPlacementLabel } from "@/lib/collegeDisplay";

type Course = { id: string; name: string; degree: string; duration: string };
type College = { id: string; name: string; location: string; state: string; fees: number; rating: number; placement: number; website?: string; courses: Course[] };
type SortOption = "relevance" | "rating" | "placement" | "feesLow" | "feesHigh" | "name";
const PAGE_SIZE = 12;

function readIds(value: string | null) {
  return (value || "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .slice(0, 3);
}

function bestId(colleges: College[], metric: "rating" | "placement" | "fees") {
  const available = colleges.filter((college) => metric === "fees" ? college.fees > 0 : college[metric] > 0);
  if (!available.length) return null;
  return available.reduce((best, college) => {
    if (!best) return college.id;
    const current = available.find((item) => item.id === best);
    if (!current) return college.id;
    return metric === "fees" ? college.fees < current.fees ? college.id : best : college[metric] > current[metric] ? college.id : best;
  }, null as string | null);
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => readIds(searchParams.get("ids")));
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [feesFilter, setFeesFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/colleges", { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error("Failed to fetch colleges"); setColleges(await response.json()); }).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);
  const states = useMemo(() => [...new Set(colleges.map((college) => college.state).filter(Boolean))].sort(), [colleges]);
  const locations = useMemo(() => [...new Set(colleges.map((college) => college.location).filter(Boolean))].sort(), [colleges]);
  const courses = useMemo(() => [...new Set(colleges.flatMap((college) => college.courses?.map((course) => course.name) || []))].sort(), [colleges]);
  const filteredColleges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return colleges.filter((college) => {
      const searchable = `${college.name} ${college.location} ${college.state} ${college.courses?.map((course) => `${course.name} ${course.degree}`).join(" ") || ""}`.toLowerCase();
      const matchesRating = ratingFilter === "all" || (ratingFilter === "4plus" && college.rating >= 4) || (ratingFilter === "3plus" && college.rating >= 3);
      const matchesFees = feesFilter === "all" || (feesFilter === "under100" && college.fees > 0 && college.fees < 100000) || (feesFilter === "100to250" && college.fees >= 100000 && college.fees <= 250000) || (feesFilter === "over250" && college.fees > 250000);
      const matchesPlacement = placementFilter === "all" || (placementFilter === "10plus" && college.placement >= 10) || (placementFilter === "5plus" && college.placement >= 5);
      return (!normalizedQuery || searchable.includes(normalizedQuery)) && (stateFilter === "all" || college.state === stateFilter) && (locationFilter === "all" || college.location === locationFilter) && matchesRating && matchesFees && matchesPlacement && (courseFilter === "all" || college.courses?.some((course) => course.name === courseFilter));
    }).sort((first, second) => sort === "rating" ? second.rating - first.rating : sort === "placement" ? second.placement - first.placement : sort === "feesLow" ? first.fees - second.fees : sort === "feesHigh" ? second.fees - first.fees : sort === "name" ? first.name.localeCompare(second.name) : second.rating - first.rating);
  }, [colleges, query, stateFilter, locationFilter, ratingFilter, feesFilter, placementFilter, courseFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredColleges.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleColleges = filteredColleges.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedColleges = selectedIds.map((id) => colleges.find((college) => college.id === id)).filter((college): college is College => Boolean(college));
  const bestRating = bestId(selectedColleges, "rating");
  const bestPlacement = bestId(selectedColleges, "placement");
  const bestFees = bestId(selectedColleges, "fees");

  function toggleCollege(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((collegeId) => collegeId !== id) : current.length < 3 ? [...current, id] : current); }
  function clearFilters() { setQuery(""); setStateFilter("all"); setLocationFilter("all"); setRatingFilter("all"); setFeesFilter("all"); setPlacementFilter("all"); setCourseFilter("all"); setSort("relevance"); }
  function updateFilter<T>(setter: (value: T) => void, value: T) { setter(value); setPage(1); }

  const comparisonRows: Array<[string, (college: College) => string]> = [
    ["Location", (college) => getCollegeLocation(college.location, college.state)], ["State", (college) => college.state || "Not available"], ["Rating", (college) => formatRating(college.rating)], ["Average fees", (college) => formatCurrency(college.fees)], ["Average placement", (college) => getPlacementLabel(college.placement)], ["Courses", (college) => college.courses?.length ? college.courses.map((course) => course.name).join(" · ") : "Not available"], ["Degrees", (college) => { const degrees = [...new Set(college.courses?.map((course) => getDegreeLabel(course.degree)).filter(Boolean))]; return degrees.length ? degrees.join(" · ") : "Not available"; }], ["Website", (college) => college.website || "Official website unavailable"],
  ];

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50 pb-28 text-slate-900">
      <SiteNav />
      <header className="border-b border-[var(--border)] bg-white px-5 py-10 sm:px-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)]">COMPARE UP TO 3 COLLEGES</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">Compare colleges with clarity.</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">Search a focused directory, shortlist up to three colleges, and see the trade-offs clearly.</p></div></header>
      <section className="px-5 py-8 sm:px-6"><div className="mx-auto max-w-7xl"><div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Select colleges to compare</p><p className="mt-1 text-sm text-[var(--text-secondary)]">Choose up to three options from the filtered directory.</p></div><p className="text-sm font-bold text-[var(--text-primary)]">{selectedIds.length}/3 selected</p></div><label htmlFor="college-search" className="sr-only">Search colleges by name, city or state</label><input id="college-search" value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search colleges by name, city or state..." className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]" /><div className="mt-4 flex flex-wrap gap-2"><select aria-label="Filter by state" value={stateFilter} onChange={(event) => updateFilter(setStateFilter, event.target.value)} className="filter-select"><option value="all">State: All</option>{states.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by location" value={locationFilter} onChange={(event) => updateFilter(setLocationFilter, event.target.value)} className="filter-select"><option value="all">Location: All</option>{locations.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by rating" value={ratingFilter} onChange={(event) => updateFilter(setRatingFilter, event.target.value)} className="filter-select"><option value="all">Rating: Any</option><option value="4plus">4+ rating</option><option value="3plus">3+ rating</option></select><select aria-label="Filter by fees" value={feesFilter} onChange={(event) => updateFilter(setFeesFilter, event.target.value)} className="filter-select"><option value="all">Fees: Any</option><option value="under100">Under ₹1L</option><option value="100to250">₹1L–₹2.5L</option><option value="over250">Over ₹2.5L</option></select><select aria-label="Filter by placement" value={placementFilter} onChange={(event) => updateFilter(setPlacementFilter, event.target.value)} className="filter-select"><option value="all">Placement: Any</option><option value="10plus">10+ LPA</option><option value="5plus">5+ LPA</option></select><select aria-label="Filter by course" value={courseFilter} onChange={(event) => updateFilter(setCourseFilter, event.target.value)} className="filter-select"><option value="all">Course: All</option>{courses.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Sort colleges" value={sort} onChange={(event) => updateFilter(setSort, event.target.value as SortOption)} className="filter-select"><option value="relevance">Sort: Relevance</option><option value="rating">Highest rating</option><option value="placement">Highest placement</option><option value="feesLow">Lowest fees</option><option value="feesHigh">Highest fees</option><option value="name">Name A-Z</option></select></div></div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">College directory</p><h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">Choose your shortlist.</h2></div><p className="text-sm font-semibold text-[var(--text-secondary)]">Showing {filteredColleges.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredColleges.length)} of {filteredColleges.length} colleges</p></div>
      {loading ? <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-white" />)}</div> : error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"><h2 className="font-bold">Unable to load colleges.</h2><p className="mt-2">Please try again.</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-bold text-white">Retry</button></div> : visibleColleges.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center"><p className="text-4xl" aria-hidden="true">⌕</p><h3 className="mt-3 text-xl font-bold">No colleges match these filters.</h3><button type="button" onClick={clearFilters} className="mt-4 font-bold text-[var(--primary)]">Clear filters</button></div> : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleColleges.map((college) => { const selected = selectedIds.includes(college.id); const disabled = selectedIds.length >= 3 && !selected; return <article key={college.id} className={`rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${selected ? "border-[var(--primary)] ring-2 ring-[var(--primary-light)]" : "border-[var(--border)]"}`}><div className="flex items-start justify-between gap-3"><div><h3 className="line-clamp-2 text-lg font-bold text-[var(--text-primary)]">{college.name}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{getCollegeLocation(college.location, college.state)}</p></div><span className="shrink-0 rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-sm font-bold text-[#8a4b05]">★ {formatRating(college.rating)}</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-xs"><div className="rounded-lg bg-[var(--surface-soft)] p-2.5"><p className="text-[var(--text-muted)]">Fees</p><p className="mt-1 font-bold text-[var(--text-primary)]">{formatCurrency(college.fees)}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-2.5"><p className="text-[var(--text-muted)]">Placement</p><p className="mt-1 font-bold text-[var(--text-primary)]">{getPlacementLabel(college.placement)}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-2.5"><p className="text-[var(--text-muted)]">Programs</p><p className="mt-1 font-bold text-[var(--text-primary)]">{college.courses?.length || "None"}</p></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Link href={`/colleges/${college.id}`} className="font-semibold text-[var(--primary)]">View details →</Link><button type="button" disabled={disabled} onClick={() => toggleCollege(college.id)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${selected ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-dark)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]"}`}>{selected ? "✓ Selected" : "Add to Compare"}</button></div></article>; })}</div>}
      {pageCount > 1 ? <nav aria-label="College results pages" className="mt-8 flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="page-button">← Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 8).map((number) => <button key={number} type="button" aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)} className={`page-button ${number === currentPage ? "bg-[var(--primary)] text-white" : ""}`}>{number}</button>)}<button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)} className="page-button">Next →</button></nav> : null}
      </div></section>
      <section id="comparison" className="border-y border-[var(--border)] bg-white px-5 py-12 sm:px-6"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Your comparison</p><h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">See the trade-offs clearly.</h2></div><p className="text-sm text-[var(--text-secondary)]">{selectedColleges.length}/3 selected</p></div>{selectedColleges.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-10 text-center"><p className="text-4xl" aria-hidden="true">⚖</p><h3 className="mt-3 text-xl font-bold text-[var(--text-primary)]">Select colleges to start comparing</h3><p className="mt-2 text-[var(--text-secondary)]">Choose up to three colleges and compare the factors that matter most.</p></div> : <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)]"><table className="min-w-[760px] w-full border-collapse text-left"><thead><tr className="comparison-table-header bg-[var(--text-primary)]"><th className="w-44 px-4 py-4 text-sm">Metric</th>{selectedColleges.map((college) => <th key={college.id} className="min-w-56 px-4 py-4 text-sm">{college.name}<button type="button" onClick={() => toggleCollege(college.id)} className="ml-2 text-white/70 hover:text-white" aria-label={`Remove ${college.name}`}>×</button></th>)}</tr></thead><tbody>{comparisonRows.map(([label, getter], rowIndex) => <tr key={label} className={rowIndex % 2 ? "bg-[var(--surface-soft)]" : "border-t border-[var(--border)]"}><th className="px-4 py-4 text-sm font-bold text-[var(--text-secondary)]">{label}</th>{selectedColleges.map((college) => { const best = label === "Rating" && bestRating === college.id || label === "Average fees" && bestFees === college.id || label === "Average placement" && bestPlacement === college.id; return <td key={college.id} className="px-4 py-4 text-sm font-semibold text-[var(--text-primary)]">{label === "Website" && college.website ? <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Visit Official Website →</a> : getter(college)}{best ? <span className="ml-2 rounded-full bg-[var(--accent-light)] px-2 py-1 text-[10px] font-bold text-[#8a4b05]">Best</span> : null}</td>; })}</tr>)}</tbody></table></div>}</div></section>
      {selectedColleges.length > 0 ? <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-md)] sm:p-4"><div className="flex min-w-0 flex-1 flex-wrap items-center gap-2"><span className="text-xs font-bold tracking-[0.16em] text-[var(--accent)]">COMPARE</span>{selectedColleges.map((college) => <button type="button" key={college.id} onClick={() => toggleCollege(college.id)} className="max-w-40 truncate rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)]">{college.name} ×</button>)}</div><a href="#comparison" className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--primary-dark)]">Compare now →</a></div> : null}
      <footer className="bg-[var(--text-primary)] px-6 py-8 text-center text-sm text-white/60">© 2026 CollegeIQ. Built for smarter college decisions.</footer>
    </main>
  );
}

export default function ComparePage() { return <Suspense fallback={<main className="dashboard-theme min-h-screen bg-slate-50" />}><ComparePageContent /></Suspense>; }