/**
 * Base AI Provider interface and standardized error class.
 */
export class AIProviderError extends Error {
  constructor(message, { provider, code = 'PROVIDER_ERROR', status = null, retryAfter = null, retryable = true } = {}) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
    this.retryable = retryable;
  }
}

export class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Generates text response.
   * @param {string} prompt
   * @param {Object} options
   * @returns {Promise<{ text: string, provider: string, model: string }>}
   */
  async generateText(_prompt, _options = {}) {
    throw new Error('generateText must be implemented by subclass');
  }

  /**
   * Generates structured JSON response conforming to a schema.
   * @param {string} prompt
   * @param {Object} schema - Zod schema or JSON schema
   * @param {Object} options
   * @returns {Promise<{ data: Object, rawText: string, provider: string, model: string }>}
   */
  async generateStructured(_prompt, _schema, _options = {}) {
    throw new Error('generateStructured must be implemented by subclass');
  }
}
