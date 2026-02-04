import fastifyFormbody from '@fastify/formbody';
import { fastifyKitaHtml } from '@kitajs/fastify-html-plugin';
import fastify from 'fastify';
import { miscRoutes } from './api/misc';
import { todosRoutes } from './api/todos';
import { Dashboard } from './templates/pages/Dashboard';

export async function createServer() {
  const app = fastify({ logger: true });

  // Register plugins
  await app.register(fastifyFormbody);
  await app.register(fastifyKitaHtml);

  // Register API routes
  await app.register(todosRoutes);
  await app.register(miscRoutes);

  // Main page
  app.get('/', async (req, reply) => {
    return reply.html(<Dashboard rid={req.id} />);
  });

  return app;
}
