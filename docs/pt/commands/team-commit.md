# Comandos

## Team:Commit

Atualize um aplicativo para sua equipe.

- [team:commit](#teamcommit)

```sh-session
USO
  $ discloud team:commit [PATH]

ALIAS
  $ discloud team:c [PATH]

OPÇÕES
  --app APP_ID   O id do seu app no ​​Discloud.
  --no-erase-zip Não apagar o zip criado no processo

ARGUMENTOS
  PATH   O caminho do nome do arquivo.
```

- Você pode digitar vários argumentos de caminho de arquivo.
- Se você colocar parâmetros, o primeiro parâmetro precisa ser `file or folder path` e o segundo precisa ser `application id`.
- Se contém `ID` em `discloud.config`, `APP_ID` ​​é opcional.
- Se não encontrar um ID de aplicativo, a CLI mostrará uma lista de seus aplicativos para você selecionar.
