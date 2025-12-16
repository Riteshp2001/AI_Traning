"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Sector,
} from "recharts";

interface ChurnDistributionChartProps {
  churnCount?: number;
  totalCount?: number;
}

interface RenderActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: {
    name: string;
    value: number;
    total: number;
  };
}

const renderActiveShape = (props: unknown) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props as RenderActiveShapeProps;

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-10}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={12}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={20}
        textAnchor="middle"
        fill="#fff"
        fontSize={18}
        fontWeight="bold"
      >
        {payload.value.toLocaleString()}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

interface LegendEntry {
  payload: {
    value: number;
    [key: string]: unknown;
  };
  value: string;
  color: string;
}

const renderLegendText = (value: string, entry: unknown) => {
  const { payload } = entry as LegendEntry;
  return (
    <span className="text-slate-400 ml-2">
      {value}:{" "}
      <span className="font-bold text-slate-100">
        {payload.value.toLocaleString()}
      </span>
    </span>
  );
};

export function ChurnDistributionChart({
  churnCount = 0,
  totalCount = 0,
}: ChurnDistributionChartProps) {
  const retentionCount = Math.max(0, totalCount - churnCount);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const data = [
    {
      name: "Retained",
      value: retentionCount,
      color: "#10b981", // Emerald-500
      total: totalCount,
    },
    { 
      name: "Churn", 
      value: churnCount, 
      color: "#f43f5e", // Rose-500
      total: totalCount 
    },
  ];

  if (totalCount === 0) {
    return (
      <div className="h-[300px] w-full flex flex-col items-center justify-center text-slate-500 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-500 animate-spin" />
        <p className="text-xs">Waiting for data...</p>
      </div>
    );
  }

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            // @ts-expect-error: activeIndex is supported by Pie but missing in types
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          {activeIndex === undefined && (
            <g>
              <text
                x="50%"
                y="50%"
                dy={-30}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={12}
              >
                Total
              </text>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fill="#fff"
                fontSize={18}
                fontWeight="bold"
              >
                {totalCount.toLocaleString()}
              </text>
            </g>
          )}
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={renderLegendText}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
