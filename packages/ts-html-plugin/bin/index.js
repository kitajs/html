#!/usr/bin/env node

const { main } = require('../dist/cli.js');

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
