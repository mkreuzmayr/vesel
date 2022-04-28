import { URL } from 'node:url';

export type PartialDeep<T> = T extends object
  ? { [P in keyof T]?: PartialDeep<T[P]> }
  : T;

type DynamicImport = <T = any>(file: URL) => Promise<T>;

export const dynamicImport = new Function(
  'file',
  'return import(file)'
) as DynamicImport;
