"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // SIGN IN / SIGN UP
  // =========================
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // =========================
    // SIGN UP VALIDATION
    // =========================
    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    // =========================
    // COMMON VALIDATION
    // =========================
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // CREATE ACCOUNT
      // =========================
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const text = await response.text();

        let data: {
          error?: string;
          message?: string;
        } = {};

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = {
              error: text,
            };
          }
        }

        if (!response.ok) {
          setError(
            data.error || "Unable to create your account."
          );
          return;
        }

        setMessage(
          data.message ||
            "Account created successfully! You can now sign in."
        );

        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Switch to Sign In
        setTimeout(() => {
          setMode("signin");
          setMessage(
            "Account created successfully. Please sign in."
          );
        }, 1200);

        return;
      }

      // =========================
      // SIGN IN
      // =========================
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      // Safely read the response
      const text = await response.text();

      let data: {
        error?: string;
        message?: string;
        user?: {
          id: string;
          name: string;
          email: string;
        };
      } = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            error: text,
          };
        }
      }

      // =========================
      // LOGIN FAILED
      // =========================
      if (!response.ok) {
        setError(
          data.error ||
            `Login failed (${response.status}). Please try again.`
        );
        return;
      }

      // =========================
      // LOGIN SUCCESSFUL
      // =========================
      setMessage(
        data.user?.name
          ? `Welcome back, ${data.user.name}!`
          : "Welcome back!"
      );

      setEmail("");
      setPassword("");

      // Go to homepage
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error) {
      console.error(
        "Authentication request failed:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure your development server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SWITCH SIGN IN / SIGN UP
  // =========================
  const switchMode = () => {
    setMode(
      mode === "signin"
        ? "signup"
        : "signin"
    );

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setMessage("");
    setError("");
  };

  return (
    <main className="dashboard-theme min-h-screen bg-slate-50">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
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

          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            ← Back to Home
          </Link>

        </div>
      </nav>

      {/* ================= AUTH AREA ================= */}

      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden px-5 py-12 sm:px-6">

        {/* Background decoration */}

        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="relative w-full max-w-md">

          {/* ================= HEADING ================= */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl font-bold text-white shadow-lg">
              C
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
              {mode === "signin"
                ? "Welcome back"
                : "Create your account"}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              {mode === "signin"
                ? "Sign in to continue your college discovery journey."
                : "Create your CollegeIQ account and start making smarter college decisions."}
            </p>

          </div>

          {/* ================= CARD ================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

            {/* ================= TABS ================= */}

            <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "signin"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>

            </div>

            {/* ================= SUCCESS MESSAGE ================= */}

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                ✓ {message}
              </div>
            )}

            {/* ================= ERROR MESSAGE ================= */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}

              {mode === "signup" && (
                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />

                </div>
              )}

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email Address
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Password recovery will be available soon."
                        )
                      }
                      className="text-xs font-semibold text-slate-500 transition hover:text-slate-950"
                    >
                      Forgot password?
                    </button>
                  )}

                </div>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-20 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-950"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                {mode === "signup" && (
                  <p className="mt-2 text-xs text-slate-500">
                    Password must contain at least 8 characters.
                  </p>
                )}

              </div>

              {/* Confirm Password */}

              {mode === "signup" && (
                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Re-enter your password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />

                </div>
              )}

              {/* ================= SUBMIT ================= */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In →"
                  : "Create Account →"}
              </button>

            </form>

            {/* ================= DIVIDER ================= */}

            <div className="my-6 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* ================= SWITCH ================= */}

            <p className="text-center text-sm text-slate-500">

              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={switchMode}
                className="ml-1 font-bold text-slate-950 hover:underline"
              >
                {mode === "signin"
                  ? "Create one"
                  : "Sign in"}
              </button>

            </p>

          </div>

          {/* ================= SECURITY NOTE ================= */}

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Your account information will be securely protected.
            <br />
            CollegeIQ will never share your password.
          </p>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500">
        © 2026 CollegeIQ · Built by Aditi Jindal
      </footer>

    </main>
  );
}