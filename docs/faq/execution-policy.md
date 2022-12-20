# FAQ

## Execution Policy

Error message: "File ... cannot be loaded because running scripts is disabled on this system"
Source: <https://go.microsoft.com/fwlink/?LinkID=135170>

### Solution

Execute the PowerShell as Adminstrator and paste this command:

```sh
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```
