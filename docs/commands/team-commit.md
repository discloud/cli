# Commands

## Team:Commit

Commit one app for your team.

- [team:commit](#teamcommit)

```sh-session
USAGE
  $ discloud team:commit [PATH] [APP_ID]

ALIAS
  $ discloud team:c [PATH] [APP_ID]

ARGUMENTS
  APP_ID The id of your app on Discloud
  PATH   The path of file name
```

- If you put parameters, the first parameter needs to be `file or folder path` and the second needs to be `application id`.
- If contains `ID` in `discloud.config`, `APP_ID` is optional.
- If it doesn't find an app id, the CLI will show a list of your apps for you to select.
