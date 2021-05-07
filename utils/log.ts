import * as emoji from 'node-emoji';

export const info = (...args: any) => console.info(...args);
export const warn = (...args: any) => console.warn(...args);
export const error = (...args: any) => console.error(...args);

export const success = (...args: any) =>
  console.log(emoji.get('white_check_mark'), ...args);
export const failure = (...args: any) => console.log(emoji.get('x'), ...args);
