import fastify from 'fastify';
import { describe, expect, test } from 'vitest';
import { fastifyKitaHtml } from '../src';

describe('opts.autoDoctype', () => {
  test('Default', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/default', () => <div>Not a html root element</div>);

    const res = await app.inject({ method: 'GET', url: '/default' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.body).toBe('<div>Not a html root element</div>');
  });

  test('Default root', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/default/root', () => <html lang="en" />);

    const res = await app.inject({ method: 'GET', url: '/default/root' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.body).toBe('<html lang="en"></html>');
  });

  test('Html', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/html', (_, res) => res.html(<div>Not a html root element</div>));

    const res = await app.inject({ method: 'GET', url: '/html' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.body).toBe('<div>Not a html root element</div>');
  });

  test('Html root', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/html/root', (_, res) => res.html(<html lang="en" />));

    const res = await app.inject({ method: 'GET', url: '/html/root' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.body).toBe('<!doctype html><html lang="en"></html>');
  });
});
