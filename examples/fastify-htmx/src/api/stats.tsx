import type { FastifyInstance } from 'fastify';
import { setTimeout } from 'node:timers/promises';
import { StatCard } from '../templates/components';

// Helper for random delay
const randomDelay = () => setTimeout(300 + Math.random() * 700);

export async function statsRoutes(app: FastifyInstance) {
  app.get('/api/stats/visitors', async () => {
    await randomDelay();
    return <StatCard label="Visitors" value="2,847" change="+12%" positive />;
  });

  app.get('/api/stats/requests', async () => {
    await randomDelay();
    return <StatCard label="Requests" value="14.2k" change="+28%" positive />;
  });

  app.get('/api/stats/uptime', async () => {
    await randomDelay();
    return <StatCard label="Uptime" value="99.9%" change="Stable" positive />;
  });

  app.get('/api/stats/memory', async () => {
    await randomDelay();
    const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    return <StatCard label="Memory" value={`${used} MB`} />;
  });
}
