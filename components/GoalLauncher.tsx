import Link from "next/link";
import DecisionAssistant from "@/components/DecisionAssistant";

const goals = [
  {
    eyebrow: "I am exploring",
    title: "Show me colleges",
    detail: "Browse by city, state, course, fees and placement.",
    href: "/colleges",
    tone: "mint",
  },
  {
    eyebrow: "I know my rank",
    title: "Find my matches",
    detail: "Turn your exam rank into a realistic starting shortlist.",
    href: "/predictor",
    tone: "gold",
  },
  {
    eyebrow: "I have options",
    title: "Help me decide",
    detail: "Put up to three colleges side by side and see the trade-offs.",
    href: "/compare",
    tone: "ink",
  },
] as const;

export default function GoalLauncher() {
  return (
    <section className="goal-launcher border-y border-[var(--border)] bg-white px-5 py-7 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Your next move</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">Make your shortlist smarter.</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            goal.title === "Help me decide" ? <DecisionAssistant key={goal.title} /> : <Link key={goal.title} href={goal.href} className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)]">
              {goal.title}<span className="text-[var(--primary)] transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
