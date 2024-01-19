import { Commit, ConventionalCommit } from 'release-please/build/src/commit';
import { type GitHub } from 'release-please/build/src/github'
import { type CandidateReleasePullRequest, type RepositoryConfig } from 'release-please/build/src/manifest'
import { ManifestPlugin } from 'release-please/build/src/plugin'
import { Release } from 'release-please/build/src/release';
import { Strategy } from 'release-please/build/src/strategy';
import { type Update } from 'release-please/build/src/update'

const commitRegex = /(?<prefix>\w+)\((?<scope>.+)\)(?<force>!?):/;

export interface ScopePackagePluginConfig {

}

export class ScopePackagePlugin extends ManifestPlugin {
  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
  ) {
    super(github, targetBranch, repositoryConfig);
  }

  async preconfigure(strategiesByPath: Record<string, Strategy>, commitsByPath: Record<string, Commit[]>, releasesByPath: Record<string, Release>): Promise<Record<string, Strategy>> {
    this.logger.info('[ScopePackagePlugin] Start analyze commits');

    const components: string[] = [];
    Object.values(releasesByPath).forEach((release) => {
      const { component } = release.tag;

      components.push(component);
    });

    Object.entries(commitsByPath).forEach(([path, commits]) => {
      const { component } = releasesByPath[path].tag;
      const commitIndexesForDeletion = [];

      commits.forEach((commit, index) => {
        const commitMatch = commit.message.match(commitRegex);

        if (commitMatch) {
          const {
            prefix,
            scope,
            force,
          } = commitMatch.groups;

          const firstScope = scope.split('/')[0];
          const affectedComponents = firstScope
            .split(',')
            .filter((component) => components.includes(component));

          // Если на компонент не повлиял коммит, удаляем коммит из его списка
          if (affectedComponents.length && !affectedComponents.includes(component)) {
            commitIndexesForDeletion.push(index);
          }
        }
      });

      // Разворачиваем массив, чтобы удалять с конца и не ломать индексы
      commitIndexesForDeletion.reverse();
      commitIndexesForDeletion.forEach((index) => {
        const commit = commits[index];

        this.logger.info(`[ScopePackagePlugin] Remove commit "${commit.message}" ${commit.sha} from ${component}`);
        commits.splice(index, 1);
      });
    });

    return strategiesByPath;
  }
}
