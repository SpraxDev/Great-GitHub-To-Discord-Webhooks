import { singleton } from 'tsyringe';
import { Hook } from '../config/AppConfiguration';
import ForkProcessor from './processors/events/ForkProcessor';
import PingProcessor from './processors/events/PingProcessor';
import RepositoryProcessor from './processors/events/RepositoryProcessor';
import WebHookEvent from './WebHookEvent';
import WebHookEventProcessor from './WebHookEventProcessor';

@singleton()
export default class WebHookEventProcessorRegistry {
  private readonly registry: Map<string, WebHookEventProcessor> = new Map();

  constructor(pingProcessor: PingProcessor, forkProcessor: ForkProcessor, repositoryProcessor: RepositoryProcessor) {
    this.registry.set('ping', pingProcessor);
    this.registry.set('fork', forkProcessor);
    this.registry.set('repository', repositoryProcessor);
  }

  async dispatch(event: WebHookEvent, hook: Hook): Promise<boolean> {
    const processor = this.registry.get(event.event);
    if (processor == null) {
      return false;
    }

    return processor.process(event, hook);
  }
}
