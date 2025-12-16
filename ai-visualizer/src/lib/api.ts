export const API_URL = "http://localhost:8000";

export interface PredictionResult {
  is_spam: boolean;
  confidence: number;
  message: string;
  model_used: string;
}

export interface ChurnResult {
  is_churn: boolean;
  confidence: number;
  model_used: string;
}

export interface ChurnInput {
  Age: number;
  Gender: string;
  Location: string;
  Subscription_Length_Months: number;
  Monthly_Bill: number;
  Total_Usage_GB: number;
  model_type: string;
}

export interface StatsResult {
  total_processed: number;
  spam_count: number;
  uptime_seconds: number;
  top_words: { name: string; count: number }[];
  churn_predictions: number;
  churn_detected: number;
  retention_predicted: number;
}

export async function checkSpam(text: string, modelType: string = "svc"): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, model_type: modelType }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Spam check error:", error);
    // Fallback Mock for demo if API is down
    console.warn("Backend unavailable, using mock data");
    const isSpam = /winner|free|cash|urgent/i.test(text);
    return {
      is_spam: isSpam,
      confidence: 85 + Math.random() * 10,
      message: "Backend Offline (Mock Mode)",
      model_used: "mock"
    };
  }
}

export async function predictChurn(data: ChurnInput): Promise<ChurnResult> {
  try {
    const response = await fetch(`${API_URL}/predict-churn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Churn check error:", error);
    // Fallback Mock
    return {
      is_churn: Math.random() > 0.5,
      confidence: 70 + Math.random() * 20,
      model_used: "mock"
    };
  }
}

export async function getStats(): Promise<StatsResult | null> {
  try {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error("Stats request failed");
    return await response.json();
  } catch (error) {
    console.error("Stats error:", error);
    return null;
  }
}
