"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChurnPredictor } from "@/components/ChurnPredictor";
import { Users, Activity, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStats, StatsResult } from "@/lib/api";
import { ChurnDistributionChart } from "@/components/charts/ChurnDistributionChart";

export default function ChurnPage() {
  const [stats, setStats] = useState<StatsResult | null>(null);

  useEffect(() => {
     getStats().then((data) => {
      if (data) setStats(data);
    });

    const interval = setInterval(() => {
      getStats().then((data) => {
        if (data) setStats(data);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const churnRate = stats && stats.churn_predictions > 0 
    ? ((stats.churn_detected / stats.churn_predictions) * 100).toFixed(1)
    : "0.0";

  const statItems = [
    {
      label: "Total Predictions",
      value: stats && stats.churn_predictions > 0 ? stats.churn_predictions.toLocaleString() : "Loading...",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Avg Churn Risk",
      value: `${churnRate}%`,
      icon: TrendingUp,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      label: "Retention Rate",
      value: stats && stats.churn_predictions > 0 ? `${(100 - parseFloat(churnRate)).toFixed(1)}%` : "...",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-2 flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Users className="w-8 h-8" />
          </div>
          Customer Churn Analysis
        </motion.h1>
        <p className="text-gray-400 ml-14">
          Predict customer retention probability using Random Forest & Logistic Regression models.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
          {/* Left: Predictor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
              <ChurnPredictor />
          </motion.div>
          
          {/* Right: Charts & Info */}
          <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Churn vs Retention Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChurnDistributionChart 
                    churnCount={stats?.churn_detected || 0}
                    totalCount={stats?.churn_predictions || 0}
                  />
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-linear-to-br from-indigo-900/10 to-purple-900/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    How it works
                  </h3>
                  <ul className="grid grid-cols-1 gap-4 text-sm text-gray-400">
                    <li className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      Random Forest builds multiple decision trees to classify customer stability based on historical patterns.
                    </li>
                    <li className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      Logistic Regression estimates the probability of churn occurrence based on weighted input features.
                    </li>
                    <li className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      Key factors include monthly bill amount, subscription duration, and total service usage.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
      </div>
    </div>
  );
}
