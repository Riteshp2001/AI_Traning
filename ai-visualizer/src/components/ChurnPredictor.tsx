"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp, User, MapPin, CreditCard, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { predictChurn, ChurnInput } from "@/lib/api";

const LOCATIONS = ["Los Angeles", "New York", "Miami", "Chicago", "Houston"];
const GENDERS = ["Male", "Female"];

const PREO_FILLED_PROFILES = [
  {
    label: "Loyal Customer",
    data: {
      Age: 45,
      Gender: "Female",
      Location: "New York",
      Subscription_Length_Months: 24,
      Monthly_Bill: 85.50,
      Total_Usage_GB: 450,
      model_type: "rf",
    },
    risk: "low"
  },
  {
    label: "New High Spender",
    data: {
      Age: 22,
      Gender: "Male",
      Location: "Miami",
      Subscription_Length_Months: 2,
      Monthly_Bill: 120.00,
      Total_Usage_GB: 50,
      model_type: "rf",
    },
    risk: "high"
  },
  {
    label: "Average User",
    data: {
      Age: 35,
      Gender: "Male",
      Location: "Chicago",
      Subscription_Length_Months: 12,
      Monthly_Bill: 60.00,
      Total_Usage_GB: 200,
      model_type: "rf",
    },
    risk: "medium"
  },
   {
    label: "At Risk (Low Usage)",
    data: {
      Age: 55,
      Gender: "Female",
      Location: "Houston",
      Subscription_Length_Months: 6,
      Monthly_Bill: 40.00,
      Total_Usage_GB: 20,
      model_type: "lr",
    },
    risk: "high"
  }
];

export function ChurnPredictor() {
  const [formData, setFormData] = useState<ChurnInput>({
    Age: 30,
    Gender: "Male",
    Location: "New York",
    Subscription_Length_Months: 12,
    Monthly_Bill: 50.0,
    Total_Usage_GB: 100,
    model_type: "rf",
  });

  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [result, setResult] = useState<{
    isChurn: boolean;
    confidence: number;
    model_used: string;
    rawData?: any;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "Age" || name === "Subscription_Length_Months" || name === "Total_Usage_GB" 
        ? parseInt(value) || 0 
        : name === "Monthly_Bill" 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const loadProfile = (profile: typeof PREO_FILLED_PROFILES[0]) => {
      setFormData(prev => ({...prev, ...profile.data}));
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    setShowJson(false);

    const apiResult = await predictChurn(formData);

    setResult({
        isChurn: apiResult.is_churn,
        confidence: apiResult.confidence,
        model_used: apiResult.model_used,
        rawData: apiResult
    });
    setLoading(false);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden space-y-8 bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-semibold flex items-center gap-3 text-slate-100">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                <Users className="w-5 h-5 text-indigo-400" />
            </div>
            Customer Retention AI
        </h3>
        <span className="text-xs font-medium text-slate-500 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
            v1.0.0
        </span>
      </div>

      {/* Quick Fill Chips */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wider">Test Scenarios</label>
        <div className="flex flex-wrap gap-2">
            {PREO_FILLED_PROFILES.map((profile) => (
                <button
                    key={profile.label}
                    onClick={() => loadProfile(profile)}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium border transition-all hover:translate-y-[-1px] active:translate-y-[1px]",
                        profile.risk === "high" 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20" 
                            : profile.risk === "low" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50"
                    )}
                >
                    {profile.label}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2">
                <User className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold">Customer Profile</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Age</label>
                    <input
                        type="number"
                        name="Age"
                        value={formData.Age}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950/30 border border-slate-700/50 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Gender</label>
                    <div className="relative">
                        <select
                            name="Gender"
                            value={formData.Gender}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/30 border border-slate-700/50 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all appearance-none cursor-pointer"
                        >
                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Location</label>
                <div className="relative group">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <select
                        name="Location"
                        value={formData.Location}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950/30 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all appearance-none cursor-pointer"
                    >
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                     <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>
        </div>

        <div className="space-y-6">
             <div className="flex items-center gap-2 text-slate-300 border-b border-white/5 pb-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold">Usage Metrics</h4>
            </div>

             <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Subscription Duration (Months)</label>
                <input
                    type="number"
                    name="Subscription_Length_Months"
                    value={formData.Subscription_Length_Months}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950/30 border border-slate-700/50 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Monthly Bill ($)</label>
                    <div className="relative group">
                        <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="number"
                            name="Monthly_Bill"
                            value={formData.Monthly_Bill}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/30 border border-slate-700/50 rounded-lg pl-10 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Data Usage (GB)</label>
                    <div className="relative group">
                        <BarChart3 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="number"
                            name="Total_Usage_GB"
                            value={formData.Total_Usage_GB}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/30 border border-slate-700/50 rounded-lg pl-10 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-xl flex flex-col items-center gap-6 border border-slate-800/50 mt-4">
         <div className="w-full max-w-md space-y-2">
            <label className="text-xs text-slate-400 font-medium text-center block">Prediction Model</label>
            <div className="relative">
                <select
                    name="model_type"
                    value={formData.model_type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none text-center font-medium"
                >
                    <option value="rf">Random Forest Classifier (Recommended)</option>
                    <option value="lr">Logistic Regression (Baseline)</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
         </div>

         <button
            onClick={handlePredict}
            disabled={loading}
            className={cn(
              "w-full max-w-md py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm",
              loading && "opacity-80"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
              Generate Prediction <ChevronDown className="w-4 h-4 rotate-270" />
              </>
            )}
          </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "p-6 rounded-2xl border flex flex-col gap-4 shadow-xl backdrop-blur-sm mt-2 relative overflow-hidden",
              result.isChurn
                ? "bg-rose-950/20 border-rose-500/20"
                : "bg-emerald-950/20 border-emerald-500/20"
            )}>
                {/* Background Glow */}
                <div className={cn("absolute inset-0 opacity-10 blur-3xl", result.isChurn ? "bg-rose-500" : "bg-emerald-500")} />

                <div className="flex items-start gap-5 relative z-10">
                    <div
                    className={cn(
                        "p-3 rounded-xl shrink-0 border",
                        result.isChurn ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}
                    >
                    {result.isChurn ? (
                        <AlertTriangle className="w-6 h-6" />
                    ) : (
                        <CheckCircle className="w-6 h-6" />
                    )}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <div>
                                <h4 className={cn("font-bold text-xl leading-tight", result.isChurn ? "text-rose-100" : "text-emerald-100")}>
                                    {result.isChurn
                                    ? "High Risk of Churn"
                                    : "Customer Likely to Retain"}
                                </h4>
                                 <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                    Based on {result.model_used === 'rf' ? 'Random Forest' : 'Logistic Regression'} analysis
                                 </p>
                             </div>
                             <div className="text-right">
                                <span className={cn("text-3xl font-bold tracking-tight", result.isChurn ? "text-rose-400" : "text-emerald-400")}>
                                    {result.confidence.toFixed(1)}%
                                </span>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Confidence Score</div>
                             </div>
                        </div>
                   
                        <div className="h-2.5 w-full bg-slate-900/50 rounded-full overflow-hidden mt-5 border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence}%` }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                                className={cn(
                                "h-full rounded-full shadow-lg",
                                result.isChurn ? "bg-rose-500 shadow-rose-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Raw Data Collapsible */}
                <div className="mt-4 border-t border-dashed border-slate-700/50 pt-4 relative z-10">
                    <button
                        onClick={() => setShowJson(!showJson)}
                        className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors w-full group select-none"
                    >
                        {showJson ? (
                        <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                        ) : (
                        <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                        )}
                        View JSON Response
                    </button>

                    <AnimatePresence>
                        {showJson && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3">
                                <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto custom-scrollbar shadow-inner ring-1 ring-inset ring-white/5">
                                {JSON.stringify(result.rawData, null, 2)}
                                </pre>
                            </div>
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
