#!/usr/bin/env node

/**
 * Wrap `stripe listen` to capture the session's webhook secret and keep our
 * env files in sync so the Firebase Functions emulator verifies events.
 */

const { spawn } = require('node:child_process');
const { readFile, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const STRIPE_ARGS = [
  'listen',
  '--events',
  'checkout.session.completed',
  '--forward-to',
  'http://127.0.0.1:5001/black-river-market-b3dec/us-central1/stripeWebhook',
];

const ENV_FILES = ['.env.local', '.env', 'functions/.env'];
let secretWritten = false;

function extractSecret(chunk) {
  const match = chunk.match(/(whsec_[A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

async function ensureEnvValue(filePath, secret) {
  const fullPath = resolve(process.cwd(), filePath);
  try {
    let contents = await readFile(fullPath, 'utf8');
    if (/^STRIPE_WEBHOOK_SECRET=.*$/m.test(contents)) {
      contents = contents.replace(
        /^STRIPE_WEBHOOK_SECRET=.*$/gm,
        `STRIPE_WEBHOOK_SECRET=${secret}`
      );
    } else {
      contents = `${contents.trimEnd()}\nSTRIPE_WEBHOOK_SECRET=${secret}\n`;
    }
    await writeFile(fullPath, contents);
    console.log(`[dev:stripe] Updated ${filePath}`);
  } catch (err) {
    console.warn(`[dev:stripe] Skipped ${filePath}: ${err.message}`);
  }
}

async function writeSecret(secret) {
  if (secretWritten) return;
  secretWritten = true;
  process.env.STRIPE_WEBHOOK_SECRET = secret;

  await Promise.all(ENV_FILES.map((file) => ensureEnvValue(file, secret)));
  console.log(`[dev:stripe] Webhook secret set to ${secret}`);
}

function startStripeListen() {
  const stripe = spawn('stripe', STRIPE_ARGS, { stdio: ['inherit', 'pipe', 'inherit'] });

  stripe.stdout.setEncoding('utf8');
  stripe.stdout.on('data', async (chunk) => {
    process.stdout.write(chunk);
    if (!secretWritten) {
      const secret = extractSecret(chunk);
      if (secret) await writeSecret(secret);
    }
  });

  stripe.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  stripe.on('error', (err) => {
    console.error('[dev:stripe] Failed to start stripe CLI:', err.message);
    process.exit(1);
  });
}

startStripeListen();
