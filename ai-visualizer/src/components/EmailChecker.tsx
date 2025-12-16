"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkSpam } from "@/lib/api";

const PRE_TYPED_EMAILS = [
  {
    label: "Spam: Lottery",
    text: "CONGRATULATIONS! You have won $1,000,000 in the detector lottery. Call now to claim your prize! This is not a drill.",
    type: "spam",
  },
  {
    label: "Spam: Urgent",
    text: "URGENT: Your account has been compromised. Click this link immediately to reset your password or your account will be deleted.",
    type: "spam",
    warning: true,
  },
  {
    label: "Ham: Meeting",
    text: "Hi team, just a reminder about our meeting tomorrow at 10 AM. Please review the attached documents before we start.",
    type: "ham",
  },
  {
    label: "Ham: Hello",
    text: "Hey, how are you doing? It's been a while since we last caught up. Let's grab coffee soon.",
    type: "ham",
    warning: true,
  },
  {
    label: "Spam: Promo",
    text: "Exclusive Offer: Buy one get one free for a limited time only! Click here to shop now.",
    type: "spam",
  },
  {
    label: "Ham: Project",
    text: "Project Update: the deployment was successful. All systems are green. Thanks for your hard work.",
    type: "ham",
  },
];

export function EmailChecker() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [selectedModel, setSelectedModel] = useState("svc");
  const [result, setResult] = useState<{
    isSpam: boolean;
    confidence: number;
    message?: string;
    model_used?: string;
    rawData?: any;
  } | null>(null);

  const handleCheck = async () => {
    if (!text) return;
    setLoading(true);
    setResult(null);
    setShowJson(false);

    console.log(
      "%c 📨 Analyzing Email Content ",
      "background: #3b82f6; color: white; padding: 4px; border-radius: 4px; font-weight: bold;"
    );
    console.log("Input Text:", text);
    console.log("Selected Model:", selectedModel);

    const apiResult = await checkSpam(text, selectedModel);

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
      model_used: apiResult.model_used,
      rawData: apiResult,
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

        <div className="flex flex-wrap gap-2">
          {PRE_TYPED_EMAILS.map((email) => (
            <button
              key={email.label}
              onClick={() => setText(email.text)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5",
                // @ts-ignore
                email.warning
                  ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                  : email.type === "spam"
                  ? "border-red-500/20 text-red-500/70 hover:bg-red-500/10 hover:border-red-500/40"
                  : "border-green-500/20 text-green-500/70 hover:bg-green-500/10 hover:border-green-500/40"
              )}
            >
              {/* @ts-ignore */}
              {email.warning && <AlertTriangle className="w-3 h-3" />}
              {email.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-3 rounded-xl gap-3">
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-400 whitespace-nowrap">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer appearance-none hover:bg-black/60 transition-colors"
                  style={{ backgroundImage: 'none' }} // Remove default arrow in some browsers if we want custom, but standard is fine
                >
                  <option value="svc">Support Vector Machine (SVC)</option>
                  <option value="nb">Naive Bayes (NB)</option>
                  <option value="rf">Random Forest (RF)</option>
                </select>
             </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
                 <button
                    onClick={() => {
                      setText("");
                      setResult(null);
                    }}
                    className="flex-1 sm:flex-none text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                  >
                    Clear
                  </button>
                  
                  <button
                    onClick={handleCheck}
                    disabled={loading || !text}
                    className={cn(
                      "flex-1 sm:flex-none px-6 py-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                      loading && "opacity-80"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Analyze"
                    )}
                  </button>
            </div>
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

              {/* Raw Data Collapsible */}
              <div className="mt-3 border-t border-white/10 pt-2">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="flex items-center gap-1 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity"
                >
                  {showJson ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  View API Response
                </button>

                <AnimatePresence>
                  {showJson && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="mt-2 p-2 rounded bg-black/30 text-[10px] font-mono whitespace-pre-wrap break-all text-white/70 overflow-x-auto max-h-40 overflow-y-auto custom-scrollbar">
                        {JSON.stringify(result.rawData, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
