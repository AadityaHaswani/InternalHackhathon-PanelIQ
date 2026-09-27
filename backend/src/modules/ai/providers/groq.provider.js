import { BaseAIProvider, AIProviderError } from './base.provider.js';

export class GroqProvider extends BaseAIProvider {
  /**
   * @param {{ apiKey?: string, model?: string }} config
   */
  constructor(config = {}) {
    super('groq');
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY || '';
    this.model = config.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  }

  /**
   * Helper to execute chat completion with timeout and error handling.
   * @private
   */
  async _postCompletion(messages, { timeoutMs = 8000, jsonMode = false, model = this.model } = {}) {
    if (!this.apiKey) {
      throw new AIProviderError('Groq API key is not configured', {
        provider: this.name,
        code: 'MISSING_API_KEY',
        status: 401,
        retryable: false,
      });
    }

    const payload = {
      model,
      messages,
      temperature: 0.2,
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    let response;
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      throw new AIProviderError(
        isTimeout ? `Groq request timed out after ${timeoutMs}ms` : `Groq network error: ${err.message}`,
        {
          provider: this.name,
          code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          retryable: true,
        }
      );
    }

    if (!response.ok) {
      let errorBody = {};
      try {
        errorBody = await response.json();
      } catch {
        // ignore non-json error body
      }

      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
      const status = response.status;
      const errorMsg = errorBody.error?.message || response.statusText;

      // Check if model not found on Groq and we can try a standard fallback model
      if (status === 404 || (status === 400 && errorMsg.includes('does not exist'))) {
        if (model !== 'openai/gpt-oss-120b' && model !== 'qwen/qwen3.8-27b') {
          return this._postCompletion(messages, { timeoutMs, jsonMode, model: 'openai/gpt-oss-120b' });
        }
      }

      let code = 'PROVIDER_ERROR';
      if (status === 429) code = 'RATE_LIMITED';
      else if (status >= 500) code = 'SERVER_ERROR';
      else if (status === 401 || status === 403) code = 'AUTH_ERROR';

      throw new AIProviderError(`Groq API error (${status}): ${errorMsg}`, {
        provider: this.name,
        code,
        status,
        retryAfter,
        retryable: status === 429 || status >= 500,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const actualModel = data.model || model;

    return { content, model: actualModel };
  }

  async generateText(prompt, options = {}) {
    const messages = [
      { role: 'system', content: options.systemPrompt || 'You are an expert technical interviewer assistant.' },
      { role: 'user', content: prompt },
    ];

    const result = await this._postCompletion(messages, {
      timeoutMs: options.timeoutMs || 8000,
      jsonMode: false,
    });

    return {
      text: result.content.trim(),
      provider: this.name,
      model: result.model,
    };
  }

  async generateStructured(prompt, schema = null, options = {}) {
    const systemPrompt = options.systemPrompt
      ? `${options.systemPrompt}\nIMPORTANT: You must respond ONLY with a valid JSON object matching the requested schema. No surrounding markdown fences or conversation.`
      : 'You are an expert technical interviewer assistant. Respond ONLY with a valid JSON object matching the requested schema. No surrounding markdown fences.';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const result = await this._postCompletion(messages, {
      timeoutMs: options.timeoutMs || 25000,
      jsonMode: true,
    });

    let parsed;
    try {
      // Strip potential markdown code block markers if returned
      let cleaned = result.content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new AIProviderError(`Groq returned invalid JSON: ${parseErr.message}`, {
        provider: this.name,
        code: 'INVALID_OUTPUT',
        retryable: true,
      });
    }

    if (schema) {
      const validated = schema.safeParse ? schema.safeParse(parsed) : { success: true, data: parsed };
      if (!validated.success) {
        throw new AIProviderError(`Groq output failed schema validation: ${validated.error.message}`, {
          provider: this.name,
          code: 'SCHEMA_VALIDATION_ERROR',
          retryable: true,
        });
      }
      parsed = validated.data;
    }

    return {
      data: parsed,
      rawText: result.content,
      provider: this.name,
      model: result.model,
    };
  }
}
