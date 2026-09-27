import { GroqProvider } from './providers/groq.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { MockProvider } from './providers/mock.provider.js';

export class AIFallbackEngine {
  /**
   * @param {{
   *   mode?: 'bank_only' | 'mock' | 'live',
   *   primaryProvider?: Object,
   *   secondaryProvider?: Object,
   * }} config
   */
  constructor(config = {}) {
    this.mode = config.mode || process.env.AI_MODE || 'bank_only';

    if (this.mode === 'mock') {
      this.primary = config.primaryProvider || new MockProvider({ name: 'mock-primary' });
      this.secondary = config.secondaryProvider || new MockProvider({ name: 'mock-secondary' });
    } else if (this.mode === 'live') {
      this.primary = config.primaryProvider || new GroqProvider();
      this.secondary = config.secondaryProvider || new GeminiProvider();
    } else {
      // bank_only mode
      this.primary = null;
      this.secondary = null;
    }
  }

  /**
   * Executes a structured JSON AI operation with bounded fallback.
   *
   * @param {string} prompt
   * @param {Object} schema
   * @param {Object} options
   * @returns {Promise<{
   *   success: boolean,
   *   data: Object|null,
   *   provider: string,
   *   model: string,
   *   fallbackUsed: boolean,
   *   error?: string
   * }>}
   */
  async executeStructured(prompt, schema = null, options = {}) {
    if (this.mode === 'bank_only' || !this.primary) {
      return {
        success: false,
        data: null,
        provider: 'bank_only',
        model: 'none',
        fallbackUsed: false,
        error: 'AI is disabled in bank_only mode',
      };
    }

    // 1. Try Primary Provider (Groq)
    let primaryError = null;
    try {
      const primaryRes = await this.primary.generateStructured(prompt, schema, options);
      return {
        success: true,
        data: primaryRes.data,
        provider: primaryRes.provider,
        model: primaryRes.model,
        fallbackUsed: false,
      };
    } catch (err) {
      primaryError = err;
    }

    // 2. Fallback to Secondary Provider (Gemini) once
    if (this.secondary) {
      try {
        const secondaryRes = await this.secondary.generateStructured(prompt, schema, options);
        return {
          success: true,
          data: secondaryRes.data,
          provider: secondaryRes.provider,
          model: secondaryRes.model,
          fallbackUsed: true,
          primaryError: primaryError?.message,
        };
      } catch (secondaryErr) {
        return {
          success: false,
          data: null,
          provider: 'none',
          model: 'none',
          fallbackUsed: true,
          error: `Both providers failed. Primary (${this.primary.name}): ${primaryError?.message}. Secondary (${this.secondary.name}): ${secondaryErr?.message}`,
        };
      }
    }

    return {
      success: false,
      data: null,
      provider: 'none',
      model: 'none',
      fallbackUsed: false,
      error: `Primary provider failed and no secondary provider configured: ${primaryError?.message}`,
    };
  }

  /**
   * Executes a text generation AI operation with bounded fallback.
   *
   * @param {string} prompt
   * @param {Object} options
   * @returns {Promise<{
   *   success: boolean,
   *   text: string|null,
   *   provider: string,
   *   model: string,
   *   fallbackUsed: boolean,
   *   error?: string
   * }>}
   */
  async executeText(prompt, options = {}) {
    if (this.mode === 'bank_only' || !this.primary) {
      return {
        success: false,
        text: null,
        provider: 'bank_only',
        model: 'none',
        fallbackUsed: false,
        error: 'AI is disabled in bank_only mode',
      };
    }

    let primaryError = null;
    try {
      const primaryRes = await this.primary.generateText(prompt, options);
      return {
        success: true,
        text: primaryRes.text,
        provider: primaryRes.provider,
        model: primaryRes.model,
        fallbackUsed: false,
      };
    } catch (err) {
      primaryError = err;
    }

    if (this.secondary) {
      try {
        const secondaryRes = await this.secondary.generateText(prompt, options);
        return {
          success: true,
          text: secondaryRes.text,
          provider: secondaryRes.provider,
          model: secondaryRes.model,
          fallbackUsed: true,
          primaryError: primaryError?.message,
        };
      } catch (secondaryErr) {
        return {
          success: false,
          text: null,
          provider: 'none',
          model: 'none',
          fallbackUsed: true,
          error: `Both providers failed. Primary: ${primaryError?.message}. Secondary: ${secondaryErr?.message}`,
        };
      }
    }

    return {
      success: false,
      text: null,
      provider: 'none',
      model: 'none',
      fallbackUsed: false,
      error: primaryError?.message,
    };
  }
}
