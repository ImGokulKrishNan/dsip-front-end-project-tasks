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
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[min(700px,100vw)] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[200px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 max-w-6xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
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
          <span className="font-bold text-white tracking-tight text-sm sm:text-base">
            DSIP
          </span>
        </div>

        <button
          onClick={redirectToGoogleLogin}
          disabled={isLoading}
          className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8 gap-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
          Systematic. Intelligent. Disciplined.
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-3 sm:mb-4 max-w-4xl">
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
        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-sm sm:max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8">
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
          className="group inline-flex items-center gap-2.5 sm:gap-3 bg-white text-slate-900 font-bold text-sm sm:text-base py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-[0_0_40px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_-8px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
            className="w-4 h-4 sm:w-5 sm:h-5"
            alt="Google"
          />
          Continue with Google
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
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

        <p className="mt-3 text-[10px] sm:text-xs text-slate-600">
          Free to use &middot; No card required
        </p>

        {/* Stats row */}
        <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-px bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 w-full max-w-xs sm:max-w-lg mx-auto">
          {[
            { value: "100%", label: "Logic Driven" },
            { value: "0%", label: "Emotional Bias" },
            { value: "24/7", label: "Market Watch" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-[#080c14] px-3 sm:px-6 py-4 sm:py-5 text-center"
            >
              <p className="text-lg sm:text-2xl font-black text-white">
                {value}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Feature pills — hidden on xs to avoid overflow */}
        <div className="mt-4 sm:mt-6 hidden sm:flex flex-wrap items-center justify-center gap-2">
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
      <footer className="relative z-10 text-center py-4 sm:py-6 text-[10px] sm:text-xs text-slate-700 font-medium shrink-0">
        By continuing, you commit to disciplined, logic-first investing.
      </footer>
    </div>
  );
};

export default LandingPage;
