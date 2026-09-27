import { AIFallbackEngine } from './fallback-engine.js';

export const MAX_AI_FOLLOW_UPS_PER_SESSION = 2;

/**
 * Enhances a stored scenario or turn follow-up question using AI, bounded by session rules.
 *
 * @param {Object} client - Supabase client
 * @param {string} sessionId - Session UUID
 * @param {{
 *   baselinePrompt: string,
 *   storedFollowUp: string,
 *   candidateAnswer: string,
 *   changedConstraint?: string,
 * }} context
 * @param {AIFallbackEngine} [engine]
 * @returns {Promise<{ followUpText: string, source: 'ai' | 'bank', provider: string, model: string }>}
 */
export async function enhanceFollowUp(client, sessionId, context, engine = null) {
  const fallbackEngine = engine || new AIFallbackEngine();

  // 1. If in bank_only mode, immediately return stored follow-up
  if (fallbackEngine.mode === 'bank_only') {
    return {
      followUpText: context.storedFollowUp,
      source: 'bank',
      provider: 'bank_only',
      model: 'none',
    };
  }

  // 2. Check maximum 2 AI-enhanced follow-ups per session rule
  if (client && sessionId) {
    try {
      const turnsRes = await client
        .from('session_turns')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('source', 'ai');

      const aiTurnsCount = turnsRes.count || 0;
      if (aiTurnsCount >= MAX_AI_FOLLOW_UPS_PER_SESSION) {
        return {
          followUpText: context.storedFollowUp,
          source: 'bank',
          provider: 'bank_quota_reached',
          model: 'none',
        };
      }
    } catch {
      // If query fails, fail safe to bank follow-up
      return {
        followUpText: context.storedFollowUp,
        source: 'bank',
        provider: 'bank_safe_fallback',
        model: 'none',
      };
    }
  }

  // 3. Construct bounded contextual prompt
  const systemPrompt = `You are an expert technical interviewer.
Your task is to rephrase or contextualize an approved follow-up question based on the candidate's previous response.

STRICT CONSTRAINTS:
1. The stored follow-up is the absolute source of truth. You MUST preserve its core question and technical goal.
2. DO NOT alter the technical assumptions or business constraints.
3. DO NOT invent a different constraint or change the difficulty level.
4. DO NOT provide hints, answer keys, or solutions.
5. Return ONLY the enhanced follow-up question (1 to 3 sentences). No introductory or conversational filler.`;

  const userPrompt = `Baseline Question:
${context.baselinePrompt}

${context.changedConstraint ? `New Constraint:\n${context.changedConstraint}\n` : ''}
Approved Follow-Up Question:
${context.storedFollowUp}

Candidate's Answer:
"${context.candidateAnswer}"

Please rephrase or contextualize the approved follow-up question so it directly builds upon what the candidate said, while strictly preserving the approved question's intent and difficulty.`;

  // 4. Execute with 8-second timeout target
  const result = await fallbackEngine.executeText(userPrompt, {
    timeoutMs: 8000,
    systemPrompt,
  });

  if (result.success && result.text && result.text.length >= 10) {
    return {
      followUpText: result.text.trim(),
      source: 'ai',
      provider: result.provider,
      model: result.model,
    };
  }

  // 5. Fallback on failure or empty response: use approved stored follow-up
  return {
    followUpText: context.storedFollowUp,
    source: 'bank',
    provider: result.provider || 'bank_fallback',
    model: result.model || 'none',
  };
}
