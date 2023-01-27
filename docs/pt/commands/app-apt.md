# Comandos

## App:Apt

Instale ou desinstale pacotes apt para seu aplicativo.

- [app:apt](#appapt)

```sh-session
USO
  $ discloud apps:apt [APP_ID] -i=PACOTE

ALIAS
  $ discloud apt [APP_ID] -i=PACOTE

ARGUMENTOS
  APP_ID O id do seu app no ​​Discloud.

OPÇÕES
  -i, --install [PACOTE]   Instalar um pacote.
  -u, --uninstall [PACOTE] Desisntalar um pacote.

EXEMPLO
  $ discloud app:apt APP_ID -i=PACOTE
  $ discloud app:apt APP_ID -u=PACOTE

PACOTE
  - canvas
  - puppeteer
  - java
  - ffmpeg
  - libgl
  - openssl
  - tools
```

- Se não contiver `APP_ID`, a CLI mostrará uma lista de seus aplicativos para você selecionar.
