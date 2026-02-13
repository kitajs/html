# Benchmark

`@kitajs/html` is a string builder and template engine on steroids.

You can run this benchmark yourself by cloning our
[source code](https://github.com/kitajs/html) and executing `pnpm bench`.

:::warning About Microbenchmarks Microbenchmarks can easily mislead with statistics, read
more about it on
[How to Lie with Statistics](https://en.wikipedia.org/wiki/How_to_Lie_with_Statistics).
Please do not base any decisions solely on the information provided below.

The difference between the fastest and slowest builders is on the order of microseconds.
So, if _a millionth of a second_ is critical to you, **PLEASE STOP WRITING JAVASCRIPT**.
:::

## Benchmark Results

```txt
cpu: 13th Gen Intel(R) Core(TM) i5-13600K
runtime: node v20.15.1 (x64-linux)

benchmark        time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------- -----------------------------
• Real World Scenario
--------------------------------------------------- -----------------------------
KitaJS/Html     469 µs/iter     (306 µs … 3'059 µs)    393 µs  1'611 µs  2'560 µs
Typed Html    2'695 µs/iter  (1'780 µs … 11'426 µs)  2'885 µs  7'963 µs 11'426 µs
VHtml         2'907 µs/iter   (2'049 µs … 5'259 µs)  3'280 µs  5'105 µs  5'259 µs
React JSX     7'485 µs/iter  (6'199 µs … 13'585 µs)  7'784 µs 13'585 µs 13'585 µs
Preact        1'059 µs/iter     (620 µs … 4'240 µs)    957 µs  3'061 µs  4'240 µs
React         7'360 µs/iter  (6'162 µs … 14'298 µs)  7'516 µs 14'298 µs 14'298 µs
Common Tags   3'108 µs/iter   (2'505 µs … 6'133 µs)  3'435 µs  5'016 µs  6'133 µs
Ghtml           294 µs/iter     (199 µs … 3'206 µs)    238 µs  2'552 µs  3'144 µs
JSXTE         4'763 µs/iter   (3'708 µs … 7'780 µs)  4'872 µs  7'554 µs  7'780 µs
Nano JSX     23'485 µs/iter (20'841 µs … 32'757 µs) 23'882 µs 32'757 µs 32'757 µs

summary for Real World Scenario
  Ghtml
   1.6x faster than KitaJS/Html
   3.61x faster than Preact
   9.18x faster than Typed Html
   9.9x faster than VHtml
   10.58x faster than Common Tags
   16.22x faster than JSXTE
   25.06x faster than React
   25.49x faster than React JSX
   79.97x faster than Nano JSX

• Component Creation
--------------------------------------------------- -----------------------------
KitaJS/Html     358 µs/iter     (244 µs … 4'031 µs)    283 µs  2'386 µs  3'806 µs
Typed Html    1'466 µs/iter   (1'086 µs … 5'013 µs)  1'432 µs  4'252 µs  5'013 µs
VHtml         2'069 µs/iter   (1'595 µs … 5'495 µs)  2'046 µs  4'874 µs  5'495 µs
React JSX     6'104 µs/iter  (4'621 µs … 12'021 µs)  7'016 µs 11'634 µs 12'021 µs
Preact          830 µs/iter     (440 µs … 8'870 µs)    539 µs  6'374 µs  8'870 µs
React         6'516 µs/iter  (4'896 µs … 11'300 µs)  7'880 µs 11'300 µs 11'300 µs
Common Tags   3'166 µs/iter   (2'591 µs … 5'660 µs)  3'225 µs  5'478 µs  5'660 µs
Ghtml           581 µs/iter     (437 µs … 4'356 µs)    571 µs  2'274 µs  4'324 µs
JSXTE         5'778 µs/iter  (4'345 µs … 10'952 µs)  6'762 µs 10'822 µs 10'952 µs
Nano JSX     25'711 µs/iter (22'150 µs … 36'598 µs) 26'801 µs 36'598 µs 36'598 µs

summary for Component Creation
  KitaJS/Html
   1.62x faster than Ghtml
   2.32x faster than Preact
   4.1x faster than Typed Html
   5.78x faster than VHtml
   8.84x faster than Common Tags
   16.14x faster than JSXTE
   17.05x faster than React JSX
   18.21x faster than React
   71.84x faster than Nano JSX

• Attributes Serialization
--------------------------------------------------- -----------------------------
KitaJS/Html   9'486 ns/iter   (6'450 ns … 1'775 µs)  8'175 ns 20'572 ns    475 µs
Typed Html   59'802 ns/iter  (42'927 ns … 4'088 µs) 49'924 ns    163 µs  1'747 µs
VHtml        67'502 ns/iter  (54'275 ns … 2'053 µs) 61'815 ns    162 µs  1'479 µs
React JSX    60'839 ns/iter  (43'731 ns … 2'230 µs) 53'105 ns    203 µs  1'671 µs
Preact       17'113 ns/iter  (10'989 ns … 9'846 µs) 13'825 ns 37'387 ns  1'297 µs
React        62'116 ns/iter  (44'024 ns … 2'666 µs) 53'946 ns    202 µs  1'708 µs
Common Tags  54'239 ns/iter  (42'734 ns … 3'139 µs) 49'173 ns    125 µs  1'362 µs
Ghtml        23'692 ns/iter  (17'014 ns … 3'660 µs) 20'162 ns 64'878 ns  1'159 µs
JSXTE        33'183 ns/iter  (23'564 ns … 3'420 µs) 28'515 ns 90'667 ns  1'415 µs
Nano JSX        369 µs/iter     (245 µs … 2'586 µs)    321 µs  1'778 µs  2'535 µs

summary for Attributes Serialization
  KitaJS/Html
   1.8x faster than Preact
   2.5x faster than Ghtml
   3.5x faster than JSXTE
   5.72x faster than Common Tags
   6.3x faster than Typed Html
   6.41x faster than React JSX
   6.55x faster than React
   7.12x faster than VHtml
   38.89x faster than Nano JSX
```

## About KitaJS/Html

KitaJS/Html prioritizes performance while maintaining a user-friendly and intuitive API.
Its design ensures not only speed but also a seamless developer experience (DX). Since
this code may run on every request, its primary objective is speed, with a secondary focus
on maintaining developer productivity.

The library adheres to the JSX standard for its API, shielding users from the complexities
of its internal workings. This approach allows us to optimize the underlying
implementation extensively, including function inlining, to achieve maximum performance.

## Runtime Inconsistencies

I tried multiple formatters and minifiers to ensure the html output of all runtimes is
consistent, however vhtml and common-tags aren't consistent at all, with weird behaviors
like adding spaces between components and rendering `0` as an empty string...

As react is by far the JSX standard these days, **KitaJS/Html is only required to produce
the same output as ReactDOMServer.renderToStaticMarkup**.

## Performance Philosophy

The key to KitaJS/Html's performance is:

1. **Direct string concatenation** - No virtual DOM overhead
2. **Optimized algorithms** - Function inlining and minimal allocations
3. **Smart escaping** - Only escape when necessary, escape once at the end
4. **Zero dependencies** - No runtime overhead from dependencies

:::tip Run It Yourself Clone the repository and run `pnpm bench` to see the benchmarks on
your own machine! :::

## Next Steps

- Get started with the [installation guide](/guide/getting-started)
- Learn about [XSS protection](/guide/xss-protection/sanitization)
- Integrate with [Fastify](/integrations/frameworks/fastify)
