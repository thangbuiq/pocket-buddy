"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { SpendingPacePoint } from "@/lib/analytics";

type SpendingPaceChartPoint = SpendingPacePoint & {
  average: number | null;
};

function CurrentDateDot(props: {
  cx?: number;
  cy?: number;
  payload?: SpendingPaceChartPoint;
  currentDay: number | null;
}) {
  const { cx, cy, payload, currentDay } = props;

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    !payload ||
    payload.day !== currentDay
  ) {
    return null;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r="4" fill="var(--primary)" opacity="0.35">
        <animate
          attributeName="r"
          values="4;11;4"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.45;0;0.45"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r="4"
        fill="var(--primary)"
        stroke="var(--card)"
        strokeWidth="2"
      />
    </g>
  );
}

export function SpendingPaceChart({
  data,
  currency = "VND",
}: {
  data: SpendingPacePoint[];
  currency?: string;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const currentDay = useMemo(() => {
    const latestPoint = data.findLast((point) => point.current !== null);
    return latestPoint?.day ?? null;
  }, [data]);
  const chartData = useMemo<SpendingPaceChartPoint[]>(() => {
    const latestPoint = data.findLast((point) => point.current !== null);
    const dailyAverage =
      latestPoint && latestPoint.current !== null
        ? latestPoint.current / latestPoint.day
        : 0;

    return data.map((point) => ({
      ...point,
      average: dailyAverage > 0 ? dailyAverage * point.day : null,
    }));
  }, [data]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="card-shadow flex h-80 flex-col rounded-[4px] border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-foreground">
          {t("spendingPace")}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          {t("monthToDate")}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-primary" />
          {t("currentMonth")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-5 border-t border-dashed border-muted" />
          {t("previousMonth")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-5 bg-warning" />
          {t("average")}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {mounted ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 0, bottom: 8, left: -18 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="day"
                stroke="var(--muted)"
                interval="preserveStartEnd"
                tick={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.7rem",
                }}
              />
              <YAxis
                stroke="var(--muted)"
                width={8}
                axisLine={false}
                tick={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value), currency),
                  name === "current"
                    ? t("currentMonth")
                    : name === "previous"
                      ? t("previousMonth")
                      : t("average"),
                ]}
                labelFormatter={(day) => `${t("day")} ${day}`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  color: "var(--foreground)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.75rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="var(--muted)"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--warning)"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={(props) => (
                  <CurrentDateDot
                    {...props}
                    payload={props.payload as SpendingPaceChartPoint}
                    currentDay={currentDay}
                  />
                )}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-muted">
            {t("loading")}
          </div>
        )}
      </div>
    </div>
  );
}
