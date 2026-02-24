import { useEffect, useState } from 'react';
import styles from './Banner.module.scss';

const STORAGE_KEY = 'kita-v5-banner-dismissed';

export function Banner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="banner">
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
