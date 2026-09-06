import Link from "next/link";
import { formatCurrency, formatRating, getCollegeLocation, getDegreeLabel, getPlacementLabel } from "@/lib/collegeDisplay";

export type CollegeCardData = {
  id: number;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  placement: number;
  pgFees?: number;
  academicScore?: number;
  facultyScore?: number;
  infrastructureScore?: number;
  placementScore?: number;
  courses?: { id: number; name: string; degree: string; duration: string }[];
  description?: string | null;
};

type CollegeCardProps = {
  college: CollegeCardData;
  onSave?: (collegeId: number) => void;
  saved?: boolean;
  matchScore?: number;
  onCompare?: (collegeId: number) => void;
  comparing?: boolean;
};

export default function CollegeCard({ college, onSave, saved = false, onCompare, comparing = false }: CollegeCardProps) {
  const courses = college.courses ?? [];
  const degrees = [...new Set(courses.map((course) => getDegreeLabel(course.degree)).filter(Boolean))];

  return (
    <article className="college-card group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="line-clamp-2 text-lg font-bold leading-6 text-[var(--text-primary)]">{college.name || "Unnamed college"}</h2>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
            {getCollegeLocation(college.location, college.state)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--accent-light)] px-2 py-1 text-xs font-bold text-[#8a4b05]">★ {formatRating(college.rating)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[var(--surface-soft)] p-2.5">
          <p className="text-xs text-[var(--text-muted)]">Annual fees</p>
          <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{formatCurrency(college.fees)}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-soft)] p-2.5">
          <p className="text-xs text-[var(--text-muted)]">Placement</p>
          <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{getPlacementLabel(college.placement)}</p>
        </div>
      </div>

      {(college.pgFees || college.academicScore || college.facultyScore || college.infrastructureScore) ? (
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
          {college.pgFees ? <span className="rounded-full bg-[var(--accent-light)] px-2 py-1">PG {formatCurrency(college.pgFees)}</span> : null}
          {college.academicScore ? <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1">Academics {college.academicScore}/10</span> : null}
          {college.facultyScore ? <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1">Faculty {college.facultyScore}/10</span> : null}
          {college.infrastructureScore ? <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1">Infrastructure {college.infrastructureScore}/10</span> : null}
        </div>
      ) : null}

      <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
        <p><span className="font-bold text-[var(--text-primary)]">{courses.length || "No"}</span> {courses.length === 1 ? "program" : "programs"} <span className="mx-1">·</span> {degrees.length ? degrees.join(" · ") : "Degree unavailable"}</p>
        {college.description ? <p className="line-clamp-1 leading-5">{college.description}</p> : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <Link href={`/colleges/${college.id}`} className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]">View details <span className="transition group-hover:ml-1">→</span></Link>
        <div className="flex gap-1.5">
          {onCompare ? <button type="button" onClick={() => onCompare(college.id)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${comparing ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-dark)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>{comparing ? "✓ Comparing" : "Compare"}</button> : null}
          {onSave ? <button type="button" onClick={() => onSave(college.id)} className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]" aria-label={`${saved ? "Remove" : "Save"} ${college.name}`}>{saved ? "Saved" : "Save"}</button> : null}
        </div>
      </div>
    </article>
  );
}
