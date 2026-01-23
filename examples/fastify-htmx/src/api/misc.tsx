import type { FastifyInstance } from 'fastify';
import { setTimeout } from 'node:timers/promises';
import { store } from '../store';
import { Progress, Toast } from '../templates/components';

export async function miscRoutes(app: FastifyInstance) {
  // Click counter
  app.post('/api/click', async () => {
    store.clickCount++;
    return String(store.clickCount);
  });

  // Server time
  app.get('/api/time', async () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  });

  // System metrics
  app.get('/api/metrics', async () => {
    await setTimeout(200);
    const cpu = Math.round(30 + Math.random() * 40);
    const memory = Math.round(50 + Math.random() * 30);
    const disk = Math.round(20 + Math.random() * 20);

    return (
      <div class="space-y-3">
        <Progress label="CPU" value={cpu} />
        <Progress label="Memory" value={memory} />
        <Progress label="Disk" value={disk} />
      </div>
    );
  });

  // Notifications
  app.post('/api/notify', async (req) => {
    const type = (req.query as { type?: string }).type || 'info';
    const messages = {
      success: ['Operation completed!', 'Changes saved successfully', 'Task completed'],
      error: ['Something went wrong', 'Connection failed', 'Please try again'],
      info: ['New update available', 'System notification', 'Processing request']
    };
    const typeMessages = messages[type as keyof typeof messages] || messages.info;
    const message =
      typeMessages[Math.floor(Math.random() * typeMessages.length)] ?? 'Notification';

    return <Toast message={message} type={type as 'success' | 'error' | 'info'} />;
  });
}
