import styles from './HeroInteractive.module.scss';

export default function HeroInteractive() {
  return (
    <div className={styles.wrapper}>
      {/* Doug turtle at bottom left */}
      <img
        className={styles.logo}
        src="https://kitajs.org/doug-pc-glasses.svg"
        alt="Doug the Kita turtle"
      />
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />

      {/* VSCode Editor Mockup */}
      <div className={styles.container}>
        {/* VSCode Title Bar with macOS traffic lights */}
        <div className={styles.titleBar}>
          <div className={styles.trafficLights}>
            <span style={{ background: '#ff5f56' }} />
            <span style={{ background: '#ffbd2e' }} />
            <span style={{ background: '#27c93f' }} />
          </div>
          <div className={styles.titleBarCenter}>index.tsx - KitaJS Html</div>
          <div className={styles.titleBarRight} />
        </div>

        {/* VSCode Main Area */}
        <div className={styles.editorBody}>
          {/* VSCode Activity Bar (left icons) */}
          <div className={styles.activityBar}>
            <div className={`${styles.activityIcon} ${styles.active}`} />
            <div className={styles.activityIcon} />
            <div className={styles.activityIcon} />
            <div className={styles.activityIcon} />
          </div>

          {/* VSCode Sidebar (File Explorer) */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>EXPLORER</div>
            <div className={styles.fileTree}>
              <div className={`${styles.file} ${styles.active}`}>
                <span>📄</span> index.tsx
              </div>
              <div className={styles.file}>
                <span>📄</span> package.json
              </div>
              <div className={styles.file}>
                <span>📄</span> tsconfig.json
              </div>
            </div>
          </div>

          {/* VSCode Editor Area */}
          <div className={styles.editorArea}>
            {/* Editor Tabs */}
            <div className={styles.editorTabs}>
              <div className={`${styles.tab} ${styles.activeTab}`}>
                <span>📄</span>
                <span>index.tsx</span>
                <span className={styles.tabClose}>×</span>
              </div>
            </div>

            {/* Code Editor */}
            <div className={styles.codeEditor}>
              <div className={styles.lineNumbers}>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
              </div>
              <div className={styles.codeContent}>
                <div>
                  <span className={styles.variable}>fs</span>
                  <span className={styles.punctuation}>.</span>
                  <span className={styles.function}>writeFileSync</span>
                  <span className={styles.punctuation}>(</span>
                </div>
                <div>
                  {'  '}
                  <span className={styles.string}>'index.html'</span>
                  <span className={styles.punctuation}>,</span>
                </div>
                <div>
                  {'  '}
                  <span className={styles.jsx}>&lt;p&gt;</span>
                </div>
                <div>
                  {'    '}Hello, <span className={styles.jsx}>&lt;b&gt;</span>world
                  <span className={styles.jsx}>&lt;/b&gt;</span>!
                </div>
                <div>
                  {'  '}
                  <span className={styles.jsx}>&lt;/p&gt;</span>
                </div>
                <div>
                  <span className={styles.punctuation}>);</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
