---
'@kitajs/html-cli': minor
---

`--format` accepts several formats, comma separated or repeated (`-f pretty,github`), and
defaults to `pretty,github` inside GitHub Actions, so findings are annotated on pull
requests without extra configuration. The `github` format now prints only the annotations
