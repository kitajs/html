import { Badge } from '@rspress/core/theme-original'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './KitaCodeBlock.module.scss'

interface KitaCodeBlockProps {
  htmlOutput: string
  rawHtml: string // Reserved for future copy functionality
  children: React.ReactNode
}

interface KitaHtmlButtonProps {
  isActive: boolean
  onClick: () => void
}

// --- Global Discovery State (sessionStorage) ---

const DISCOVERED_KEY = 'kita-html-discovered'

function isDiscovered(): boolean {
  try {
    return sessionStorage.getItem(DISCOVERED_KEY) === '1'
  } catch (e) {
    return false
  }
}

function markDiscovered() {
  try {
    sessionStorage.setItem(DISCOVERED_KEY, '1')
  } catch (e) {
    // sessionStorage not available
  }
  // Trigger custom event so all instances can update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('kita-discovered'))
  }
}

// --- Components ---

export const KitaCodeSvg: React.FC = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ pointerEvents: 'none' }}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const KitaHtmlButton: React.FC<KitaHtmlButtonProps> = ({ isActive, onClick }) => {
  return (
    <button
      type="button"
      className={`rp-code-button-group__button ${styles.button} ${isActive ? styles.active : ''}`}
      title={isActive ? 'Hide HTML Output' : 'Show HTML Output'}
      aria-label={isActive ? 'Hide HTML Output' : 'Show HTML Output'}
      onClick={(e) => {
        if (!isActive) {
          e.currentTarget.blur()
        }
        onClick()
      }}
    >
      <KitaCodeSvg />
    </button>
  )
}

const KitaCodeBlock: React.FC<KitaCodeBlockProps> = ({ htmlOutput, children }) => {
  // Per-instance toggle state
  const [showHtml, setShowHtml] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [buttonGroupEl, setButtonGroupEl] = useState<Element | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if discovery badge should be shown
  useEffect(() => {
    setShowBadge(!isDiscovered())

    // Listen for discovery events from other instances
    const handleDiscovery = () => {
      setShowBadge(false)
    }
    window.addEventListener('kita-discovered', handleDiscovery)
    return () => window.removeEventListener('kita-discovered', handleDiscovery)
  }, [])

  // Find the button group element for this specific code block (run once on mount)
  useEffect(() => {
    if (!containerRef.current) return

    // Query for the direct child code block only (not nested ones)
    const codeBlock = containerRef.current.querySelector(':scope > .rp-codeblock')
    if (!codeBlock) return

    // Find the button group that's a direct child of the code block content
    // (not nested inside Twoslash popups which also have code blocks with button groups!)
    const codeBlockContent = codeBlock.querySelector(':scope > .rp-codeblock__content')
    if (!codeBlockContent) return

    const buttonGroup = codeBlockContent.querySelector(':scope > .rp-code-button-group')
    if (!buttonGroup) return

    setButtonGroupEl(buttonGroup)
  }, [])

  const handleToggle = () => {
    setShowHtml(!showHtml)
  }

  const handleBadgeClick = () => {
    markDiscovered()
    setShowBadge(false)
    setShowHtml(true) // Open HTML output for this specific code block
  }

  return (
    <div
      className={`${styles.container} ${showHtml ? styles.showHtml : ''}`}
      ref={containerRef}
    >
      {children}
      {buttonGroupEl &&
        createPortal(
          <KitaHtmlButton isActive={showHtml} onClick={handleToggle} />,
          buttonGroupEl
        )}
      {showBadge && (
        <button
          type="button"
          className={styles.discoveryBadge}
          onClick={handleBadgeClick}
        >
          <Badge type="info" text="💡 Click to see HTML output" />
        </button>
      )}
      <div className={`${styles.htmlWrapper} ${showHtml ? styles.visible : ''}`}>
        <div className={styles.htmlContent}>
          <div className="rp-codeblock language-html">
            <div className="rp-codeblock__content">
              <div
                className="rp-codeblock__content__scroll-container rp-scrollbar rp-scrollbar--always"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KitaCodeBlock
