"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Zap, ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: "spam-detection",
    title: "Spam Detection Model",
    description:
      "Advanced NLP model to classify emails as Spam or Ham using Naive Bayes and SVM.",
    icon: ShieldAlert,
    href: "/spam-detection",
    status: "Live",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "sentiment-analysis",
    title: "Sentiment Analysis",
    description:
      "Analyze customer reviews and feedback to determine underlying sentiment.",
    icon: Activity,
    href: "/upcoming",
    status: "Coming Soon",
    color: "from-purple-500 to-pink-400",
  },
  {
    id: "image-recognition",
    title: "Image Recognition",
    description:
      "Identify objects and faces in images with high precision using CNNs.",
    icon: Zap,
    href: "/upcoming",
    status: "Coming Soon",
    color: "from-amber-500 to-orange-400",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <header>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2"
        >
          Welcome Back, User
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          Select an AI project to visualize and interact with.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            href={project.href}
            className={cn(
              project.status === "Coming Soon" &&
                "pointer-events-none opacity-80"
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative p-6 rounded-2xl glass-panel h-full border border-white/5 bg-linear-to-br from-white/5 to-transparent overflow-hidden"
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br",
                  project.color
                )}
              />

              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-linear-to-br bg-opacity-20",
                    project.color
                  )}
                >
                  <project.icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full border border-white/10",
                    project.status === "Live"
                      ? "text-green-400 bg-green-400/10"
                      : "text-gray-400 bg-gray-400/10"
                  )}
                >
                  {project.status}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-sm text-gray-400 mb-6">
                {project.description}
              </p>

              {project.status === "Live" && (
                <div className="flex items-center text-sm font-medium text-blue-400 group-hover:gap-2 transition-all">
                  Explore Project <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
