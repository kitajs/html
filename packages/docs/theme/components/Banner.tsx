import { useEffect, useRef, useState } from 'react';
import styles from './Banner.module.scss';

const STORAGE_KEY = 'kita-v5-banner-dismissed';

export function Banner() {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!ref.current) {
      document.documentElement.style.setProperty('--rp-banner-height', '0px');
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        '--rp-banner-height',
        `${entry?.contentRect.height}px`
      );
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div ref={ref} className={styles.banner} role="banner">
      <span>
        You are viewing documentation for the upcoming{' '}
        <a
          href="https://github.com/kitajs/html/tree/next"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>v5</strong>
        </a>{' '}
        release. For the current stable version, see the{' '}
        <a
          href="https://www.npmjs.com/package/@kitajs/html"
          target="_blank"
          rel="noopener noreferrer"
        >
          v4 readme on npm
        </a>
        .
      </span>
      <button onClick={dismiss} aria-label="Dismiss" className={styles.close}>
        ×
      </button>
    </div>
  );
}
