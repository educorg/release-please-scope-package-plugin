import { Commit, ConventionalCommit } from 'release-please/build/src/commit';
import { type GitHub } from 'release-please/build/src/github'
import { type RepositoryConfig } from 'release-please/build/src/manifest'
import { ManifestPlugin } from 'release-please/build/src/plugin'
import { Release } from 'release-please/build/src/release';
import { Strategy } from 'release-please/build/src/strategy';


const commitRegex = /^(?<prefix>\w+)\((?<scope>.+)\)(?<force>!?):/m;
const MULTILINE_EMPTY_FIX = 'fix(ScopePackagePlugin): Empty multiline commit';

export interface ScopePackagePluginConfig {
  type: 'scope-package',
  fixMultilineFirstLine: boolean;
}

export class ScopePackagePlugin extends ManifestPlugin {
  protected fixMultilineFirstLine: boolean;

  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    fixMultilineFirstLine: ScopePackagePluginConfig['fixMultilineFirstLine'] = true,
  ) {
    super(github, targetBranch, repositoryConfig);

    this.fixMultilineFirstLine = fixMultilineFirstLine;
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    if (!this.fixMultilineFirstLine) return commits;

    return commits.filter((commit) => commit.message !== MULTILINE_EMPTY_FIX);
  }

  async preconfigure(strategiesByPath: Record<string, Strategy>, commitsByPath: Record<string, Commit[]>, releasesByPath: Record<string, Release>): Promise<Record<string, Strategy>> {
    this.logger.info('[ScopePackagePlugin] Start analyze commits');

    // Получаем список всех названий пакетов
    // чтобы далее по ним фильтровать коммиты
    const components: string[] = [];
    Object.values(releasesByPath).forEach((release) => {
      const { component } = release.tag;

      components.push(component);
    });
    const getAffectedComponents = (scope: string): string[] => {
      const firstScope = scope.split('/')[0];
      return firstScope
        .split(',')
        .filter((component) => components.includes(component));
    };

    Object.entries(commitsByPath).forEach(([path, commits]) => {
      const { component } = releasesByPath[path].tag;
      const commitIndexesForDeletion = [];

      // Обходим коммиты каждого пакета и удаляем те, что не повлияли на текущее пакет
      commits.forEach((commit, index) => {
        const isMultilineCommit = commit.message.trim().includes('\n');
        const commitMatch = commit.message.match(commitRegex);

        if (isMultilineCommit) {
          this.logger.debug(`[ScopePackagePlugin] Process multiline commit "${commit.message}" ${commit.sha} for ${component}`);

          const lines = commit.message.split('\n');
          const newLines: string[] = [];
          // Логика чанков необходима, чтобы вместе с semantical commit, оставалась/удалялась инфа под ним
          // не разделенная новой пустой строкой
          let openedChunk = false;
          let chunkIsAffected = true;

          // Проверяем, является ли первая строка semantical
          // иначе release-please проигнорирует любой текст в коммите
          if (!lines[0].includes(':')) {
            if (!this.fixMultilineFirstLine) return;

            this.logger.debug(`[ScopePackagePlugin] Add semantical prefix for multiline commit ${commit.sha}`);
            newLines.push(MULTILINE_EMPTY_FIX);
          }

          lines.forEach((line) => {
            // Чанки будут разделяться пустыми строками
            if (!line.trim()) {
              // Reset chunk
              openedChunk = false;
              chunkIsAffected = true;
              newLines.push(line);
              return;
            }

            const lineMatch = line.match(commitRegex);

            if (lineMatch) {
              openedChunk = true;

              const {
                scope,
              } = lineMatch.groups;

              const affectedComponents = getAffectedComponents(scope);

              if (affectedComponents.length && !affectedComponents.includes(component)) {
                chunkIsAffected = false;
              } else {
                chunkIsAffected = true;
                newLines.push(line);
              }
            } else {
              if (openedChunk && !chunkIsAffected) return;
              else newLines.push(line);
            }
          });

          const newMessage = newLines.join('\n').trim();

          if (commit.message.trim() !== newMessage) {
            this.logger.info(`[ScopePackagePlugin] Change commit ${commit.sha} message to "${newMessage}" for ${component}`);
            commits.splice(index, 1, {
              ...commit,
              message: newMessage,
            });
          }
        } else if (commitMatch) {
          const {
            scope,
          } = commitMatch.groups;

          const affectedComponents = getAffectedComponents(scope);

          this.logger.debug(`[ScopePackagePlugin] Commit "${commit.message}" ${commit.sha} affect ${affectedComponents}`);

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
