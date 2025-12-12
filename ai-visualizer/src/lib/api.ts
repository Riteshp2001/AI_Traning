export const API_URL = "http://localhost:8000";

export interface PredictionResult {
  is_spam: boolean;
  confidence: number;
  message: string;
}

export interface StatsResult {
  total_processed: number;
  spam_count: number;
  uptime_seconds: number;
  top_words: { name: string; count: number }[];
}

export async function checkSpam(text: string): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
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
