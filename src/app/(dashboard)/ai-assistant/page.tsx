"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { AIAnalysis } from "@/types";

export default function AiAssistantPage() {
  const { register, handleSubmit, reset } = useForm();
  const [latestAnalysis, setLatestAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AIAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/ai/history");
        setAnalysisHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch analysis history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setLatestAnalysis(null);
    try {
      const payload = {
        type: "symptom",
        inputData: {
          symptoms: data.symptoms.split(",").map((s: string) => s.trim()),
        },
      };
      const response = await api.post("/ai/analyze", payload);
      setLatestAnalysis(response.data);
      setAnalysisHistory((prev) => [response.data, ...prev]);
      reset();
    } catch (error) {
      console.error("Failed to get AI analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    const base = "inline-block px-3 py-1 text-xs font-semibold rounded-full";
    switch (level) {
      case "high":
        return `${base} bg-red-100 text-red-700`;
      case "medium":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "low":
        return `${base} bg-green-100 text-green-700`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            🤖 AI Health Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your symptoms and let our AI provide insights on potential
            conditions and recommend next steps.
          </p>
        </header>

        {/* Symptom Form Card */}
        <section className="bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg rounded-2xl p-6 md:p-8 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            📝 Check Your Symptoms
          </h2>
          <p className="text-gray-600 mb-5">
            Describe your symptoms below, separated by commas (e.g.,{" "}
            <i>headache, fever, sore throat</i>).
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <textarea
              {...register("symptoms", { required: true })}
              rows={4}
              placeholder="e.g., headache, fever, nausea"
              className="w-full p-4 border text-gray-500 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                  Analyzing...
                </>
              ) : (
                "Run AI Analysis"
              )}
            </button>
          </form>
        </section>

        {/* Analysis Result Card */}
        {latestAnalysis && (
          <section className="bg-white/95 border-l-4 border-blue-500 shadow-md rounded-2xl p-6 md:p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              ✅ AI Analysis Result
            </h2>
            <div className="space-y-4 text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Risk Level</p>
                  <p
                    className={getRiskBadge(latestAnalysis.analysis.riskLevel)}
                  >
                    {latestAnalysis.analysis.riskLevel}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Urgency</p>
                  <p className={getRiskBadge(latestAnalysis.analysis.urgency)}>
                    {latestAnalysis.analysis.urgency}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-600">Suggested Specialty</p>
                <p>{latestAnalysis.analysis.suggestedSpecialty}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Recommendations</p>
                <ul className="list-disc list-inside mt-2 text-gray-700 ml-2 space-y-1">
                  {latestAnalysis.analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* History Section */}
        <section className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            📚 Analysis History
          </h2>

          {historyLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : analysisHistory.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-4">
                {analysisHistory.map((item) => (
                  <li
                    key={item._id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow transition"
                  >
                    <p className="text-sm text-gray-500">
                      <strong>Date:</strong>{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-gray-900 ">
                        Title:  <span className="text-gray-700 italic  mb-2">
                        {item.inputData.symptoms.join(", ")}
                      </span>
                      </p>
                     
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <p>
                        <strong>Risk Level:</strong>{" "}
                        <span className={getRiskBadge(item.analysis.riskLevel)}>
                          {item.analysis.riskLevel}
                        </span>
                      </p>
                      <p>
                        <strong>Urgency:</strong>{" "}
                        <span className={getRiskBadge(item.analysis.urgency)}>
                          {item.analysis.urgency}
                        </span>
                      </p>
                      <p>
                        <strong>Specialty:</strong>{" "}
                        {item.analysis.suggestedSpecialty}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">
              No previous analyses found.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
