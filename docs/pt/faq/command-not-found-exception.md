# FAQ

## Exceção de comando não encontrado

- Mensagem de erro: O termo 'discloud' não é reconhecido como o nome de um cmdlet, função, script, arquivo ou programa operável. Verifique a ortografia do nome, se um caminho foi incluído, verifique se o caminho está correto e tente novamente.
- Código do erro: CommandNotFoundException

### Pré-solução

- Verifique se o `discloud-cli` está instalado.

### Solução

#### Método 1

- Reinstale a CLI.

```sh
npm uninstall -g discloud-cli
npm i -g discloud-cli
```

#### Método 2

- Reinstale o [NodeJS](https://nodejs.org) e a CLI.

```sh
npm i -g discloud-cli
```

### Método 3

- Inclua a pasta de instalação `NodeJS` na variável de ambiente `PATH`.
