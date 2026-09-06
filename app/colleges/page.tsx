"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import CollegeCard, { CollegeCardData } from "@/components/CollegeCard";
import { getInstitutionType, InstitutionType } from "@/lib/institutionType";

type SortOption = "rating" | "placement" | "fees" | "nameAsc" | "nameDesc";
type Lens = "balanced" | "value" | "career";
const PAGE_SIZE = 12;

export default function CollegesPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeCardData[]>([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [location, setLocation] = useState("all");
  const [course, setCourse] = useState("all");
  const [degree, setDegree] = useState("all");
  const [rating, setRating] = useState("all");
  const [fees, setFees] = useState("all");
  const [placement, setPlacement] = useState("all");
  const [ownership, setOwnership] = useState<"all" | InstitutionType>("all");
  const [sort, setSort] = useState<SortOption>("rating");
  const [page, setPage] = useState(1);
  const [lens, setLens] = useState<Lens>(() => {
    if (typeof window === "undefined") return "balanced";
    const savedLens = window.localStorage.getItem("collegeiq-fit-lens");
    return savedLens === "balanced" || savedLens === "value" || savedLens === "career" ? savedLens : "balanced";
  });
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/colleges", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch colleges");
        setColleges(await response.json());

        const savedResponse = await fetch("/api/saved-colleges", { cache: "no-store" });
        if (savedResponse.ok) {
          const saved = await savedResponse.json();
          setSavedIds(saved.map((college: CollegeCardData) => college.id));
        }
      } catch (loadError) {
        console.error(loadError);
        setError("Something went wrong while loading colleges.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("collegeiq-fit-lens", lens);
  }, [lens]);

  const states = useMemo(() => [...new Set(colleges.map((college) => college.state))].sort(), [colleges]);
  const locations = useMemo(() => [...new Set(colleges.map((college) => college.location).filter(Boolean))].sort(), [colleges]);
  const courses = useMemo(
    () => [...new Set(colleges.flatMap((college) => college.courses?.map((item) => item.name) ?? []))].sort(),
    [colleges]
  );
  const degrees = useMemo(() => [...new Set(colleges.flatMap((college) => college.courses?.map((item) => item.degree) ?? []))].filter(Boolean).sort(), [colleges]);

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();
    return colleges
      .filter((college) => {
        const courseText = college.courses?.map((item) => `${item.name} ${item.degree}`).join(" ") ?? "";
        return (
          (!query || `${college.name} ${college.location} ${college.state} ${courseText}`.toLowerCase().includes(query)) &&
          (state === "all" || college.state === state) &&
          (location === "all" || college.location === location) &&
          (course === "all" || college.courses?.some((item) => item.name === course)) &&
          (degree === "all" || college.courses?.some((item) => item.degree === degree)) &&
          (rating === "all" || (rating === "4plus" && college.rating >= 4) || (rating === "3plus" && college.rating >= 3)) &&
          (fees === "all" || (fees === "under100" && college.fees > 0 && college.fees < 100000) || (fees === "100to250" && college.fees >= 100000 && college.fees <= 250000) || (fees === "over250" && college.fees > 250000)) &&
          (placement === "all" || (placement === "10plus" && college.placement >= 10) || (placement === "5plus" && college.placement >= 5)) &&
          (ownership === "all" || getInstitutionType(college.name) === ownership)
        );
      })
      .sort((a, b) => {
        if (sort === "nameAsc") return a.name.localeCompare(b.name);
        if (sort === "nameDesc") return b.name.localeCompare(a.name);
        if (sort === "fees") return a.fees - b.fees;
        if (sort === "placement") return b.placement - a.placement;
        return b.rating - a.rating;
      });
  }, [colleges, search, state, location, course, degree, rating, fees, placement, ownership, sort]);

  const scoredColleges = useMemo(() => {
    const maxFees = Math.max(...colleges.map((college) => college.fees), 1);
    const maxPlacement = Math.max(...colleges.map((college) => college.placement), 1);
    return filteredColleges.map((college) => {
      const valueScore = 1 - college.fees / maxFees;
      const careerScore = college.placement / maxPlacement;
      const ratingScore = college.rating / 5;
      const rawScore = lens === "value" ? valueScore * 0.55 + ratingScore * 0.2 + careerScore * 0.25 : lens === "career" ? careerScore * 0.55 + ratingScore * 0.35 + valueScore * 0.1 : ratingScore * 0.4 + careerScore * 0.35 + valueScore * 0.25;
      return { college, score: Math.round(rawScore * 100) };
    });
  }, [colleges, filteredColleges, lens]);
  const pageCount = Math.max(1, Math.ceil(scoredColleges.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleColleges = scoredColleges.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const showingStart = scoredColleges.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(currentPage * PAGE_SIZE, scoredColleges.length);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  async function toggleSave(collegeId: number) {
    const saved = savedIds.includes(collegeId);
    const response = await fetch("/api/saved-colleges", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collegeId }),
    });

    if (response.status === 401) {
      router.push("/auth");
      return;
    }

    if (response.ok) {
      setSavedIds((current) => saved ? current.filter((id) => id !== collegeId) : [...current, collegeId]);
    }
  }

  function toggleCompare(collegeId: number) {
    setCompareIds((current) => {
      if (current.includes(collegeId)) return current.filter((id) => id !== collegeId);
      return current.length < 3 ? [...current, collegeId] : current;
    });
  }

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50 text-slate-900">
      <SiteNav />
      <header className="discover-header border-b border-[var(--border)] px-5 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Discover</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Find institutions that match your goals.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">Search a focused directory of colleges, then shortlist the options worth comparing.</p>
          <div className="mt-8 flex max-w-3xl items-center rounded-2xl border border-[var(--border)] bg-white p-2 shadow-[var(--shadow-sm)]">
            <span className="px-3 text-xl" aria-hidden="true">⌕</span>
            <input aria-label="Search colleges" type="search" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Search colleges, cities, states or courses..." className="w-full bg-transparent px-3 py-3 text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
          </div>
        </div>
      </header>

      <section className="px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold text-[var(--text-primary)]">State
                <select value={state} onChange={(event) => updateFilter(setState, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]">
                  <option value="all">All states</option>{states.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Location
                <select value={location} onChange={(event) => updateFilter(setLocation, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]"><option value="all">All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Course
                <select value={course} onChange={(event) => updateFilter(setCourse, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]">
                  <option value="all">All courses</option>{courses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Degree
                <select value={degree} onChange={(event) => updateFilter(setDegree, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]"><option value="all">All degrees</option>{degrees.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Rating
                <select value={rating} onChange={(event) => updateFilter(setRating, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]"><option value="all">Any rating</option><option value="4plus">4+ rating</option><option value="3plus">3+ rating</option></select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Fees
                <select value={fees} onChange={(event) => updateFilter(setFees, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]"><option value="all">Any fees</option><option value="under100">Under ₹1L</option><option value="100to250">₹1L–₹2.5L</option><option value="over250">Over ₹2.5L</option></select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Placement
                <select value={placement} onChange={(event) => updateFilter(setPlacement, event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]"><option value="all">Any placement</option><option value="10plus">10+ LPA</option><option value="5plus">5+ LPA</option></select>
              </label>
              <label className="text-sm font-semibold text-[var(--text-primary)]">Sort by
                <select value={sort} onChange={(event) => updateFilter(setSort, event.target.value as SortOption)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--primary)]">
                  <option value="rating">Highest rated</option><option value="placement">Best placement</option><option value="fees">Lowest fees</option><option value="nameAsc">Name A-Z</option><option value="nameDesc">Name Z-A</option>
                </select>
              </label>
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Showing {showingStart}–{showingEnd} of {scoredColleges.length} colleges</p>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)]" role="tablist" aria-label="Institution ownership">
            {(["all", "government", "private", "other"] as const).map((option) => (
              <button key={option} type="button" role="tab" aria-selected={ownership === option} onClick={() => updateFilter(setOwnership, option)} className={`rounded-xl px-4 py-2.5 text-sm font-bold capitalize transition ${ownership === option ? "bg-[var(--primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--primary)]"}`}>
                {option === "all" ? "All institutions" : option === "other" ? "Other / verify" : `${option} institutions`}
              </button>
            ))}
            <p className="ml-auto hidden text-xs text-[var(--text-muted)] lg:block">Ownership is classified from institution names where the source has no ownership field.</p>
          </div>

          <div className="mb-8 rounded-2xl border border-[var(--primary-light)] bg-[var(--primary-light)] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary-dark)]">CollegeIQ Fit Lens</p><h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">What matters most to you?</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">We explain the ranking using the college data already available.</p></div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Fit Lens priorities">
                {(["balanced", "value", "career"] as Lens[]).map((option) => <button key={option} type="button" onClick={() => setLens(option)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${lens === option ? "bg-[var(--primary)] text-white" : "bg-white text-[var(--text-secondary)] hover:text-[var(--primary)]"}`}>{option === "balanced" ? "All-round" : option === "value" ? "Budget" : "Career outcomes"}</button>)}
              </div>
            </div>
          </div>

          {loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />)}</div> : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center"><h2 className="text-xl font-bold text-red-900">Unable to load colleges</h2><p className="mt-2 text-red-700">Please try again.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-red-700 px-5 py-3 font-bold text-white">Retry</button></div>
          ) : filteredColleges.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center"><p className="text-4xl" aria-hidden="true">⌕</p><h2 className="mt-4 text-2xl font-bold">No colleges match those filters</h2><p className="mt-2 text-[var(--text-secondary)]">Try a broader search or clear one of the filters.</p><button type="button" onClick={() => { setSearch(""); setState("all"); setLocation("all"); setCourse("all"); setDegree("all"); setRating("all"); setFees("all"); setPlacement("all"); setOwnership("all"); }} className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">Clear filters</button></div>
          ) : <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{visibleColleges.map(({ college, score }) => <CollegeCard key={college.id} college={college} matchScore={score} saved={savedIds.includes(college.id)} onSave={toggleSave} comparing={compareIds.includes(college.id)} onCompare={toggleCompare} />)}</div>{pageCount > 1 ? <nav aria-label="College directory pages" className="mt-8 flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="page-button">← Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 8).map((number) => <button type="button" key={number} aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)} className={`page-button ${number === currentPage ? "bg-[var(--primary)] text-white" : ""}`}>{number}</button>)}{pageCount > 8 ? <span className="px-1 text-[var(--text-muted)]">…</span> : null}<button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)} className="page-button">Next →</button></nav> : null}</>}
        </div>
      </section>

      {compareIds.length > 0 ? <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-md)]"><p className="text-sm font-bold text-[var(--text-primary)]">{compareIds.length}/3 selected for compare</p><a href={`/compare?ids=${compareIds.join(",")}`} className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white">Open comparison →</a></div> : null}
    </main>
  );
}
