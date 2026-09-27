import { databaseData } from '../sessions/session.service.js';

/**
 * Service for persistent constraint scenarios (Task 6 / D4-06)
 */

export async function getApprovedScenarios(client, { domain, level, role = 'backend_developer' }) {
  const query = client
    .from('scenario_versions')
    .select('id,scenario_id,version,domain,experience_level,stage,panel_role,role_slug,baseline_question_id,baseline_prompt,changed_constraint,follow_up,status')
    .eq('status', 'published')
    .eq('domain', domain)
    .eq('experience_level', level)
    .eq('role_slug', role);

  return databaseData(await query);
}

/**
 * Selects at most ONE approved constraint scenario for an interview session plan.
 * Matches candidate level, domain, target role, and matches one of the technical questions in the plan.
 *
 * @param {Array<Object>} scenarios - Available approved scenarios
 * @param {Array<Object>} planQuestions - Selected questions for the session
 * @param {Function} [pick] - Randomization function (defaults to 0 for determinism or randomInt)
 * @returns {Object|null} Selected scenario or null
 */
export function selectScenarioForPlan(scenarios, planQuestions, pick = () => 0) {
  if (!Array.isArray(scenarios) || scenarios.length === 0) return null;
  if (!Array.isArray(planQuestions) || planQuestions.length === 0) return null;

  // Find candidate scenarios that match a technical question in the plan
  const technicalQuestions = planQuestions.filter((q) => q.stage === 'technical');
  const technicalQuestionIds = new Set(technicalQuestions.map((q) => q.question_id || q.id));

  const eligibleScenarios = scenarios.filter((s) =>
    s.status === 'published' && technicalQuestionIds.has(s.baseline_question_id),
  );

  if (eligibleScenarios.length === 0) return null;

  const index = pick(eligibleScenarios.length);
  return eligibleScenarios[index] || eligibleScenarios[0];
}

/**
 * Constructs safe challenge turn representation for the client DTO.
 * Excludes expected reasoning points and rubric anchors.
 *
 * @param {Object} turnRow
 * @returns {Object}
 */
export function formatSafeTurnDto(turnRow) {
  const isChallenge = turnRow.turn_type === 'challenge' || turnRow.source === 'stored_followup';
  const base = {
    id: turnRow.id,
    position: turnRow.position,
    stage: turnRow.stage || turnRow.question_snapshot?.stage,
    panelRole: turnRow.panel_role || turnRow.question_snapshot?.panelRole,
    prompt: turnRow.prompt || turnRow.question_snapshot?.prompt,
    source: turnRow.source || 'question_bank',
    isChallenge,
    constraint: isChallenge && turnRow.constraint_snapshot ? {
      originalPrompt: turnRow.constraint_snapshot.originalPrompt,
      change: turnRow.constraint_snapshot.change,
    } : null,
  };

  if (!isChallenge && turnRow.question_snapshot) {
    base.questionId = turnRow.question_snapshot.questionId;
    base.questionVersion = turnRow.question_snapshot.questionVersion;
    base.topics = turnRow.question_snapshot.topics;
    base.difficulty = turnRow.question_snapshot.difficulty;
  }

  if (isChallenge) {
    base.baselineTurnId = turnRow.parent_turn_id;
  }

  return base;
}
