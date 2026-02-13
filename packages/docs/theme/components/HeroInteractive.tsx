import { useState } from 'react';
import styles from './HeroInteractive.module.scss';

// Import file icons
import HtmlIcon from 'material-icon-theme/icons/html.svg?raw';
import ReactTsIcon from 'material-icon-theme/icons/react_ts.svg?raw';

// Helper component to render raw SVG
const FileIcon = ({ svg, className = '' }: { svg: string; className?: string }) => (
  <span
    className={className}
    style={{ display: 'inline-flex', width: '16px', height: '16px' }}
    dangerouslySetInnerHTML={{ __html: svg }}
  />
);

export default function HeroInteractive() {
  const [activeTab, setActiveTab] = useState<'index.tsx' | 'output.html'>('index.tsx');
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
          <div className={styles.titleBarCenter}>{activeTab} - KitaJS Html</div>
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
              <div
                className={`${styles.file} ${activeTab === 'index.tsx' ? styles.active : ''}`}
                onClick={() => setActiveTab('index.tsx')}
                style={{ cursor: 'pointer' }}
              >
                <FileIcon svg={ReactTsIcon} /> index.tsx
              </div>
              <div
                className={`${styles.file} ${activeTab === 'output.html' ? styles.active : ''}`}
                onClick={() => setActiveTab('output.html')}
                style={{ cursor: 'pointer' }}
              >
                <FileIcon svg={HtmlIcon} /> output.html
              </div>
            </div>
          </div>

          {/* VSCode Editor Area */}
          <div className={styles.editorArea}>
            {/* Editor Tabs */}
            <div className={styles.editorTabs}>
              <div
                className={`${styles.tab} ${activeTab === 'index.tsx' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('index.tsx')}
                style={{ cursor: 'pointer' }}
              >
                <FileIcon svg={ReactTsIcon} />
                <span>index.tsx</span>
                <span className={styles.tabClose}>×</span>
              </div>
              <div
                className={`${styles.tab} ${activeTab === 'output.html' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('output.html')}
                style={{ cursor: 'pointer' }}
              >
                <FileIcon svg={HtmlIcon} />
                <span>output.html</span>
                <span className={styles.tabClose}>×</span>
              </div>
            </div>

            {/* Code Editor */}
            <div className={styles.codeEditor}>
              {activeTab === 'index.tsx' ? (
                <>
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
                      <span className={styles.string}>'output.html'</span>
                      <span className={styles.punctuation}>,</span>
                    </div>
                    <div>
                      {'  '}
                      <span className={styles.jsx}>&lt;p&gt;</span>
                    </div>
                    <div>
                      {'    '}Hello, <span className={styles.jsx}>&lt;b&gt;</span>
                      <span className={styles.punctuation}>{'{'}</span>
                      <span className={styles.variable}>user.name</span>
                      <span className={styles.punctuation}>{'}'}</span>
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
                </>
              ) : (
                <>
                  <div className={styles.lineNumbers}>
                    <div>1</div>
                    <div>2</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                  </div>
                  <div className={styles.codeContent}>
                    <div>
                      <span className={styles.jsx}>&lt;p&gt;</span>
                      Hello, <span className={styles.jsx}>&lt;b&gt;</span>
                      Arthur
                      <span className={styles.jsx}>&lt;/b&gt;</span>!
                      <span className={styles.jsx}>&lt;/p&gt;</span>
                    </div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                    <div>{'\u00A0'}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
