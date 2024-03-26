import { singleton } from 'tsyringe';
import { Hook } from '../config/AppConfiguration';
import ForkProcessor from './event_processors/ForkProcessor';
import PingProcessor from './event_processors/PingProcessor';
import PullRequestProcessor from './event_processors/PullRequestProcessor';
import PushProcessor from './event_processors/PushProcessor';
import RepositoryProcessor from './event_processors/RepositoryProcessor';
import WebHookEvent from './WebHookEvent';
import WebHookEventProcessor from './WebHookEventProcessor';

@singleton()
export default class WebHookEventProcessorRegistry {
  private readonly registry: Map<string, WebHookEventProcessor> = new Map();

  constructor(
    pingProcessor: PingProcessor,
    forkProcessor: ForkProcessor,
    repositoryProcessor: RepositoryProcessor,
    pullRequestProcessor: PullRequestProcessor,
    pushProcessor: PushProcessor
  ) {
    this.registry.set('ping', pingProcessor);
    this.registry.set('fork', forkProcessor);
    this.registry.set('repository', repositoryProcessor);
    this.registry.set('pull_request', pullRequestProcessor);
    this.registry.set('push', pushProcessor);
  }

  async dispatch(event: WebHookEvent, hook: Hook): Promise<boolean> {
    const processor = this.registry.get(event.event);
    if (processor == null) {
      return false;
    }

    return processor.process(event, hook);
  }
}
