import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI initialization
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. High-Thinking Deep Carbon Audit & Strategic Roadmap
// CRITICAL: Must use `gemini-3.1-pro-preview` with `thinkingLevel: ThinkingLevel.HIGH` and NO `maxOutputTokens`.
app.post('/api/deep-analysis', async (req, res) => {
  try {
    const { activities, summary, userQuery, benchmarkRegion } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are a world-class Environmental Lifecycle Assessment (LCA) Scientist and Personal Decarbonization Strategist.
Your mission is to perform a rigorous, high-depth carbon footprint audit and generate a high-impact, scientifically sound decarbonization roadmap for the user.

Key analytical principles:
1. Lifecycle thinking (Scope 1 direct emissions, Scope 2 electricity generation emissions, Scope 3 supply chain & embodied carbon).
2. Avoid generic platitudes ("turn off lights", "recycle plastic"). Focus on high-leverage interventions (dietary shifts from ruminants, heating electrification, vehicle miles traveled, flight mitigation, structural efficiency).
3. Identify potential "rebound effects" (e.g. saving $200 on fuel and spending it on high-carbon air travel or luxury consumer goods).
4. Provide quantified annual carbon savings (kg CO2e / year) with realistic behavioral friction assessments.
5. If the user provided a specific query, scenario, or question, dedicate focused reasoning to address it with thorough quantitative trade-offs.

Structure your final response clearly using clean Markdown with distinct sections:
- **Executive Diagnostic**: Crisp assessment of their current carbon velocity compared to the Paris 1.5°C benchmark (approx 2,000 kg CO2e/year ≈ 5.5 kg/day).
- **Emissions Hotspot Breakdown**: The mathematical drivers behind their largest impacts.
- **High-Leverage Strategic Roadmap**: Prioritized into 3 tiers:
   - *Tier 1: Quick Wins (0-30 days)* - High impact, low capital outlay.
   - *Tier 2: Behavioral / Lifestyle Optimizations (1-6 months)* - Medium friction, systemic reductions.
   - *Tier 3: Structural Capital Shifts (6-24 months)* - Heat pumps, EV, solar, insulation.
- **Specific Query & Scenario Resolution**: Direct, deep-reasoned answer to their specific query (if provided).
- **Behavioral Rebound Warning**: One subtle rebound trap to watch for.`;

    const userPrompt = `
Current User Carbon Tracking Data:
- Daily Benchmark Selected: ${benchmarkRegion || 'Paris 1.5°C Target (5.5 kg/day)'}
- Total Logged Emission (Recent Window): ${summary?.totalKg?.toFixed(2) || '0'} kg CO2e
- Breakdown by Category:
  ${summary?.byCategory ? JSON.stringify(summary.byCategory, null, 2) : 'No category data'}
- Recent Activities Logged (${activities?.length || 0} items):
  ${JSON.stringify((activities || []).slice(0, 20), null, 2)}

User Custom Query / Focus:
"${userQuery || 'Please conduct a comprehensive diagnostic of my carbon footprint, identify my single biggest leverage point for reduction, and build me an optimal step-by-step decarbonization plan.'}"
`;

    // MUST use gemini-3.1-pro-preview with thinkingLevel: ThinkingLevel.HIGH
    // Do NOT set maxOutputTokens
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const markdownAnalysis = response.text || 'Unable to generate deep thinking analysis.';

    res.json({
      success: true,
      analysis: markdownAnalysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Deep analysis error:', error);
    res.status(500).json({
      error: error.message || 'Failed to execute deep reasoning carbon analysis.',
    });
  }
});

// 3. AI Custom Activity Carbon Estimator
app.post('/api/estimate-activity', async (req, res) => {
  try {
    const { activityDescription } = req.body;
    if (!activityDescription || typeof activityDescription !== 'string') {
      res.status(400).json({ error: 'Activity description is required.' });
      return;
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Estimate the greenhouse gas emissions (in kg CO2e) for the following human activity or purchase:
"${activityDescription}"

Provide an accurate, evidence-based estimate referencing EPA/IPCC/DEFRA emission factors.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activityName: {
              type: Type.STRING,
              description: 'A concise clean title for this activity (max 6 words)',
            },
            category: {
              type: Type.STRING,
              description: 'One of: transport, energy, food, consumption',
            },
            co2Kg: {
              type: Type.NUMBER,
              description: 'Estimated carbon footprint in kilograms of CO2 equivalent (kg CO2e)',
            },
            confidence: {
              type: Type.STRING,
              description: 'Low, Medium, or High depending on specificity of the input',
            },
            rationale: {
              type: Type.STRING,
              description: '1-2 sentence explanation of the emission factor math or lifecycle factors used',
            },
            cleanerAlternative: {
              type: Type.STRING,
              description: '1 actionable alternative that reduces or eliminates these emissions',
            },
          },
          required: ['activityName', 'category', 'co2Kg', 'rationale', 'cleanerAlternative'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    // Validate category
    const validCategories = ['transport', 'energy', 'food', 'consumption'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'consumption';
    }

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Estimate activity error:', error);
    res.status(500).json({
      error: error.message || 'Failed to estimate activity carbon footprint.',
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Carbon Footprint Tracker server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
