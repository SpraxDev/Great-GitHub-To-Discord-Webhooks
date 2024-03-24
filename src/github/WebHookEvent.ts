import { HookBody } from '../webserver/GitHubHookReceiverRouter';

// TODO: Prüfen ob es ein type/interface auch tut
export default class WebHookEvent {
  public readonly event: string;
  public readonly action?: string;
  public readonly payload: HookBody;

  constructor(event: string, action: string | undefined, payload: HookBody) {
    this.event = event;
    this.action = action;
    this.payload = payload;
  }
}
