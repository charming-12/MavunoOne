#!/usr/bin/env node

// Load .env IMMEDIATELY
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  process.exit(1);
}

console.log('✓ Environment loaded');
console.log(`✓ DATABASE_URL configured`);
console.log('');

// NOW run the TypeScript seed script
require('tsx/cjs').default('./scripts/seed-production.ts');
