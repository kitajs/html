// Fake jsdom typings  because its now exposing JSX syntax too and this package
// has its own JSX typings that are not compatible React's ones.
declare module 'jsdom' {
  var JSDOM: any;
}
