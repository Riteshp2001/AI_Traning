"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkSpam } from "@/lib/api";

export function EmailChecker() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isSpam: boolean;
    confidence: number;
    message?: string;
  } | null>(null);

  const handleCheck = async () => {
    if (!text) return;
    setLoading(true);
    setResult(null);

    console.log(
      "%c 📨 Analyzing Email Content ",
      "background: #3b82f6; color: white; padding: 4px; border-radius: 4px; font-weight: bold;"
    );
    console.log("Input Text:", text);

    const apiResult = await checkSpam(text);

    console.log(
      "%c 🤖 Prediction Result ",
      apiResult.is_spam
        ? "background: #ef4444; color: white; padding: 4px; border-radius: 4px; font-weight: bold;"
        : "background: #22c55e; color: white; padding: 4px; border-radius: 4px; font-weight: bold;"
    );
    console.table(apiResult);

    const mappedResult = {
      isSpam: apiResult.is_spam,
      confidence: apiResult.confidence,
      message: apiResult.message,
    };

    setResult(mappedResult);
    setLoading(false);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-400" />
        Live Email Checker
      </h3>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste email content here to analyze..."
          className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
        />

        <div className="flex justify-between items-center">
          <button
            onClick={handleCheck}
            disabled={loading || !text}
            className={cn(
              "px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
              loading && "opacity-80"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Analyze Text"
            )}
          </button>

          <button
            onClick={() => {
              setText("");
              setResult(null);
            }}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "mt-6 p-4 rounded-xl border flex items-center gap-4",
              result.isSpam
                ? "bg-red-500/10 border-red-500/20 text-red-200"
                : "bg-green-500/10 border-green-500/20 text-green-200"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full",
                result.isSpam ? "bg-red-500/20" : "bg-green-500/20"
              )}
            >
              {result.isSpam ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-lg leading-tight">
                {result.isSpam
                  ? "Potential SPAM Detected"
                  : "Likely Legit Email (Ham)"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={cn(
                      "h-full",
                      result.isSpam ? "bg-red-500" : "bg-green-500"
                    )}
                  />
                </div>
                <span className="text-xs font-mono opacity-80">
                  {result.confidence.toFixed(1)}% Confidence
                </span>
              </div>
              {result.message && (
                <div className="text-xs text-gray-500 mt-1">
                  {result.message}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
