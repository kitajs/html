import fs from 'node:fs';
import { Session } from 'node:inspector/promises';
import { KitaJs } from './runners.js';
import { generatePurchases } from './util.js';

const purchases = generatePurchases(1_000);

// Run to warm up the JIT
for (let i = 0; i < 3; i++) {
  KitaJs('Profile', purchases);
}

(async () => {
  const session = new Session();

  session.connect();

  await session.post('Profiler.enable');
  await session.post('Profiler.start');

  for (let i = 0; i < 100; i++) {
    KitaJs('Profile', purchases);
  }

  const { profile } = await session.post('Profiler.stop');

  fs.writeFileSync('./profile.cpuprofile', JSON.stringify(profile));

  // session.disconnect();
})().catch(console.error);
