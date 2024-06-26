import Fs from 'node:fs';
import Path from 'node:path';
import { logAndCaptureError } from './SentrySdk';

type AppInfo = { name: string, version: string, homepage: string };
let appInfo: AppInfo;

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const APP_ROOT_DIR = Path.join(__dirname, '..');
export const RESOURCE_DIR = Path.join(APP_ROOT_DIR, 'resources');

export async function getAppInfo(): Promise<Readonly<AppInfo>> {
  if (appInfo == null) {
    appInfo = {
      name: 'UNKNOWN-APP-NAME',
      version: 'UNKNOWN-APP-VERSION',
      homepage: ''
    };

    const packageJsonPath = Path.join(APP_ROOT_DIR, 'package.json');
    if (Fs.existsSync(packageJsonPath)) {
      const packageJson = await Fs.promises.readFile(packageJsonPath, { encoding: 'utf-8' });
      let parsedPackageJson = JSON.parse(packageJson);

      const parsedName = parsedPackageJson.name;
      if (typeof parsedName == 'string') {
        appInfo.name = parsedName;
      }

      const parsedVersion = parsedPackageJson.version;
      if (typeof parsedVersion == 'string') {
        appInfo.version = parsedVersion;
      }

      const parsedHomepage = parsedPackageJson.homepage;
      if (typeof parsedHomepage == 'string') {
        appInfo.homepage = parsedHomepage;
      }
    }

    if (appInfo.name == 'UNKNOWN-APP-NAME') {
      logAndCaptureError(new Error('Unable to parse app name from package.json'));
    }
    if (appInfo.version == 'UNKNOWN-APP-VERSION') {
      logAndCaptureError(new Error('Unable to parse app version from package.json'));
    }
    if (appInfo.homepage == '') {
      logAndCaptureError(new Error('Unable to parse app homepage from package.json'));
    }
  }

  return appInfo;
}
