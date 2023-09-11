export function BigComponent(Html: { createElement: Function }, name: string) {
  return (
    <div>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <title>{name}</title>
      <meta name="description" content="My own room in the internet!" />
      <meta
        name="keywords"
        content="arthur, fileti, fiorette, resume, portifolio, personal, website, cv, curriculum, vitale"
      />
      <meta name="author" content="Arthur Fiorette" />
      <meta name="og:type" content="website" />
      <meta name="og:title" content={name} />
      <meta name="og:site_name" content={name} />
      <meta name="og:description" content="My own room in the internet!" />
      <meta name="og:url" content="https://arthur.place/" />
      <meta
        name="og:image"
        content="https://arthur.place/images/logo-1280-720.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={name} />
      <meta name="twitter:description" content="My own room in the internet!" />
      <meta
        name="twitter:image"
        content="https://arthur.place/images/logo-1280-720.png"
      />
      <meta name="twitter:site" content="@arthurfiorette" />
      <meta name="twitter:creator" content="@arthurfiorette" />
      <meta name="next-head-count" content="18" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#000000" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="robots" content="index, follow" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/icons/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/icons/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/icons/favicon-16x16.png"
      />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link rel="preload" href="/_next/static/css/bfc77d1276d15f52.css" />
      <link
        rel="stylesheet"
        href="/_next/static/css/bfc77d1276d15f52.css"
        data-n-g=""
      />
      <link rel="preload" href="/_next/static/css/4317182bfd3fef54.css" />
      <link
        rel="stylesheet"
        href="/_next/static/css/4317182bfd3fef54.css"
        data-n-p=""
      />
      <noscript data-n-css="" />
      <style data-href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap" />
      <div id="__next">
        <header class="header_header__f31t9">
          <div class="header_logo__2nrkl">
            <a href="/">{name}</a>
          </div>
          <nav class="header_nav__xvW26">
            <a href="/posts" />
            <a title="A list of recent posts I wrote">Recent Posts</a>
            <a href="/resume" />
            <a title="My professional resume">Resume</a>
            <a href="/links" />
            <a title="View all my links">Links</a>
          </nav>
        </header>
        <main class="main_main__Ttnm8 undefined">
          <h1 style="margin-bottom: 3rem; text-align: center;">
            Eai 👋 <br />I am Arthur Fiorette
          </h1>
          <section class="section_section__VeKXZ undefined">
            <p>
              Hello! My name is <b>Arthur</b>. I am working with web and
              server-side development since mid 2018. I really enjoy the open
              source community and I'm always looking for new projects to
              contribute!
            </p>
            <p>
              Everything started with me trying to code some Minecraft Plugins.
              Today, I've developed entire SaaS applications, from side-projects
              to enterprise ones.
            </p>
          </section>
          <section class="section_section__VeKXZ undefined">
            <p>
              I always liked to code new challenges and libraries, so it would
              be awesome if you look at some projects that I'm hosting on
              Github.
            </p>
            <ul>
              <li>
                <a
                  href="https://github.com/arthurfiorette/axios-cache-interceptor"
                  title="Axios Cache Interceptor"
                  rel="noreferrer"
                  target="_self">
                  A small and efficient cache interceptor for axios.
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/arthurfiorette/brainease"
                  title="Brainease"
                  rel="noreferrer"
                  target="_self">
                  A brainf*ck-style programming language, but readable.
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/arthurfiorette/tinylibs"
                  title="TinyLibs"
                  rel="noreferrer"
                  target="_self">
                  A collection of small libraries for javascript.
                </a>
              </li>
            </ul>
          </section>
          <section class="section_section__VeKXZ undefined">
            <p>In case you are interested, you also can...</p>
            <ul>
              <li>
                <a href="/resume" rel="noreferrer" target="_self">
                  View my resume.
                </a>
              </li>
              <li>
                <a href="/r/github" rel="noreferrer" target="_self">
                  Find me at Github.
                </a>
              </li>
              <li>
                <a href="/r/twitter" rel="noreferrer" target="_self">
                  Like some of my tweets.
                </a>
              </li>
              <li>
                <a href="/r/linkedin" rel="noreferrer" target="_self">
                  Connect with me on LinkedIn.
                </a>
              </li>
              <li>
                <a href="/r/twitch" rel="noreferrer" target="_self">
                  Follow me on Twitch.
                </a>
              </li>
              <li>
                <a
                  href="mailto:arthur.fiorette@gmail.com"
                  rel="noreferrer"
                  target="_self">
                  Send me an email.
                </a>
              </li>
            </ul>
          </section>
          <section class="section_section__VeKXZ undefined">
            <p>
              I'm still a programmer, not a writer, but I like to write useful,
              random and tricky stuff that I'd like the development community to
              know about.
            </p>
            <p>
              If you like to know specific things that will make you a better
              programmer, here's a preview of the last 3 posts I wrote:
            </p>
            <div style="margin: 2rem 0px;">
              <ol class="list_list__2a8BJ">
                <li class="list_listItem__HYvMd">
                  <div
                    class="min-read_minRead__5_gc6"
                    title="This content will probably consume around 8 minutes to be read.">
                    ~<b>8</b> min read.
                  </div>
                  <a href="/implications-of-cache-or-state" />
                  <a class="preview_preview__D20oh">
                    <h2 class="preview_title__047B1">
                      The consequences of using State over Cache and its impact
                      on data consistency.
                    </h2>
                  </a>
                  <div class="preview_description__Z3UPd">
                    A guide to work with Cache over State for remote data
                    management
                  </div>
                  <div class="preview_meta__QiaE5">
                    <time datetime="2022-09-23T07:52:00.000Z">
                      Fri Sep 23 2022
                    </time>
                    <address>Arthur Fiorette</address>
                    <div class="preview_keywords__tPZ4g">
                      <ul class="badge_list__EaR3F">
                        <li>
                          <span
                            class="badge_item__XI77F"
                            style="background-color: #563D7C73">
                            architecture
                          </span>
                        </li>
                        <li>
                          <span
                            class="badge_item__XI77F"
                            style="background-color: #F2994A73">
                            design pattern
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
                <li class="list_listItem__HYvMd">
                  <div
                    class="min-read_minRead__5_gc6"
                    title="This content will probably consume around 6 minutes to be read.">
                    ~<b>6</b> min read.
                  </div>
                  <a href="/the-cost-of-return-await" />
                  <a class="preview_preview__D20oh">
                    <h2 class="preview_title__047B1">
                      How Return Await can slow down your code
                    </h2>
                  </a>
                  <div class="preview_description__Z3UPd">
                    Awaiting a promise before returning it slows down your code.
                  </div>
                  <div class="preview_meta__QiaE5">
                    <time datetime="2022-03-26T08:17:00.000Z">
                      Sat Mar 26 2022
                    </time>
                    <address>Arthur Fiorette</address>
                    <div class="preview_keywords__tPZ4g">
                      <ul class="badge_list__EaR3F">
                        <li>
                          <span
                            class="badge_item__XI77F"
                            style="background-color: #67C68473">
                            performance
                          </span>
                        </li>
                        <li>
                          <span
                            class="badge_item__XI77F"
                            style="background-color: #f7df1e73">
                            javascript
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              </ol>
            </div>
            <p>
              <a href="/posts" />
              <a>See all of them!</a>
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
