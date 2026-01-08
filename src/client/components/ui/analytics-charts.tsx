// Client-side only — no server secrets or database access here

"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { theme } from "@/client/lib/theme";

// ============================================
// Color Palettes - The Stack Hub Logo Colors
// Centralized in theme.ts for consistency
// ============================================
export const CHART_COLORS = theme.charts;

// ============================================
// Tooltip Styles
// ============================================
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    borderRadius: "12px",
    border: "1px solid rgba(55, 65, 81, 0.5)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
    color: "#fff",
    padding: "12px",
  },
  itemStyle: { color: "#fff" },
  labelStyle: { color: "#9ca3af", marginBottom: "4px" },
};

// ============================================
// Score Distribution Bar Chart
// ============================================
interface ScoreBarChartProps {
  data: { name: string; value: number; target?: number; color?: string }[];
  height?: number;
  showTarget?: boolean;
}

export function ScoreBarChart({ data, height = 300, showTarget = false }: ScoreBarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip {...tooltipStyle} formatter={(value) => [`${value}%`, "Score"]} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CHART_COLORS.rainbow[index % CHART_COLORS.rainbow.length]}
              />
            ))}
          </Bar>
          {showTarget && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Trend Line Chart
// ============================================
interface TrendLineChartProps {
  data: { name: string; [key: string]: string | number }[];
  lines: { key: string; color: string; name?: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function TrendLineChart({
  data,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
}: TrendLineChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <Tooltip {...tooltipStyle} />
          {showLegend && <Legend />}
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name || line.key}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 4, fill: line.color }}
              activeDot={{ r: 6, fill: line.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Stacked Bar Chart (for question types)
// ============================================
interface StackedBarChartProps {
  data: { name: string; [key: string]: string | number }[];
  bars: { key: string; color: string; name?: string }[];
  height?: number;
  layout?: "horizontal" | "vertical";
}

export function StackedBarChart({
  data,
  bars,
  height = 300,
  layout = "horizontal",
}: StackedBarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
          {layout === "horizontal" ? (
            <>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} width={100} />
            </>
          )}
          <Tooltip {...tooltipStyle} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name || bar.key}
              fill={bar.color}
              stackId="stack"
              radius={index === bars.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Donut Chart with Center Label
// ============================================
interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 280,
  innerRadius = 60,
  outerRadius = 90,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <BarChart3 className="mx-auto mb-2 h-12 w-12 text-neutral-400" />
          <p className="text-neutral-500 dark:text-neutral-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CHART_COLORS.rainbow[index % CHART_COLORS.rainbow.length]}
              />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(value) => [value, ""]} />
        </PieChart>
      </ResponsiveContainer>
      
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: "15%" }}>
          <div className="text-center">
            {centerValue && (
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{centerValue}</p>
            )}
            {centerLabel && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{centerLabel}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color || CHART_COLORS.rainbow[index % CHART_COLORS.rainbow.length] }}
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {item.name}
              <span className="ml-1 font-medium text-neutral-900 dark:text-white">
                ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Area Gradient Chart
// ============================================
interface AreaGradientChartProps {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
  gradientId?: string;
}

export function AreaGradientChart({
  data,
  height = 200,
  color = "#6366f1",
  gradientId = "areaGradient",
}: AreaGradientChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
          />
          <YAxis hide />
          <Tooltip {...tooltipStyle} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Heatmap Grid (for chapter performance)
// ============================================
interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface HeatmapProps {
  data: HeatmapData[];
  xLabels: string[];
  yLabels: string[];
  height?: number;
  colorRange?: [string, string, string]; // [low, mid, high]
}

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  height = 300,
  colorRange = ["#fee2e2", "#fef9c3", "#d1fae5"],
}: HeatmapProps) {
  const getValue = (x: string, y: string) => {
    const item = data.find((d) => d.x === x && d.y === y);
    return item?.value ?? 0;
  };

  const getColor = (value: number) => {
    if (value < 50) return colorRange[0];
    if (value < 75) return colorRange[1];
    return colorRange[2];
  };

  return (
    <div style={{ height }} className="overflow-auto">
      <div className="min-w-fit">
        {/* X-axis labels */}
        <div className="flex">
          <div className="w-24 shrink-0" />
          {xLabels.map((label) => (
            <div
              key={label}
              className="flex-1 min-w-15 px-1 text-center text-xs text-neutral-500 dark:text-neutral-400 truncate"
            >
              {label}
            </div>
          ))}
        </div>
        
        {/* Grid */}
        {yLabels.map((yLabel) => (
          <div key={yLabel} className="flex items-center">
            <div className="w-24 shrink-0 pr-2 text-right text-xs text-neutral-600 dark:text-neutral-400 truncate">
              {yLabel}
            </div>
            {xLabels.map((xLabel) => {
              const value = getValue(xLabel, yLabel);
              return (
                <div
                  key={`${xLabel}-${yLabel}`}
                  className="flex-1 min-w-15 m-0.5 flex h-10 items-center justify-center rounded-md text-xs font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${yLabel} × ${xLabel}: ${value}%`}
                >
                  {value > 0 ? `${value}%` : "-"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Radial Progress Chart
// ============================================
interface RadialProgressProps {
  data: { name: string; value: number; fill: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function RadialProgress({
  data,
  height = 250,
  innerRadius = 20,
  outerRadius = 100,
}: RadialProgressProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          barSize={15}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
          <Tooltip {...tooltipStyle} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Mini Sparkline Chart
// ============================================
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "#6366f1",
  showDot = true,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={showDot ? { r: 2, fill: color } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Comparison Bar Chart (horizontal)
// ============================================
interface ComparisonBarProps {
  data: { name: string; current: number; previous: number }[];
  height?: number;
}

export function ComparisonBarChart({ data, height = 300 }: ComparisonBarProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Bar dataKey="previous" name="Previous" fill="#9ca3af" radius={[0, 4, 4, 0]} barSize={12} />
          <Bar dataKey="current" name="Current" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
