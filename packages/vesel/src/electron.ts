import { ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import { killChildProcess } from './utils';

const binName = process.platform === 'win32' ? 'electron.cmd' : 'electron';
const binNodeModulesPath = path.join('node_modules', '.bin', binName);

type ElectronInstanceOptions = {
  workingDirectory: string;
  inspectPort?: number;
  remoteDebuggingPort?: number;
  entryFile?: string;
};

export function createElectronInstance(options: ElectronInstanceOptions) {
  let electronProcess: ChildProcess | null = null;

  function start(): void {
    const { workingDirectory, inspectPort, remoteDebuggingPort, entryFile } =
      options;

    const args = [];

    if (inspectPort) {
      args.push(`--inspect=${inspectPort}`);
    }

    if (remoteDebuggingPort) {
      args.push(`--remote-debugging-port=${remoteDebuggingPort}`);
    }

    args.push(entryFile || workingDirectory);

    const binPath = path.join(workingDirectory, binNodeModulesPath);

    electronProcess = spawn(binPath, args, {
      shell: false,
      stdio: 'inherit',
    });
  }

  function stop(): void {
    if (electronProcess) {
      killChildProcess(electronProcess);
    }
  }

  return {
    start,
    stop,
  };
}
