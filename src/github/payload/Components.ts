/** The GitHub user that triggered the event. This property is included in every webhook payload. */
export type SimpleUser = {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id?: string | null;
  html_url: string;
  type: string;
  site_admin: boolean;
};

/** A GitHub organization. Webhook payloads contain the organization property when the webhook is configured for an organization, or when the event occurs from activity in a repository owned by an organization. */
export type OrganizationSimple = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  description?: string | null;
};

/** The repository on GitHub where the event occurred. Webhook payloads contain the repository property when the event occurs from activity in a repository. */
export type Repository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  organization?: string | null;
  forks: number;
  owner: SimpleUser;
  private: boolean;
  html_url: string;
  description?: string | null;
  fork: boolean;
  homepage?: string | null;
  language?: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  /** The size of the repository, in kilobytes. Size is calculated hourly. When a repository is initially created, the size is 0. */
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template?: boolean | null;
  topics?: string[] | null;
  /** Whether issues are enabled. */
  has_issues: boolean;
  /** Whether projects are enabled. */
  has_projects: boolean;
  /** Whether the wiki is enabled. */
  has_wiki: boolean;
  has_pages: boolean;
  /** Whether downloads are enabled. */
  has_downloads: boolean;
  /** Whether discussions are enabled. */
  has_discussions?: boolean | null;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'internal';
  pushed_at: string | number;
  created_at: string | number;
  updated_at: string;
  open_issues: number;
  watchers: number;
  master_branch?: string | null;
};

export type Commit = {
  /** An array of files added in the commit. A maximum of 3000 changed files will be reported per commit. */
  added: string[];
  /** Whether this commit is distinct from any that have been pushed before. */
  distinct: boolean;
  id: string;
  author: Committer;
  committer: Committer;
  /** The commit message. */
  message: string;
  /** An array of files modified by the commit. A maximum of 3000 changed files will be reported per commit. */
  modified: string[];
  /** An array of files removed in the commit. A maximum of 3000 changed files will be reported per commit. */
  removed: string[];
  /** The ISO 8601 timestamp of the commit. */
  timestamp: string;
  tree_id: string;
};

export type Committer = {
  date?: string | null;
  email?: string | null;
  name: string;
  username?: string | null;
};

/**
 * Pull requests let you tell others about changes you've pushed to a repository on GitHub. Once a pull request is sent,
 * interested parties can review the set of changes, discuss potential modifications, and even push follow-up commits if necessary.
 */
export type PullRequest = {
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  /** Number uniquely identifying the pull request within its repository. */
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: SimpleUser;
  body?: string | null;
  author_association: 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER';
  draft?: boolean | null;
  merged?: boolean | null;
  comments: number;
  review_comments: number;
  additions: number;
  deletions: number;
  changed_files: number;
};

/** The webhook that is being pinged */
export type WebHook = {
  id: number;
  active: boolean;
  created_at: string;
  name: 'web';
  type: 'string';
  updated_at: string;
  deliveries_url?: string | null;
  url?: string | null;
  ping_url?: string | null;
  test_url?: string | null;
};
