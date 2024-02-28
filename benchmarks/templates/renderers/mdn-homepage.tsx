// All credits to MDN https://developer.mozilla.org/pt-BR/
// This JSX element tree was extracted from the initial HTML of the page
// and then converted to JSX using https://magic.reactjs.net/htmltojsx.htm
// 17/09/2023 18PM GMT-3

export function TemplateMdnHomepage(html: Function, mdn: string) {
  return html`
    <div>
      <meta char-set="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" href="/favicon-48x48.cbbd161b.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.6803c6f0.png" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="manifest" href="/manifest.56b1cedc.json" />
      <link
        rel="search"
        type="application/opensearchdescription+xml"
        href="/opensearch.xml"
        title="MDN Web Docs"
      />
      <title>${mdn} Web Docs</title>
      <link
        rel="alternate"
        type="application/rss+xml"
        title="MDN Blog RSS Feed"
        href="/en-US/blog/rss.xml"
        href-lang="en"
      />
      <meta name="robots" content="index, follow" />
      <meta
        name="description"
        content="The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps."
      />
      <meta property="og:url" content="https://developer.mozilla.org" />
      <meta property="og:title" content="MDN Web Docs" />
      <meta property="og:locale" content="en-US" />
      <meta
        property="og:description"
        content="The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps."
      />
      <meta
        property="og:image"
        content="https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="MozDevNet" />
      <link rel="canonical" href="https://developer.mozilla.org" />
      <style media="print">
        {\`.article-actions-container,.document-toc-container,.language-menu,.main-menu-toggle,.on-github,.page-footer,.place,.sidebar,.top-banner,.top-navigation-main,ul.prev-next{display:none!important}.main-page-content,.main-page-content pre{padding:2px}.main-page-content pre{border-left-width:2px}\`}
      </style>
      <link href="/static/css/main.d3b84f58.css" rel="stylesheet" />
      <div id="root">
        <ul id="nav-access" class="a11y-nav">
          <li>
            <a id="skip-main" href="#content">
              Skip to main content
            </a>
          </li>
          <li>
            <a id="skip-search" href="#top-nav-search-input">
              Skip to search
            </a>
          </li>
        </ul>
        <div class="page-wrapper  category-home standard-page ">
          <div class="top-banner loading">
            <section class="place top container" />
          </div>
          <header
            class="top-navigation main-document-header-container 
 dark
"
          >
            <div class="container ">
              <div class="top-navigation-wrap">
                <a href="/pt-BR/" class="logo" aria-label="MDN homepage">
                  <svg
                    id="mdn-docs-logo"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 361 104.2"
                    style={{ background: 'new 0 0 361 104.2' }}
                    xmlSpace="preserve"
                    role="img"
                  >
                    <title>MDN Web Docs</title>
                    <path
                      d="M197.6 73.2h-17.1v-5.5h3.8V51.9c0-3.7-.7-6.3-2.1-7.9-1.4-1.6-3.3-2.3-5.7-2.3-3.2 0-5.6 1.1-7.2 3.4s-2.4 4.6-2.5 6.9v15.6h6v5.5h-17.1v-5.5h3.8V51.9c0-3.8-.7-6.4-2.1-7.9-1.4-1.5-3.3-2.3-5.6-2.3-3.2 0-5.5 1.1-7.2 3.3-1.6 2.2-2.4 4.5-2.5 6.9v15.8h6.9v5.5h-20.2v-5.5h6V42.4h-6.1v-5.6h13.4v6.4c1.2-2.1 2.7-3.8 4.7-5.2 2-1.3 4.4-2 7.3-2s5.3.7 7.5 2.1c2.2 1.4 3.7 3.5 4.5 6.4 1.1-2.5 2.7-4.5 4.9-6.1s4.8-2.4 7.9-2.4c3.5 0 6.5 1.1 8.9 3.3s3.7 5.6 3.7 10.2v18.2h6.1v5.5zm42.5 0h-13.2V66c-1.2 2.2-2.8 4.1-4.9 5.6-2.1 1.6-4.8 2.4-8.3 2.4-4.8 0-8.7-1.6-11.6-4.9-2.9-3.2-4.3-7.7-4.3-13.3 0-5 1.3-9.6 4-13.7 2.6-4.1 6.9-6.2 12.8-6.2s9.8 2.2 12.3 6.5V22.7h-8.6v-5.6h15.8v50.6h6v5.5zm-13.3-16.8V52c-.1-3-1.2-5.5-3.2-7.3s-4.4-2.8-7.2-2.8c-3.6 0-6.3 1.3-8.2 3.9-1.9 2.6-2.8 5.8-2.8 9.6 0 4.1 1 7.3 3 9.5s4.5 3.3 7.4 3.3c3.2 0 5.8-1.3 7.8-3.8 2.1-2.6 3.1-5.3 3.2-8zm61.5 16.8H269v-5.5h6V51.9c0-3.7-.7-6.3-2.2-7.9-1.4-1.6-3.4-2.3-5.7-2.3-3.1 0-5.6 1-7.4 3s-2.8 4.4-2.9 7v15.9h6v5.5h-19.3v-5.5h6V42.4h-6.2v-5.6h13.6V43c2.6-4.6 6.8-6.9 12.7-6.9 3.6 0 6.7 1.1 9.2 3.3s3.7 5.6 3.7 10.2v18.2h6v5.4h-.2z"
                      class="logo-text"
                    />
                    <path
                      d="M42 .2 13.4 92.3H1.7L30.2.2Zm10.4 0v92.1H42V.2Zm40.3 0L64.2 92.3H52.5L81 .2Zm10.4 0v92.1H92.7V.2Z"
                      class="logo-m"
                    />
                    <path d="M294 95h67v8.8h-67z" class="logo-_" />
                  </svg>
                </a>
                <button
                  title="Open main menu"
                  type="button"
                  class="button action has-icon main-menu-toggle"
                  aria-haspopup="menu"
                  aria-label="Open main menu"
                  aria-expanded="false"
                >
                  <span class="button-wrap">
                    <span class="icon icon-menu " />
                    <span class="visually-hidden">Open main menu</span>
                  </span>
                </button>
              </div>
              <div class="top-navigation-main">
                <nav class="main-nav" aria-label="Main menu">
                  <ul class="main-menu nojs">
                    <li class="top-level-entry-container">
                      <button
                        type="button"
                        id="references-button"
                        class="top-level-entry menu-toggle"
                        aria-controls="references-menu"
                        aria-expanded="false"
                      >
                        References
                      </button>
                      <a href="/pt-BR/docs/Web" class="top-level-entry">
                        References
                      </a>
                      <ul
                        id="references-menu"
                        class="submenu references hidden inline-submenu-lg"
                        aria-labelledby="references-button"
                      >
                        <li class="apis-link-container mobile-only ">
                          <a href="/pt-BR/docs/Web" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">
                                Overview / Web Technology
                              </div>
                              <p class="submenu-item-description">
                                Web technology reference for developers
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="html-link-container ">
                          <a href="/pt-BR/docs/Web/HTML" class="submenu-item ">
                            <div class="submenu-icon html" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">HTML</div>
                              <p class="submenu-item-description">
                                Structure of content on the web
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="css-link-container ">
                          <a href="/pt-BR/docs/Web/CSS" class="submenu-item ">
                            <div class="submenu-icon css" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">CSS</div>
                              <p class="submenu-item-description">
                                Code used to describe document style
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="javascript-link-container ">
                          <a href="/pt-BR/docs/Web/JavaScript" class="submenu-item ">
                            <div class="submenu-icon javascript" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">JavaScript</div>
                              <p class="submenu-item-description">
                                General-purpose scripting language
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="http-link-container ">
                          <a href="/pt-BR/docs/Web/HTTP" class="submenu-item ">
                            <div class="submenu-icon http" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">HTTP</div>
                              <p class="submenu-item-description">
                                Protocol for transmitting web resources
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="apis-link-container ">
                          <a href="/pt-BR/docs/Web/API" class="submenu-item ">
                            <div class="submenu-icon apis" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Web APIs</div>
                              <p class="submenu-item-description">
                                Interfaces for building web applications
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="apis-link-container ">
                          <a
                            href="/pt-BR/docs/Mozilla/Add-ons/WebExtensions"
                            class="submenu-item "
                          >
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Web Extensions</div>
                              <p class="submenu-item-description">
                                Developing extensions for web browsers
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="apis-link-container desktop-only ">
                          <a href="/pt-BR/docs/Web" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Web Technology</div>
                              <p class="submenu-item-description">
                                Web technology reference for developers
                              </p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="top-level-entry-container">
                      <button
                        type="button"
                        id="guides-button"
                        class="top-level-entry menu-toggle"
                        aria-controls="guides-menu"
                        aria-expanded="false"
                      >
                        Guides
                      </button>
                      <a href="/pt-BR/docs/Learn" class="top-level-entry">
                        Guides
                      </a>
                      <ul
                        id="guides-menu"
                        class="submenu guides hidden inline-submenu-lg"
                        aria-labelledby="guides-button"
                      >
                        <li class="apis-link-container mobile-only ">
                          <a href="/pt-BR/docs/Learn" class="submenu-item ">
                            <div class="submenu-icon learn" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">
                                Overview / MDN Learning Area
                              </div>
                              <p class="submenu-item-description">
                                Learn web development
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="apis-link-container desktop-only ">
                          <a href="/pt-BR/docs/Learn" class="submenu-item ">
                            <div class="submenu-icon learn" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">MDN Learning Area</div>
                              <p class="submenu-item-description">
                                Learn web development
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="html-link-container ">
                          <a href="/pt-BR/docs/Learn/HTML" class="submenu-item ">
                            <div class="submenu-icon html" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">HTML</div>
                              <p class="submenu-item-description">
                                Learn to structure web content with HTML
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="css-link-container ">
                          <a href="/pt-BR/docs/Learn/CSS" class="submenu-item ">
                            <div class="submenu-icon css" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">CSS</div>
                              <p class="submenu-item-description">
                                Learn to style content using CSS
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class="javascript-link-container ">
                          <a href="/pt-BR/docs/Learn/JavaScript" class="submenu-item ">
                            <div class="submenu-icon javascript" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">JavaScript</div>
                              <p class="submenu-item-description">
                                Learn to run scripts in the browser
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class=" ">
                          <a href="/pt-BR/docs/Web/Accessibility" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Accessibility</div>
                              <p class="submenu-item-description">
                                Learn to make the web accessible to all
                              </p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="top-level-entry-container">
                      <button
                        type="button"
                        id="mdn-plus-button"
                        class="top-level-entry menu-toggle"
                        aria-controls="mdn-plus-menu"
                        aria-expanded="false"
                      >
                        Plus
                      </button>
                      <a href="/pt-BR/plus" class="top-level-entry">
                        Plus
                      </a>
                      <ul
                        id="mdn-plus-menu"
                        class="submenu mdn-plus hidden inline-submenu-lg"
                        aria-labelledby="mdn-plus-button"
                      >
                        <li class=" ">
                          <a href="/pt-BR/plus" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Overview</div>
                              <p class="submenu-item-description">
                                A customized MDN experience
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class=" ">
                          <a href="/pt-BR/plus/ai-help" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">AI Help (beta)</div>
                              <p class="submenu-item-description">
                                Get real-time assistance and support
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class=" ">
                          <a href="/pt-BR/plus/updates" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Updates</div>
                              <p class="submenu-item-description">
                                All browser compatibility updates at a glance
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class=" ">
                          <a
                            href="/en-US/plus/docs/features/overview"
                            class="submenu-item "
                          >
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">Documentation</div>
                              <p class="submenu-item-description">
                                Learn how to use MDN Plus
                              </p>
                            </div>
                          </a>
                        </li>
                        <li class=" ">
                          <a href="/en-US/plus/docs/faq" class="submenu-item ">
                            <div class="submenu-icon" />
                            <div class="submenu-content-container">
                              <div class="submenu-item-heading">FAQ</div>
                              <p class="submenu-item-description">
                                Frequently asked questions about MDN Plus
                              </p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="top-level-entry-container">
                      <a class="top-level-entry menu-link" href="/en-US/blog/">
                        Blog
                      </a>
                    </li>
                    <li class="top-level-entry-container">
                      <a class="top-level-entry menu-link" href="/pt-BR/play">
                        Play
                      </a>
                    </li>
                    <li class="top-level-entry-container">
                      <a class="top-level-entry menu-link" href="/en-US/plus/ai-help/">
                        AI Help <sup class="new beta">Beta</sup>
                      </a>
                    </li>
                  </ul>
                </nav>
                <div class="header-search">
                  <form
                    action="/pt-BR/search"
                    class="search-form search-widget"
                    id="top-nav-search-form"
                    role="search"
                  >
                    <label
                      id="top-nav-search-label"
                      html-for="top-nav-search-input"
                      class="visually-hidden"
                    >
                      Search MDN
                    </label>
                    <input
                      aria-activedescendant=""
                      aria-auto-complete="list"
                      aria-controls="top-nav-search-menu"
                      aria-expanded="false"
                      aria-labelledby="top-nav-search-label"
                      auto-complete="off"
                      id="top-nav-search-input"
                      role="combobox"
                      type="search"
                      class="search-input-field"
                      name="q"
                      placeholder="   "
                      required
                      default-value=""
                    />
                    <button
                      type="button"
                      class="button action has-icon clear-search-button"
                    >
                      <span class="button-wrap">
                        <span class="icon icon-cancel " />
                        <span class="visually-hidden">Clear search input</span>
                      </span>
                    </button>
                    <button type="submit" class="button action has-icon search-button">
                      <span class="button-wrap">
                        <span class="icon icon-search " />
                        <span class="visually-hidden">Search</span>
                      </span>
                    </button>
                    <div
                      id="top-nav-search-menu"
                      role="listbox"
                      aria-labelledby="top-nav-search-label"
                    />
                  </form>
                </div>
                <div class="theme-switcher-menu">
                  <button
                    type="button"
                    class="button action has-icon theme-switcher-menu small"
                    aria-haspopup="menu"
                  >
                    <span class="button-wrap">
                      <span class="icon icon-theme-os-default " />
                      Theme
                    </span>
                  </button>
                </div>
                <ul class="auth-container">
                  <li>
                    <a
                      href="/users/fxa/login/authenticate/?next=%2Fpt-BR%2F"
                      class="login-link"
                      rel="nofollow"
                    >
                      Log in
                    </a>
                  </li>
                  <li>
                    <a
                      href="/users/fxa/login/authenticate/?next=%2Fpt-BR%2F"
                      target="_self"
                      class="button primary mdn-plus-subscribe-link"
                    >
                      <span class="button-wrap">Sign up for free</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </header>
          <main id="content" role="main">
            <div class="homepage mdn-ui-body-m">
              <div class="homepage-hero dark">
                <section>
                  <h1>
                    Resources for <u>Developers</u>,<br /> by Developers
                  </h1>
                  <p>
                    Documenting web technologies, including CSS, HTML, and JavaScript,
                    since 2005.
                  </p>
                  <div class="homepage-hero-search">
                    <form
                      action="/pt-BR/search"
                      class="search-form search-widget"
                      id="hp-search-form"
                      role="search"
                    >
                      <label
                        id="hp-search-label"
                        html-for="hp-search-input"
                        class="visually-hidden"
                      >
                        Search MDN
                      </label>
                      <input
                        aria-activedescendant=""
                        aria-auto-complete="list"
                        aria-controls="hp-search-menu"
                        aria-expanded="false"
                        aria-labelledby="hp-search-label"
                        auto-complete="off"
                        id="hp-search-input"
                        role="combobox"
                        type="search"
                        class="search-input-field"
                        name="q"
                        placeholder="   "
                        required
                        default-value=""
                      />
                      <button
                        type="button"
                        class="button action has-icon clear-search-button"
                      >
                        <span class="button-wrap">
                          <span class="icon icon-cancel " />
                          <span class="visually-hidden">Clear search input</span>
                        </span>
                      </button>
                      <button type="submit" class="button action has-icon search-button">
                        <span class="button-wrap">
                          <span class="icon icon-search " />
                          <span class="visually-hidden">Search</span>
                        </span>
                      </button>
                      <div
                        id="hp-search-menu"
                        role="listbox"
                        aria-labelledby="hp-search-label"
                      />
                    </form>
                  </div>
                </section>
                <div class="mandala-container  homepage-hero-bg" aria-hidden="true">
                  <div class="mandala-translate mandala-rotate">
                    <div class="mandala-svg-container">
                      <svg
                        width={675}
                        height={675}
                        viewBox="0 0 675 675"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="mandala"
                      >
                        <title>Mandala</title>
                        <defs>
                          <path
                            d="M337.5,337.5 m-320,0 a320,320 0 1,1 640,0 a320,320 0 1,1 -640,0"
                            id="circle1"
                          />
                          <path
                            d="M337.5,337.5 m-280,0 a280,280 0 1,1 560,0 a280,280 0 1,1 -560,0"
                            id="circle2"
                          />
                          <path
                            d="M337.5,337.5 m-240,0 a240,240 0 1,1 480,0 a240,240 0 1,1 -480,0"
                            id="circle3"
                          />
                          <path
                            d="M337.5,337.5 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0"
                            id="circle4"
                          />
                          <path
                            d="M337.5,337.5 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"
                            id="circle5"
                          />
                        </defs>
                        <text dy={70} textLength={2010}>
                          <textPath textLength={2010} href="#circle1">
                            {' '}
                            /<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
                          </textPath>
                        </text>
                        <text dy={70} textLength={1760}>
                          <textPath textLength={1760} href="#circle2">
                            {' '}
                            +<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                          </textPath>
                        </text>
                        <text dy={70} textLength={1507}>
                          <textPath textLength={1507} href="#circle3">
                            <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'}
                          </textPath>
                        </text>
                        <text dy={70} textLength={1257}>
                          <textPath textLength={1257} href="#circle4">
                            {' '}
                            ../../ ../../ ../../ ../../ ../../ ../../ ../../
                          </textPath>
                        </text>
                        <text dy={70} textLength={1005}>
                          <textPath textLength={1005} href="#circle5">
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <section class="place hp-main" />
              <div class="featured-articles">
                <h2>Featured Articles</h2>
                <div class="tile-container">
                  <div class="article-tile">
                    <h3 class="tile-title">
                      <a href="/en-US/blog/regular-expressions-reference-updates/">
                        New reference pages on MDN for JavaScript regular expressions
                      </a>
                    </h3>
                    <p>
                      See the latest updates to the MDN reference pages about JavaScript
                      regular expressions, including new sections on sub-features and
                      browser compatibility information.
                    </p>
                  </div>
                  <div class="article-tile">
                    <h3 class="tile-title">
                      <a href="/en-US/blog/aria-accessibility-html-landmark-roles/">
                        Using HTML landmark roles to improve accessibility
                      </a>
                    </h3>
                    <p>
                      Learn what HTML landmark roles are, how they improve accessibility,
                      and how you can include them on your website effectively.
                    </p>
                  </div>
                  <div class="article-tile">
                    <a href="/en-US/docs/Web/API" class="tile-tag">
                      Web APIs
                    </a>
                    <h3 class="tile-title">
                      <a href="/en-US/docs/Web/API/Performance_API">Performance API</a>
                    </h3>
                    <p>
                      The Performance API is a group of standards used to measure the
                      performance of web applications.
                    </p>
                  </div>
                  <div class="article-tile">
                    <a href="/en-US/docs/Web/CSS" class="tile-tag">
                      CSS
                    </a>
                    <h3 class="tile-title">
                      <a href="/en-US/docs/Web/CSS/font-palette">font-palette</a>
                    </h3>
                    <p>
                      The font-palette CSS property allows specifying one of the many
                      palettes contained in a font that a user agent should use for the
                      font. Users can also override the values in a palette or create a
                      new palette by using the @font-palette-values at-rule.
                    </p>
                  </div>
                </div>
              </div>
              <section class="latest-news">
                <h2>Latest news</h2>
                <ul class="news-list">
                  <li class="news-item">
                    <p class="news-title">
                      <span>
                        <a href="https://blog.mozilla.org/en/products/mdn/responsibly-empowering-developers-with-ai-on-mdn/">
                          Responsibly empowering developers with AI on MDN
                        </a>
                      </span>
                      <span>
                        <a class="news-source" href="https://blog.mozilla.org/en/latest/">
                          blog.mozilla.org
                        </a>
                      </span>
                    </p>
                    <span class="news-date">2 months ago</span>
                  </li>
                  <li class="news-item">
                    <p class="news-title">
                      <span>
                        <a href="/en-US/blog/introducing-ai-help/">
                          Introducing AI Help: Your Trusted Companion for Web Development
                        </a>
                      </span>
                      <span>
                        <a class="news-source" href="/en-US/blog/">
                          developer.mozilla.org
                        </a>
                      </span>
                    </p>
                    <span class="news-date">3 months ago</span>
                  </li>
                  <li class="news-item">
                    <p class="news-title">
                      <span>
                        <a href="/en-US/blog/introducing-the-mdn-playground/">
                          Introducing the MDN Playground: Bring your code to life!
                        </a>
                      </span>
                      <span>
                        <a class="news-source" href="/en-US/blog/">
                          developer.mozilla.org
                        </a>
                      </span>
                    </p>
                    <span class="news-date">3 months ago</span>
                  </li>
                </ul>
              </section>
              <section class="recent-contributions">
                <h2>Recent contributions</h2>
                <ul class="contribution-list">
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/content/pull/29154">
                        Fix a level of a heading
                      </a>
                      <span>
                        <a class="request-repo" href="https://github.com/mdn/content">
                          mdn/content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">8 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/content/pull/29149">
                        Fix issue 22955: clarify description of destination property
                      </a>
                      <span>
                        <a class="request-repo" href="https://github.com/mdn/content">
                          mdn/content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">8 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/translated-content/pull/15644">
                        [ko]: add index.md for \`web/glossary/brotli_compression\`
                      </a>
                      <span>
                        <a
                          class="request-repo"
                          href="https://github.com/mdn/translated-content"
                        >
                          mdn/translated-content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">9 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/translated-content/pull/15262">
                        [ko] update translation to vibration api in Web API
                      </a>
                      <span>
                        <a
                          class="request-repo"
                          href="https://github.com/mdn/translated-content"
                        >
                          mdn/translated-content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">9 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/translated-content/pull/15602">
                        [ko] web/html/reference update
                      </a>
                      <span>
                        <a
                          class="request-repo"
                          href="https://github.com/mdn/translated-content"
                        >
                          mdn/translated-content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">9 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/translated-content/pull/15862">
                        Pointer Lock API: remove broken image link
                      </a>
                      <span>
                        <a
                          class="request-repo"
                          href="https://github.com/mdn/translated-content"
                        >
                          mdn/translated-content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">10 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/translated-content/pull/15360">
                        [ko]: revise files for \`web/glossary-n\`
                      </a>
                      <span>
                        <a
                          class="request-repo"
                          href="https://github.com/mdn/translated-content"
                        >
                          mdn/translated-content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">10 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/content/pull/29099">
                        link \`at\` and \`with\` together
                      </a>
                      <span>
                        <a class="request-repo" href="https://github.com/mdn/content">
                          mdn/content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">14 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/content/pull/29148">fix typos</a>
                      <span>
                        <a class="request-repo" href="https://github.com/mdn/content">
                          mdn/content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">18 hours ago</span>
                  </li>
                  <li class="request-item">
                    <p class="request-title">
                      <a href="https://github.com/mdn/content/pull/28962">
                        Detail about &lt;number&gt;s in rgb-related color functions and
                        glossary
                      </a>
                      <span>
                        <a class="request-repo" href="https://github.com/mdn/content">
                          mdn/content
                        </a>
                      </span>
                    </p>
                    <span class="request-date">a day ago</span>
                  </li>
                </ul>
              </section>
              <div class="contributor-spotlight dark">
                <div class="wrapper">
                  <div class="text-col">
                    <h3>Contributor Spotlight</h3>
                    <a class="contributor-name" href="/pt-BR/community/spotlight/yuji">
                      Yuji
                    </a>
                    <blockquote>
                      <span class="icon icon-quote " />
                      MDN Web Docs has the most up-to-date and accurate information and
                      the content is presented in an easy-to-understand manner. I also
                      like that it's available in many languages (very important!).
                    </blockquote>
                    <a href="/en-US/community" class="spotlight-cta">
                      Get involved →
                    </a>
                  </div>
                  <figure class="contributor-graphic">
                    <img
                      width={523}
                      height={323}
                      src="/assets/mdn_contributor.png"
                      alt="Tiled Mozilla Logo"
                    />
                  </figure>
                </div>
                <div class="mandala-container  " aria-hidden="true">
                  <div class="mandala-translate ">
                    <div class="mandala-svg-container">
                      <svg
                        width={675}
                        height={675}
                        viewBox="0 0 675 675"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="mandala"
                      >
                        <title>Mandala</title>
                        <defs>
                          <path
                            d="M337.5,337.5 m-320,0 a320,320 0 1,1 640,0 a320,320 0 1,1 -640,0"
                            id="circle1"
                          />
                          <path
                            d="M337.5,337.5 m-280,0 a280,280 0 1,1 560,0 a280,280 0 1,1 -560,0"
                            id="circle2"
                          />
                          <path
                            d="M337.5,337.5 m-240,0 a240,240 0 1,1 480,0 a240,240 0 1,1 -480,0"
                            id="circle3"
                          />
                          <path
                            d="M337.5,337.5 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0"
                            id="circle4"
                          />
                          <path
                            d="M337.5,337.5 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"
                            id="circle5"
                          />
                        </defs>
                        <text dy={70} textLength={2010}>
                          <textPath textLength={2010} href="#circle1">
                            {' '}
                            /<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan> /
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
                          </textPath>
                        </text>
                        <text dy={70} textLength={1760}>
                          <textPath textLength={1760} href="#circle2">
                            {' '}
                            +<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan> +
                            <tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                          </textPath>
                        </text>
                        <text dy={70} textLength={1507}>
                          <textPath textLength={1507} href="#circle3">
                            <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'} <tspan>{'{'}</tspan>
                            {'{'}
                            <tspan>{'{'}</tspan>
                            {'{'} <tspan>{'}'}</tspan>
                            {'}'}
                            <tspan>{'}'}</tspan>
                            {'}'}
                          </textPath>
                        </text>
                        <text dy={70} textLength={1257}>
                          <textPath textLength={1257} href="#circle4">
                            {' '}
                            ../../ ../../ ../../ ../../ ../../ ../../ ../../
                          </textPath>
                        </text>
                        <text dy={70} textLength={1005}>
                          <textPath textLength={1005} href="#circle5">
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>
                            &lt;/&gt;<tspan>&lt;&gt;</tspan>&lt;/&gt;
                            <tspan>&lt;&gt;</tspan>&lt;/&gt;
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <section class="place hp-main" />
            </div>
          </main>
        </div>
        <footer id="nav-footer" class="page-footer">
          <div class="page-footer-grid">
            <div class="page-footer-logo-col">
              <a href="/" class="mdn-footer-logo" aria-label="MDN homepage">
                <svg
                  width={48}
                  height={17}
                  viewBox="0 0 48 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title id="mdn-footer-logo-svg">MDN logo</title>
                  <path
                    d="M20.04 16.512H15.504V10.416C15.504 9.488 15.344 8.824 15.024 8.424C14.72 8.024 14.264 7.824 13.656 7.824C12.92 7.824 12.384 8.064 12.048 8.544C11.728 9.024 11.568 9.64 11.568 10.392V14.184H13.008V16.512H8.472V10.416C8.472 9.488 8.312 8.824 7.992 8.424C7.688 8.024 7.232 7.824 6.624 7.824C5.872 7.824 5.336 8.064 5.016 8.544C4.696 9.024 4.536 9.64 4.536 10.392V14.184H6.6V16.512H0V14.184H1.44V8.04H0.024V5.688H4.536V7.32C5.224 6.088 6.32 5.472 7.824 5.472C8.608 5.472 9.328 5.664 9.984 6.048C10.64 6.432 11.096 7.016 11.352 7.8C11.992 6.248 13.168 5.472 14.88 5.472C15.856 5.472 16.72 5.776 17.472 6.384C18.224 6.992 18.6 7.936 18.6 9.216V14.184H20.04V16.512Z"
                    fill="currentColor"
                  />
                  <path
                    d="M33.6714 16.512H29.1354V14.496C28.8314 15.12 28.3834 15.656 27.7914 16.104C27.1994 16.536 26.4154 16.752 25.4394 16.752C24.0154 16.752 22.8954 16.264 22.0794 15.288C21.2634 14.312 20.8554 12.984 20.8554 11.304C20.8554 9.688 21.2554 8.312 22.0554 7.176C22.8554 6.04 24.0634 5.472 25.6794 5.472C26.5594 5.472 27.2794 5.648 27.8394 6C28.3994 6.352 28.8314 6.8 29.1354 7.344V2.352H26.9754V0H32.2314V14.184H33.6714V16.512ZM29.1354 11.04V10.776C29.1354 9.88 28.8954 9.184 28.4154 8.688C27.9514 8.176 27.3674 7.92 26.6634 7.92C25.9754 7.92 25.3674 8.176 24.8394 8.688C24.3274 9.2 24.0714 10.008 24.0714 11.112C24.0714 12.152 24.3114 12.944 24.7914 13.488C25.2714 14.032 25.8394 14.304 26.4954 14.304C27.3114 14.304 27.9514 13.96 28.4154 13.272C28.8954 12.584 29.1354 11.84 29.1354 11.04Z"
                    fill="currentColor"
                  />
                  <path
                    d="M47.9589 16.512H41.9829V14.184H43.4229V10.416C43.4229 9.488 43.2629 8.824 42.9429 8.424C42.6389 8.024 42.1829 7.824 41.5749 7.824C40.8389 7.824 40.2709 8.056 39.8709 8.52C39.4709 8.968 39.2629 9.56 39.2469 10.296V14.184H40.6869V16.512H34.7109V14.184H36.1509V8.04H34.5909V5.688H39.2469V7.344C39.9669 6.096 41.1269 5.472 42.7269 5.472C43.7509 5.472 44.6389 5.776 45.3909 6.384C46.1429 6.992 46.5189 7.936 46.5189 9.216V14.184H47.9589V16.512Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <p>Your blueprint for a better internet.</p>
              <ul class="social-icons">
                <li>
                  <a
                    class="icon icon-twitter"
                    href="https://twitter.com/mozdevnet"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span class="visually-hidden">MDN on Twitter</span>
                  </a>
                </li>
                <li>
                  <a
                    class="icon icon-github-mark-small"
                    href="https://github.com/mdn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span class="visually-hidden">MDN on GitHub</span>
                  </a>
                </li>
                <li>
                  <a class="icon icon-feed" href="/en-US/blog/rss.xml" target="_blank">
                    <span class="visually-hidden">MDN Blog RSS Feed</span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="page-footer-nav-col-1">
              <h2 class="footer-nav-heading">MDN</h2>
              <ul class="footer-nav-list">
                <li class="footer-nav-item">
                  <a href="/en-US/about">About</a>
                </li>
                <li class="footer-nav-item">
                  <a href="/en-US/blog/">Blog</a>
                </li>
                <li class="footer-nav-item">
                  <a
                    href="https://www.mozilla.org/en-US/careers/listings/?team=Marketing"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Careers
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a href="/en-US/advertising">Advertise with us</a>
                </li>
              </ul>
            </div>
            <div class="page-footer-nav-col-2">
              <h2 class="footer-nav-heading">Support</h2>
              <ul class="footer-nav-list">
                <li class="footer-nav-item">
                  <a
                    class="footer-nav-link"
                    href="https://support.mozilla.org/products/mdn-plus"
                  >
                    Product help
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a class="footer-nav-link" href="/pt-BR/docs/MDN/Community/Issues">
                    Report an issue
                  </a>
                </li>
              </ul>
            </div>
            <div class="page-footer-nav-col-3">
              <h2 class="footer-nav-heading">Our communities</h2>
              <ul class="footer-nav-list">
                <li class="footer-nav-item">
                  <a class="footer-nav-link" href="/en-US/community">
                    MDN Community
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a
                    class="footer-nav-link"
                    href="https://discourse.mozilla.org/c/mdn/236"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MDN Forum
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a
                    class="footer-nav-link"
                    href="https://discord.gg/hkGN8VKvvD"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MDN Chat
                  </a>
                </li>
              </ul>
            </div>
            <div class="page-footer-nav-col-4">
              <h2 class="footer-nav-heading">Developers</h2>
              <ul class="footer-nav-list">
                <li class="footer-nav-item">
                  <a class="footer-nav-link" href="/pt-BR/docs/Web">
                    Web Technologies
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a class="footer-nav-link" href="/pt-BR/docs/Learn">
                    Learn Web Development
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a class="footer-nav-link" href="/pt-BR/plus">
                    MDN Plus
                  </a>
                </li>
                <li class="footer-nav-item">
                  <a
                    href="https://hacks.mozilla.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hacks Blog
                  </a>
                </li>
              </ul>
            </div>
            <div class="page-footer-moz">
              <a
                href="https://www.mozilla.org/"
                class="footer-moz-logo-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width={112}
                  height={32}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title id="mozilla-footer-logo-svg">Mozilla logo</title>
                  <path
                    d="M41.753 14.218c-2.048 0-3.324 1.522-3.324 4.157 0 2.423 1.119 4.286 3.29 4.286 2.082 0 3.447-1.678 3.447-4.347 0-2.826-1.522-4.096-3.413-4.096Zm54.89 7.044c0 .901.437 1.618 1.645 1.618 1.427 0 2.949-1.024 3.044-3.352-.649-.095-1.365-.185-2.02-.185-1.426-.005-2.668.397-2.668 1.92Z"
                    fill="currentColor"
                  />
                  <path
                    d="M0 0v32h111.908V0H0Zm32.56 25.426h-5.87v-7.884c0-2.423-.806-3.352-2.39-3.352-1.924 0-2.702 1.365-2.702 3.324v4.868h1.864v3.044h-5.864v-7.884c0-2.423-.806-3.352-2.39-3.352-1.924 0-2.702 1.365-2.702 3.324v4.868h2.669v3.044H6.642v-3.044h1.863v-7.918H6.642V11.42h5.864v2.11c.839-1.489 2.3-2.39 4.252-2.39 2.02 0 3.878.963 4.566 3.01.778-1.862 2.361-3.01 4.566-3.01 2.512 0 4.812 1.522 4.812 4.84v6.402h1.863v3.044h-.005Zm9.036.307c-4.314 0-7.296-2.635-7.296-7.106 0-4.096 2.484-7.481 7.514-7.481s7.481 3.38 7.481 7.29c0 4.472-3.228 7.297-7.699 7.297Zm22.578-.307H51.942l-.403-2.11 7.7-8.846h-4.376l-.621 2.17-2.888-.313.498-4.907h12.294l.313 2.11-7.767 8.852h4.533l.654-2.172 3.167.308-.872 4.908Zm7.99 0h-4.191v-5.03h4.19v5.03Zm0-8.976h-4.191v-5.03h4.19v5.03Zm2.618 8.976 6.054-21.358h3.945l-6.054 21.358h-3.945Zm8.136 0 6.048-21.358h3.945l-6.054 21.358h-3.939Zm21.486.307c-1.863 0-2.887-1.085-3.072-2.792-.805 1.427-2.232 2.792-4.498 2.792-2.02 0-4.314-1.085-4.314-4.006 0-3.447 3.323-4.253 6.518-4.253.778 0 1.584.034 2.3.124v-.465c0-1.427-.034-3.133-2.3-3.133-.84 0-1.488.061-2.143.402l-.453 1.578-3.195-.34.549-3.224c2.45-.996 3.692-1.27 5.992-1.27 3.01 0 5.556 1.55 5.556 4.75v6.083c0 .805.314 1.085.963 1.085.184 0 .375-.034.587-.095l.034 2.11a5.432 5.432 0 0 1-2.524.654Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <ul class="footer-moz-list">
                <li class="footer-moz-item">
                  <a
                    href="https://www.mozilla.org/privacy/websites/"
                    class="footer-moz-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website Privacy Notice
                  </a>
                </li>
                <li class="footer-moz-item">
                  <a
                    href="https://www.mozilla.org/privacy/websites/#cookies"
                    class="footer-moz-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cookies
                  </a>
                </li>
                <li class="footer-moz-item">
                  <a
                    href="https://www.mozilla.org/about/legal/terms/mozilla"
                    class="footer-moz-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Legal
                  </a>
                </li>
                <li class="footer-moz-item">
                  <a
                    href="https://www.mozilla.org/about/governance/policies/participation/"
                    class="footer-moz-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Community Participation Guidelines
                  </a>
                </li>
              </ul>
            </div>
            <div class="page-footer-legal">
              <p id="license" class="page-footer-legal-text">
                Visit{/* */}{' '}
                <a
                  href="https://www.mozilla.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mozilla Corporation’s
                </a>{' '}
                {/* */}not-for-profit parent, the{/* */}{' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://foundation.mozilla.org/"
                >
                  Mozilla Foundation
                </a>
                .<br />
                Portions of this content are ©1998–{/* */}2023{/* */} by individual
                mozilla.org contributors. Content available under
                {/* */}{' '}
                <a href="/pt-BR/docs/MDN/Writing_guidelines/Attrib_copyright_license">
                  a Creative Commons license
                </a>
                .
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>`;
}
