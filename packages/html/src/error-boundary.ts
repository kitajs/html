import { setTimeout } from 'node:timers/promises';
import type { Children } from './index.js';
import { contentToString } from './index.js';

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
   *
   * If the timeout gets triggered, it will throw an {@linkcode HtmlTimeout} error.
   */
  catch: JSX.Element | ((error: unknown) => JSX.Element);

  /**
   * If we should use the catch error boundary if the children takes longer than the
   * timeout. Use `undefined` or `0` to disable the timeout.
   */
  timeout?: number;

  /**
   * The error class we should throw if the timeout gets triggered. Defaults to
   * {@linkcode HtmlTimeout}
   */
  error?: { reject(): never };
}

/** A component that adds an error boundary to catch any inner promise rejection. */
export function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element {
  // Joins the content into a string or promise of string
  let children = contentToString(props.children);

  // Sync children, just render them
  if (typeof children === 'string') {
    return children;
  }

  // Adds race condition to children
  if (props.timeout) {
    children = Promise.race([
      children,
      setTimeout(props.timeout).then((props.error || HtmlTimeout).reject)
    ]);
  }

  // If the error boundary itself throws another error, there's nothing
  // we can do, so we just re-throw it.
  return children.catch(function errorBoundary(error) {
    if (typeof props.catch === 'function') {
      return props.catch(error);
    }

    return props.catch;
  });
}

/** An error thrown by the ErrorBoundary's `timeout` property. */
export class HtmlTimeout extends Error {
  /** Throws the error. */
  static reject(): never {
    throw new HtmlTimeout('Children timed out.');
  }
}
