import fastify from 'fastify';
import assert from 'node:assert';
import test, { describe } from 'node:test';
import { fastifyKitaHtml } from '..';

describe('opts.autoDetect', () => {
  test('Auto detects HTML by default', async (t) => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/html', () => <html lang="en" />);
    app.get('/div', () => <div>Not a html root element</div>);

    await t.test('Html root', async () => {
      const res = await app.inject({ method: 'GET', url: '/html' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
      assert.strictEqual(res.body, '<!doctype html><html lang="en"></html>');
    });

    await t.test('Non html root', async () => {
      const res = await app.inject({ method: 'GET', url: '/div' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
      assert.strictEqual(res.body, '<div>Not a html root element</div>');
    });
  });

  test('Does not autodetect when disabled', async (t) => {
    await using app = fastify();
    app.register(fastifyKitaHtml, {
      autoDetect: false
    });

    app.get('/default', () => <div>Not a html root element</div>);
    app.get('/default/root', () => <html lang="en" />);
    app.get('/html', (_, res) => res.html(<div>Not a html root element</div>));
    app.get('/html/root', (_, res) => res.html(<html lang="en" />));

    await t.test('Default', async () => {
      const res = await app.inject({ method: 'GET', url: '/default' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.strictEqual(res.body, '<div>Not a html root element</div>');
    });

    await t.test('Default root', async () => {
      const res = await app.inject({ method: 'GET', url: '/default/root' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.strictEqual(res.body, '<html lang="en"></html>');
    });

    await t.test('Html ', async () => {
      const res = await app.inject({ method: 'GET', url: '/html' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
      assert.strictEqual(res.body, '<div>Not a html root element</div>');
    });

    await t.test('Html root', async () => {
      const res = await app.inject({ method: 'GET', url: '/html/root' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
      assert.strictEqual(res.body, '<!doctype html><html lang="en"></html>');
    });
  });
});
