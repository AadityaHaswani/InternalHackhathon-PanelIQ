import { BaseAIProvider, AIProviderError } from './base.provider.js';

export class MockProvider extends BaseAIProvider {
  /**
   * @param {{
   *   name?: string,
   *   shouldFail?: boolean,
   *   failCode?: string,
   *   failStatus?: number,
   *   retryAfter?: number,
   *   invalidJson?: boolean,
   *   invalidSchema?: boolean,
   *   invalidEvidence?: boolean,
   *   mockEvaluations?: Array<Object>,
   *   mockFollowUp?: string,
   * }} config
   */
  constructor(config = {}) {
    super(config.name || 'mock');
    this.model = 'mock-model-v1';
    this.config = config;
  }

  async generateText(prompt, _options = {}) {
    if (this.config.shouldFail) {
      throw new AIProviderError(`Mock provider ${this.name} simulated failure`, {
        provider: this.name,
        code: this.config.failCode || 'SIMULATED_FAILURE',
        status: this.config.failStatus || 500,
        retryAfter: this.config.retryAfter || null,
        retryable: true,
      });
    }

    if (this.config.mockFollowUp) {
      return {
        text: this.config.mockFollowUp,
        provider: this.name,
        model: this.model,
      };
    }

    return {
      text: `Mock enhanced follow-up based on: ${prompt.slice(0, 40)}...`,
      provider: this.name,
      model: this.model,
    };
  }

  async generateStructured(prompt, schema = null, _options = {}) {
    if (this.config.shouldFail) {
      throw new AIProviderError(`Mock provider ${this.name} simulated failure`, {
        provider: this.name,
        code: this.config.failCode || 'SIMULATED_FAILURE',
        status: this.config.failStatus || 500,
        retryAfter: this.config.retryAfter || null,
        retryable: true,
      });
    }

    if (this.config.invalidJson) {
      throw new AIProviderError('Mock provider returned invalid JSON', {
        provider: this.name,
        code: 'INVALID_OUTPUT',
        retryable: true,
      });
    }

    if (this.config.invalidSchema) {
      const badData = { malformed: true };
      if (schema && schema.safeParse && !schema.safeParse(badData).success) {
        throw new AIProviderError('Mock output failed schema validation', {
          provider: this.name,
          code: 'SCHEMA_VALIDATION_ERROR',
          retryable: true,
        });
      }
      return {
        data: badData,
        rawText: JSON.stringify(badData),
        provider: this.name,
        model: this.model,
      };
    }

    if (this.config.mockEvaluations) {
      const data = { evaluations: this.config.mockEvaluations };
      return {
        data,
        rawText: JSON.stringify(data),
        provider: this.name,
        model: this.model,
      };
    }

    // Default mock evaluation payload
    const defaultData = {
      evaluations: [
        {
          criterionId: 'correctness',
          rating: 3,
          applicable: true,
          rationale: 'Demonstrated solid grasp of key principles.',
          missingPoints: [],
          evidence: this.config.invalidEvidence
            ? { start: 999, end: 1005, excerpt: 'nonexistent' }
            : null,
          limitations: '',
        },
        {
          criterionId: 'reasoning',
          rating: 3,
          applicable: true,
          rationale: 'Sound logic and trade-off analysis.',
          missingPoints: [],
          evidence: null,
          limitations: '',
        },
        {
          criterionId: 'relevance',
          rating: 4,
          applicable: true,
          rationale: 'Directly addressed the question asked.',
          missingPoints: [],
          evidence: null,
          limitations: '',
        },
        {
          criterionId: 'tradeoffs',
          rating: 3,
          applicable: true,
          rationale: 'Identified practical engineering trade-offs.',
          missingPoints: [],
          evidence: null,
          limitations: '',
        },
      ],
    };

    return {
      data: defaultData,
      rawText: JSON.stringify(defaultData),
      provider: this.name,
      model: this.model,
    };
  }
}
