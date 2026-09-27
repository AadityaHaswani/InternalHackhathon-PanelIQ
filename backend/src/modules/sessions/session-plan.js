import { randomInt } from 'node:crypto';

export const stages = ['icebreaker', 'technical', 'techno_managerial', 'reflection'];
export const topics = ['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs'];
export const levels = ['junior', 'intermediate'];
export const stagePlan = ['icebreaker', 'technical', 'technical', 'technical', 'technical', 'techno_managerial', 'techno_managerial', 'reflection'];

// Randomize ties, then prefer technical questions introducing an unseen topic.
export function selectPlan(questions, profile, roles, pick = randomInt) {
  if (!profile?.display_name || !profile.domain || !profile.experience_level || !profile.target_role) {
    throw Object.assign(new Error('Complete display name, domain, level and target role in your profile'), { status: 400, code: 'PROFILE_INCOMPLETE' });
  }
  const role = roles.find((item) => item.slug === profile.target_role && item.domain === profile.domain);
  if (!role || !levels.includes(profile.experience_level) || profile.domain !== 'computer_science') {
    throw Object.assign(new Error('Select a supported domain, level and role slug from the catalog'), { status: 400, code: 'PROFILE_UNSUPPORTED' });
  }
  const eligible = questions.filter((q) => q.status === 'published' && q.domain === profile.domain &&
    q.experience_level === profile.experience_level && q.role_slugs.includes(role.slug));
  const chosen = [];
  const usedTopics = new Set();
  for (const stage of stagePlan) {
    let pool = eligible.filter((q) => q.stage === stage && !chosen.some((item) => item.question_id === q.question_id));
    if (!pool.length) throw Object.assign(new Error('Not enough reviewed published questions for this profile'), { status: 409, code: 'BANK_INSUFFICIENT' });
    if (stage === 'technical') {
      const diverse = pool.filter((q) => q.topics.some((topic) => !usedTopics.has(topic)));
      if (diverse.length) pool = diverse;
    }
    const question = pool[pick(pool.length)];
    chosen.push(question);
    if (stage === 'technical') question.topics.forEach((topic) => usedTopics.add(topic));
  }
  return chosen.map((q) => q.id);
}
