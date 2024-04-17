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
    accesskey?: string;
    contenteditable?: string;
    dir?: string;
    hidden?: string | boolean;
    id?: number | string;
    role?: string;
    lang?: string;
    draggable?: string | boolean;
    spellcheck?: string | boolean;
    tabindex?: number | string;
    title?: string;
    translate?: string | boolean;

    /** A css style attribute which also supports a `csstype` object. */
    style?: string | CSSProperties;

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
    safe?: boolean;

    /**
     * Included here to work as a react drop-in replacement
     *
     * @deprecated Please use `class`.
     */
    className?: string;

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
    class?: string | (string | number | null | boolean | undefined)[];

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
    attrs?: object | string;
  }

  interface HtmlAnchorTag extends HtmlTag {
    href?: string;
    hreflang?: string;
    target?: string;
    download?: string;
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
    ping?: string;
    rel?: string;
    media?: string;
    type?: string;
  }

  interface HtmlAreaTag extends HtmlTag {
    alt?: string;
    coords?: string;
    shape?: string;
    href?: string;
    target?: string;
    ping?: string;
    rel?: string;
    media?: string;
    hreflang?: string;
    type?: string;
  }

  interface HtmlAudioTag extends HtmlTag {
    src?: string;
    autobuffer?: string;
    autoplay?: boolean;
    preload?: string;
    muted?: boolean;
    loop?: boolean;
    controls?: string;
  }

  interface BaseTag extends HtmlTag {
    href?: string;
    target?: string;
  }

  interface HtmlQuoteTag extends HtmlTag {
    cite?: string;
  }

  interface HtmlBodyTag extends HtmlTag {}

  interface HtmlButtonTag extends HtmlTag {
    action?: string;
    autofocus?: string;
    disabled?: boolean;
    enctype?: string;
    form?: string;
    method?: string;
    name?: string;
    novalidate?: string | boolean;
    target?: string;
    type?: string;
    value?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: string | boolean;
    formtarget?: string;
    popovertarget?: string;
    popovertargetaction?: string;
  }

  interface HtmlDataListTag extends HtmlTag {}

  interface HtmlCanvasTag extends HtmlTag {
    width?: string;
    height?: string;
  }

  interface HtmlTableColTag extends HtmlTag {
    span?: string;
  }

  interface HtmlTableSectionTag extends HtmlTag {}

  interface HtmlTableRowTag extends HtmlTag {}

  interface DataTag extends HtmlTag {
    value?: string;
  }

  interface HtmlEmbedTag extends HtmlTag, Record<string, any> {
    src?: string;
    type?: string;
    width?: string;
    height?: string;
  }

  interface HtmlFieldSetTag extends HtmlTag {
    disabled?: boolean;
    form?: string;
    name?: string;
  }

  interface HtmlFormTag extends HtmlTag {
    'accept-charset'?: string;
    action?: string;
    autocomplete?: string;
    enctype?: string;
    method?: string;
    name?: string;
    novalidate?: string | boolean;
    target?: string;
  }

  interface HtmlHtmlTag extends HtmlTag {
    manifest?: string;
  }

  interface HtmlIFrameTag extends HtmlTag {
    allow?: string;
    allowfullscreen?: boolean;
    allowpaymentrequest?: boolean;
    credentialless?: boolean;
    height?: string;
    loading?: string;
    name?: string;
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
    sandbox?: boolean;
    src?: string;
    srcdoc?: string;
    seamless?: string;
    width?: string;
  }

  interface HtmlImageTag extends HtmlTag {
    alt?: string;
    src?: string;
    crossorigin?: string;
    usemap?: string;
    ismap?: string;
    width?: number | string;
    height?: number | string;
    decoding?: 'sync' | 'async' | 'auto' | AnyString;
    loading?: 'eager' | 'lazy' | AnyString;
    srcset?: string;
  }

  interface HtmlInputTag extends HtmlTag {
    accept?: string;
    action?: string;
    alt?: string;
    autocomplete?: string;
    autofocus?: string;
    checked?: boolean;
    disabled?: boolean;
    enctype?: string;
    form?: string;
    height?: string;
    list?: string;
    max?: number | string;
    minlength?: number | string;
    maxlength?: number | string;
    method?: string;
    min?: number | string;
    multiple?: boolean;
    name?: string;
    novalidate?: boolean;
    pattern?: string;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    size?: string;
    src?: string;
    step?: string;
    target?: string;
    type?: string;
    value?: string;
    width?: string;
  }

  interface HtmlModTag extends HtmlTag {
    cite?: string;
    datetime?: string | Date;
  }

  interface KeygenTag extends HtmlTag {
    autofocus?: string;
    challenge?: string;
    disabled?: boolean;
    form?: string;
    keytype?: string;
    name?: string;
  }

  interface HtmlLabelTag extends HtmlTag {
    form?: string;
    for?: string;
  }

  interface HtmlLITag extends HtmlTag {
    value?: string | number;
  }

  interface HtmlLinkTag extends HtmlTag {
    href?: string;
    crossorigin?: string;
    rel?: string;
    as?: string;
    media?: string;
    hreflang?: string;
    type?: string;
    sizes?: string;
    integrity?: string;
  }

  interface HtmlMapTag extends HtmlTag {
    name?: string;
  }

  interface HtmlMetaTag extends HtmlTag {
    name?: string;
    property?: string;
    'http-equiv'?: string;
    content?: string;
    charset?: string;
  }

  interface HtmlMeterTag extends HtmlTag {
    value?: string | number;
    min?: string | number;
    max?: string | number;
    low?: string | number;
    high?: string | number;
    optimum?: string | number;
  }

  interface HtmlObjectTag extends HtmlTag {
    data?: string;
    type?: string;
    name?: string;
    usemap?: string;
    form?: string;
    width?: string;
    height?: string;
  }

  interface HtmlOListTag extends HtmlTag {
    reversed?: string;
    start?: string | number;
  }

  interface HtmlOptgroupTag extends HtmlTag {
    disabled?: boolean;
    label?: string;
  }

  interface HtmlOptionTag extends HtmlTag {
    disabled?: boolean;
    label?: string;
    selected?: boolean;
    value?: string;
  }

  interface HtmlOutputTag extends HtmlTag {
    for?: string;
    form?: string;
    name?: string;
  }

  interface HtmlParamTag extends HtmlTag {
    name?: string;
    value?: string;
  }

  interface HtmlPictureTag extends HtmlTag {}

  interface HtmlProgressTag extends HtmlTag {
    value?: string | number;
    max?: string | number;
  }

  interface HtmlCommandTag extends HtmlTag {
    type?: string;
    label?: string;
    icon?: string;
    disabled?: boolean;
    checked?: string;
    radiogroup?: string;
    default?: string;
  }

  interface HtmlLegendTag extends HtmlTag {}

  interface HtmlBrowserButtonTag extends HtmlTag {
    type?: string;
  }

  interface HtmlMenuTag extends HtmlTag {
    type?: string;
    label?: string;
  }

  interface HtmlScriptTag extends HtmlTag {
    src?: string;
    type?: string;
    charset?: string;
    async?: boolean;
    defer?: boolean;
    crossorigin?: string;
    integrity?: string;
    text?: string;
  }

  interface HtmlDetailsTag extends HtmlTag {
    open?: boolean;
  }

  interface HtmlDialogTag extends HtmlTag {
    open?: boolean;
    onclose?: string;
  }

  interface HtmlSelectTag extends HtmlTag, FormEvents {
    autofocus?: boolean;
    disabled?: boolean;
    form?: string;
    multiple?: string;
    name?: string;
    required?: boolean;
    size?: string;
    autocomplete?: string;
  }

  interface HtmlSourceTag extends HtmlTag {
    src?: string;
    srcset?: string;
    type?: string;
    media?: string;
  }

  interface HtmlStyleTag extends HtmlTag {
    media?: string;
    type?: string;
    disabled?: boolean;
    scoped?: string;
  }

  interface HtmlTableTag extends HtmlTag {}

  interface HtmlTableDataCellTag extends HtmlTag {
    colspan?: string | number;
    rowspan?: string | number;
    headers?: string;
  }

  interface HtmlTextAreaTag extends HtmlTag {
    autofocus?: string;
    cols?: string;
    dirname?: string;
    disabled?: boolean;
    form?: string;
    maxlength?: number | string;
    minlength?: number | string;
    name?: string;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    rows?: string;
    wrap?: string;
  }

  interface HtmlTableHeaderCellTag extends HtmlTag {
    colspan?: string | number;
    rowspan?: string | number;
    headers?: string;
    scope?: string;
  }

  interface HtmlTimeTag extends HtmlTag {
    datetime?: string | Date;
  }

  interface HtmlTrackTag extends HtmlTag {
    default?: string;
    kind?: string;
    label?: string;
    src?: string;
    srclang?: string;
  }

  interface HtmlVideoTag extends HtmlTag {
    src?: string;
    poster?: string;
    autobuffer?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    width?: string;
    height?: string;
  }

  // We allow any attributes on svg because its hard to keep track of them all.
  interface HtmlSvgTag extends HtmlTag, Record<string, any> {}

  interface HtmlUnspecifiedTag extends HtmlTag, Record<string, any> {
    of: string;
  }

  interface HtmlBodyTag {
    onafterprint?: string;
    onbeforeprint?: string;
    onbeforeonload?: string;
    onblur?: string;
    onerror?: string;
    onfocus?: string;
    onhaschange?: string;
    onload?: string;
    onmessage?: string;
    onoffline?: string;
    ononline?: string;
    onpagehide?: string;
    onpageshow?: string;
    onpopstate?: string;
    onredo?: string;
    onresize?: string;
    onstorage?: string;
    onundo?: string;
    onunload?: string;
  }

  interface HtmlTag {
    oncontextmenu?: string;
    onkeydown?: string;
    onkeypress?: string;
    onkeyup?: string;
    onclick?: string;
    ondblclick?: string;
    ondrag?: string;
    ondragend?: string;
    ondragenter?: string;
    ondragleave?: string;
    ondragover?: string;
    ondragstart?: string;
    ondrop?: string;
    onmousedown?: string;
    onmousemove?: string;
    onmouseout?: string;
    onmouseover?: string;
    onmouseup?: string;
    onmousewheel?: string;
    onscroll?: string;
  }

  interface FormEvents {
    onblur?: string;
    onchange?: string;
    onfocus?: string;
    onformchange?: string;
    onforminput?: string;
    oninput?: string;
    oninvalid?: string;
    onselect?: string;
    onsubmit?: string;
  }

  interface HtmlInputTag extends FormEvents {}

  interface HtmlFieldSetTag extends FormEvents {}

  interface HtmlFormTag extends FormEvents {}

  interface MediaEvents {
    onabort?: string;
    oncanplay?: string;
    oncanplaythrough?: string;
    ondurationchange?: string;
    onemptied?: string;
    onended?: string;
    onerror?: string;
    onloadeddata?: string;
    onloadedmetadata?: string;
    onloadstart?: string;
    onpause?: string;
    onplay?: string;
    onplaying?: string;
    onprogress?: string;
    onratechange?: string;
    onreadystatechange?: string;
    onseeked?: string;
    onseeking?: string;
    onstalled?: string;
    onsuspend?: string;
    ontimeupdate?: string;
    onvolumechange?: string;
    onwaiting?: string;
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
    key?: never;
  }

  interface ElementChildrenAttribute {
    children?: import('./').Children;
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
