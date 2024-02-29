// This file is a result from https://turbo.hotwired.dev/
// Missing something? Please submit a issue report or a PR:
// https://github.com/kitajs/html

declare namespace JSX {
  interface HtmlTag extends HotwireTurbo.Attributes {}
  interface IntrinsicElements extends HotwireTurbo.Elements {}
}

declare namespace HotwireTurbo {
  interface TurboFrameTag extends JSX.HtmlTag {
    id: string;
    /**
     * Scroll to Turbo frame element after load Control the vertical alignment with
     * data-autoscroll-block
     */
    autoscroll?: boolean;
    target?: '_top' | Omit<string, '_top'>;
    /** Accepts a URL or path value that controls navigation of the element */
    src?: string;
    /**
     * When loading="eager", changes to the src attribute will immediately navigate the
     * element. When loading="lazy", changes to the src attribute will defer navigation
     * until the element is visible in the viewport.
     *
     * @default { eager }
     */
    loading?: 'eager' | 'lazy';
    /**
     * Controls the autoscroll vertical alignment
     *
     * @default { end }
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#parameters}
     */
    ['data-autoscroll-block']?: 'end' | 'start' | 'center' | 'nearest';
    /**
     * Controls the autoscroll behavior
     *
     * @default { end }
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#parameters}
     */
    ['data-autoscroll-behavior']?: 'auto' | 'smooth';
  }

  interface TurboStreamTag extends JSX.HtmlTag {
    action: 'append' | 'prepend' | 'replace' | 'update' | 'remove' | 'before' | 'after';
    target?: string;
    targets?: string;
  }

  interface Elements {
    ['turbo-frame']: TurboFrameTag;
    ['turbo-stream']: TurboStreamTag;
  }

  /**
   * Turbo data attributes to add to every element This adds strong typing and
   * documentation to these tags
   */
  interface Attributes {
    /**
     * False: disables Turbo Drive on links and forms including descendants. Use "true" to
     * renable when an ancestor has opted out
     */
    ['data-turbo']?: 'true' | 'false';

    /** Tracks the element’s HTML and performs a full page reload when it changes */
    ['data-turbo-track']?: 'reload';

    /** Identifies the Turbo Frame to navigate. */
    ['data-turbo-frame']?: string;
    /**
     * Customizes the Turbo.visit action.
     *
     * "Replace" will visit a link without pushing a new history entry onto the stack. It
     * will discard your current location in the history stack.
     */
    ['data-turbo-action']?: 'replace' | 'advance';
    /**
     * Persists element between page loads
     *
     * The element **must** have an id
     *
     * @link {https://turbo.hotwired.dev/handbook/building#persisting-elements-across-page-loads}
     */
    ['data-turbo-permanent']?: boolean;
    /**
     * Removes the element before the document is cached, preventing it from reappearing
     * when restored.
     */
    ['data-turbo-temporary']?: boolean;
    /** Prevents inline scripts from being re-evaluated on Visits. */
    ['data-turbo-eval']?: 'false';
    /**
     * Changes the request link method from the default "GET" request You should prefer a
     * form in most cases
     */
    ['data-turbo-method']?: string;

    /**
     * Specifies that a link/form can accept a turbo stream response
     *
     * Turbo will automatically request Turbo streams on Form submissions for non GETs
     *
     * This is useful when trying to request turbo streams on GET requests
     */
    ['data-turbo-stream']?: boolean;
    /**
     * Presents a confirm dialog with the given value. This can be used on form elements
     * or links with the data-turbo-method attribute.
     */
    ['data-turbo-confirm']?: string;
    /**
     * Specifies text to display when submitting a form. Can be used on input or button
     * elements. While the form is submitting, the text of the element will show with this
     * value.
     *
     * After submission, the original text will be restored.
     *
     * Useful for feedback like "Saving..." while an operation is in progress
     */
    ['data-turbo-submits-with']?: string;
  }
}
