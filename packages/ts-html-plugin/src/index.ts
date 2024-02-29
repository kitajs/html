import type { default as TS, server } from 'typescript/lib/tsserverlibrary';
import { proxyObject, recursiveDiagnoseJsxElements } from './util';

export = function initHtmlPlugin(modules: { typescript: typeof TS }) {
  const ts = modules.typescript;

  return {
    create(info: server.PluginCreateInfo) {
      const proxy = proxyObject(info.languageService);

      proxy.getSemanticDiagnostics = function clonedSemanticDiagnostics(filename) {
        const diagnostics = info.languageService.getSemanticDiagnostics(filename);

        // Not a tsx file, so don't do anything
        if (!filename.endsWith('.tsx') && !filename.endsWith('.jsx')) {
          return diagnostics;
        }

        const program = info.languageService.getProgram();

        if (!program) {
          return diagnostics;
        }

        const source = program?.getSourceFile(filename);

        if (!source) {
          return diagnostics;
        }

        const typeChecker = program.getTypeChecker();

        ts.forEachChild(source, function loopSourceNodes(node) {
          recursiveDiagnoseJsxElements(ts, node, typeChecker, diagnostics);
        });

        return diagnostics;
      };

      return proxy;
    }
  };
};
