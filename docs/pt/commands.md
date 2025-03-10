# Comandos

```sh
discloud --help

discloud [comando]

discloud app <comando>                         Gerencie seus aplicativos
  discloud app apt <comando>                   Gerencie seus aplicativos APT
    discloud app apt install <app> [apt...]    Instale o APT em seu aplicativo                                  [aliases: i]
    discloud app apt uninstall <app> [apt...]  Desinstale o APT do seu aplicativo                               [aliases: u]
  discloud app backup [app] [path]             Obtenha backup do código do seu aplicativo do Discloud           [aliases: bkp]
  discloud app commit <app> [glob..]           Envie um aplicativo ou site para o Discloud                      [aliases: c]
  discloud app console <app>                   Use o terminal do aplicativo                                     [aliases: terminal]
  discloud app delete <app>                    Exclua um ou todos os seus aplicativos no Discloud               
  discloud app info [app]                      Obtenha informações sobre seus aplicativos                       
  discloud app logs [app] [path]               Visualize os logs do aplicativo no Discloud                      
  discloud app mod <comando>                   Gerencie sua equipe de aplicativos                               
  discloud app mod add <app> <mod> [perms...]  Adicione MOD ao seu aplicativo                                   
  discloud app mod delete <app> <mod>          Exclua MOD do seu aplicativo                                     
  discloud app mod edit <app> <mod> [perms...] Edite permissões de MOD do seu aplicativo                        
  discloud app mod info <app>                  Obtenha informações de MOD do seu aplicativo                     
  discloud app ram <app> <amount>              Defina a quantidade de RAM para seu aplicativo                   
  discloud app restart [app]                   Reinicie um ou todos os seus aplicativos de equipe no Discloud   
  discloud app start [app]                     Inicie um ou todos os seus aplicativos no Discloud               
  discloud app status [app]                    Obtenha o status dos seus aplicativos                            
  discloud app stop [app]                      Pare um ou todos os seus aplicativos no Discloud                 
  discloud app upload [glob..]                 Carregue um aplicativo ou site para o Discloud                   [aliases: up]
discloud init                                  Inicie o arquivo discloud.config                                 
discloud login                                 Faça login na API do Discloud                                    
discloud team <comando>                        Gerencie aplicativos de equipe                                   
  discloud team backup [app] [path]            Obtenha backup do código do aplicativo da sua equipe do Discloud [aliases: bkp]
  discloud team commit <app> [glob..]          Envie um aplicativo ou site para o Discloud                      [aliases: c]
  discloud team info                           Obtenha informações sobre os aplicativos da sua equipe           
  discloud team logs [app] [path]              Visualize os logs do seu aplicativo do Tean no Discloud          
  discloud team ram <app> <amount>             Defina a quantidade de RAM para seu aplicativo                   
  discloud team restart [app]                  Reinicie um ou todos os seus aplicativos no Discloud             
  discloud team start [app]                    Inicie um ou todos os seus aplicativos da equipe no Discloud     
  discloud team stop [app]                     Pare um ou todos os seus aplicativos da equipe no Discloud       
discloud user <comando>                        Gerencie seu perfil                                              
  discloud user info                           Obtenha suas informações                                         
  discloud user locale                         Defina sua localidade                                            
discloud zip [glob..]                          Crie zip                                                         

Opções:
  -h, --help                                   Mostrar ajuda                                                    [boolean]
  -v, --version                                Mostrar número da versão                                         [boolean]
```
