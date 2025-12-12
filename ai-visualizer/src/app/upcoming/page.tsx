"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import Link from "next/link";

export default function UpcomingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-24 h-24 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-6 shadow-2xl border border-white/5"
      >
        <Construction className="w-10 h-10 text-gray-400" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold mb-3"
      >
        Work in Progress
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 max-w-md mb-8"
      >
        We are currently training this model. Check back soon for exciting new
        AI capabilities!
      </motion.p>

      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:bg-gray-200 transition-colors"
        >
          Return to Dashboard
        </motion.button>
      </Link>
    </div>
  );
}
