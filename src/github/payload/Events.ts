import type { Commit, OrganizationSimple, PullRequest, Repository, SimpleUser, WebHook } from './Components';

interface BaseEvent {
  sender: SimpleUser;
}

export interface SimpleEvent extends BaseEvent {
  action?: string;
}

export interface PingEvent extends BaseEvent {
  /** The webhook that is being pinged */
  hook: WebHook;
  /** The ID of the webhook that triggered the ping. */
  hook_id: number;
  organization?: OrganizationSimple;
  repository?: Repository;

  /** Random string of GitHub zen. */
  zen: string;
}

export interface RepositoryEvent extends BaseEvent {
  action: 'archived' | 'unarchived' | 'publicized' | 'privatized' | 'created' | 'deleted' | 'renamed' | 'transferred' | 'edited';
  organization?: OrganizationSimple;
  repository: Repository;
}

export interface RepositoryRenamedEvent extends RepositoryEvent {
  action: 'renamed';
  changes: {
    repository: {
      name: {
        from: string;
      }
    }
  };
}

export interface RepositoryTransferredEvent extends RepositoryEvent {
  action: 'transferred';
  changes: {
    owner: {
      from: {
        organization?: OrganizationSimple;
        user?: SimpleUser;
      }
    }
  };
}

export interface ForkEvent extends BaseEvent {
  forkee: Repository;
  repository: Repository;
  organization?: OrganizationSimple;
}

export interface PullRequestEvent extends BaseEvent {
  action: 'opened' | 'closed';
  /** The pull request number. */
  number: number;
  organization?: OrganizationSimple;
  repository: Repository;
  pull_request: PullRequest;
}

export interface PushEvent extends BaseEvent {
  /** The full git ref that was pushed. Example: refs/heads/main or refs/tags/v3.14.1. */
  ref: string;
  /** The SHA of the most recent commit on ref after the push. */
  after: string;
  base_ref?: string | null;
  /** The SHA of the most recent commit on ref before the push. */
  before: string;
  commits: Commit[];
  /** URL that shows the changes in this ref update, from the before commit to the after commit. */
  compare: string;
  /** Whether this push created the ref. */
  created: boolean;
  /** Whether this push deleted the ref. */
  deleted: boolean;
  /** Whether this push was a force push of the ref. */
  forced: boolean;
  organization?: OrganizationSimple | null;
  repository: Repository;
}
