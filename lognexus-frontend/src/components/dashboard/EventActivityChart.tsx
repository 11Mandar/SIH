import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EventActivityPoint } from "../../types";

interface EventActivityChartProps {
  data: EventActivityPoint[];
}

export function EventActivityChart({ data }: EventActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="eventActivityFillChetas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="eventActivityStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1F2937" strokeDasharray="3 5" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: "#1F2937" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8B93A7", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 8,
            color: "#E6EDF3",
            fontSize: 12,
            fontFamily: "JetBrains Mono",
          }}
          labelStyle={{ color: "#8B93A7", fontSize: 11 }}
          formatter={(value: number) => [value.toLocaleString(), "Events"]}
        />
        <Area
          type="monotone"
          dataKey="events"
          stroke="url(#eventActivityStroke)"
          strokeWidth={2}
          fill="url(#eventActivityFillChetas)"
          dot={false}
          activeDot={{ r: 4, fill: "#06B6D4", stroke: "#111827", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
