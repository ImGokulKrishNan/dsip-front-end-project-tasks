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

interface ExecutionDialogsProps {
  showDailyLimitWarning: boolean;
  setShowDailyLimitWarning: (val: boolean) => void;
  showSuccessPopup: boolean;
  setShowSuccessPopup: (val: boolean) => void;
  showVictoryPopup: boolean;
  setShowVictoryPopup: (val: boolean) => void;
  showKillSwitchPopup: boolean;
  setShowKillSwitchPopup: (val: boolean) => void;
  executionResponse: any;
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Icons.AlertTriangle className="w-5 h-5" />
              Not Recommended for This Strategy
            </DialogTitle>
            <DialogDescription className="pt-2">
              DSIP is designed for one disciplined execution per day. Multiple
              executions within the same day may accelerate capital deployment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDailyLimitWarning(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDailyLimitWarning(false);
                performCalculation();
              }}
            >
              Execute Anyway
            </Button>
          </DialogFooter>
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
        <DialogContent className="sm:max-w-md text-center border-0 bg-background/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col items-center justify-center space-y-5 px-6 py-10 relative">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in zoom-in-50 duration-700">
                <Icons.Target className="w-12 h-12 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
              </div>
              <div className="absolute -inset-2 rounded-full border border-amber-500/20 animate-[spin_10s_linear_infinite]" />
              <div className="absolute -inset-4 rounded-full border border-amber-500/10 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
            </div>

            <div className="space-y-2 max-w-sm mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
                {executionResponse?.title || "Partition Completed!"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                {executionResponse?.message ||
                  "Outstanding discipline! You have successfully completed a full investment cycle."}
              </DialogDescription>
              {executionResponse?.deployed_amount !== undefined &&
                executionResponse?.profit_pct !== undefined && (
                  <div className="text-xs text-center text-muted-foreground space-y-1 pt-2 border-t border-amber-500/10 mt-3 pt-3">
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
                onClick={() => setShowVictoryPopup(false)}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold tracking-wide"
              >
                Proceed to Next Cycle
              </Button>
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
                "Good traders know when to throttle down."
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
