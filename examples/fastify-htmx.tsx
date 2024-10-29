/// <reference types="@kitajs/html/htmx" />

import fastifyFormbody from '@fastify/formbody';
import { Suspense } from '@kitajs/html/suspense';
import fastify from 'fastify';
import { setTimeout } from 'node:timers/promises';
import { fastifyKitaHtml } from '../packages/fastify-html-plugin/types';

const app = fastify({ logger: true });

// Htmx requires body parsing
app.register(fastifyFormbody);
app.register(fastifyKitaHtml, {
  // defaults
  autoDoctype: true
});

const users: string[] = ['Arthur Fiorette'];

app.get('/', (_req, rep) => {
  rep.html(
    <html lang="en">
      <head>
        <title>Fastify & Kita & Htmx</title>
        <script src="https://unpkg.com/htmx.org@1" />
      </head>
      <body>
        <h1>Users</h1>

        <UserList />

        <form hx-post="/users" hx-target="#user-list" hx-swap="beforeend">
          <input name="username" required />
          <button type="submit">Add user</button>
        </form>

        <div hx-boost>
          <a href="/delay">Simulate this page with 5s delay</a>
        </div>
      </body>
    </html>
  );
});

// Simulates a slow response
app.get('/delay', (req, rep) => {
  rep.html(
    <html lang="en">
      <head>
        <title>Fastify & Kita & Htmx</title>
        <script src="https://unpkg.com/htmx.org@1" />
      </head>
      <body>
        <h1>Users</h1>

        <Suspense rid={req.id} fallback={<progress />}>
          <UserList wait={5000} />
        </Suspense>

        <form hx-post="/users" hx-target="#user-list" hx-swap="beforeend">
          <input name="username" required />
          <button type="submit">Add user</button>
        </form>

        <div hx-boost>
          <a href="/">Go back</a>
        </div>
      </body>
    </html>
  );
});

app.post(
  '/users',
  {
    schema: {
      body: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      }
    }
  },
  (req, rep) => {
    const { username } = req.body as { username: string };
    users.push(username);

    // Safe is required to avoid xss attacks.
    // Use `xss-scan` CLI to automatically check for forgotten `safe` props.
    rep.html(<li safe>{username}</li>);
  }
);

/** Simple component that can simulate delay */
async function UserList({ wait = 0 }) {
  if (wait) {
    await setTimeout(wait);
  }

  return (
    <ul id="user-list">
      {users.map((user) => (
        <li safe>{user}</li>
      ))}
    </ul>
  );
}

app.listen({ port: 3000 }).then(console.log);
