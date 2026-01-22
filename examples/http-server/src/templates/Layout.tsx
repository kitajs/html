import type { PropsWithChildren } from '@kitajs/html';

interface LayoutProps {
  title: string;
}

export function Layout({ title, children }: PropsWithChildren<LayoutProps>) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            {`
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    animation: {
                      'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                  }
                }
              }
            `}
          </script>
        </head>
        <body class="bg-slate-900 min-h-screen text-slate-200">
          <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <header class="text-center mb-12 p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur">
              <div class="flex items-center justify-center gap-4 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25">
                  K
                </div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  KitaJS Streaming Demo
                </h1>
              </div>
              <p class="text-slate-400 text-lg">
                Watch components load progressively with Suspense streaming
              </p>
            </header>

            <main>{children}</main>

            <footer class="text-center mt-12 py-6 text-slate-500 text-sm">
              <p>
                Built with{' '}
                <a
                  href="https://github.com/kitajs/html"
                  class="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  @kitajs/html
                </a>{' '}
                - The fastest JSX runtime for server-side rendering
              </p>
            </footer>
          </div>
        </body>
      </html>
    </>
  );
}
