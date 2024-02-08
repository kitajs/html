 

import { PassThrough, Readable } from 'node:stream';
import { pipeHtml, renderToStream, renderToString,SuspenseGenerator } from '../suspense';

// function ListUsers() {
//   const userJsonStream =;

//   return (
//     <SuspenseList>
//       {async function* () {
//         for await (const user of generateNUmbers()) {
//           yield (
//             <li>
//               <User user={user} />
//             </li>
//           );
//         }
//       }}
//     </SuspenseList>
//   );
// }

async function* generateNumbers(): AsyncGenerator {
  for (let i = 0; i < 10; i++) {
    yield i;
  }
}


(async () => {

  const stream = db.selectFrom('user').selectAll().limit(30).stream();
  const stream2 = generateNumbers();

})()

function ListUsers() {
  return (
    <SuspenseGenerator
      source={ generateNumbers()}
      batch={50}
      map={(user) => (
        <li>
          <User user={user} />
        </li>
      )}
    />
  );
}

declare function MyTemplateWithSuspense({ requestId }): JSX.Element;

console.log(<div>I'm only a string!</div>);

renderToStream(MyTemplateWithSuspense); // Readable<string>

// (joins the stream and returns a string)
renderToString(MyTemplateWithSuspense); // Promise<string> 

// Reuses a current string stream.
pipeHtml(MyTemplateWithSuspense({ requestId }), myExistingStream, requestId);
