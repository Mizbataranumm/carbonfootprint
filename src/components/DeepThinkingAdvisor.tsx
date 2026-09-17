import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  X,
  Compass,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ActivityLog } from '../types';
import { BENCHMARKS } from '../data/emissionPresets';
import { calculateTotalEmissions, getCategorySummaries } from '../utils/calculations';

interface DeepThinkingAdvisorProps {
  activities: ActivityLog[];
  benchmarkKey: keyof typeof BENCHMARKS;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COMPLEX_QUERIES = [
  'Conduct a deep lifecycle diagnostic of my carbon footprint and identify my single highest-leverage reduction lever.',
  'Simulate: What has a greater annual carbon reduction—replacing my gas car with an EV, or switching to a plant-based diet?',
  'Calculate the carbon payback timeline and lifecycle balance of installing rooftop solar panels for my household.',
  'I want to reach the Paris 1.5°C goal (5.5 kg CO₂e/day). Give me a 3-tier prioritized roadmap tailored to my logs.',
  'Analyze the embodied carbon of my purchases and shipping compared to my direct energy and transport emissions.',
];

const THINKING_STEPS = [
  'Deconstructing Scope 1, 2, and 3 greenhouse gas emissions...',
  'Evaluating marginal grid carbon intensity and lifecycle factors...',
  'Assessing behavioral friction and potential rebound effects...',
  'Modeling multi-tier quantitative reduction trajectories...',
  'Synthesizing final high-impact decarbonization roadmap...',
];

export const DeepThinkingAdvisor: React.FC<DeepThinkingAdvisorProps> = ({
  activities,
  benchmarkKey,
  isOpen,
  onClose,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisMarkdown, setAnalysisMarkdown] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0);

  // Rotate thinking status messages while loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
      }, 3500);
    } else {
      setThinkingStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleRunAnalysis = async (queryToRun?: string) => {
    const finalQuery = queryToRun || userQuery;
    setIsLoading(true);
    setErrorMessage(null);

    const totalKg = calculateTotalEmissions(activities);
    const categoryBreakdown = getCategorySummaries(activities);

    try {
      const response = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: activities.slice(0, 30),
          summary: {
            totalKg,
            byCategory: categoryBreakdown,
          },
          userQuery: finalQuery || undefined,
          benchmarkRegion: BENCHMARKS[benchmarkKey].label,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to complete high-thinking analysis.');
      }

      setAnalysisMarkdown(json.analysis);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Unable to execute deep thinking analysis. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisMarkdown) return;
    navigator.clipboard.writeText(analysisMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-[#d8e2dc] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1b4332] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d6a4f] text-[#34d399] flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  High-Thinking Decarbonization Advisor
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2d6a4f] text-[#a7f3d0] border border-[#52b788]/40">
                  <Sparkles className="w-3 h-3 text-[#34d399]" />
                  gemini-3.1-pro-preview • HIGH
                </span>
              </div>
              <p className="text-xs text-[#b7e4c7]">
                Deep lifecycle assessment (LCA), marginal grid math &amp; rebound risk modeling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b7e4c7] hover:text-white hover:bg-[#2d6a4f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Query input and Preset Chips */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
              Select or ask a complex decarbonization scenario:
            </label>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COMPLEX_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserQuery(preset);
                    handleRunAnalysis(preset);
                  }}
                  disabled={isLoading}
                  className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#f0f4f1] text-[#2d4a3e] hover:bg-[#e2ece4] hover:text-[#1b4332] border border-[#dce6df] transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
                >
                  <Compass className="w-3 h-3 text-[#2d6a4f] shrink-0" />
                  <span>{preset}</span>
                </button>
              ))}
            </div>

            {/* Custom query input */}
            <div className="flex gap-2 mt-2">
              <input
                id="deep-advisor-query-input"
                type="text"
                placeholder="Ask any complex question (e.g. trade-offs, heat pumps, travel emissions, diet math)..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleRunAnalysis();
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#ccd7cf] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d6a4f]"
              />

              <button
                id="submit-deep-thinking-audit-btn"
                onClick={() => handleRunAnalysis()}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1b4332] text-white hover:bg-[#2d6a4f] disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                    <span>Run Thinking Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Thinking Progress Bar / Loading State */}
          {isLoading && (
            <div className="p-5 rounded-xl bg-[#f7faf8] border border-[#bbf7d0] space-y-3">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-[#2d6a4f] animate-pulse" />
                <span className="text-xs font-bold text-[#1b4332]">
                  High-Reasoning Thinking Mode in Progress
                </span>
              </div>
              <p className="text-xs text-[#2d6a4f] font-medium flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16a34a]" />
                <span>{THINKING_STEPS[thinkingStepIndex]}</span>
              </p>
              <div className="h-1.5 w-full bg-[#e2ece4] rounded-full overflow-hidden">
                <div className="h-full bg-[#2d6a4f] rounded-full animate-pulse w-3/4 transition-all duration-700" />
              </div>
              <p className="text-[11px] text-[#52796f]">
                Gemini 3.1 Pro is executing deep chains of thought to optimize lifecycle carbon reduction paths.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Rendered Results */}
          {analysisMarkdown && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#edf2ee] pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span className="text-xs font-bold text-[#1b4332]">
                    High-Reasoning Decarbonization Audit Results
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="copy-analysis-markdown-btn"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#52796f] hover:text-[#1b4332] bg-[#f4f7f5] hover:bg-[#e8efe9] rounded-md transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>

                  <button
                    id="re-evaluate-analysis-btn"
                    onClick={() => handleRunAnalysis()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#52796f] hover:text-[#1b4332] bg-[#f4f7f5] hover:bg-[#e8efe9] rounded-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-evaluate</span>
                  </button>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="p-5 rounded-xl bg-[#fcfdfc] border border-[#e5ebe7] text-xs leading-relaxed text-[#2d3748]">
                <div className="markdown-body prose prose-sm max-w-none prose-headings:text-[#1b4332] prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-[#1b4332] prose-code:bg-[#f1f5f2] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  <ReactMarkdown>{analysisMarkdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Initial Blank State (Before running) */}
          {!analysisMarkdown && !isLoading && !errorMessage && (
            <div className="p-8 rounded-xl bg-[#f7faf8] border border-dashed border-[#ccd7cf] text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#eef6f1] text-[#2d6a4f] flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#1b4332]">
                Ready to Analyze Your Real Carbon Data
              </h4>
              <p className="text-xs text-[#52796f] max-w-md mx-auto">
                Click one of the scenario queries above or enter your own custom question. Gemini 3.1 Pro with High Thinking will analyze your logged habits, benchmark against climate goals, and calculate high-leverage interventions.
              </p>
              <button
                onClick={() => handleRunAnalysis(PRESET_COMPLEX_QUERIES[0])}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#1b4332] text-white hover:bg-[#2d6a4f] shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                <span>Run Diagnostic on My {activities.length} Tracked Activities</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#f7faf8] border-t border-[#e2e8e3] flex items-center justify-between text-[11px] text-[#52796f]">
          <span>
            Powered by <strong>gemini-3.1-pro-preview</strong> with high-reasoning thinking configuration
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 font-semibold text-[#1b4332] hover:bg-[#e2ece4] rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
