import type { PropsWithChildren } from '@kitajs/html'

export function Layout({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title safe>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <nav>
          <a class="mark" href="/">
            NA
          </a>
          <div>
            <a href="/objects/orion">Orion</a>
            <a href="/observatory">Observatory</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
