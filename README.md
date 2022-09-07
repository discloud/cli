# Discloud CLI

[![GitHub](https://img.shields.io/github/license/discloud/cli)](https://github.com/discloud/cli/blob/main/LICENSE)
[![npm-downloads](https://img.shields.io/npm/dw/discloud-cli)](https://www.npmjs.com/package/discloud-cli)
[![npm](https://img.shields.io/npm/v/discloud-cli)](https://www.npmjs.com/package/discloud-cli)
[![cli](https://img.shields.io/badge/Discloud--CLI-Docs-blue)](https://discloud.github.io/cli)
[![github](https://img.shields.io/badge/GitHub-100000?logo=github&logoColor=white)](https://github.com/discloud/cli)

Discloud CLI is a quick option to control your apps in Discloud

## Installation

```sh
npm i --location=global discloud-cli
```

To get started using this CLI, first use:

```sh
discloud login
```

[![discloud-login](./assets/discloud-login.gif)](./docs/login.md)

If your app does not contain `discloud.config`, use:

```sh
discloud init
```

[![discloud-init](./assets/discloud-init.gif)](./docs/init.md)

Do you want to send an app to discloud? Use:

```sh
discloud upload .
```

[![discloud-upload](./assets/discloud-upload.gif)](./docs/upload.md)

If you want to see all commands

```sh
discloud --help

discloud version 0.2.2

  discloud                                       -                                                    
  version (v)                                    Output the version number                            
  upload (up)                                    Upload one app or site to Discloud.                  
  team:stop                                      Stop one or all of your apps on Discloud.            
  team:status                                    Get status information of your team applications.    
  team:start (team:i)                            Start one or all of your apps on Discloud.           
  team:restart                                   Restart one or all of your apps on Discloud.         
  team:ram                                       Set amount of ram for an app of your team.           
  team:logs (team:l)                             View the logs from team application in Discloud.     
  team:commit (team:c)                           Commit one app for your team.                        
  team:backups (team:backup, team:bkp, team:b)   Make backup from your team applications in Discloud. 
  team                                           View team information.                               
  stop                                           Stop one or all of your apps on Discloud.            
  status                                         View status information of your applications.        
  start (i)                                      Start one or all of your apps on Discloud.           
  restart                                        Restart one or all of your apps on Discloud.         
  ram                                            Set amount of ram for your app.                      
  logs (l)                                       View the logs from application in Discloud.          
  login                                          Login to Discloud API.                               
  locale                                         Set your locale.                                     
  init                                           Init discloud.config file.                           
  delete (del, rb)                               Delete one or all of your apps on Discloud.          
  commit (c)                                     Commit one app or site to Discloud.                  
  backups (backup, bkp, b)                       Make backup from your applications in Discloud.      
  apps:team (app:team)                           Get team information of your applications.           
  apps (app)                                     Get information of your applications.                
  help (h)                                       -                                                    
```

See more of the [docs](https://discloud.github.io/cli/).
