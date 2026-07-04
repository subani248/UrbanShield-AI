const { GoogleGenerativeAI } = require('@google/generative-ai');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODELS = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];

async function tryGenerate(prompt, retries = 0) {
  if (retries >= MODELS.length) throw new Error('All AI models exhausted');
  const model = genAI.getGenerativeModel({ model: MODELS[retries] });
  try {
    const result = await model.generateContent(prompt);
    return await result.response.text();
  } catch (err) {
    if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('503')) {
      return tryGenerate(prompt, retries + 1);
    }
    throw err;
  }
}

exports.getAIPrediction = async (req, res, next) => {
  try {
    const [recentIncidents, activeAlerts, categoryStats] = await Promise.all([
      Incident.find({ status: { $ne: 'resolved' } }).sort('-createdAt').limit(20),
      Alert.find({ status: 'active' }).sort('-createdAt').limit(10),
      Incident.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const prompt = `You are an AI emergency response analyst for UrbanShield AI, a Smart City Emergency Response Platform. Analyze this data and provide predictions.

Current Incidents Data:
${JSON.stringify(recentIncidents, null, 2)}

Active Alerts:
${JSON.stringify(activeAlerts, null, 2)}

Category Distribution:
${JSON.stringify(categoryStats, null, 2)}

Provide a JSON response with exactly this structure:
{
  "prediction": "brief prediction about likely emergencies in next 24 hours",
  "riskLevel": "low|medium|high|critical",
  "recommendedResponse": "specific recommended response actions",
  "safetyTips": ["tip1", "tip2", "tip3"],
  "affectedAreas": ["area1", "area2"],
  "priorityAreas": ["priority1", "priority2"]
}

Respond ONLY with valid JSON, no other text.`;

    const text = await tryGenerate(prompt);
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      parsed = {
        prediction: 'Unable to generate prediction at this time.',
        riskLevel: 'medium',
        recommendedResponse: 'Standard monitoring procedures should be maintained.',
        safetyTips: ['Stay informed via official channels', 'Keep emergency contacts handy', 'Follow local authority instructions'],
        affectedAreas: ['City center', 'Surrounding suburbs'],
        priorityAreas: ['Review current incident data', 'Monitor high-risk zones'],
      };
    }

    res.status(200).json({ success: true, ...parsed });
  } catch (error) {
    next(new AppError(error.message.includes('quota') ? 'AI quota exceeded. Try again later.' : 'AI prediction service unavailable.', 503));
  }
};

exports.getAISummary = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return next(new AppError('Text is required.', 400));

    const prompt = `Summarize this emergency incident report concisely and extract key information:

"${text}"

Provide a JSON response:
{
  "summary": "2-3 sentence summary",
  "priority": "low|medium|high|critical",
  "keywords": ["keyword1", "keyword2"],
  "suggestedCategory": "fire|flood|earthquake|medical|crime|accident|hazard|infrastructure|other",
  "recommendedAction": "brief recommended action"
}

Respond ONLY with valid JSON.`;

    const responseText = await tryGenerate(prompt);
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      parsed = {
        summary: 'Unable to summarize at this time.',
        priority: 'medium',
        keywords: ['emergency'],
        suggestedCategory: 'other',
        recommendedAction: 'Review the report manually.',
      };
    }

    res.status(200).json({ success: true, ...parsed });
  } catch (error) {
    next(new AppError(error.message.includes('quota') ? 'AI quota exceeded. Try again later.' : 'AI summarization service unavailable.', 503));
  }
};
