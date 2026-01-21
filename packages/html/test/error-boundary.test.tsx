import { setTimeout } from 'timers/promises';
import { describe, expect, it } from 'vitest';
import { ErrorBoundary, HtmlTimeout } from '../src/error-boundary.js';

describe('Error Boundary', () => {
  it('should render error boundary', async () => {
    try {
      await (<div>{Promise.reject(<div>2</div>)}</div>);
      throw new Error('should throw');
    } catch (error) {
      expect(error).toMatchInlineSnapshot(`"<div>2</div>"`);
    }

    try {
      const html = await (
        <>
          <ErrorBoundary catch={<div>1</div>}>
            {Promise.reject(<div>2</div>)}
          </ErrorBoundary>
        </>
      );

      expect(html).toMatchInlineSnapshot(`"<div>1</div>"`);
    } catch {
      throw new Error('should not throw');
    }
  });

  it('should render error boundary as function', async () => {
    const html = await (
      <>
        <ErrorBoundary catch={(html) => <div>{String(html)}</div>}>
          {Promise.reject('my error')}
        </ErrorBoundary>
      </>
    );

    expect(html).toMatchInlineSnapshot(`"<div>my error</div>"`);
  });

  it('Catches timed out promise', async () => {
    const html = await (
      <>
        <ErrorBoundary catch={<div>1</div>} timeout={10}>
          {setTimeout(100, <div>2</div>)}
        </ErrorBoundary>
      </>
    );

    expect(html).toMatchInlineSnapshot(`"<div>1</div>"`);
  });

  it('Renders non timed out promise', async () => {
    const html = await (
      <>
        <ErrorBoundary catch={<div>1</div>} timeout={100}>
          {setTimeout(10, <div>2</div>)}
        </ErrorBoundary>
      </>
    );

    expect(html).toMatchInlineSnapshot(`"<div>2</div>"`);
  });

  it('Catches timed out promise', async () => {
    const html = await (
      <>
        <ErrorBoundary
          catch={(err) => {
            expect(err instanceof HtmlTimeout).toBeTruthy();
            return <div>1</div>;
          }}
          timeout={10}
        >
          {setTimeout(100, <div>2</div>)}
        </ErrorBoundary>
      </>
    );

    expect(html).toMatchInlineSnapshot(`"<div>1</div>"`);
  });

  it('doesnt do nothing on sync children', () => {
    const html = (
      <>
        <ErrorBoundary catch={<div>1</div>}>
          <div>2</div>
        </ErrorBoundary>
      </>
    );

    expect(html).toMatchInlineSnapshot(`"<div>2</div>"`);
  });
});
