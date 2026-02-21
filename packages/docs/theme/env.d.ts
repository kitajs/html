declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}
