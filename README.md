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

## Идея

Идея как создать плагин взята из [@ipfs-shipyard/release-please-ipfs-plugin](https://github.com/ipfs-shipyard/release-please-ipfs-plugin)
