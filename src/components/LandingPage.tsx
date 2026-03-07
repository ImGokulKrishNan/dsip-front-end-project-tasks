import React from "react";
import { useAuth } from "../hooks/useAuth";
import { redirectToGoogleLogin } from "../utils/auth";

const LandingPage: React.FC = () => {
  const { isLoading } = useAuth();

  return (
    <div className="h-screen bg-[#080c14] text-white flex flex-col overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top nav bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight">DSIP</span>
        </div>

        <button
          onClick={redirectToGoogleLogin}
          disabled={isLoading}
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Systematic. Intelligent. Disciplined.
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-4 max-w-4xl">
          <span className="text-white">Invest Like</span>
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)",
            }}
          >
            You Know More.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
          DSIP replaces emotional investing with a mathematically optimized
          daily SIP engine — so every rupee you deploy is{" "}
          <span className="text-slate-200 font-medium">
            timed, sized, and purposeful.
          </span>
        </p>

        {/* CTA */}
        <button
          onClick={redirectToGoogleLogin}
          disabled={isLoading}
          className="group relative inline-flex items-center gap-3 bg-white text-slate-900 font-bold text-base py-4 px-8 rounded-2xl shadow-[0_0_40px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_-8px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Stats row */}
        <div className="mt-10 grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 max-w-lg w-full mx-auto">
          {[
            { value: "100%", label: "Logic Driven" },
            { value: "0%", label: "Emotional Bias" },
            { value: "24/7", label: "Market Watch" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[#080c14] px-6 py-5 text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            "Daily SIP Engine",
            "Capital Efficiency",
            "Kill Switch Protection",
            "Partition-Based Cycles",
          ].map((feat) => (
            <span
              key={feat}
              className="text-xs text-slate-500 border border-white/5 bg-white/[0.03] px-3 py-1.5 rounded-full font-medium"
            >
              {feat}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-700 font-medium">
        By continuing, you commit to disciplined, logic-first investing.
      </footer>
    </div>
  );
};

export default LandingPage;
