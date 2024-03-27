/// <reference path="./jsx.d.ts" />

const { Fragment, jsx, jsxs } = require('./jsx-runtime');

const JsxRuntime = {
  jsxDEV: jsx,
  jsxs,
  Fragment
};

module.exports = JsxRuntime;
module.exports.default = JsxRuntime;
