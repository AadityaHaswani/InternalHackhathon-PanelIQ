import { z } from 'zod';
import { validateEvidence } from '../evaluations/scoring.service.js';
import { AIFallbackEngine } from './fallback-engine.js';
import { databaseData } from '../sessions/session.service.js';

export const aiEvaluationProposalSchema = z.object({
  evaluations: z.array(
    z.object({
      criterionId: z.enum(['correctness', 'reasoning', 'relevance', 'tradeoffs']),
      rating: z.number().int().min(0).max(4),
      applicable: z.boolean().default(true),
      rationale: z.string().default(''),
      missingPoints: z.array(z.string()).default([]),
      evidence: z
        .object({
          start: z.number().int().min(0),
          end: z.number().int().min(0),
          excerpt: z.string(),
        })
        .nullable()
        .optional(),
      limitations: z.string().optional().default(''),
    })
  ).min(1),
});

/**
 * Evaluates a candidate's answer using AI with strict server-side evidence verification and fallback.
 *
 * @param {Object} client - Supabase client
 * @param {{
 *   sessionId: string,
 *   turnId: string,
 *   answerId: string,
 *   answerText: string,
 *   questionPrompt: string,
 *   expectedConcepts?: string[],
 *   rubricAnchors?: Object,
 *   rubricVersion?: number,
 * }} context
 * @param {AIFallbackEngine} [engine]
 * @returns {Promise<{
 *   success: boolean,
 *   evaluations: Array<Object>,
 *   provider: string,
 *   model: string,
 *   pending: boolean,
 *   error?: string
 * }>}
 */
export async function evaluateAnswerWithAI(client, context, engine = null) {
  const fallbackEngine = engine || new AIFallbackEngine();

  if (fallbackEngine.mode === 'bank_only') {
    return {
      success: false,
      evaluations: [],
      provider: 'bank_only',
      model: 'none',
      pending: true,
      error: 'AI evaluation skipped in bank_only mode',
    };
  }

  const { answerText, questionPrompt, expectedConcepts = [], rubricAnchors = {}, rubricVersion = 1 } = context;

  // Build prompt containing question, answer, and private evaluation context
  const systemPrompt = `You are a rigorous technical interview evaluator.
Evaluate the candidate's answer against the standard rubric:
1. correctness (weight 40%): technical accuracy, invariants, edge cases.
2. reasoning (weight 25%): logical explanation of cause and effect.
3. relevance (weight 20%): directly addresses the prompt asked.
4. tradeoffs (weight 15%): realistic pros/cons and production implications.

For each criterion, assign an integer rating from 0 to 4.
CRITICAL EVIDENCE RULES:
- If citing evidence from the candidate's answer, excerpt MUST BE AN EXACT SUBSTRING of the candidate's text.
- Character offsets 'start' and 'end' must accurately slice the exact excerpt from the text (i.e. answer.slice(start, end) === excerpt).
- If a concept is missing, state it in missingPoints and set evidence to null. NEVER fabricate a quote to prove absence.
- Output JSON format:
{
  "evaluations": [
    {
      "criterionId": "correctness",
      "rating": 3,
      "applicable": true,
      "rationale": "...",
      "missingPoints": ["..."],
      "evidence": { "start": 0, "end": 20, "excerpt": "exact quote" },
      "limitations": "..."
    }
  ]
}`;

  const userPrompt = `Question:
${questionPrompt}

Candidate Answer:
"${answerText}"

Expected Concepts:
${expectedConcepts.length > 0 ? expectedConcepts.map((c) => `- ${c}`).join('\n') : 'Standard engineering best practices.'}

Rubric Anchors:
${JSON.stringify(rubricAnchors, null, 2)}

Provide your evaluation JSON now.`;

  /**
   * Helper to validate that all evidence items in an AI proposal match the immutable answer.
   * @param {Array<Object>} proposedEvals
   * @returns {{ valid: boolean, error?: string }}
   */
  function validateProposalEvidence(proposedEvals) {
    for (const item of proposedEvals) {
      if (item.evidence) {
        const val = validateEvidence(item.evidence, answerText);
        if (!val.valid) {
          return { valid: false, error: `Invalid evidence for criterion '${item.criterionId}': ${val.error}` };
        }
      }
    }
    return { valid: true };
  }

  // 1. Try Primary Provider (Groq)
  let primaryProposal = null;
  let primaryError = null;

  if (fallbackEngine.primary) {
    try {
      const res = await fallbackEngine.primary.generateStructured(userPrompt, aiEvaluationProposalSchema, {
        timeoutMs: 25000,
        systemPrompt,
      });

      const evidenceCheck = validateProposalEvidence(res.data.evaluations);
      if (evidenceCheck.valid) {
        primaryProposal = {
          evaluations: res.data.evaluations,
          provider: res.provider,
          model: res.model,
        };
      } else {
        primaryError = new Error(`Primary evidence validation failed: ${evidenceCheck.error}`);
      }
    } catch (err) {
      primaryError = err;
    }
  }

  if (primaryProposal) {
    // Save valid proposal to database
    if (client) {
      await persistAIEvaluations(client, context, primaryProposal.evaluations, primaryProposal.provider, rubricVersion);
    }
    return {
      success: true,
      evaluations: primaryProposal.evaluations,
      provider: primaryProposal.provider,
      model: primaryProposal.model,
      pending: false,
    };
  }

  // 2. Try Secondary Provider (Gemini) fallback once
  if (fallbackEngine.secondary) {
    try {
      const res = await fallbackEngine.secondary.generateStructured(userPrompt, aiEvaluationProposalSchema, {
        timeoutMs: 25000,
        systemPrompt,
      });

      const evidenceCheck = validateProposalEvidence(res.data.evaluations);
      if (evidenceCheck.valid) {
        if (client) {
          await persistAIEvaluations(client, context, res.data.evaluations, res.provider, rubricVersion);
        }
        return {
          success: true,
          evaluations: res.data.evaluations,
          provider: res.provider,
          model: res.model,
          pending: false,
          fallbackUsed: true,
        };
      }
    } catch {
      // Both providers failed
    }
  }

  // 3. Both providers failed or produced invalid evidence:
  // Preserves answer and session; leaves evaluation pending for human review.
  return {
    success: false,
    evaluations: [],
    provider: 'none',
    model: 'none',
    pending: true,
    error: primaryError ? primaryError.message : 'Evaluation proposal failed validation or timed out',
  };
}

/**
 * Persists validated AI evaluation records to public.evaluations.
 * @private
 */
async function persistAIEvaluations(client, context, evaluations, provider, rubricVersion) {
  const records = evaluations.map((e) => ({
    session_id: context.sessionId,
    turn_id: context.turnId,
    answer_id: context.answerId,
    criterion_id: e.criterionId,
    rating: e.rating,
    applicable: e.applicable ?? true,
    rationale: e.rationale || '',
    missing_points: e.missingPoints || [],
    evidence_excerpt: e.evidence?.excerpt || null,
    evidence_start: e.evidence?.start ?? null,
    evidence_end: e.evidence?.end ?? null,
    evidence_source: 'ai',
    rubric_version: rubricVersion,
    report_revision: 1,
  }));

  const res = await client
    .from('evaluations')
    .upsert(records, { onConflict: 'answer_id,criterion_id,report_revision' })
    .select();

  return databaseData(res);
}
