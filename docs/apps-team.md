# Apps:Team

Get team information of your applications.

* [apps:team](#appsteam)

```sh-session
USAGE
  $ discloud apps:team [APP_ID]

ALIAS
  $ discloud app:team [APP_ID]

ARGUMENTS
  APP_ID The id of your app on Discloud

OPTIONS
  -c, --create [perms | all] Add a mod to your application
  -d, --delete               Delete a mod from your application
  -e, --edit   [perms | all] Edit mod perms for your application
  -p, --perms  [perms | all] Mod permissions

EXAMPLE
  $ discloud app:team -c=MOD_ID -p=backup_app-commit_app-edit_ram
  $ discloud app:team -d=MOD_ID

PERMS
  - backup_app
  - commit_app
  - edit_ram
  - logs_app
  - restart_app
  - start_app
  - status_app
  - stop_app
```
