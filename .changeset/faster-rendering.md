---
'@kitajs/html': patch
---

Improve rendering performance by allocating fewer intermediate strings

Tag, attribute and style property name fragments are cached, element props are read in a
single pass, nested children arrays are joined without copying, and async children are
wrapped with one promise instead of two. Style objects render up to 2.4x faster, fragments
and lists with siblings 2x faster and typical pages 1.2x to 1.5x faster.
