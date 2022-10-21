import { contextBridge } from 'electron';

const versions = {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
};

export type ExposedVersions = typeof versions;

contextBridge.exposeInMainWorld('versions', versions);
