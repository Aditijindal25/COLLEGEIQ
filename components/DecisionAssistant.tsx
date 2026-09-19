"use client";

import { useState } from "react";
import Link from "next/link";

type College = {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  placement: number;
  courses?: { name: string }[];
};

type Message = { role: "assistant" | "user"; text: string };

const priorities = [
  { value: "career", label: "Career outcomes" },
  { value: "budget", label: "Lower fees" },
  { value: "academic", label: "Academic quality" },
] as const;

export default function DecisionAssistant() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("career");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "I can help you make a practical shortlist from CollegeIQ's verified college data." },
  ]);
  const [results, setResults] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep(0);
    setCourse("");
    setLocation("");
    setPriority("career");
    setResults([]);
    setMessages([{ role: "assistant", text: "I can help you make a practical shortlist from CollegeIQ's verified college data." }]);
  }

  async function findMatches() {
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: `${course || "Any course"} · ${location || "Any location"} · ${priorities.find((item) => item.value === priority)?.label}` }, { role: "assistant", text: "I am comparing the available colleges now..." }]);

    try {
      const response = await fetch("/api/colleges", { cache: "no-store" });
      const colleges: College[] = await response.json();
      const maxFees = Math.max(...colleges.map((college) => college.fees), 1);
      const maxPlacement = Math.max(...colleges.map((college) => college.placement), 1);
      const matches = colleges
        .filter((college) => !location || `${college.location} ${college.state}`.toLowerCase().includes(location.toLowerCase()))
        .filter((college) => !course || college.courses?.some((item) => item.name.toLowerCase().includes(course.toLowerCase())))
        .sort((a, b) => {
          const score = (college: College) => {
            const value = 1 - college.fees / maxFees;
            const career = college.placement / maxPlacement;
            const academic = college.rating / 5;
            return priority === "budget" ? value * 0.6 + academic * 0.25 + career * 0.15 : priority === "academic" ? academic * 0.6 + career * 0.25 + value * 0.15 : career * 0.55 + academic * 0.35 + value * 0.1;
          };
          return score(b) - score(a);
        }).slice(0, 3);
      setResults(matches);
      setMessages((current) => [...current, { role: "assistant", text: matches.length ? "Here are three starting points. Compare them before making a final decision." : "I could not find a direct match. Try a broader location or course." }]);
      setStep(3);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "I could not reach the college database. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function openAssistant() {
    setOpen(true);
    reset();
  }

  return (
    <>
      <button type="button" onClick={openAssistant} className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)]">
        Help me decide <span className="text-[var(--primary)] transition group-hover:translate-x-1" aria-hidden="true">→</span>
      </button>

      {open ? <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(23,49,47,0.35)] p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="assistant-title">
        <div className="assistant-panel w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
          <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">CollegeIQ Guide</p><h2 id="assistant-title" className="mt-1 text-xl font-bold text-[var(--text-primary)]">Help me decide</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="text-2xl text-[var(--text-muted)]">×</button></div>
          <div className="max-h-[70vh] overflow-y-auto p-5">
            <div className="space-y-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "bg-[var(--surface-soft)] text-[var(--text-primary)]" : "ml-auto bg-[var(--primary)] text-white"}`}>{message.text}</div>)}</div>
            {step < 3 ? <div className="mt-5 space-y-4">
              {step === 0 ? <label className="block text-sm font-semibold text-[var(--text-primary)]">What course are you considering?<input value={course} onChange={(event) => setCourse(event.target.value)} placeholder="e.g. Computer Science, Mechanical" className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]" /><button type="button" onClick={() => { setMessages((current) => [...current, { role: "user", text: course || "Any course" }, { role: "assistant", text: "Great. Which city or state would you prefer?" }]); setStep(1); }} className="mt-3 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white">Continue</button></label> : null}
              {step === 1 ? <label className="block text-sm font-semibold text-[var(--text-primary)]">Preferred city or state?<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional, e.g. Tamil Nadu" className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--primary)]" /><button type="button" onClick={() => { setMessages((current) => [...current, { role: "user", text: location || "Any location" }, { role: "assistant", text: "What should carry the most weight?" }]); setStep(2); }} className="mt-3 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white">Continue</button></label> : null}
              {step === 2 ? <div><p className="text-sm font-semibold text-[var(--text-primary)]">Choose your priority</p><div className="mt-3 grid gap-2">{priorities.map((item) => <button key={item.value} type="button" onClick={() => setPriority(item.value)} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${priority === item.value ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-dark)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`}>{item.label}</button>)}</div><button type="button" disabled={loading} onClick={findMatches} className="mt-4 w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? "Finding matches..." : "Show my shortlist"}</button></div> : null}
            </div> : <div className="mt-5 space-y-3">{results.map((college) => <Link key={college.id} href={`/colleges/${college.id}`} onClick={() => setOpen(false)} className="block rounded-xl border border-[var(--border)] p-4 hover:border-[var(--primary)]"><p className="font-bold text-[var(--text-primary)]">{college.name}</p><p className="mt-1 text-sm text-[var(--text-secondary)]">{college.location}, {college.state} · ★ {college.rating}</p></Link>)}<button type="button" onClick={reset} className="text-sm font-bold text-[var(--primary)]">Start again</button></div>}
            <p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">This is a transparent database-based guide, not an admission guarantee or a generative AI claim.</p>
          </div>
        </div>
      </div> : null}
    </>
  );
}
