// This file is a result from many sources, including: RFCs, typescript dom lib, w3schools, and others.
// Possibly there are many tags/attributes missing, but it is a good start.
// Missing something? Please submit a issue report or a PR:
// https://github.com/kitajs/html

/** Same as a string type but allows autocompletion of literal values */
type AnyString = string & {};

declare namespace JSX {
  /**
   * A {@linkcode JSX.Element} will always be a string, unless one of its children is a
   * promise, in which case all of its subsequent children will also be promises.
   *
   * Direct calls of `Html.createElement` uses correct return type based on its children.
   * However, when using JSX syntax, typescript does not support this yet.
   *
   * @see https://github.com/microsoft/TypeScript/issues/14729
   */
  type Element = string | Promise<string>;

  /**
   * The index signature was removed to enable closed typing for style using CSSType.
   * You're able to use type assertion or module augmentation to add properties or an
   * index signature of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
  type CSSProperties = import('csstype').Properties;

  interface HtmlTag extends ElementChildrenAttribute, IntrinsicAttributes {
    accesskey?: undefined | string;
    contenteditable?: undefined | string;
    inputmode?:
      | undefined
      | 'none'
      | 'text'
      | 'decimal'
      | 'numeric'
      | 'tel'
      | 'search'
      | 'email'
      | 'url'
      | AnyString;
    dir?: undefined | string;
    hidden?: undefined | string | boolean;
    id?: undefined | number | string;
    role?: undefined | string;
    lang?: undefined | string;
    draggable?: undefined | string | boolean;
    spellcheck?: undefined | string | boolean;
    tabindex?: undefined | number | string;
    title?: undefined | string;
    translate?: undefined | string | boolean;

    /** A css style attribute which also supports a `csstype` object. */
    style?: undefined | string | CSSProperties;

    /**
     * When set to true, all inner content (html or not) of this tag will be escaped when
     * evaluated.
     *
     * **Warning: This will escape even inner jsx tags. You should only use this in the
     * most inner tag of the html tree.**
     *
     * @example
     *
     * ```tsx
     * <div>{'<script />'}</div>
     * '<div><script /></div>'
     * <div safe>{'<script />'}</div>
     * '<div><script /></div>'
     * <div><div>{'<script />'}</div></div>
     * '<div><div><script /></div></div>'
     *
     * // Escapes even inner jsx tags
     * <div safe><div>{'<script />'}</div></div>
     * '<div><div><script /></div></div>'
     * ```
     *
     * @default false
     *
     * @see https://github.com/kitajs/html/tree/master/packages/html#sanitization
     */
    safe?: undefined | boolean;

    /**
     * Included here to work as a react drop-in replacement
     *
     * @deprecated Please use `class`.
     */
    className?: undefined | string;

    /**
     * The html class property. You can use an array to represent conditional class names.
     * Similar to the `clsx` package behavior.
     *
     * @example
     *
     * ```tsx
     * <div class={['a', true && 'b', false && 'c', 'd']} />
     * '<div class="a b d"></div>'
     *
     * <div class={['class-a class-b', true && 'class-c']} />
     * '<div class="class-a class-b class-c"></div>'
     * ```
     */
    class?: undefined | string | (string | number | null | boolean | undefined)[];

    /**
     * A custom property that can be used to avoid attributes escaping and allow custom
     * attributes syntax, such as `:` and `.` in their names.
     *
     * Objects are escaped normally, **strings ARE NOT escaped**.
     *
     * You can use a string or an object. When using a string, it will be used as the
     * attribute value. When using an object, it will be used as a key-value map of
     * attributes.
     *
     * @example
     *
     * ```tsx
     * <div attrs={{ 'data-attr': 'value"' }} />
     * '<div data-attr="value&#34;"></div>' // escapes
     *
     * <div attrs='a=1 b c=3 "' />
     * '<div a=1 b c=3 "></div>' // does NOT escape
     * ```
     */
    attrs?: undefined | object | string;
  }

  interface HtmlAnchorTag extends HtmlTag {
    href?: undefined | string;
    hreflang?: undefined | string;
    target?: undefined | string;
    download?: undefined | string;
    referrerpolicy?:
      | undefined
      | ''
      | 'no-referrer'
      | 'no-referrer-when-downgrade'
      | 'origin'
      | 'origin-when-cross-origin'
      | 'same-origin'
      | 'strict-origin'
      | 'strict-origin-when-cross-origin'
      | 'unsafe-url'
      | AnyString;
    ping?: undefined | string;
    rel?: undefined | string;
    media?: undefined | string;
    type?: undefined | string;
  }

  interface HtmlAreaTag extends HtmlTag {
    alt?: undefined | string;
    coords?: undefined | string;
    shape?: undefined | string;
    href?: undefined | string;
    target?: undefined | string;
    ping?: undefined | string;
    rel?: undefined | string;
    media?: undefined | string;
    hreflang?: undefined | string;
    type?: undefined | string;
  }

  interface HtmlAudioTag extends HtmlTag {
    src?: undefined | string;
    autobuffer?: undefined | string;
    autoplay?: undefined | boolean;
    preload?: undefined | string;
    muted?: undefined | boolean;
    loop?: undefined | boolean;
    controls?: undefined | string;
  }

  interface BaseTag extends HtmlTag {
    href?: undefined | string;
    target?: undefined | string;
  }

  interface HtmlQuoteTag extends HtmlTag {
    cite?: undefined | string;
  }

  interface HtmlBodyTag extends HtmlTag {}

  interface HtmlButtonTag extends HtmlTag {
    action?: undefined | string;
    autofocus?: undefined | string;
    disabled?: undefined | boolean;
    enctype?: undefined | string;
    form?: undefined | string;
    method?: undefined | string;
    name?: undefined | string;
    novalidate?: undefined | string | boolean;
    target?: undefined | string;
    type?: undefined | string;
    value?: undefined | string;
    formaction?: undefined | string;
    formenctype?: undefined | string;
    formmethod?: undefined | string;
    formnovalidate?: undefined | string | boolean;
    formtarget?: undefined | string;
    popovertarget?: undefined | string;
    popovertargetaction?: undefined | string;
  }

  interface HtmlDataListTag extends HtmlTag {}

  interface HtmlCanvasTag extends HtmlTag {
    width?: undefined | string;
    height?: undefined | string;
  }

  interface HtmlTableColTag extends HtmlTag {
    span?: undefined | string;
  }

  interface HtmlTableSectionTag extends HtmlTag {}

  interface HtmlTableRowTag extends HtmlTag {}

  interface DataTag extends HtmlTag {
    value?: undefined | string;
  }

  interface HtmlEmbedTag extends HtmlTag, Record<string, any> {
    src?: undefined | string;
    type?: undefined | string;
    width?: undefined | string;
    height?: undefined | string;
  }

  interface HtmlFieldSetTag extends HtmlTag {
    disabled?: undefined | boolean;
    form?: undefined | string;
    name?: undefined | string;
  }

  interface HtmlFormTag extends HtmlTag {
    'accept-charset'?: undefined | string;
    action?: undefined | string;
    autocomplete?: undefined | string;
    enctype?: undefined | string;
    method?: undefined | string;
    name?: undefined | string;
    novalidate?: undefined | string | boolean;
    target?: undefined | string;
  }

  interface HtmlHtmlTag extends HtmlTag {
    manifest?: undefined | string;
  }

  interface HtmlIFrameTag extends HtmlTag {
    allow?: undefined | string;
    allowfullscreen?: undefined | boolean;
    allowpaymentrequest?: undefined | boolean;
    credentialless?: undefined | boolean;
    height?: undefined | string;
    loading?: undefined | string;
    name?: undefined | string;
    referrerpolicy?:
      | undefined
      | ''
      | 'no-referrer'
      | 'no-referrer-when-downgrade'
      | 'origin'
      | 'origin-when-cross-origin'
      | 'same-origin'
      | 'strict-origin'
      | 'strict-origin-when-cross-origin'
      | 'unsafe-url'
      | AnyString;
    sandbox?: undefined | boolean;
    src?: undefined | string;
    srcdoc?: undefined | string;
    seamless?: undefined | string;
    width?: undefined | string;
  }

  interface HtmlImageTag extends HtmlTag {
    alt?: undefined | string;
    src?: undefined | string;
    crossorigin?: undefined | string;
    usemap?: undefined | string;
    ismap?: undefined | string;
    width?: undefined | number | string;
    height?: undefined | number | string;
    decoding?: undefined | 'sync' | 'async' | 'auto' | AnyString;
    loading?: undefined | 'eager' | 'lazy' | AnyString;
    srcset?: undefined | string;
  }

  interface HtmlInputTag extends HtmlTag {
    accept?: undefined | string;
    action?: undefined | string;
    alt?: undefined | string;
    autocomplete?: undefined | string;
    autofocus?: undefined | string;
    checked?: undefined | boolean;
    disabled?: undefined | boolean;
    enctype?: undefined | string;
    form?: undefined | string;
    height?: undefined | string;
    list?: undefined | string;
    max?: undefined | number | string;
    minlength?: undefined | number | string;
    maxlength?: undefined | number | string;
    method?: undefined | string;
    min?: undefined | number | string;
    multiple?: undefined | boolean;
    name?: undefined | string;
    novalidate?: undefined | boolean;
    pattern?: undefined | string;
    placeholder?: undefined | string;
    readonly?: undefined | boolean;
    required?: undefined | boolean;
    size?: undefined | string;
    src?: undefined | string;
    step?: undefined | string;
    target?: undefined | string;
    type?: undefined | string;
    value?: undefined | string;
    width?: undefined | string;
  }

  interface HtmlModTag extends HtmlTag {
    cite?: undefined | string;
    datetime?: undefined | string | Date;
  }

  interface KeygenTag extends HtmlTag {
    autofocus?: undefined | string;
    challenge?: undefined | string;
    disabled?: undefined | boolean;
    form?: undefined | string;
    keytype?: undefined | string;
    name?: undefined | string;
  }

  interface HtmlLabelTag extends HtmlTag {
    form?: undefined | string;
    for?: undefined | string;
  }

  interface HtmlLITag extends HtmlTag {
    value?: undefined | string | number;
  }

  interface HtmlLinkTag extends HtmlTag {
    href?: undefined | string;
    crossorigin?: undefined | string;
    rel?: undefined | string;
    as?: undefined | string;
    media?: undefined | string;
    hreflang?: undefined | string;
    type?: undefined | string;
    sizes?: undefined | string;
    integrity?: undefined | string;
  }

  interface HtmlMapTag extends HtmlTag {
    name?: undefined | string;
  }

  interface HtmlMetaTag extends HtmlTag {
    name?: undefined | string;
    property?: undefined | string;
    'http-equiv'?: undefined | string;
    content?: undefined | string;
    charset?: undefined | string;
  }

  interface HtmlMeterTag extends HtmlTag {
    value?: undefined | string | number;
    min?: undefined | string | number;
    max?: undefined | string | number;
    low?: undefined | string | number;
    high?: undefined | string | number;
    optimum?: undefined | string | number;
  }

  interface HtmlObjectTag extends HtmlTag {
    data?: undefined | string;
    type?: undefined | string;
    name?: undefined | string;
    usemap?: undefined | string;
    form?: undefined | string;
    width?: undefined | string;
    height?: undefined | string;
  }

  interface HtmlOListTag extends HtmlTag {
    reversed?: undefined | string;
    start?: undefined | string | number;
  }

  interface HtmlOptgroupTag extends HtmlTag {
    disabled?: undefined | boolean;
    label?: undefined | string;
  }

  interface HtmlOptionTag extends HtmlTag {
    disabled?: undefined | boolean;
    label?: undefined | string;
    selected?: undefined | boolean;
    value?: undefined | string;
  }

  interface HtmlOutputTag extends HtmlTag {
    for?: undefined | string;
    form?: undefined | string;
    name?: undefined | string;
  }

  interface HtmlParamTag extends HtmlTag {
    name?: undefined | string;
    value?: undefined | string;
  }

  interface HtmlPictureTag extends HtmlTag {}

  interface HtmlProgressTag extends HtmlTag {
    value?: undefined | string | number;
    max?: undefined | string | number;
  }

  interface HtmlCommandTag extends HtmlTag {
    type?: undefined | string;
    label?: undefined | string;
    icon?: undefined | string;
    disabled?: undefined | boolean;
    checked?: undefined | string;
    radiogroup?: undefined | string;
    default?: undefined | string;
  }

  interface HtmlLegendTag extends HtmlTag {}

  interface HtmlBrowserButtonTag extends HtmlTag {
    type?: undefined | string;
  }

  interface HtmlMenuTag extends HtmlTag {
    type?: undefined | string;
    label?: undefined | string;
  }

  interface HtmlScriptTag extends HtmlTag {
    src?: undefined | string;
    type?: undefined | string;
    charset?: undefined | string;
    async?: undefined | boolean;
    defer?: undefined | boolean;
    crossorigin?: undefined | string;
    integrity?: undefined | string;
    text?: undefined | string;
  }

  interface HtmlDetailsTag extends HtmlTag {
    open?: undefined | boolean;
  }

  interface HtmlDialogTag extends HtmlTag {
    open?: undefined | boolean;
    onclose?: undefined | string;
  }

  interface HtmlSelectTag extends HtmlTag, FormEvents {
    autofocus?: undefined | boolean;
    disabled?: undefined | boolean;
    form?: undefined | string;
    multiple?: undefined | string;
    name?: undefined | string;
    required?: undefined | boolean;
    size?: undefined | string;
    autocomplete?: undefined | string;
  }

  interface HtmlSourceTag extends HtmlTag {
    src?: undefined | string;
    srcset?: undefined | string;
    type?: undefined | string;
    media?: undefined | string;
  }

  interface HtmlStyleTag extends HtmlTag {
    media?: undefined | string;
    type?: undefined | string;
    disabled?: undefined | boolean;
    scoped?: undefined | string;
  }

  interface HtmlTableTag extends HtmlTag {}

  interface HtmlTableDataCellTag extends HtmlTag {
    colspan?: undefined | string | number;
    rowspan?: undefined | string | number;
    headers?: undefined | string;
  }

  interface HtmlTextAreaTag extends HtmlTag {
    autofocus?: undefined | string;
    cols?: undefined | string;
    dirname?: undefined | string;
    disabled?: undefined | boolean;
    form?: undefined | string;
    maxlength?: undefined | number | string;
    minlength?: undefined | number | string;
    name?: undefined | string;
    placeholder?: undefined | string;
    readonly?: undefined | boolean;
    required?: undefined | boolean;
    rows?: undefined | string;
    wrap?: undefined | string;
  }

  interface HtmlTableHeaderCellTag extends HtmlTag {
    colspan?: undefined | string | number;
    rowspan?: undefined | string | number;
    headers?: undefined | string;
    scope?: undefined | string;
  }

  interface HtmlTimeTag extends HtmlTag {
    datetime?: undefined | string | Date;
  }

  interface HtmlTrackTag extends HtmlTag {
    default?: undefined | string;
    kind?: undefined | string;
    label?: undefined | string;
    src?: undefined | string;
    srclang?: undefined | string;
  }

  interface HtmlVideoTag extends HtmlTag {
    src?: undefined | string;
    poster?: undefined | string;
    autobuffer?: undefined | string;
    autoplay?: undefined | boolean;
    loop?: undefined | boolean;
    controls?: undefined | boolean;
    width?: undefined | string;
    height?: undefined | string;
  }

  // We allow any attributes on svg because its hard to keep track of them all.
  interface HtmlSvgTag extends HtmlTag, Record<string, any> {}

  interface HtmlUnspecifiedTag extends HtmlTag, Record<string, any> {
    of: string;
  }

  interface HtmlBodyTag {
    onafterprint?: undefined | string;
    onbeforeprint?: undefined | string;
    onbeforeonload?: undefined | string;
    onblur?: undefined | string;
    onerror?: undefined | string;
    onfocus?: undefined | string;
    onhaschange?: undefined | string;
    onload?: undefined | string;
    onmessage?: undefined | string;
    onoffline?: undefined | string;
    ononline?: undefined | string;
    onpagehide?: undefined | string;
    onpageshow?: undefined | string;
    onpopstate?: undefined | string;
    onredo?: undefined | string;
    onresize?: undefined | string;
    onstorage?: undefined | string;
    onundo?: undefined | string;
    onunload?: undefined | string;
  }

  interface HtmlTag {
    oncontextmenu?: undefined | string;
    onkeydown?: undefined | string;
    onkeypress?: undefined | string;
    onkeyup?: undefined | string;
    onclick?: undefined | string;
    ondblclick?: undefined | string;
    ondrag?: undefined | string;
    ondragend?: undefined | string;
    ondragenter?: undefined | string;
    ondragleave?: undefined | string;
    ondragover?: undefined | string;
    ondragstart?: undefined | string;
    ondrop?: undefined | string;
    onmousedown?: undefined | string;
    onmousemove?: undefined | string;
    onmouseout?: undefined | string;
    onmouseover?: undefined | string;
    onmouseup?: undefined | string;
    onmousewheel?: undefined | string;
    onscroll?: undefined | string;
  }

  interface FormEvents {
    onblur?: undefined | string;
    onchange?: undefined | string;
    onfocus?: undefined | string;
    onformchange?: undefined | string;
    onforminput?: undefined | string;
    oninput?: undefined | string;
    oninvalid?: undefined | string;
    onselect?: undefined | string;
    onsubmit?: undefined | string;
  }

  interface HtmlInputTag extends FormEvents {}

  interface HtmlFieldSetTag extends FormEvents {}

  interface HtmlFormTag extends FormEvents {}

  interface MediaEvents {
    onabort?: undefined | string;
    oncanplay?: undefined | string;
    oncanplaythrough?: undefined | string;
    ondurationchange?: undefined | string;
    onemptied?: undefined | string;
    onended?: undefined | string;
    onerror?: undefined | string;
    onloadeddata?: undefined | string;
    onloadedmetadata?: undefined | string;
    onloadstart?: undefined | string;
    onpause?: undefined | string;
    onplay?: undefined | string;
    onplaying?: undefined | string;
    onprogress?: undefined | string;
    onratechange?: undefined | string;
    onreadystatechange?: undefined | string;
    onseeked?: undefined | string;
    onseeking?: undefined | string;
    onstalled?: undefined | string;
    onsuspend?: undefined | string;
    ontimeupdate?: undefined | string;
    onvolumechange?: undefined | string;
    onwaiting?: undefined | string;
  }

  interface HtmlAudioTag extends MediaEvents {}

  interface HtmlEmbedTag extends MediaEvents {}

  interface HtmlImageTag extends MediaEvents {}

  interface HtmlObjectTag extends MediaEvents {}

  interface HtmlVideoTag extends MediaEvents {}

  interface IntrinsicAttributes {
    /**
     * In `react-jsx`, the `'key'` attribute serves as a reserved attribute name.
     * Consequently, the `'key'` attribute is not included in the properties parameter of
     * any component or element.
     *
     * **If you intend to utilize a similar property, please opt for an alternate name.**
     *
     * @see https://github.com/reactjs/rfcs/pull/107
     */
    key?: undefined | never;
  }

  interface ElementChildrenAttribute {
    children?: undefined | import('./').Children;
  }

  interface IntrinsicElements {
    a: HtmlAnchorTag;
    abbr: HtmlTag;
    address: HtmlTag;
    animate: HtmlSvgTag;
    animateMotion: HtmlSvgTag;
    animateTransform: HtmlSvgTag;
    area: HtmlAreaTag;
    article: HtmlTag;
    aside: HtmlTag;
    audio: HtmlAudioTag;
    b: HtmlTag;
    base: BaseTag;
    bb: HtmlBrowserButtonTag;
    bdi: HtmlTag;
    bdo: HtmlTag;
    blockquote: HtmlQuoteTag;
    body: HtmlBodyTag;
    br: HtmlTag;
    button: HtmlButtonTag;
    canvas: HtmlCanvasTag;
    caption: HtmlTag;
    circle: HtmlSvgTag;
    cite: HtmlTag;
    clipPath: HtmlSvgTag;
    code: HtmlTag;
    col: HtmlTableColTag;
    colgroup: HtmlTableColTag;
    commands: HtmlCommandTag;
    data: DataTag;
    datalist: HtmlDataListTag;
    dd: HtmlTag;
    defs: HtmlSvgTag;
    del: HtmlModTag;
    desc: HtmlSvgTag;
    details: HtmlDetailsTag;
    dfn: HtmlTag;
    dialog: HtmlDialogTag;
    div: HtmlTag;
    dl: HtmlTag;
    dt: HtmlTag;
    ellipse: HtmlSvgTag;
    em: HtmlTag;
    embed: HtmlEmbedTag;
    feBlend: HtmlSvgTag;
    feColorMatrix: HtmlSvgTag;
    feComponentTransfer: HtmlSvgTag;
    feComposite: HtmlSvgTag;
    feConvolveMatrix: HtmlSvgTag;
    feDiffuseLighting: HtmlSvgTag;
    feDisplacementMap: HtmlSvgTag;
    feDistantLight: HtmlSvgTag;
    feDropShadow: HtmlSvgTag;
    feFlood: HtmlSvgTag;
    feFuncA: HtmlSvgTag;
    feFuncB: HtmlSvgTag;
    feFuncG: HtmlSvgTag;
    feFuncR: HtmlSvgTag;
    feGaussianBlur: HtmlSvgTag;
    feImage: HtmlSvgTag;
    feMerge: HtmlSvgTag;
    feMergeNode: HtmlSvgTag;
    feMorphology: HtmlSvgTag;
    feOffset: HtmlSvgTag;
    fePointLight: HtmlSvgTag;
    feSpecularLighting: HtmlSvgTag;
    feSpotLight: HtmlSvgTag;
    feTile: HtmlSvgTag;
    feTurbulence: HtmlSvgTag;
    fieldset: HtmlFieldSetTag;
    figcaption: HtmlTag;
    figure: HtmlTag;
    filter: HtmlSvgTag;
    footer: HtmlTag;
    foreignObject: HtmlSvgTag;
    form: HtmlFormTag;
    g: HtmlSvgTag;
    h1: HtmlTag;
    h2: HtmlTag;
    h3: HtmlTag;
    h4: HtmlTag;
    h5: HtmlTag;
    h6: HtmlTag;
    head: HtmlTag;
    header: HtmlTag;
    hgroup: HtmlTag;
    hr: HtmlTag;
    html: HtmlHtmlTag;
    i: HtmlTag;
    iframe: HtmlIFrameTag;
    image: HtmlSvgTag;
    img: HtmlImageTag;
    input: HtmlInputTag;
    ins: HtmlModTag;
    kbd: HtmlTag;
    keygen: KeygenTag;
    label: HtmlLabelTag;
    legend: HtmlLegendTag;
    li: HtmlLITag;
    line: HtmlSvgTag;
    linearGradient: HtmlSvgTag;
    link: HtmlLinkTag;
    main: HtmlTag;
    map: HtmlMapTag;
    mark: HtmlTag;
    marker: HtmlSvgTag;
    mask: HtmlSvgTag;
    menu: HtmlMenuTag;
    meta: HtmlMetaTag;
    metadata: HtmlSvgTag;
    meter: HtmlMeterTag;
    mpath: HtmlSvgTag;
    nav: HtmlTag;
    noscript: HtmlTag;
    object: HtmlObjectTag;
    ol: HtmlOListTag;
    optgroup: HtmlOptgroupTag;
    option: HtmlOptionTag;
    output: HtmlOutputTag;
    p: HtmlTag;
    param: HtmlParamTag;
    path: HtmlSvgTag;
    pattern: HtmlSvgTag;
    picture: HtmlPictureTag;
    polygon: HtmlSvgTag;
    polyline: HtmlSvgTag;
    pre: HtmlTag;
    progress: HtmlProgressTag;
    q: HtmlQuoteTag;
    radialGradient: HtmlSvgTag;
    rb: HtmlTag;
    rect: HtmlSvgTag;
    rp: HtmlTag;
    rt: HtmlTag;
    rtc: HtmlTag;
    ruby: HtmlTag;
    s: HtmlTag;
    samp: HtmlTag;
    script: HtmlScriptTag;
    section: HtmlTag;
    select: HtmlSelectTag;
    set: HtmlSvgTag;
    small: HtmlTag;
    source: HtmlSourceTag;
    span: HtmlTag;
    stop: HtmlSvgTag;
    strong: HtmlTag;
    style: HtmlStyleTag;
    sub: HtmlTag;
    summary: HtmlTag;
    sup: HtmlTag;
    svg: HtmlSvgTag;
    switch: HtmlSvgTag;
    symbol: HtmlSvgTag;
    table: HtmlTableTag;
    tag: HtmlUnspecifiedTag;
    tbody: HtmlTag;
    td: HtmlTableDataCellTag;
    template: HtmlTag;
    text: HtmlSvgTag;
    textarea: HtmlTextAreaTag;
    textPath: HtmlSvgTag;
    tfoot: HtmlTableSectionTag;
    th: HtmlTableHeaderCellTag;
    thead: HtmlTableSectionTag;
    time: HtmlTimeTag;
    title: HtmlTag;
    tr: HtmlTableRowTag;
    track: HtmlTrackTag;
    tspan: HtmlSvgTag;
    u: HtmlTag;
    ul: HtmlTag;
    use: HtmlSvgTag;
    var: HtmlTag;
    video: HtmlVideoTag;
    view: HtmlSvgTag;
    wbr: HtmlTag;
  }
}
