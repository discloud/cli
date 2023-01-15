# Commands

## App:Apt

Install or uninstall apt packages for you application.

- [app:apt](#appapt)

```sh-session
USAGE
  $ discloud apps:apt [APP_ID] -i=PACKAGE

ALIAS
  $ discloud apt [APP_ID] -i=PACKAGE

ARGUMENTS
  APP_ID The id of your app on Discloud

OPTIONS
  -i, --install [PACKAGE]   Install a package.
  -u, --uninstall [PACKAGE] Uninstall a package.

EXAMPLE
  $ discloud app:apt APP_ID -i=PACKAGE
  $ discloud app:apt APP_ID -u=PACKAGE

PACKAGE
  - canvas
  - puppeteer
  - java
  - ffmpeg
  - libgl
  - openssl
  - tools
```

- If does not contains `APP_ID`, the CLI will show a list of your apps for you to select.
