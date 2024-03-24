import { Hook } from '../config/AppConfiguration';
import WebHookEvent from './WebHookEvent';

// TODO: Maybe einfach interface machen?
export default abstract class WebHookEventProcessor {
  abstract process(event: WebHookEvent, hook: Hook): Promise<boolean>;
}
