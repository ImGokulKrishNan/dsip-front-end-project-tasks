import React from "react";
import { Icons } from "../../constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
        <DialogContent className="sm:max-w-md text-center border-0 bg-background/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col items-center justify-center space-y-5 px-6 py-10 relative">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-in zoom-in-50 duration-500 delay-150">
                <Icons.Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
              </div>
              <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-xs mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                {executionResponse?.title || "Order Executed!"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                {executionResponse?.message ||
                  "Great discipline! Your investment has been successfully recorded for today."}
              </DialogDescription>
              {executionResponse?.deployed_amount !== undefined &&
                executionResponse?.profit_pct !== undefined && (
                  <div className="text-xs text-center text-muted-foreground space-y-1 pt-2 border-t border-emerald-500/10 mt-3 pt-3">
                    <p>
                      Capital Deployed:{" "}
                      <span className="font-semibold">
                        ${executionResponse.deployed_amount.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Net Return:{" "}
                      <span
                        className={`font-semibold ${executionResponse.profit_pct >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {executionResponse.profit_pct.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                )}
              <DialogDescription className="hidden"></DialogDescription>
            </div>

            <div className="pt-2 w-full animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold tracking-wide"
              >
                Continue
              </Button>
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
        <DialogContent className="sm:max-w-md text-center border-l-4 border-l-red-500">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-red-600 text-xl">
              <Icons.AlertTriangle className="w-6 h-6" />
              Stop Execution Warning
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {executionResponse?.message ||
                "We noticed your portfolio is currently down. Since you are more than halfway through the cycle, it is recommended to halt further investment to protect capital."}
            </p>
            {executionResponse?.deployed_amount !== undefined &&
              executionResponse?.profit_pct !== undefined && (
                <div className="text-xs text-center text-muted-foreground space-y-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 mb-3">
                  <p>
                    Capital Deployed:{" "}
                    <span className="font-semibold">
                      ${executionResponse.deployed_amount.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Net Return:{" "}
                    <span className="font-semibold text-red-600">
                      {executionResponse.profit_pct.toFixed(2)}%
                    </span>
                  </p>
                </div>
              )}
            <p className="hidden"></p>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                &quot;Good Investors know when to throttle down.&quot;
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              className="w-full sm:w-auto flex-1 shadow-md"
              onClick={() => setShowKillSwitchPopup(false)}
            >
              <Icons.Zap className="w-4 h-4 mr-2" /> Kill Switch (Stop)
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowKillSwitchPopup(false);
                performCalculation();
              }}
            >
              Ignore & Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
