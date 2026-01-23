import { createServer } from './server';

const port = Number(process.env.PORT) || 32013;

createServer()
  .then((app) => app.listen({ port }))
  .then(() => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
