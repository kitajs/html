import fastify from 'fastify';
import assert from 'node:assert';
import test from 'node:test';

test('fails when html is not a string (promise)', async () => {
  await using app = fastify();

  app.get('/', (_, res) => {
    process.stdout.pipe(res.raw);

    // return res.send(1).send(2).send(3)
  });

  const res = await app.inject({ method: 'GET', url: '/' });

  assert.strictEqual(res.statusCode, 200);
  console.log(res.body);

  // app.register(fastifyKitaHtml);

  // app.get('/', (_, res) =>
  //   //@ts-expect-error - should fail
  //   res.html(Promise.resolve(12345))
  // );

  // const res = await app.inject({ method: 'GET', url: '/' });

  // assert.strictEqual(res.statusCode, 500);
  // assert.strictEqual(
  //   res.headers[CONTENT_TYPE_HEADER],
  //   'application/json; charset=utf-8'
  // );
  // assert.deepStrictEqual(res.json(), {
  //   statusCode: 500,
  //   code: 'FST_ERR_REP_INVALID_PAYLOAD_TYPE',
  //   error: 'Internal Server Error',
  //   message:
  //     "Attempted to send payload of invalid type 'number'. Expected a string or Buffer."
  // });
});
