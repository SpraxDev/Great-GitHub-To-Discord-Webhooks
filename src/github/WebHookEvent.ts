import type { SimpleEvent } from './payload/Events';

// TODO: Turn into interface?
export default class WebHookEvent {
  public readonly event: string;
  public readonly payload: SimpleEvent;
  public readonly action?: string;

  constructor(event: string, payload: SimpleEvent) {
    this.event = event;
    this.payload = payload;
    this.action = payload.action;
  }
}
