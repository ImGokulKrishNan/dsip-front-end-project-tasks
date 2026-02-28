import React from "react";
import { Icons } from "../../constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExecuteTradeResponse } from "../../types/tracker.types";

interface ExecutionDialogsProps {
  showDailyLimitWarning: boolean;
  setShowDailyLimitWarning: (val: boolean) => void;
  showSuccessPopup: boolean;
  setShowSuccessPopup: (val: boolean) => void;
  showVictoryPopup: boolean;
  setShowVictoryPopup: (val: boolean) => void;
  showKillSwitchPopup: boolean;
  setShowKillSwitchPopup: (val: boolean) => void;
  executionResponse: ExecuteTradeResponse | null;
  performCalculation: () => void;
}

export const ExecutionDialogs: React.FC<ExecutionDialogsProps> = ({
  showDailyLimitWarning,
  setShowDailyLimitWarning,
  showSuccessPopup,
  setShowSuccessPopup,
  showVictoryPopup,
  setShowVictoryPopup,
  showKillSwitchPopup,
  setShowKillSwitchPopup,
  executionResponse,
  performCalculation,
}) => {
  return (
    <>
      {/* Daily Limit Warning Modal */}
      <Dialog
        open={showDailyLimitWarning}
        onOpenChange={setShowDailyLimitWarning}
      >
        <DialogContent className="sm:max-w-md border-0 bg-[#0f0b04] p-0 overflow-hidden shadow-2xl shadow-amber-900/30">
          {/* Soft amber radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(245,158,11,0.14),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col gap-5 px-6 pt-8 pb-6 relative">
            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                <Icons.AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Already Executed Today
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-400 mt-1">
                  You&apos;ve already recorded an execution for today.
                </DialogDescription>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed">
                DSIP is built on{" "}
                <span className="text-amber-400 font-semibold">
                  one disciplined execution per day
                </span>
                . Executing twice in the same day can accelerate capital
                deployment and throw off your cycle pacing.
              </p>
              <p className="text-xs text-slate-500 italic border-t border-amber-500/15 pt-2 mt-2">
                &ldquo;Discipline over frequency — consistency is the
                edge.&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-11 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setShowDailyLimitWarning(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 font-semibold transition-all"
                onClick={() => {
                  setShowDailyLimitWarning(false);
                  performCalculation();
                }}
              >
                Execute Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-md text-center border border-emerald-500/15 bg-[#060d09] shadow-2xl shadow-emerald-900/30 p-0 overflow-hidden">
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(16,185,129,0.18),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/8 via-transparent to-transparent pointer-events-none" />

          {/* Subtle floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-8 left-10 w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce [animation-delay:0.2s]" />
            <div className="absolute top-6 right-12 w-1 h-1 rounded-full bg-green-300/50 animate-ping [animation-delay:0.5s]" />
            <div className="absolute top-12 left-[45%] w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-bounce [animation-delay:0.8s]" />
            <div className="absolute top-5 right-[35%] w-1 h-1 rounded-full bg-green-400/60 animate-ping [animation-delay:0.3s]" />
          </div>

          <div className="flex flex-col items-center justify-center space-y-5 px-6 pt-9 pb-7 relative">
            {/* Animated check icon */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full border border-emerald-500/10 animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full border border-dashed border-emerald-500/20 animate-[spin_8s_linear_infinite]" />
              <div className="absolute w-16 h-16 rounded-full bg-emerald-500/8 animate-pulse [animation-delay:0.4s]" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-700/20 border border-emerald-400/35 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-in zoom-in-50 duration-500">
                <Icons.Check className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 max-w-sm mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-150">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-500/50" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-400 uppercase">
                  Daily Execution
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-500/50" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white">
                {executionResponse?.title || "Order Executed!"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-slate-400 leading-relaxed">
                {executionResponse?.message ||
                  "Great discipline! Your investment has been successfully recorded for today."}
              </DialogDescription>
              <DialogDescription className="hidden"></DialogDescription>
            </div>

            {/* Stats grid */}
            {executionResponse?.deployed_amount !== undefined &&
              executionResponse?.profit_pct !== undefined && (
                <div className="w-full grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
                      Capital Deployed
                    </p>
                    <p className="text-xl font-bold text-white">
                      ${executionResponse.deployed_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
                      Net Return
                    </p>
                    <p
                      className={`text-xl font-bold ${executionResponse.profit_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {executionResponse.profit_pct >= 0 ? "+" : ""}
                      {executionResponse.profit_pct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

            {/* Button */}
            <div className="pt-1 w-full animate-in slide-in-from-bottom-5 fade-in duration-700 delay-400">
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white text-base font-bold tracking-wide border-0 shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:shadow-[0_0_36px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icons.Check className="mr-2 w-4 h-4" />
                Continue
              </Button>
              <p className="text-xs text-slate-600 mt-2.5 text-center">
                One step closer — stay consistent
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Victory Popup */}
      <Dialog open={showVictoryPopup} onOpenChange={setShowVictoryPopup}>
        <DialogContent className="sm:max-w-md text-center border border-emerald-500/20 bg-[#060d09] backdrop-blur-3xl shadow-2xl shadow-emerald-900/40 p-0 overflow-hidden">
          {/* Radial green glow from top */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(16,185,129,0.22),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-900/10 pointer-events-none" />

          {/* Confetti / sparkle particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-6 left-7 w-2 h-2 rounded-full bg-emerald-400/70 animate-bounce [animation-delay:0.1s]" />
            <div className="absolute top-10 right-9 w-1.5 h-1.5 rounded-full bg-green-300/60 animate-bounce [animation-delay:0.4s]" />
            <div className="absolute top-5 left-[38%] w-1 h-1 rounded-full bg-emerald-500/80 animate-ping [animation-delay:0.2s]" />
            <div className="absolute top-14 right-[28%] w-2 h-2 rounded-full bg-green-400/50 animate-bounce [animation-delay:0.6s]" />
            <div className="absolute top-20 left-14 w-1.5 h-1.5 rounded-full bg-emerald-300/70 animate-ping [animation-delay:0.8s]" />
            <div className="absolute top-8 right-16 w-1 h-1 rounded-full bg-green-500/60 animate-bounce [animation-delay:0.3s]" />
            <div className="absolute top-3 left-[60%] w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-ping [animation-delay:0.7s]" />
          </div>

          <div className="flex flex-col items-center justify-center space-y-5 px-6 pt-10 pb-8 relative">
            {/* Trophy icon with burst rings */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full border border-emerald-500/10 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute w-32 h-32 rounded-full border border-emerald-500/15 animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 animate-pulse [animation-delay:0.5s]" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/25 to-emerald-700/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.55)] animate-in zoom-in-50 duration-700">
                <svg
                  className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                </svg>
              </div>
            </div>

            {/* Title section */}
            <div className="space-y-2.5 max-w-sm mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-emerald-500/50" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-400 uppercase">
                  Cycle Complete
                </span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-emerald-500/50" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-white">
                {executionResponse?.title || "Target Achieved!"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-slate-400 leading-relaxed">
                {executionResponse?.message ||
                  "Outstanding! You've completed this investment cycle and are compounding your gains."}
              </DialogDescription>
              <DialogDescription className="hidden"></DialogDescription>
            </div>

            {/* Stats grid */}
            {executionResponse?.deployed_amount !== undefined &&
              executionResponse?.profit_pct !== undefined && (
                <div className="w-full grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
                      Capital Deployed
                    </p>
                    <p className="text-xl font-bold text-white">
                      ${executionResponse.deployed_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
                      Net Return
                    </p>
                    <p
                      className={`text-xl font-bold ${executionResponse.profit_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {executionResponse.profit_pct >= 0 ? "+" : ""}
                      {executionResponse.profit_pct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

            {/* CTA Button */}
            <div className="pt-1 w-full animate-in slide-in-from-bottom-5 fade-in duration-700 delay-500">
              <Button
                onClick={() => setShowVictoryPopup(false)}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white text-base font-bold tracking-wide border-0 shadow-[0_0_28px_rgba(16,185,129,0.45)] hover:shadow-[0_0_40px_rgba(16,185,129,0.65)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Next Cycle
                <Icons.ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-xs text-slate-600 mt-2.5 text-center">
                Keep compounding — your next cycle starts now
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kill Switch Popup */}
      <Dialog open={showKillSwitchPopup} onOpenChange={setShowKillSwitchPopup}>
        <DialogContent className="sm:max-w-md text-center border border-red-500/20 bg-[#0c0505] shadow-2xl shadow-red-900/40 p-0 overflow-hidden">
          {/* Radial red glow from top */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(239,68,68,0.18),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/8 via-transparent to-red-900/8 pointer-events-none" />

          {/* Subtle warning particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-7 left-9 w-1.5 h-1.5 rounded-full bg-red-400/50 animate-pulse [animation-delay:0.2s]" />
            <div className="absolute top-5 right-11 w-1 h-1 rounded-full bg-red-300/40 animate-pulse [animation-delay:0.6s]" />
            <div className="absolute top-12 left-[42%] w-1 h-1 rounded-full bg-red-500/50 animate-pulse [animation-delay:1s]" />
            <div className="absolute top-9 right-[32%] w-1.5 h-1.5 rounded-full bg-red-400/35 animate-pulse [animation-delay:0.4s]" />
          </div>

          <div className="flex flex-col items-center justify-center space-y-5 px-6 pt-9 pb-7 relative">
            {/* Shield icon with warning rings */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full border border-red-500/10 animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full border border-dashed border-red-500/15 animate-[spin_12s_linear_infinite]" />
              <div className="absolute w-16 h-16 rounded-full bg-red-500/8 animate-pulse [animation-delay:0.5s]" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-800/20 border border-red-400/30 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.45)] animate-in zoom-in-50 duration-500">
                <svg
                  className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 max-w-sm mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-150">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500/50" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase">
                  Risk Alert
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500/50" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white">
                {executionResponse?.title || "Stop Execution Warning"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-slate-400 leading-relaxed">
                {executionResponse?.message ||
                  "Your portfolio is down and you're more than halfway through this cycle. Halting now protects your capital."}
              </DialogDescription>
              <DialogDescription className="hidden"></DialogDescription>
            </div>

            {/* Stats grid */}
            {executionResponse?.deployed_amount !== undefined &&
              executionResponse?.profit_pct !== undefined && (
                <div className="w-full grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
                      Capital Deployed
                    </p>
                    <p className="text-xl font-bold text-white">
                      ${executionResponse.deployed_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">
                      Net Return
                    </p>
                    <p
                      className={`text-xl font-bold ${executionResponse.profit_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {executionResponse.profit_pct >= 0 ? "+" : ""}
                      {executionResponse.profit_pct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

            {/* Quote card */}
            <div className="w-full bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
              <p className="text-xs text-slate-500 italic text-center">
                &ldquo;Good investors know when to protect capital — patience is
                its own return.&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="pt-1 w-full space-y-2.5 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-400">
              <Button
                onClick={() => setShowKillSwitchPopup(false)}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-base font-bold tracking-wide border-0 shadow-[0_0_24px_rgba(239,68,68,0.4)] hover:shadow-[0_0_36px_rgba(239,68,68,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Icons.Zap className="mr-2 w-4 h-4" />
                Activate Kill Switch
              </Button>
              <Button
                variant="ghost"
                className="w-full h-10 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 text-sm font-medium transition-all"
                onClick={() => {
                  setShowKillSwitchPopup(false);
                  performCalculation();
                }}
              >
                Ignore & Continue Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
