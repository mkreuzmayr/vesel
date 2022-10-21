import { ExposedVersions } from '../main/preload';

declare global {
  interface Window {
    versions: ExposedVersions;
  }
}

export {};
