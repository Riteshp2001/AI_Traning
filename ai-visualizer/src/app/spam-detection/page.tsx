"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, ShieldCheck, AlertOctagon, BarChart3 } from "lucide-react";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { TopWordsChart } from "@/components/charts/TopWordsChart";
import { EmailChecker } from "@/components/EmailChecker";
import { getStats, StatsResult } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpamDetectionPage() {
  const [stats, setStats] = useState<StatsResult | null>(null);

  useEffect(() => {
    // Initial fetch
    getStats().then((data) => {
      if (data) {
        setStats(data);
      }
    });

    // Poll every 10 seconds for realtime updates
    const interval = setInterval(() => {
      getStats().then((data) => {
        if (data) {
          setStats(data);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      label: "Total Emails Processed",
      value: stats ? stats.total_processed.toLocaleString() : "Loading...",
      icon: Mail,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Spam Rate",
      value: stats
        ? `${((stats.spam_count / stats.total_processed) * 100).toFixed(1)}%`
        : "...",
      icon: AlertOctagon,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Uptime",
      value: stats ? `${Math.floor(stats.uptime_seconds / 60)}m` : "...",
      icon: ShieldCheck,
      color: "text-green-400",
      bg: "bg-green-400/10",
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
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          Spam Detection Analysis
        </motion.h1>
        <p className="text-gray-400 ml-14">
          Real-time analysis of email content using Naive Bayes & Support Vector
          Machines.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Interactive */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <EmailChecker />

          <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Spam vs Ham Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DistributionChart
                spamCount={stats?.spam_count || 0}
                totalCount={stats?.total_processed || 0}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Col: Charts/Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Top Keywords in Spam</CardTitle>
              <p className="text-xs text-gray-500">
                Frequency of words appearing in flagged messages.
              </p>
            </CardHeader>
            <CardContent>
              <TopWordsChart data={stats?.top_words || []} />
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-linear-to-br from-blue-900/20 to-purple-900/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                <li>
                  The model processes raw text, removing punctuation and
                  stopwords.
                </li>
                <li>
                  Term Frequency-Inverse Document Frequency (TF-IDF) converts
                  text to numbers.
                </li>
                <li>A linear SVM classifies the vector as Spam or Ham.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
