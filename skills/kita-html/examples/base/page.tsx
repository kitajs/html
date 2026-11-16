import { escapeHtml, type Children } from '@kitajs/html'

function Layout({ title, children }: { title: string; children: Children }) {
  return (
    <html lang="en">
      <body>
        <main class="layout">
          <h1 safe>{title}</h1>
          {children}
        </main>
      </body>
    </html>
  )
}

export function HomePage({ userName, bio }: { userName: string; bio: string }) {
  return (
    <>
      {'<!doctype html>'}
      <Layout title="Welcome">
        <p safe>{userName}</p>
        <section>{escapeHtml(bio)}</section>
      </Layout>
    </>
  )
}
