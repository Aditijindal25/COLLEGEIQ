import Link from "next/link";

const steps = [
  { number: "01", title: "Discover", detail: "Find colleges that fit your goals.", href: "/colleges" },
  { number: "02", title: "Shortlist", detail: "Save the options worth a closer look.", href: "/profile" },
  { number: "03", title: "Compare", detail: "See the trade-offs side by side.", href: "/compare" },
  { number: "04", title: "Predict", detail: "Turn your rank into a realistic starting point.", href: "/predictor" },
];

export default function DecisionPath() {
  return (
    <section className="decision-path border-y border-[var(--border)] bg-[var(--text-primary)] px-5 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">The CollegeIQ method</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A clearer route to a big decision.</h2>
          <p className="mt-4 leading-7 text-white/70">Move from a broad search to a confident shortlist in four focused steps.</p>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <Link key={step.number} href={step.href} className="decision-step group relative rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-[var(--accent)] hover:bg-white/10">
              <div className="flex items-center justify-between"><span className="text-sm font-bold text-[var(--accent)]">{step.number}</span>{index < steps.length - 1 ? <span className="hidden text-white/30 md:block" aria-hidden="true">→</span> : null}</div>
              <h3 className="mt-7 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{step.detail}</p>
              <span className="mt-5 block text-sm font-bold text-[var(--accent)]">Start here →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
