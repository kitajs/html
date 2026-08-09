import styles from './Banner.module.scss'

export function Banner() {
  return (
    <div className={styles.banner} role="banner">
      <span className="rp-not-doc">
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
    </div>
  )
}
