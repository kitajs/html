import type { Children } from '.';

/** A component that adds an error boundary to catch any inner promise rejection. */
export function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element;

/**
 * Checks if the error is a timeout error thrown by the ErrorBoundary's `timeout`
 * property.
 *
 * @param error The error to check.
 */
export function isTimeoutError(error: unknown): error is Error & { message: 'timeout' };

/**
 * The props for the `ErrorBoundary` component.
 *
 * @see {@linkcode ErrorBoundary}
 */
export interface ErrorBoundaryProps {
  /** The async children to render as soon as they are ready. */
  children: Children;

  /**
   * The error boundary to use if the async children throw an error.
   *
   * The error will be string `timeout` if the rejection was caused by the `timeout`
   * property.
   */
  catch: JSX.Element | ((error: unknown) => JSX.Element);

  /**
   * If we should use the catch error boundary if the children takes longer than the
   * timeout. Use `undefined` or `0` to disable the timeout.
   */
  timeout?: number;
}
