import React from "react";
import { Icons } from "../../constants";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PartitionDetailsView } from "./types";

interface PartitionSectionProps {
  selectedPartition: number | null;
  setSelectedPartition: (val: number | null) => void;
  partitionDetails: PartitionDetailsView | null;
  isLoadingPartition: boolean;
  displayPartitionMonths: number;
  showPartitionSelector: boolean;
  setShowPartitionSelector: (val: boolean) => void;
  selectorPartitions: number[];
  selectorAnchor: HTMLElement | null;
  onPartitionClick: (index: number) => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const PartitionSection: React.FC<PartitionSectionProps> = ({
  selectedPartition,
  setSelectedPartition,
  partitionDetails,
  isLoadingPartition,
  displayPartitionMonths,
  showPartitionSelector,
  setShowPartitionSelector,
  selectorPartitions,
  selectorAnchor,
  onPartitionClick,
}) => {
  const isCompleted =
    partitionDetails?.status === "COMPLETED" || partitionDetails?.status === 2;
  const isActive =
    partitionDetails?.status === "ACTIVE" || partitionDetails?.status === 1;

  // Normalize dual field names
  const capitalDeployed =
    partitionDetails?.capital_deployed ??
    partitionDetails?.capitalInvestedSoFar ??
    0;
  const capitalAllocated =
    partitionDetails?.capital_allocated ??
    partitionDetails?.partitionCapitalAllocated ??
    0;
  const expectedDays =
    partitionDetails?.expected_days ??
    partitionDetails?.expectedPartitionDays ??
    displayPartitionMonths;
  const sharesBought =
    partitionDetails?.shares_bought ?? partitionDetails?.noOfSharesBought ?? 0;
  const partitionIndex =
    partitionDetails?.partition_index ??
    partitionDetails?.partitionIndex ??
    (selectedPartition !== null ? selectedPartition + 1 : 1);
  const startDate = partitionDetails?.start_date ?? partitionDetails?.createdAt;
  const endDate =
    partitionDetails?.end_date ?? partitionDetails?.partitionEndDate;
  const netReturn = partitionDetails?.net_profit_percentage ?? 0;
  const returnPositive = netReturn >= 0;

  return (
    <div>
      {/* Partition group selector popup */}
      {showPartitionSelector && selectorAnchor && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowPartitionSelector(false)}
        >
          <div
            className="absolute bg-[#060d09] border border-emerald-500/25 rounded-2xl shadow-2xl shadow-emerald-900/30 p-4 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: `${selectorAnchor.getBoundingClientRect().top - 130}px`,
              left: `${selectorAnchor.getBoundingClientRect().left}px`,
              minWidth: "240px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/40" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
                Select Cycle
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/40" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {selectorPartitions.map((partitionNum) => (
                <button
                  key={partitionNum}
                  onClick={() => onPartitionClick(partitionNum)}
                  className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)] hover:shadow-[0_0_16px_rgba(16,185,129,0.55)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-black/15 to-white/15 rounded-xl" />
                  <span className="relative z-10 text-white font-bold text-sm">
                    {partitionNum}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partition detail dialog */}
      <Dialog
        open={selectedPartition !== null}
        onOpenChange={(open) => !open && setSelectedPartition(null)}
      >
        <DialogContent
          hideCloseButton
          className="max-w-md p-0 overflow-hidden bg-[#060d09] border border-slate-800/60 shadow-2xl rounded-2xl"
        >
          {isLoadingPartition ? (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading cycle details…</p>
            </div>
          ) : (
            selectedPartition !== null && (
              <>
                {/* Header */}
                <div className="relative overflow-hidden px-6 pt-6 pb-5">
                  {/* Status-tinted radial glow */}
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      isCompleted
                        ? "bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(16,185,129,0.18),transparent)]"
                        : isActive
                          ? "bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(16,185,129,0.12),transparent)]"
                          : "bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(100,116,139,0.12),transparent)]"
                    }`}
                  />

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedPartition(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
                  >
                    <Icons.Close size={14} />
                  </button>

                  <div className="flex items-center gap-4 pr-10 relative">
                    {/* Cycle number badge */}
                    <div
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                          : isActive
                            ? "bg-slate-800 border-2 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                            : "bg-slate-800 border border-slate-700"
                      }`}
                    >
                      {isCompleted && (
                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/15" />
                      )}
                      {isActive && (
                        <span className="absolute -inset-px rounded-2xl border border-emerald-400/30 animate-pulse" />
                      )}
                      <span className="relative z-10 font-black text-xl text-white">
                        {partitionIndex}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <DialogTitle className="text-lg font-bold text-white leading-none">
                          Cycle {partitionIndex}
                        </DialogTitle>
                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/25"
                              : isActive
                                ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
                                : "text-slate-400 bg-slate-700/30 border-slate-600/30"
                          }`}
                        >
                          {isCompleted
                            ? "✓ Completed"
                            : isActive
                              ? "● Active"
                              : "Upcoming"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {expectedDays} day cycle
                        {startDate && (
                          <span className="ml-2 text-slate-600">
                            · started {formatDate(startDate)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-4">
                  {partitionDetails ? (
                    <>
                      {/* Stats cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                            <Icons.Wallet size={11} />
                            Capital Invested
                          </p>
                          <p className="text-2xl font-black text-white tracking-tight">
                            ${capitalDeployed.toLocaleString()}
                          </p>
                          {capitalAllocated > 0 && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              of ${capitalAllocated.toLocaleString()} allocated
                            </p>
                          )}
                        </div>

                        <div
                          className={`rounded-xl p-4 border ${
                            returnPositive
                              ? "bg-emerald-500/10 border-emerald-500/25"
                              : "bg-red-500/10 border-red-500/25"
                          }`}
                        >
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                            <Icons.TrendingUp size={11} />
                            Net Return
                          </p>
                          <p
                            className={`text-2xl font-black tracking-tight ${
                              returnPositive
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {returnPositive ? "+" : ""}
                            {netReturn.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      {/* Timeline row */}
                      {(startDate || endDate) && (
                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                          <div className="flex items-center justify-between relative">
                            <div className="text-center">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                                Start
                              </p>
                              <p className="text-xs font-semibold text-white font-mono">
                                {formatDate(startDate)}
                              </p>
                            </div>

                            {/* Timeline connector */}
                            <div className="flex-1 mx-4 flex items-center gap-1">
                              <div className="flex-1 h-px bg-slate-700" />
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isCompleted
                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                    : "bg-slate-700 border border-slate-600"
                                }`}
                              >
                                {isCompleted ? (
                                  <svg
                                    className="w-2.5 h-2.5 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                )}
                              </div>
                              <div className="flex-1 h-px bg-slate-700" />
                            </div>

                            <div className="text-center">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                                End
                              </p>
                              <p className="text-xs font-semibold text-white font-mono">
                                {formatDate(endDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                            <Icons.Clock className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                              Duration
                            </p>
                            <p className="text-sm font-bold text-white">
                              {expectedDays} days
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                            <Icons.Activity className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                              Units
                            </p>
                            <p className="text-sm font-bold text-white font-mono">
                              {sharesBought.toLocaleString(undefined, {
                                maximumFractionDigits: 4,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Upcoming / no data state */
                    <div className="py-10 flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center">
                        <Icons.Clock className="w-7 h-7 text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white">
                          Awaiting Execution
                        </p>
                        <p className="text-xs text-slate-500 max-w-[220px]">
                          This cycle is scheduled for a future date.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
