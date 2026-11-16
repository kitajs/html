# H3 Signal Room

A small streaming operations display built with H3 and Kita Html. The shell arrives
immediately, then independent sensor readings replace their fallbacks through
`AutoSuspense`.

```bash
pnpm start
```

Open `http://localhost:3000`. Use `/?station=aurora` to change the station label. The
value comes from the query string, so it is untrusted and escaped with Kita's `safe`
attribute.
