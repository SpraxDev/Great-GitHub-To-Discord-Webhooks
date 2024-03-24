import { HttpClient } from '@spraxdev/node-commons';
import { injectable, singleton } from 'tsyringe';
import { getAppInfo } from '../constants';

export type DiscordHookBody = {
  username?: string;
  avatar_url?: string;
  content?: string;
  allowed_mentions?: {
    parse?: ('roles' | 'users' | 'everyone')[];
    roles?: string[];
    users?: string[];
    replied_user?: boolean;
  };
  embeds?: DiscordEmbed[];
}

export type DiscordEmbed = {
  title: string;
  description?: string;
  color?: number;
  author?: {
    name: string;
    icon_url?: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  url?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
};

@injectable()
export default class DiscordWebHookClient {
  private httpClient?: HttpClient;

  async send(hookUrl: string, body: DiscordHookBody): Promise<void> {
    const httpClient = await this.getHttpClient();
    const hookResponse = await httpClient.post(hookUrl, undefined, body);

    if (!hookResponse.ok) {
      throw new Error(`Execution of Discord WebHook failed with code ${hookResponse.status}: ${hookResponse.body.toString()}`);
    }
  }

  private async getHttpClient(): Promise<HttpClient> {
    if (this.httpClient == null) {
      const appInfo = await getAppInfo();
      this.httpClient = new HttpClient(HttpClient.generateUserAgent(appInfo.name, appInfo.version, undefined, appInfo.homepage));
    }
    return this.httpClient;
  }
}
