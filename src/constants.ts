import Fs from 'node:fs';
import Path from 'node:path';
import { logAndCaptureError } from './SentrySdk';

let appVersion: string;

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const APP_ROOT_DIR = Path.join(__dirname, '..');

export async function getAppVersion(): Promise<string> {
  if (appVersion == null) {
    appVersion = 'UNKNOWN-APP-VERSION';

    const packageJsonPath = Path.join(APP_ROOT_DIR, 'package.json');
    if (Fs.existsSync(packageJsonPath)) {
      const packageJson = await Fs.promises.readFile(packageJsonPath, { encoding: 'utf-8' });
      const parsedVersion = JSON.parse(packageJson).version;
      if (typeof parsedVersion == 'string') {
        appVersion = parsedVersion;
      }
    }

    if (appVersion == 'UNKNOWN-APP-VERSION') {
      logAndCaptureError(new Error('Unable to parse app version from package.json'));
    }
  }

  return appVersion;
}
