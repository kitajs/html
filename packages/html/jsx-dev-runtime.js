/// <reference path="./jsx.d.ts" />
/// <reference types="./suspense.d.ts" />
/// <reference types="./error-boundary.d.ts" />

const { Fragment, jsx, jsxs } = require('./jsx-runtime');

exports.jsx = jsx;
exports.jsxs = jsxs;
exports.jsxDEV = jsx;
exports.Fragment = Fragment;
