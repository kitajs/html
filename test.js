const { renderToStream,SuspenseGenerator } = require('./suspense');

renderToStream((rid) => {
  return SuspenseGenerator({
    rid,
    source: (function* () {
      yield '1';
      yield '2';
      yield String('3');
    })
  });
}).pipe(process.stdout);
