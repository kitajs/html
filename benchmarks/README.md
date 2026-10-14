<h1>Benchmark</h1>

- [Results](#results)
- [Versions](#versions)
- [Information](#information)
- [About KitaJS/Html](#about-kitajshtml)
- [Runtime Inconsistencies](#runtime-inconsistencies)

## Results

```
clk: ~4.80 GHz
cpu: 13th Gen Intel(R) Core(TM) i5-13600K
runtime: node 24.13.0 (x64-linux)

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
KitaJs 170.5 KiB             361.79 µs/iter 358.24 µs  █
                      (302.91 µs … 1.13 ms) 866.76 µs ██
                    (  1.27 mb …   2.53 mb)   1.83 mb ███▅▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁

! TypedHtml 173.5 KiB          2.11 ms/iter   2.24 ms  ▅█ ▄
                        (1.78 ms … 3.47 ms)   2.97 ms  ████▃
                    (  6.24 mb …   8.48 mb)   7.13 mb ████████▅▅▆▆▅▄▃▃▃▄▁▂▁

! vHtml 170.5 KiB              2.06 ms/iter   2.18 ms  █▂
                        (1.79 ms … 3.24 ms)   3.19 ms ███▅▂
                    (  2.31 mb …   4.63 mb)   3.54 mb █████▇▇▇▅▂▂▃▂▁▁▂▂▁▂▂▁

ReactJsx 170.5 KiB             1.01 ms/iter   1.08 ms  █
                      (822.95 µs … 2.33 ms)   1.92 ms ▂█▂
                    (  1.31 mb …   4.67 mb)   3.30 mb ███▆▆▆▅▃▂▂▂▁▁▁▁▁▂▂▁▁▁

Preact 170.5 KiB             806.05 µs/iter 845.81 µs █
                      (603.80 µs … 4.66 ms)   3.13 ms █▃▂
                    (  2.32 mb …   4.42 mb)   3.09 mb ███▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

React 170.5 KiB                1.04 ms/iter   1.03 ms  █
                      (919.83 µs … 2.15 ms)   1.86 ms ▃█▂
                    (  2.14 mb …   5.16 mb)   3.68 mb ███▅▃▂▂▂▂▁▁▁▁▁▁▁▁▂▁▁▁

! Jsxte 170.6 KiB              3.95 ms/iter   4.19 ms  █
                        (3.59 ms … 5.20 ms)   4.89 ms  ██▃▄▂
                    ( 13.36 mb …  17.30 mb)  13.94 mb ██████▄▂▄▂▃▅▆▇▅▂▄▁▂▂▂

HonoJsx 170.5 KiB              1.05 ms/iter   1.07 ms ▅█
                      (872.65 µs … 2.60 ms)   1.95 ms ██▂
                    (  2.46 mb …   6.24 mb)   3.14 mb ████▅▄▄▃▂▂▁▂▁▁▂▂▁▂▁▁▁

* CommonTags 211.3 KiB         3.58 ms/iter   3.60 ms  █
                        (3.18 ms … 5.39 ms)   5.17 ms  █▅
                    (  5.55 mb …   7.45 mb)   6.30 mb ▆██▇▆▄▃▂▂▃▂▁▁▂▂▂▁▂▂▁▂

* Ghtml 204.5 KiB            230.79 µs/iter 216.96 µs  █
                      (188.45 µs … 3.27 ms) 440.05 µs  █▅
                    (169.75 kb …   1.38 mb) 649.87 kb ▂██▅▃▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁

* HonoHtml 204.5 KiB         118.12 µs/iter 113.55 µs █
                    (103.38 µs … 645.95 µs) 360.09 µs █
                    ( 40.68 kb …   1.11 mb) 549.60 kb █▆▅▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

                             ┌                                            ┐
                               ┬    ╷
            KitaJs 170.5 KiB   │────┤
                               ┴    ╵
                                            ╷┌─┬┐     ╷
       ! TypedHtml 173.5 KiB                ├┤ │├─────┤
                                            ╵└─┴┘     ╵
                                            ╷┌┬┐        ╷
           ! vHtml 170.5 KiB                ├┤│├────────┤
                                            ╵└┴┘        ╵
                                   ╷┌┬┐      ╷
          ReactJsx 170.5 KiB       ├┤│├──────┤
                                   ╵└┴┘      ╵
                                 ╷┌┬┐                   ╷
            Preact 170.5 KiB     ├┤│├───────────────────┤
                                 ╵└┴┘                   ╵
                                    ╷┬       ╷
             React 170.5 KiB        ├│───────┤
                                    ╵┴       ╵
                                                            ╷┌─┬─┐     ╷
           ! Jsxte 170.6 KiB                                ├┤ │ ├─────┤
                                                            ╵└─┴─┘     ╵
                                    ┌┬┐      ╷
           HonoJsx 170.5 KiB        ││├──────┤
                                    └┴┘      ╵
                                                        ╷┌──┬             ╷
      * CommonTags 211.3 KiB                            ├┤  │─────────────┤
                                                        ╵└──┴             ╵
                              ┬ ╷
           * Ghtml 204.5 KiB  │─┤
                              ┴ ╵
                             ┬ ╷
        * HonoHtml 204.5 KiB │─┤
                             ┴ ╵
                             └                                            ┘
                             103.38 µs           2.64 ms            5.17 ms

Sizes are the final html output based on the same input.

!) Are jsx runtimes that produces different output from React for the same input ⚠️

*) Are template engines, which usually lacks syntax highlighting and intellisense:
   https://github.com/kitajs/html/blob/master/benchmarks/templates/normal.tsx
```

## Versions

```json
{
  "common-tags": "1.8.2",
  "ghtml": "4.0.2",
  "hono": "4.12.2",
  "html-minifier": "4.0.0",
  "jsxte": "3.3.1",
  "mitata": "1.0.34",
  "nano-jsx": "0.2.1",
  "preact-render-to-string": "6.6.6",
  "react-dom": "19.2.9"
}
```

## Information

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
