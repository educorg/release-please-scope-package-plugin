import { Commit, ConventionalCommit } from 'release-please/build/src/commit';
import { type GitHub } from 'release-please/build/src/github'
import { type CandidateReleasePullRequest, type RepositoryConfig } from 'release-please/build/src/manifest'
import { ManifestPlugin } from 'release-please/build/src/plugin'
import { Release } from 'release-please/build/src/release';
import { Strategy } from 'release-please/build/src/strategy';
import { type Update } from 'release-please/build/src/update'

export interface ScopePackagePluginConfig {
  packages?: string[];
}

export class ScopePackagePlugin extends ManifestPlugin {
  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    packages: ScopePackagePluginConfig['packages'],
  ) {
    super(github, targetBranch, repositoryConfig);
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.logger.info('[ScopePackagePlugin] processCommites', commits);

    return commits;
  }

  async run(pullRequests: CandidateReleasePullRequest[]): Promise<CandidateReleasePullRequest[]> {
    this.logger.info('[ScopePackagePlugin] run', pullRequests)

    return pullRequests;
  }

  async preconfigure(strategiesByPath: Record<string, Strategy>, _commitsByPath: Record<string, Commit[]>, _releasesByPath: Record<string, Release>): Promise<Record<string, Strategy>> {
    this.logger.info('[ScopePackagePlugin] preconfigure', strategiesByPath, _commitsByPath, _releasesByPath);

    return strategiesByPath;
  }
}
