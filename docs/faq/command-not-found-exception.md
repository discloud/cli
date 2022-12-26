# FAQ

## Command Not Found Exception

- Error message: The term 'discloud' is not recognized as the name of a cmdlet, function, script, file, or operable program. Check the spelling of the name, of if a path was included, verify that the path is correct and try again.
- Error code: CommandNotFoundException

### Pre-solution

- Check that the `discloud-cli` is installed.

### Solution

#### Method 1

- Reinstall the CLI.

```sh
npm uninstall -g discloud-cli
npm i -g discloud-cli
```

#### Method 2

- Reinstall the [NodeJS](https://nodejs.org) and the CLI.

```sh
npm i -g discloud-cli
```

### Method 3

- Include `NodeJS` installation folder in `PATH` environment variable.
