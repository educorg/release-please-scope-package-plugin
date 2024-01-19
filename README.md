# release-please-scope-package-plugin

> Плагин для указания конкретных затронутых `package` в рамках коммита (актуально при `squash-merge`)


## How to use

### Add to release-please config

```jsonc
{
  // ...
  "plugins": [/** ... */, "release-please-scope-package-plugin"]
  // ...
}

or

{
  "plugins": [
    ...
    {
      "type": "release-please-scope-package-plugin",
      "fixMultilineFirstLine": true
    }
  ]
}
```

### Ensure you call the release-please binary

**NOTE:** Simply adding to the release-please config *is not enough* to make it run. You must also call the release-please CLI with the plugin name.

```bash
release-please release-pr ... --plugin=release-please-scope-package-plugin
```

## Использование

Плагин ищет коммиты со `scope` уже имеющихся в конфиге пакетов (например для `apps/studwork-front` это `studwork`, название из `package.json`) вроде `fix(studwork/util): Some fix` и исключает подобные коммиты из остальные пакетов

Для указания нескольких затронутых пакетов необходимо указывать их через запятую (прим. `fix(work24,studwork/util): Some fix`)

Так же плагин работает с `multiline` коммитами, которые обычно появляются при `squash-merge`

## Идея

Идея как создать плагин взята из [@ipfs-shipyard/release-please-ipfs-plugin](https://github.com/ipfs-shipyard/release-please-ipfs-plugin)
