import { ChildProcess, spawn } from 'node:child_process';
import { URL } from 'node:url';

export type PartialDeep<T> = T extends object
  ? { [P in keyof T]?: PartialDeep<T[P]> }
  : T;

type DynamicImport = <T = any>(file: URL) => Promise<T>;

export const dynamicImport = new Function(
  'file',
  'return import(file)'
) as DynamicImport;

export async function killChildProcess(
  childProcess: ChildProcess
): Promise<void> {
  return new Promise((resolve) => {
    childProcess.once('exit', () => resolve());

    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', `${childProcess.pid}`, '/f', '/t']);
    } else {
      childProcess.kill();
    }
  });
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
