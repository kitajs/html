import { ChildProcess, fork } from 'child_process';
import { EventEmitter } from 'events';
import { Deferred, deferred } from 'fast-defer';
import { statSync } from 'fs';
import path from 'path';
import ts from 'typescript/lib/tsserverlibrary';

/** All requests used in tests */
export type Requests =
  | ts.server.protocol.OpenRequest
  | ts.server.protocol.SemanticDiagnosticsSyncRequest;

try {
  statSync(require.resolve('self'));
} catch (error) {
  throw new Error('You must run pnpm build before running tests');
}

const TEST_FILE = path.join(__dirname, 'index.tsx');
const ROOT = path.join(__dirname, '..');

export const TEST_HELPERS = /* tsx */ `
  import Html, { type PropsWithChildren, e } from '@kitajs/html';

  const date = new Date();
  const safeString: string = 'safe';
  const promiseHtml = Promise.resolve(<div>Hello</div>);
  const promiseNumber = Promise.resolve(1227);
  const html: string = '<div>Hello</div>';
  const number = 1227;
  const unsafeNumber = 1227;
  const union = 1 as string | number;
  const boolean = true as boolean;
  const object = {};

  function Component(props: PropsWithChildren) {
    return <div>{props.children}</div>;
  }

  // just to avoid unused variable error
  if (process.env.NEVER) {
    console.log({
      date, e, Html,
      safeString,
      promiseHtml,
      promiseNumber,
      html,
      number,
      unsafeNumber,
      union,
      boolean,
      object,
      Component
    });
  }
`.trim();

export class TSLangServer {
  responseEventEmitter = new EventEmitter();
  responseCommandEmitter = new EventEmitter();
  errorEmitter = new EventEmitter();

  exitPromise: Deferred<void>;
  isClosed = false;
  server: ChildProcess;
  sequence = 0;

  constructor(
    projectPath: string,
    private readonly debug = false
  ) {
    this.server = fork(require.resolve('typescript/lib/tsserver'), {
      cwd: projectPath,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        TSS_LOG: debug ? `-level verbose -file ${projectPath}/tss.log` : undefined,
        KITA_TS_HTML_PLUGIN_TESTING: 'true'
      }
    });

    this.exitPromise = deferred();
    this.server.on('exit', this.exitPromise.resolve);
    this.server.on('error', this.exitPromise.reject);

    this.server.stdout!.setEncoding('utf-8');

    this.server.stdout!.on('data', (data) => {
      const obj = JSON.parse(data.split('\n', 3)[2]);

      if (this.debug) {
        console.dir(obj, { depth: 10 });
      }

      if (obj.success === false) {
        this.errorEmitter.emit(obj.type === 'event' ? obj.event : obj.command, obj);

        // Error is fatal, close the server
        if (!this.isClosed) {
          this.isClosed = true;
          this.server.stdin!.end();
        }
      } else if (obj.type === 'event') {
        this.responseEventEmitter.emit(obj.event, obj);
      } else if (obj.type === 'response') {
        this.responseCommandEmitter.emit(obj.command, obj);
      }
    });
  }

  /** Opens the project, sends diagnostics request and returns the response */
  async openWithDiagnostics(content: TemplateStringsArray, ...args: any[]) {
    const fileContent = TEST_HELPERS + '\n' + String.raw(content, ...args).trim();

    if (this.debug) {
      console.log(this.strWithLineNumbers(fileContent));
    }

    await this.send({
      command: ts.server.protocol.CommandTypes.Open,
      arguments: {
        file: TEST_FILE,
        fileContent,
        scriptKindName: 'TSX',
        projectRootPath: ROOT
      }
    });

    // One of these events will be emitted after opening the project
    await Promise.race([
      this.waitResponse('open'),
      this.waitEvent('projectLoadingFinish')
    ]);

    await this.send({
      command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
      arguments: {
        file: TEST_FILE,
        fileContent,
        scriptKindName: 'TSX',
        projectRootPath: ROOT
      }
    });

    return this.waitResponse('semanticDiagnosticsSync');
  }

  send(command: Omit<Requests, 'seq' | 'type'>) {
    const response = deferred<void>();

    this.server.stdin!.write(this.formatCommand(command), (err) =>
      err ? response.reject(err) : response.resolve()
    );

    return response;
  }

  private formatCommand(command: Omit<Requests, 'seq' | 'type'>) {
    return (
      JSON.stringify(Object.assign({ seq: ++this.sequence, type: 'request' }, command)) +
      '\n'
    );
  }

  waitEvent(eventName: string) {
    return new Promise<any>((resolve, reject) => {
      const success = (data: any) => {
        this.errorEmitter.removeListener(eventName, success);
        resolve(data);
      };

      const error = (err: any) => {
        this.responseEventEmitter.removeListener(eventName, success);
        reject(err);
      };

      this.responseEventEmitter.once(eventName, success);
      this.errorEmitter.once(eventName, error);
    });
  }

  waitResponse(commandName: `${ts.server.protocol.CommandTypes}`) {
    return new Promise<any>((resolve, reject) => {
      const success = (data: any) => {
        this.errorEmitter.removeListener(commandName, success);
        resolve(data);
      };

      const error = (err: any) => {
        this.responseCommandEmitter.removeListener(commandName, success);
        reject(err);
      };

      this.responseCommandEmitter.once(commandName, success);
      this.errorEmitter.once(commandName, error);
    });
  }

  [Symbol.asyncDispose]() {
    if (!this.isClosed) {
      this.isClosed = true;
      this.server.stdin!.end();
    }

    return this.exitPromise;
  }

  strWithLineNumbers(str: string) {
    return str
      .split('\n')
      .map((line, index) => `${index + 1 < 10 ? `0${index + 1}` : index + 1} | ${line}`)
      .join('\n');
  }
}
