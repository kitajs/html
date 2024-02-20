// This file is a result from https://alpinejs.dev/
// Missing something? Please submit a issue report or a PR:
// https://github.com/kitajs/html

declare namespace JSX {
  interface HtmlTag extends Alpine.Attributes {}
}

declare namespace Alpine {
  /** Definitions for Alpine.js attributes. */
  interface Attributes {
    /**
     * Adds behavior to an element to make it interactive.
     *
     * @see https://alpinejs.dev/directives/data
     */
    'x-data'?: string;

    /**
     * Initializes Alpine.js and defines the scope for reactive properties and methods within an element or its children.
     *
     * @see https://alpinejs.dev/directives/init
     */
    'x-init'?: string;

    /**
     * Conditionally shows or hides an element based on a boolean expression.
     *
     * @see https://alpinejs.dev/directives/show
     */
    'x-show'?: string;

    /**
     * Conditionally renders elements based on the truthiness of a given expression.
     *
     * @see https://alpinejs.dev/directives/if
     */
    'x-if'?: string;

    /**
     * Loops through an array or an object and generates HTML for each item.
     *
     * @see https://alpinejs.dev/directives/for
     */
    'x-for'?: string;

    /**
     * Binds an attribute or property to a JavaScript expression.
     *
     * @see https://alpinejs.dev/directives/bind
     */
    'x-bind'?: string;

    /**
     * Two-way data binding for form elements.
     *
     * @see https://alpinejs.dev/directives/model
     */
    'x-model'?: string;

    /**
     * Attaches event listeners to elements.
     *
     * @see https://alpinejs.dev/directives/on
     */
    'x-on'?: string;

    /**
     * Creates a reference to an element, allowing you to access it in JavaScript code.
     *
     * @see https://alpinejs.dev/directives/ref
     */
    'x-ref'?: string;

    /**
     * Updates the text content of an element based on a JavaScript expression.
     *
     * @see https://alpinejs.dev/directives/text
     */
    'x-text'?: string;

    /**
     * Updates the inner HTML of an element based on a JavaScript expression.
     *
     * @see https://alpinejs.dev/directives/html
     */
    'x-html'?: string;

    /**
     * Adds transition effects to elements when they are inserted, updated, or removed from the DOM.
     *
     * @see https://alpinejs.dev/directives/transition
     */
    'x-transition'?: string;

    /**
     * Adds a side-effect to an element, such as executing a function or modifying data.
     *
     * @see https://alpinejs.dev/directives/effect
     */
    'x-effect'?: string;

    /**
     * Instructs Alpine.js to ignore an element and its children during initialization.
     *
     * @see https://alpinejs.dev/directives/ignore
     */
    'x-ignore'?: string;

    /**
     * Hides an element until Alpine.js is initialized to prevent the unstyled content from being displayed.
     *
     * @see https://alpinejs.dev/directives/cloak
     */
    'x-cloak'?: string;

    /**
     * Teleports an element to a different location in the DOM.
     *
     * @see https://alpinejs.dev/directives/teleport
     */
    'x-teleport'?: string;

    /**
     * Sets a unique identifier for an element.
     *
     * @see https://alpinejs.dev/directives/id
     */
    'x-id'?: string;
  }
}
