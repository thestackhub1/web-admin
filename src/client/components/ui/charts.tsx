// Client-side only — no server secrets or database access here

"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { GlassCard } from "./premium";
import { theme } from "@/client/lib/theme";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <GlassCard className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
      </div>
      {children}
    </GlassCard>
  );
}

// Using theme colors instead of hardcoded values
const COLORS = theme.charts.rainbow;

interface PieChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export function SubjectPieChart({ data }: { data: PieChartData[] }) {
  // Filter out zero values for cleaner chart
  const filteredData = data.filter((item) => item.value > 0);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label that only shows for non-zero values
  const _renderLabel = ({ name, value }: { name: string; value: number }) => {
    if (value === 0 || total === 0) return null;
    const percent = Math.round((value / total) * 100);
    return `${name}: ${percent}%`;
  };

  if (total === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <BarChart3 className="mx-auto mb-2 h-12 w-12 text-neutral-400" />
        <p className="text-neutral-500 dark:text-neutral-400">No questions yet</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              borderRadius: "12px",
              border: "1px solid rgba(55, 65, 81, 0.5)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
              color: "#fff",
            }}
            formatter={(value) => [`${value ?? 0} questions`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {item.name}
              <span className="ml-1 font-medium text-neutral-900 dark:text-white">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AreaChartData {
  name: string;
  value: number;
}

export function ActivityAreaChart({ data }: { data: AreaChartData[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

export function DifficultyBarChart({ data }: { data: BarChartData[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
