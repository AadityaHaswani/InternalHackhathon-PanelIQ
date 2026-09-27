import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';
import { GroqProvider } from '../src/modules/ai/providers/groq.provider.js';
import { GeminiProvider } from '../src/modules/ai/providers/gemini.provider.js';
import { AIFallbackEngine } from '../src/modules/ai/fallback-engine.js';
import { MockProvider } from '../src/modules/ai/providers/mock.provider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testSchema = z.object({
  status: z.string(),
  reason: z.string(),
  score: z.number().int().min(0).max(100),
});

async function runLiveSmokeTest() {
  console.log('=== PanelIQ Live AI Provider Smoke Test ===\n');

  const groqKeyConfigured = !!process.env.GROQ_API_KEY;
  const geminiKeyConfigured = !!process.env.GEMINI_API_KEY;

  console.log(`1. Key Configuration Check:`);
  console.log(`   - Groq API Key: ${groqKeyConfigured ? 'Configured' : 'Missing'}`);
  console.log(`   - Gemini API Key: ${geminiKeyConfigured ? 'Configured' : 'Missing'}`);
  console.log(`   - Configured Groq Model: ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
  console.log(`   - Configured Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}\n`);

  let groqPassed = false;
  let geminiPassed = false;
  let fallbackPassed = false;

  // 1. Groq Live Request Test
  console.log('2. Testing Primary Provider (Groq)...');
  try {
    const groq = new GroqProvider();
    const groqRes = await groq.generateStructured(
      'Evaluate: A candidate said "We use database transactions for atomicity". Return status="ok", reason="Demonstrated atomicity", score=90.',
      testSchema,
      { timeoutMs: 15000 }
    );
    console.log(`   ✔ Groq Request SUCCEEDED`);
    console.log(`     Model Used: ${groqRes.model}`);
    console.log(`     Parsed Data: ${JSON.stringify(groqRes.data)}`);
    groqPassed = true;
  } catch (err) {
    console.log(`   ✖ Groq Request FAILED: ${err.message}`);
  }

  console.log('');

  // 2. Gemini Live Request Test
  console.log('3. Testing Secondary Provider (Gemini)...');
  try {
    const gemini = new GeminiProvider();
    const geminiRes = await gemini.generateStructured(
      'Evaluate: A candidate said "We use Redis for distributed locks with TTL". Return status="ok", reason="Mentioned TTL", score=95.',
      testSchema,
      { timeoutMs: 15000 }
    );
    console.log(`   ✔ Gemini Request SUCCEEDED`);
    console.log(`     Model Used: ${geminiRes.model}`);
    console.log(`     Parsed Data: ${JSON.stringify(geminiRes.data)}`);
    geminiPassed = true;
  } catch (err) {
    console.log(`   ✖ Gemini Request FAILED: ${err.message}`);
  }

  console.log('');

  // 3. Fallback Mechanism Test
  console.log('4. Testing Provider Fallback Mechanism (Primary Fails -> Secondary Succeeds)...');
  try {
    const failingPrimary = new MockProvider({ name: 'failing-groq-mock', shouldFail: true, failCode: 'TIMEOUT' });
    const realGemini = new GeminiProvider();
    const fallbackEngine = new AIFallbackEngine({
      mode: 'live',
      primaryProvider: failingPrimary,
      secondaryProvider: realGemini,
    });

    const fallbackRes = await fallbackEngine.executeStructured(
      'Return status="ok", reason="Fallback test", score=80.',
      testSchema,
      { timeoutMs: 15000 }
    );

    if (fallbackRes.success && fallbackRes.fallbackUsed) {
      console.log(`   ✔ Fallback SUCCEEDED`);
      console.log(`     Primary Failed -> Secondary (${fallbackRes.provider}) rescued execution`);
      console.log(`     Model: ${fallbackRes.model}`);
      console.log(`     Data: ${JSON.stringify(fallbackRes.data)}`);
      fallbackPassed = true;
    } else {
      console.log(`   ✖ Fallback did not trigger secondary provider as expected: ${fallbackRes.error}`);
    }
  } catch (err) {
    console.log(`   ✖ Fallback test failed: ${err.message}`);
  }

  console.log('\n=== Smoke Test Summary ===');
  console.log(`Groq Primary:       ${groqPassed ? 'PASS' : 'FAIL'}`);
  console.log(`Gemini Secondary:   ${geminiPassed ? 'PASS' : 'FAIL'}`);
  console.log(`Provider Fallback:  ${fallbackPassed ? 'PASS' : 'FAIL'}`);

  if (groqPassed && geminiPassed && fallbackPassed) {
    console.log('\nALL LIVE AI PROVIDER CHECKS PASSED.');
    process.exit(0);
  } else {
    console.log('\nSOME CHECKS DID NOT PASS. Review above logs.');
    process.exit(1);
  }
}

runLiveSmokeTest().catch((err) => {
  console.error('Fatal smoke test runner error:', err.message);
  process.exit(1);
});
