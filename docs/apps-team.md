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
  -c, --create [MOD_ID]      Add a mod to your application
  -d, --delete [MOD_ID]      Delete a mod from your application
  -e, --edit   [MOD_ID]      Edit mod perms for your application
  -p, --perms  [perms | all] Mod permissions

EXAMPLE
  $ discloud app:team APP_ID -c=MOD_ID -p=backup_app-commit_app-edit_ram
  $ discloud app:team APP_ID -e=MOD_ID -p=all
  $ discloud app:team APP_ID -d=MOD_ID

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

* You can choose `permissions` by menu if you don't use the `-p` option
