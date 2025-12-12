"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface TopWordsChartProps {
  data?: { name: string; count: number }[];
}

interface CustomYAxisTickProps {
  x: number;
  y: number;
  payload: { value: string };
}

const CustomYAxisTick = (props: unknown) => {
  const { x, y, payload } = props as CustomYAxisTickProps;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#9ca3af" fontSize={12}>
        {payload.value.length > 12
          ? `${payload.value.substring(0, 10)}...`
          : payload.value}
      </text>
    </g>
  );
};

export function TopWordsChart({ data = [] }: TopWordsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-500 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 animate-spin" />
        <p className="text-xs">Analyzing keywords...</p>
      </div>
    );
  }

  // Top 10 for Chart
  const chartData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);
  // Next 20 for Chips
  const chipData = [...data].sort((a, b) => b.count - a.count).slice(10, 30);

  return (
    <div className="space-y-6">
      {/* Bar Chart Section */}
      <div className="h-[300px] w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#333"
              opacity={0.4}
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={<CustomYAxisTick />}
              width={80}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)", radius: 4 }}
              contentStyle={{
                backgroundColor: "#111",
                borderRadius: "8px",
                border: "1px solid #333",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              itemStyle={{ color: "#fff", fontWeight: 600 }}
              formatter={(value: number) => [`${value} occurrences`, "Count"]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" /> {/* purple-500 */}
                <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
              </linearGradient>
            </defs>
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              fill="url(#barGradient)"
              animationDuration={1000}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chips Section */}
      {chipData.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            More Frequent Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {chipData.map((word, i) => (
              <motion.span
                key={word.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/50 hover:text-purple-200 transition-colors cursor-default"
                title={`${word.count} occurrences`}
              >
                {word.name}
                <span className="ml-1.5 opacity-50 text-[10px]">
                  {word.count}
                </span>
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
