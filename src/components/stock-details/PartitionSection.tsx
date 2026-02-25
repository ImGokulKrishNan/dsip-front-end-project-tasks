import React from "react";
import { Icons } from "../../constants";
import { Badge } from "@/components/ui/badge";
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
  return (
    <div>
      {showPartitionSelector && selectorAnchor && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowPartitionSelector(false)}
        >
          <div
            className="absolute bg-slate-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 p-4 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: `${selectorAnchor.getBoundingClientRect().top - 120}px`,
              left: `${selectorAnchor.getBoundingClientRect().left}px`,
              minWidth: "280px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <Icons.Target size={14} />
              Select Partition
            </div>
            <div className="grid grid-cols-4 gap-2">
              {selectorPartitions.map((partitionNum) => (
                <button
                  key={partitionNum}
                  onClick={() => onPartitionClick(partitionNum)}
                  className="h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:via-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-white font-bold text-sm relative overflow-hidden group"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20" />
                  <span className="relative z-10">{partitionNum}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={selectedPartition !== null}
        onOpenChange={(open) => !open && setSelectedPartition(null)}
      >
        <DialogContent
          hideCloseButton
          className="max-w-lg p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-2xl rounded-3xl"
        >
          {isLoadingPartition ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">
                Loading partition details...
              </p>
            </div>
          ) : (
            selectedPartition !== null && (
              <>
                <div className="relative bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent p-6 pb-8">
                  <button
                    onClick={() => setSelectedPartition(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all z-10 backdrop-blur-sm"
                  >
                    ✕
                  </button>

                  <div className="flex items-start gap-4 pr-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                      <span className="font-mono font-black text-2xl text-white">
                        I
                        {partitionDetails?.partition_index ||
                          selectedPartition + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <DialogTitle className="font-bold text-xl text-white leading-none">
                          Investment Cycle
                        </DialogTitle>
                        <Badge
                          variant={
                            partitionDetails?.status === 2
                              ? "default"
                              : "outline"
                          }
                          className={
                            partitionDetails?.status === 2
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30 px-3 py-0.5 text-xs font-semibold"
                              : partitionDetails?.status === 1
                                ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30 px-3 py-0.5 text-xs font-semibold"
                                : "bg-slate-700/50 text-slate-400 border-slate-600 px-3 py-0.5 text-xs font-semibold"
                          }
                        >
                          {partitionDetails?.status === "COMPLETED"
                            ? "Success"
                            : "Active"}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-400 font-mono">
                        Current Cycle{" "}
                        {partitionDetails?.partition_index ||
                          selectedPartition + 1}{" "}
                        •{" "}
                        {partitionDetails?.expected_days ||
                          displayPartitionMonths}{" "}
                        days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 pb-8 space-y-6">
                  {partitionDetails ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                            <Icons.Wallet size={14} />
                            Capital Invested
                          </div>
                          <div className="text-3xl font-black text-white tracking-tight">
                            $
                            {(
                              partitionDetails?.capital_deployed || 0
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            of $
                            {(
                              partitionDetails?.capital_allocated || 0
                            ).toLocaleString()}{" "}
                            allocated
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-2xl border ${
                            (partitionDetails?.net_profit_percentage || 0) >= 0
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-red-500/10 border-red-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                            <Icons.Activity size={14} />
                            Net Return
                          </div>
                          <div
                            className={`text-3xl font-black tracking-tight ${
                              (partitionDetails?.net_profit_percentage || 0) >=
                              0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {(partitionDetails?.net_profit_percentage || 0) >= 0
                              ? "+"
                              : ""}
                            {(
                              partitionDetails?.net_profit_percentage || 0
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {partitionDetails?.end_date && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                            <span className="text-sm text-slate-400">
                              End Date
                            </span>
                            <span className="text-sm font-semibold text-white font-mono">
                              {new Date(
                                partitionDetails.end_date,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                          <span className="text-sm text-slate-400">
                            Expected Days
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {partitionDetails?.expected_days ||
                              displayPartitionMonths}{" "}
                            days
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                          <span className="text-sm text-slate-400">
                            Units Acquired
                          </span>
                          <span className="text-sm font-semibold text-white font-mono">
                            {(
                              partitionDetails?.shares_bought || 0
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        {partitionDetails?.start_date && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-400">
                              Start Date
                            </span>
                            <span className="text-sm font-semibold text-white font-mono">
                              {new Date(
                                partitionDetails.start_date,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-slate-800/30 flex items-center justify-center mx-auto text-slate-600 border-2 border-dashed border-slate-700">
                        <Icons.Clock className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-white text-lg">
                          Awaiting Execution
                        </p>
                        <p className="text-sm text-slate-400 max-w-[250px] mx-auto">
                          This investment cycle is scheduled for a future date.
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
