import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SourceDistributionPoint } from "../../types";

interface SourceDistributionChartProps {
  data: SourceDistributionPoint[];
}

// Chetas ring palette — one color per source type
const ringColors = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#7C3AED", "#EC4899"];

export function SourceDistributionChart({ data }: SourceDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 5" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="sourceType"
          tick={{ fill: "var(--color-text-primary)", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          cursor={{ fill: "rgba(6,182,212,0.06)" }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 8,
            color: "var(--color-text-primary)",
            fontSize: 12,
            fontFamily: "JetBrains Mono",
          }}
          labelStyle={{ color: "var(--color-text-secondary)" }}
          itemStyle={{ color: "var(--color-text-primary)" }}
          formatter={(value: number) => [value.toLocaleString(), "Events"]}
        />
        <Bar dataKey="events" radius={[0, 5, 5, 0]} barSize={16}>
          {data.map((entry, index) => (
            <Cell
              key={entry.sourceType}
              fill={ringColors[index % ringColors.length]}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
