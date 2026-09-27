import { BaseAIProvider, AIProviderError } from './base.provider.js';

export class GeminiProvider extends BaseAIProvider {
  /**
   * @param {{ apiKey?: string, model?: string }} config
   */
  constructor(config = {}) {
    super('gemini');
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Helper to execute generateContent with timeout, structured output, and error handling.
   * @private
   */
  async _postGenerate(contents, { timeoutMs = 8000, jsonMode = false, model = this.model, systemInstruction = null } = {}) {
    if (!this.apiKey) {
      throw new AIProviderError('Gemini API key is not configured', {
        provider: this.name,
        code: 'MISSING_API_KEY',
        status: 401,
        retryable: false,
      });
    }

    const payload = {
      contents,
      generationConfig: {
        temperature: 0.2,
      },
    };

    if (jsonMode) {
      payload.generationConfig.responseMimeType = 'application/json';
    }

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const endpoint = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      throw new AIProviderError(
        isTimeout ? `Gemini request timed out after ${timeoutMs}ms` : `Gemini network error: ${err.message}`,
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

      // Handle discontinued or overloaded models by trying gemini-3.1-flash-lite
      if (
        (status === 404 || status === 400 || (status === 503 && errorMsg.includes('high demand'))) &&
        model !== 'gemini-3.1-flash-lite'
      ) {
        return this._postGenerate(contents, {
          timeoutMs,
          jsonMode,
          model: 'gemini-3.1-flash-lite',
          systemInstruction,
        });
      }

      let code = 'PROVIDER_ERROR';
      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('high demand')) {
        code = 'RATE_LIMITED';
      } else if (status >= 500) {
        code = 'SERVER_ERROR';
      } else if (status === 401 || status === 403) {
        code = 'AUTH_ERROR';
      }

      throw new AIProviderError(`Gemini API error (${status}): ${errorMsg}`, {
        provider: this.name,
        code,
        status,
        retryAfter,
        retryable: status === 429 || status >= 500,
      });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || '';

    return { content, model };
  }

  async generateText(prompt, options = {}) {
    const contents = [{ parts: [{ text: prompt }] }];
    const result = await this._postGenerate(contents, {
      timeoutMs: options.timeoutMs || 8000,
      jsonMode: false,
      systemInstruction: options.systemPrompt || 'You are an expert technical interviewer assistant.',
    });

    return {
      text: result.content.trim(),
      provider: this.name,
      model: result.model,
    };
  }

  async generateStructured(prompt, schema = null, options = {}) {
    const systemInstruction = options.systemPrompt
      ? `${options.systemPrompt}\nIMPORTANT: Respond ONLY with a valid JSON object matching the requested schema. No surrounding markdown.`
      : 'You are an expert technical interviewer assistant. Respond ONLY with a valid JSON object matching the requested schema.';

    const contents = [{ parts: [{ text: prompt }] }];
    const result = await this._postGenerate(contents, {
      timeoutMs: options.timeoutMs || 25000,
      jsonMode: true,
      systemInstruction,
    });

    let parsed;
    try {
      let cleaned = result.content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new AIProviderError(`Gemini returned invalid JSON: ${parseErr.message}`, {
        provider: this.name,
        code: 'INVALID_OUTPUT',
        retryable: true,
      });
    }

    if (schema) {
      const validated = schema.safeParse ? schema.safeParse(parsed) : { success: true, data: parsed };
      if (!validated.success) {
        throw new AIProviderError(`Gemini output failed schema validation: ${validated.error.message}`, {
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
