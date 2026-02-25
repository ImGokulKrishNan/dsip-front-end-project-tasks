import React, { useState } from "react";
import { Icons } from "../../constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTracker } from "@/hooks/useTrackers";
import { InfoTooltip } from "../InfoTooltip";
import { DisplayValues } from "./types";

interface EngineConfigurationCardProps {
  displayValues: DisplayValues;
  trackerData: any;
}

const LOAD_FACTOR_TO_KEY: Record<string, string> = {
  "Gradual Build": "GRADUAL",
  "Balanced Build": "MODERATE",
  "Aggressive Early Build": "AGGRESSIVE",
};

export const EngineConfigurationCard: React.FC<
  EngineConfigurationCardProps
> = ({ displayValues, trackerData }) => {
  const updateTrackerM = useUpdateTracker();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editConfig, setEditConfig] = useState({
    totalBudget: displayValues.totalBudget,
    convictionYears: displayValues.convictionYears,
    loadFactor: displayValues.loadFactor,
    partitionMonths: displayValues.partitionMonths,
    convictionLevel: displayValues.convictionLevel,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleStartEdit = () => {
    setEditConfig({
      totalBudget: displayValues.totalBudget,
      convictionYears: displayValues.convictionYears,
      loadFactor: (LOAD_FACTOR_TO_KEY[displayValues.loadFactor] ||
        displayValues.loadFactor) as any,
      partitionMonths: displayValues.partitionMonths,
      convictionLevel: displayValues.convictionLevel,
    });
    setValidationErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditConfig({
      totalBudget: displayValues.totalBudget,
      convictionYears: displayValues.convictionYears,
      loadFactor: displayValues.loadFactor,
      partitionMonths: displayValues.partitionMonths,
      convictionLevel: displayValues.convictionLevel,
    });
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};

    const currentTotalBudget = displayValues.totalBudget;
    const currentConvictionYears = displayValues.convictionYears;

    if (editConfig.totalBudget < currentTotalBudget) {
      errors["Total Budget"] =
        `Can only increase (current: $${currentTotalBudget.toLocaleString()})`;
    }

    if (editConfig.convictionYears < currentConvictionYears) {
      errors["Conviction Period"] =
        `Can only increase (current: ${currentConvictionYears} years)`;
    }

    if (editConfig.convictionLevel < 0 || editConfig.convictionLevel > 100) {
      errors["Overall Conviction"] = "Must be between 0-100%";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const currentLoadFactor =
      LOAD_FACTOR_TO_KEY[displayValues.loadFactor] || displayValues.loadFactor;

    const hasChanges =
      editConfig.totalBudget !== currentTotalBudget ||
      editConfig.convictionYears !== currentConvictionYears ||
      editConfig.partitionMonths !== displayValues.partitionMonths ||
      editConfig.loadFactor !== currentLoadFactor ||
      editConfig.convictionLevel !== displayValues.convictionLevel;

    if (!hasChanges) {
      setValidationErrors({
        Info: "No changes detected. Please update at least one value to save.",
      });
      return;
    }

    if (!trackerData?.trackerId) return;

    setIsSaving(true);
    try {
      await updateTrackerM.mutateAsync({
        trackerId: trackerData.trackerId,
        data: {
          total_capital_planned: editConfig.totalBudget,
          conviction_period_years: editConfig.convictionYears,
          partition_months: editConfig.partitionMonths,
          deployment_style: editConfig.loadFactor,
          base_conviction_score: editConfig.convictionLevel,
        },
      });
      setIsEditing(false);
    } catch {
      alert("Failed to update tracker. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="size-7"></div>
      <Card className="bg-muted/20 border-border/50 shadow-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <Icons.Settings size={14} className="text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  Engine Configuration
                  <InfoTooltip text="Your investment strategy parameters. These define how your capital is deployed over time." />
                </CardTitle>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={handleStartEdit}
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-3.5 text-sm">
            {!isEditing ? (
              <>
                <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                  <p className="text-xs text-muted-foreground">
                    Conviction Period
                  </p>
                  <p className="font-semibold">
                    {displayValues.convictionYears} Years
                  </p>
                </div>
                <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                  <p className="font-semibold">
                    ${displayValues.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                  <p className="text-xs text-muted-foreground">
                    Overall Conviction
                  </p>
                  <p className="font-semibold">
                    {displayValues.convictionLevel}%
                  </p>
                </div>
                <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                  <p className="text-xs text-muted-foreground">Load Factor</p>
                  <p className="font-semibold capitalize">
                    {displayValues.loadFactor}
                  </p>
                </div>
                <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                  <p className="text-xs text-muted-foreground">
                    Investment Cycle Length
                  </p>
                  <p className="font-semibold">
                    {displayValues.partitionMonths} Months
                  </p>
                </div>
                {displayValues.initialInvestedAmount !== null &&
                  displayValues.initialInvestedAmount !== undefined &&
                  Number(displayValues.initialInvestedAmount) !== 0 && (
                    <div className="flex justify-between md:block border-b md:border-0 pb-2 md:pb-0 border-dashed border-muted">
                      <p className="text-xs text-muted-foreground">
                        Initial Invested Amount
                      </p>
                      <p className="font-semibold">
                        $
                        {Number(
                          displayValues.initialInvestedAmount,
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                {displayValues.initialSharesHeld !== null &&
                  displayValues.initialSharesHeld !== undefined &&
                  Number(displayValues.initialSharesHeld) !== 0 && (
                    <div className="flex justify-between md:block pt-1 md:pt-0">
                      <p className="text-xs text-muted-foreground">
                        Initial Shares Held
                      </p>
                      <p className="font-semibold">
                        {Number(displayValues.initialSharesHeld).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 },
                        )}
                      </p>
                    </div>
                  )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Conviction Period (Years)
                  </Label>
                  <Input
                    type="number"
                    className="h-10 md:h-8"
                    value={editConfig.convictionYears || ""}
                    onChange={(e) =>
                      setEditConfig({
                        ...editConfig,
                        convictionYears:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Total Budget ($)
                  </Label>
                  <Input
                    type="number"
                    className="h-10 md:h-8"
                    value={editConfig.totalBudget || ""}
                    onChange={(e) =>
                      setEditConfig({
                        ...editConfig,
                        totalBudget:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    placeholder="Enter total budget"
                  />
                </div>
                <div className="space-y-3 md:col-span-2 pt-2 md:pt-0">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Conviction Adjustment
                    <InfoTooltip text="Your overall conviction strength (X-Factor). Higher values execute more aggressively." />
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1 py-1"
                      value={[editConfig.convictionLevel || 50]}
                      onValueChange={(val) =>
                        setEditConfig({
                          ...editConfig,
                          convictionLevel: val[0],
                        })
                      }
                    />
                    <span className="w-12 text-center text-sm font-bold bg-muted p-1 rounded">
                      {editConfig.convictionLevel}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold flex justify-between">
                    Load Factor
                    <span className="text-[10px] text-amber-600 font-normal">
                      *Not recommended to change
                    </span>
                  </Label>
                  <Select
                    value={editConfig.loadFactor}
                    onValueChange={(val: any) =>
                      setEditConfig({ ...editConfig, loadFactor: val })
                    }
                  >
                    <SelectTrigger className="h-10 md:h-8">
                      <SelectValue placeholder="Select load factor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRADUAL">Gradual Build</SelectItem>
                      <SelectItem value="MODERATE">Balanced Build</SelectItem>
                      <SelectItem value="AGGRESSIVE">
                        Aggressive Early Build
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {editConfig.loadFactor !==
                    ((
                      {
                        "Gradual Build": "GRADUAL",
                        "Balanced Build": "MODERATE",
                        "Aggressive Early Build": "AGGRESSIVE",
                      } as Record<string, string>
                    )[displayValues.loadFactor] ||
                      displayValues.loadFactor) && (
                    <div className="flex items-start gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-2">
                      <Icons.AlertTriangle
                        size={12}
                        className="mt-0.5 shrink-0"
                      />
                      <p className="text-[11px] leading-tight">
                        These changes will affect only in the next investment
                        cycle.
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold">
                    Investment Cycle Length (Months)
                  </Label>
                  <Input
                    type="number"
                    className="h-10 md:h-8"
                    value={editConfig.partitionMonths || ""}
                    onChange={(e) =>
                      setEditConfig({
                        ...editConfig,
                        partitionMonths:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                  {editConfig.partitionMonths !==
                    displayValues.partitionMonths && (
                    <div className="flex items-start gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-2">
                      <Icons.AlertTriangle
                        size={12}
                        className="mt-0.5 shrink-0"
                      />
                      <p className="text-[11px] leading-tight">
                        These changes will affect only in the next investment
                        cycle.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {isEditing && (
            <div className="space-y-3 pt-2">
              {Object.keys(validationErrors).length > 0 && (
                <div
                  className={`p-3 rounded-lg border ${
                    validationErrors["Info"]
                      ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      : "bg-destructive/10 border-destructive/20"
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      validationErrors["Info"]
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-destructive"
                    }`}
                  >
                    <Icons.AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="space-y-1 text-xs">
                      {Object.entries(validationErrors).map(
                        ([field, error]) => (
                          <p key={field}>
                            {field === "Info" ? (
                              error
                            ) : (
                              <>
                                <strong>{field}:</strong> {error}
                              </>
                            )}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" disabled={isSaving} onClick={handleSave}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
