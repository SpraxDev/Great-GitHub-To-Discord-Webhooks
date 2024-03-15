import { ConfigFile } from '@spraxdev/node-commons';
import Path from 'node:path';
import { singleton } from 'tsyringe';
import { APP_ROOT_DIR } from '../constants';

export type AppConfig = {
  readonly sentryDsn: string;
};

@singleton()
export default class AppConfiguration {
  private readonly configFile: ConfigFile<AppConfig>;

  constructor() {
    this.configFile = new ConfigFile<AppConfig>(Path.join(APP_ROOT_DIR, 'storage', 'config.json'), {
      sentryDsn: ''
    });
    this.configFile.saveIfChanged();
  }

  get(): Readonly<AppConfig> {
    return this.configFile.data;
  }
}
