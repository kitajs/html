# Benchmark

The `RealWorldPage` benchmark is the most meaningful since it represents a realistic
workload scenario. _Other benchmarks serve specific purposes, such as measuring the speed
of creating individual elements or handling attribute injection and escaping._

It's essential to emphasize that all benchmarks aim for impartiality. Any perceived bias
towards a particular library should be promptly reported, and corrective actions will be
taken swiftly.

We are committed to addressing any discrepancies or unfairness in the benchmarks promptly.
Updates reflecting corrections will be publicly shared as soon as they are available.

Feel free to reach out if you have any concerns or suggestions for improving the
benchmarking process. Your feedback is invaluable in ensuring the fairness and accuracy of
our comparisons.

Also, feel free to contribute benchmarks for any library you're interested in by opening a
pull request (PR). If you need assistance or wish to suggest a library for benchmarking,
don't hesitate to open an issue.

## Benchmark Results

```s
cpu: 13th Gen Intel(R) Core(TM) i5-13600K
runtime: node v20.11.0 (x64-linux)

benchmark        time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------- -----------------------------
• Real World Scenario
--------------------------------------------------- -----------------------------
KitaJS/Html     396 µs/iter     (297 µs … 1'391 µs)    337 µs  1'024 µs  1'214 µs
Typed Html    2'212 µs/iter   (1'778 µs … 3'733 µs)  2'453 µs  3'406 µs  3'733 µs
VHtml         2'220 µs/iter   (1'948 µs … 4'140 µs)  2'399 µs  3'409 µs  4'140 µs
React JSX     6'653 µs/iter   (5'901 µs … 8'058 µs)  7'176 µs  8'058 µs  8'058 µs
Preact        1'090 µs/iter     (705 µs … 2'940 µs)  1'007 µs  2'691 µs  2'940 µs
React         6'960 µs/iter   (5'977 µs … 9'382 µs)  7'890 µs  9'382 µs  9'382 µs
Common Tags   2'895 µs/iter   (2'455 µs … 4'955 µs)  2'636 µs  4'844 µs  4'955 µs
Ghtml           410 µs/iter     (320 µs … 3'442 µs)    351 µs  2'996 µs  3'368 µs
JSXTE         4'548 µs/iter  (4'045 µs … 13'247 µs)  4'509 µs 12'044 µs 13'247 µs

summary for Real World Scenario
  KitaJS/Html
   1.03x faster than Ghtml
   2.75x faster than Preact
   5.59x faster than Typed Html
   5.61x faster than VHtml
   7.31x faster than Common Tags
   11.49x faster than JSXTE
   16.81x faster than React JSX
   17.58x faster than React

• Component Creation
--------------------------------------------------- -----------------------------
KitaJS/Html     430 µs/iter     (351 µs … 1'082 µs)    397 µs    947 µs  1'050 µs
Typed Html      812 µs/iter     (696 µs … 1'628 µs)    767 µs  1'398 µs  1'628 µs
VHtml         1'553 µs/iter   (1'375 µs … 2'360 µs)  1'609 µs  2'176 µs  2'360 µs
React JSX     9'255 µs/iter  (8'367 µs … 10'660 µs)  9'717 µs 10'660 µs 10'660 µs
Preact          596 µs/iter     (508 µs … 1'143 µs)    570 µs    994 µs  1'123 µs
React         9'568 µs/iter  (8'390 µs … 14'629 µs)  9'908 µs 14'629 µs 14'629 µs
Common Tags   1'768 µs/iter   (1'577 µs … 2'459 µs)  1'900 µs  2'359 µs  2'459 µs
Ghtml           591 µs/iter     (541 µs … 1'177 µs)    590 µs  1'073 µs  1'136 µs
JSXTE         4'205 µs/iter   (3'750 µs … 8'826 µs)  4'305 µs  5'860 µs  8'826 µs

summary for Component Creation
  KitaJS/Html
   1.38x faster than Ghtml
   1.38x faster than Preact
   1.89x faster than Typed Html
   3.61x faster than VHtml
   4.11x faster than Common Tags
   9.78x faster than JSXTE
   21.51x faster than React JSX
   22.24x faster than React

• Attributes Serialization
--------------------------------------------------- -----------------------------
KitaJS/Html  17'651 ns/iter    (15'465 ns … 412 µs) 16'852 ns 38'031 ns    255 µs
Typed Html   75'062 ns/iter    (67'404 ns … 508 µs) 71'108 ns    276 µs    372 µs
VHtml        77'398 ns/iter    (69'587 ns … 544 µs) 73'078 ns    208 µs    451 µs
React JSX    64'422 ns/iter    (56'172 ns … 623 µs) 60'317 ns    176 µs    473 µs
Preact       27'199 ns/iter    (23'063 ns … 530 µs) 25'269 ns 71'372 ns    373 µs
React        64'362 ns/iter    (56'379 ns … 742 µs) 59'944 ns    218 µs    452 µs
Common Tags  46'592 ns/iter    (36'483 ns … 751 µs) 40'804 ns    128 µs    569 µs
Ghtml        42'412 ns/iter    (37'829 ns … 579 µs) 39'841 ns    100 µs    435 µs
JSXTE        28'416 ns/iter    (23'348 ns … 667 µs) 25'813 ns 84'530 ns    507 µs

summary for Attributes Serialization
  KitaJS/Html
   1.54x faster than Preact
   1.61x faster than JSXTE
   2.4x faster than Ghtml
   2.64x faster than Common Tags
   3.65x faster than React
   3.65x faster than React JSX
   4.25x faster than Typed Html
   4.38x faster than VHtml
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

To be sure we are emitting a similar output and none of the libraries are emitting broken
HTML, a realWorldPage is rendered and stored at the [samples](./runner/samples) directory.
