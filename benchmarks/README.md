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
runtime: node v20.13.1 (x64-linux)

benchmark        time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------- -----------------------------
• Real World Scenario
--------------------------------------------------- -----------------------------
KitaJS/Html     407 µs/iter     (297 µs … 1'465 µs)    366 µs    988 µs  1'375 µs
Typed Html    2'115 µs/iter   (1'757 µs … 2'958 µs)  2'381 µs  2'877 µs  2'958 µs
VHtml         2'186 µs/iter   (1'930 µs … 2'872 µs)  2'359 µs  2'801 µs  2'872 µs
React JSX     6'628 µs/iter   (5'846 µs … 8'088 µs)  7'140 µs  8'088 µs  8'088 µs
Preact          881 µs/iter     (560 µs … 9'010 µs)    736 µs  2'263 µs  9'010 µs
React         6'465 µs/iter   (5'932 µs … 7'377 µs)  6'796 µs  7'377 µs  7'377 µs
Common Tags   2'806 µs/iter   (2'447 µs … 4'161 µs)  2'852 µs  4'003 µs  4'161 µs
Ghtml           395 µs/iter     (316 µs … 2'656 µs)    353 µs  2'347 µs  2'656 µs
JSXTE         4'401 µs/iter   (3'654 µs … 5'105 µs)  4'591 µs  5'097 µs  5'105 µs

summary for Real World Scenario
  Ghtml
   1.03x faster than KitaJS/Html
   2.23x faster than Preact
   5.35x faster than Typed Html
   5.54x faster than VHtml
   7.1x faster than Common Tags
   11.14x faster than JSXTE
   16.37x faster than React
   16.78x faster than React JSX

• Component Creation
--------------------------------------------------- -----------------------------
KitaJS/Html     446 µs/iter     (364 µs … 1'174 µs)    415 µs    972 µs  1'146 µs
Typed Html      863 µs/iter     (710 µs … 1'783 µs)    877 µs  1'547 µs  1'783 µs
VHtml         1'561 µs/iter   (1'364 µs … 2'116 µs)  1'658 µs  1'972 µs  2'116 µs
React JSX     9'433 µs/iter  (8'261 µs … 11'178 µs)  9'969 µs 11'178 µs 11'178 µs
Preact          617 µs/iter     (485 µs … 1'666 µs)    569 µs  1'342 µs  1'666 µs
React         9'615 µs/iter  (8'447 µs … 11'099 µs) 10'186 µs 11'099 µs 11'099 µs
Common Tags   1'821 µs/iter   (1'580 µs … 2'541 µs)  1'959 µs  2'415 µs  2'541 µs
Ghtml           605 µs/iter     (549 µs … 1'262 µs)    596 µs  1'104 µs  1'262 µs
JSXTE         4'100 µs/iter   (3'652 µs … 7'943 µs)  4'271 µs  4'951 µs  7'943 µs

summary for Component Creation
  KitaJS/Html
   1.36x faster than Ghtml
   1.38x faster than Preact
   1.94x faster than Typed Html
   3.5x faster than VHtml
   4.09x faster than Common Tags
   9.2x faster than JSXTE
   21.17x faster than React JSX
   21.58x faster than React

• Attributes Serialization
--------------------------------------------------- -----------------------------
KitaJS/Html  17'700 ns/iter    (15'572 ns … 367 µs) 16'913 ns 36'767 ns    240 µs
Typed Html   72'712 ns/iter    (64'627 ns … 468 µs) 68'699 ns    231 µs    346 µs
VHtml        77'068 ns/iter    (69'881 ns … 487 µs) 73'527 ns    200 µs    382 µs
React JSX    64'839 ns/iter    (56'995 ns … 632 µs) 60'884 ns    244 µs    412 µs
Preact       14'853 ns/iter    (12'359 ns … 456 µs) 14'221 ns 35'427 ns    197 µs
React        64'811 ns/iter    (57'054 ns … 484 µs) 60'813 ns    226 µs    396 µs
Common Tags  41'139 ns/iter    (36'372 ns … 491 µs) 38'806 ns    111 µs    326 µs
Ghtml        41'254 ns/iter    (38'341 ns … 394 µs) 40'000 ns 73'622 ns    313 µs
JSXTE        27'828 ns/iter    (23'137 ns … 472 µs) 25'571 ns 96'494 ns    370 µs

summary for Attributes Serialization
  Preact
   1.19x faster than KitaJS/Html
   1.87x faster than JSXTE
   2.77x faster than Common Tags
   2.78x faster than Ghtml
   4.36x faster than React
   4.37x faster than React JSX
   4.9x faster than Typed Html
   5.19x faster than VHtml
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
