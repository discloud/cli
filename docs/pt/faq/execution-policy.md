# FAQ (Perguntas frequentes)

## Política de Execução

Mensagem de erro: "O arquivo ... não pode ser carregado porque a execução de scripts foi desabilitada neste sistema."  
Fonte: <https://go.microsoft.com/fwlink/?LinkID=135170>

### Solução

Execute o PowerShell como Administrador e cole este comando:

```sh
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```
