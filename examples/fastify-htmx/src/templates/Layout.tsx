import type { PropsWithChildren } from '@kitajs/html';

interface LayoutProps {
  title: string;
}

export function Layout({ title, children }: PropsWithChildren<LayoutProps>) {
  return (
    // autoDoctype is added by fastify-html-plugin
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1B1B1F" />
        <title safe>{title}</title>
        <link rel="icon" href="https://kitajs.org/favicon.svg" type="image/svg+xml" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <script src="https://unpkg.com/idiomorph@0.3.0/dist/idiomorph-ext.min.js"></script>
        <script>
          {`
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      kita: {
                        50: '#fdf5f4',
                        100: '#fbe9e7',
                        200: '#e4c8c5',
                        300: '#d4a49e',
                        400: '#bd695e',
                        500: '#ad4336',
                        600: '#9a3a2f',
                        700: '#7d2f26',
                        800: '#662722',
                        900: '#54231f',
                      }
                    }
                  }
                }
              }
            `}
        </script>
        <style>
          {`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              .skeleton {
                background: linear-gradient(90deg, rgba(173,67,54,0.1) 0%, rgba(173,67,54,0.2) 50%, rgba(173,67,54,0.1) 100%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
              }
              .htmx-request .htmx-indicator { display: inline-block; }
              .htmx-indicator { display: none; }
            `}
        </style>
      </head>
      <body
        class="bg-stone-950 min-h-screen text-stone-200 p-6 overflow-y-auto"
        hx-ext="morph"
      >
        {children}
      </body>
    </html>
  );
}
