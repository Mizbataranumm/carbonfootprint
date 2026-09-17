import React from 'react';
import {
  Brain,
  Cpu,
  Sparkles,
  Database,
  Layers,
  CheckCircle2,
  X,
  Bot,
  Eye,
  Workflow,
  ShieldCheck,
} from 'lucide-react';

interface TechArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechArchitectureModal: React.FC<TechArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-[#d8e2dc] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b4332] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d6a4f] text-[#34d399] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Applied Technologies: AI, ML, NLP &amp; LLM</h3>
              <p className="text-xs text-[#b7e4c7]">
                Technical breakdown of models, algorithms, and lifecycle engines powering this application
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#2d3748]">
          {/* Grid of Tech pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1: LLM */}
            <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-2">
              <div className="flex items-center gap-2 text-[#15803d]">
                <Bot className="w-4 h-4" />
                <h4 className="font-bold text-sm text-[#166534]">
                  1. LLMs (Large Language Models)
                </h4>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#14532d] leading-relaxed">
                <li>
                  • <strong>gemini-3.1-pro-preview with Extended Thinking (ThinkingLevel.HIGH)</strong>:
                  Executes deep multi-chain-of-thought audits, modeling complex trade-offs (e.g. EV transition vs heat pumps, grid marginal emissions, and rebound risks).
                </li>
                <li>
                  • <strong>gemini-3.8-flash</strong>: Low-latency, structured generation enforcing strict JSON schemas for real-time food and transport factor decomposition.
                </li>
              </ul>
            </div>

            {/* Pillar 2: NLP */}
            <div className="p-4 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] space-y-2">
              <div className="flex items-center gap-2 text-[#1d4ed8]">
                <Workflow className="w-4 h-4" />
                <h4 className="font-bold text-sm text-[#1e40af]">
                  2. NLP (Natural Language Processing)
                </h4>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#1e3a8a] leading-relaxed">
                <li>
                  • <strong>Semantic Entity Parsing</strong>: Interprets unstructured meal descriptions (e.g., &quot;mostly vegetarian with red meat on weekends&quot;) and extracts dietary components.
                </li>
                <li>
                  • <strong>Zero-Shot Categorization</strong>: Classifies freeform actions into Scope 1 (direct combustion), Scope 2 (grid electricity), and Scope 3 (supply chain logistics).
                </li>
              </ul>
            </div>

            {/* Pillar 3: ML & LCA Mechanistic Modeling */}
            <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-2">
              <div className="flex items-center gap-2 text-[#7e22ce]">
                <Database className="w-4 h-4" />
                <h4 className="font-bold text-sm text-[#6b21a8]">
                  3. ML &amp; Lifecycle Assessment (LCA)
                </h4>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#581c87] leading-relaxed">
                <li>
                  • <strong>Agricultural Meta-Analysis</strong>: Embeds coefficients from Poore &amp; Nemecek (Science 2018) for enteric methane (CH₄) and nitrous oxide (N₂O).
                </li>
                <li>
                  • <strong>DEFRA / EPA Standard Conversion Engines</strong>: Rigorous multi-parameter math calculating fuel combustion, occupancy factors, and high-altitude radiative forcing (RFI).
                </li>
              </ul>
            </div>

            {/* Pillar 4: Computer Vision (CV) & Deep Learning Context */}
            <div className="p-4 rounded-xl bg-[#fffbeb] border border-[#fde68a] space-y-2">
              <div className="flex items-center gap-2 text-[#b45309]">
                <Eye className="w-4 h-4" />
                <h4 className="font-bold text-sm text-[#92400e]">
                  4. Computer Vision (CV) Context
                </h4>
              </div>
              <p className="text-[11px] text-[#78350f] leading-relaxed">
                • <strong>Current Scope</strong>: The app focuses on text NLP and scientific accounting.
                Computer Vision is not required for numerical calculation, but the Gemini API architecture is multimodal-ready to ingest meal photos, receipts, or utility bill images via Vision OCR.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#f8faf9] rounded-xl border border-[#e2e8e3] text-[11px] text-[#52796f]">
            <strong>Full-Stack Architecture:</strong> Client-side React 19 + Tailwind CSS + Recharts visualizer, combined with an Express backend running server-side Gemini SDK API proxies to protect secrets and ensure robust execution.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f7faf8] border-t border-[#e2e8e3] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#1b4332] text-white hover:bg-[#2d6a4f] transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
