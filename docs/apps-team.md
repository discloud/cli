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
  -c, --create Add a mod to your application
  -d, --delete Delete a mod from your application
  -e, --edit   Edit mod perms for your application
  -p, --perms  Mod permissions

EXAMPLE
  $ discloud app:team -c=MOD_ID -p=edit_ram-start_app-stop_app-backup_app-restart_app-status_app-logs_app-commit_app
  $ discloud app:team -d=MOD_ID
```
