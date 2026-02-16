"use client";

import { Clock } from "lucide-react";
import { SeatVacancyPredictionDto } from "@pnu-blace/types";

interface PredictionDisplayProps {
  isLoading: boolean;
  prediction: SeatVacancyPredictionDto | null | undefined;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}시간${m > 0 ? ` ${m}분` : ""}`;
  return `${m}분`;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    confidence >= 0.7
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : confidence >= 0.4
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <span
      className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${color}`}
    >
      신뢰도 {pct}%
    </span>
  );
}

function ProbabilityChip({
  label,
  probability,
}: {
  label: string;
  probability: number;
}) {
  const pct = Math.round(probability * 100);
  const width = `${Math.max(8, pct)}%`;

  return (
    <div className="flex-1 p-3 bg-muted/30 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
          style={{ width }}
        />
      </div>
    </div>
  );
}

export function PredictionDisplay({
  isLoading,
  prediction,
}: PredictionDisplayProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-muted/40 border border-border rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground/40" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-muted-foreground/10 rounded" />
            <div className="h-3 w-48 bg-muted-foreground/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const medianMin = prediction.medianRemainingMinutes ?? 0;
  const timeLabel = formatMinutes(medianMin);
  const confidence = prediction.confidence ?? 0;
  const bands = prediction.probabilityBands ?? [];
  const band30 = bands.find((b) => b.withinMinutes === 30);
  const band60 = bands.find((b) => b.withinMinutes === 60);

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* 메인 예측 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100 tabular-nums">
                {timeLabel}
              </span>
              <span className="text-sm text-blue-700/70 dark:text-blue-300/70">
                후 비워질 예정
              </span>
            </div>
            {prediction.remainingRange && (
              <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-1">
                빠르면 {formatMinutes(prediction.remainingRange.optimistic)},
                늦으면 {formatMinutes(prediction.remainingRange.pessimistic)}
              </p>
            )}
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>

      {/* 확률 밴드 */}
      {(band30 || band60) && (
        <div className="flex gap-2">
          {band30 && (
            <ProbabilityChip label="30분 내" probability={band30.probability} />
          )}
          {band60 && (
            <ProbabilityChip
              label="1시간 내"
              probability={band60.probability}
            />
          )}
        </div>
      )}
    </div>
  );
}
