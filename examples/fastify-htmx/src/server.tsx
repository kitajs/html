import fastifyFormbody from '@fastify/formbody';
import fastifyHtml from '@kitajs/fastify-html-plugin';
import fastify from 'fastify';
import { miscRoutes } from './api/misc';
import { statsRoutes } from './api/stats';
import { todosRoutes } from './api/todos';
import { Dashboard } from './templates/pages/Dashboard';

export async function createServer() {
  const app = fastify({ logger: true });

  // Register plugins
  await app.register(fastifyFormbody);
  await app.register(fastifyHtml);

  // Register API routes
  await app.register(statsRoutes);
  await app.register(todosRoutes);
  await app.register(miscRoutes);

  // Main page
  app.get('/', async (_req, reply) => {
    return reply.html(<Dashboard />);
  });

  return app;
}
