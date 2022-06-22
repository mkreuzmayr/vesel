import { ChildProcess, spawn } from 'node:child_process';
import EventEmitter from 'node:events';
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

type EventHandler = {
  close: () => void;
};

type Events = keyof EventHandler;

export function createElectronInstance(options: ElectronInstanceOptions) {
  let electronProcess: ChildProcess | null = null;
  const ee = new EventEmitter();

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

    electronProcess.on('close', (code) => {
      ee.emit('close', code);
    });
  }

  async function stop(): Promise<void> {
    if (!electronProcess) {
      return;
    }

    const closeEvents = ee.listeners('close');

    ee.removeAllListeners('close');

    await killChildProcess(electronProcess);

    closeEvents.forEach((closeEvent: any) => {
      ee.on('close', closeEvent);
    });
  }

  function on<T extends Events>(event: T, listener: EventHandler[T]): void {
    ee.on(event, listener);
  }

  return {
    start,
    stop,
    on,
  };
}
