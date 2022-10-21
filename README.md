# ELECTRONIC HEALTH RECORDS MANAGEMENT SYSTEM
### Version :
* Branche releases 1.0.X [(Première version du projet)](https://github.com/mohamedberte/EHR_MANAGEMENT/tree/release/1.0.x)
## Objective
The health record management system implemented is a solution that allows patients to have full control over their identity and health attributes while facilitating access to information when needed.

## Acteurs
The health record management system involves 3 actors who all have a specific role in the exchange. We have the data provider called Issuer, the evidence giver called Prover and the evidence verifier called 
called Verifier.

![Credential Model](Docs/img/ACTOR.png)



## Architecture web
The web architecture uses several technologies that must be installed before being able to make manipulations. It consists of 4 services:
- Issuer with http//:localhost:3000
- Prover with http//:localhost:3010
- Verifier with http//:localhost:3020
- Steward with http//:localhost:9000

![Credential Model](Docs/img/ARCHI_WEB_EHR.png)


### Requirements
* Python 
* Wsl with the Ubuntu version or directly under linux
* Indy network lancé au préalable avec le docker [(Instructions)](https://github.com/TrustNetPK/indy-env-setup) 
* Node 8.x

### Step 1
The first step is the initialization phase of the Indy network. If this has not yet been done on your machine, you should follow these instructions below:
* First you need to download and install the docker [(Download)](https://www.docker.com/)

* Clone the git project on your machine: https://github.com/mohamedberte/EHR_MANAGEMENT/edit/main/README.md

* Open the terminal from your folder then run the following command to be on linux terminal :
```console
wsl
```

* Then run this command to build the indy network on the docker

```console
npm run ledger:build
npm run ledger:start
```
To stop it, just use this command :
```console
npm run ledger:stop
```


### Step 2
Une fois que le réseau indy est lancé, nous pouvons maintenant lancer nos serveurs mais bien avant, nous allons installer les packages nécessaire pour le lancement de notre projet avec la commande suivante :

```console
npm install
```
Puis lancer les services MongoDB avec :
```console
sudo service mongodb start
```
Et sur chaque terminal, nous allons lancer :
* Pour le Steward :
```console
node nodes/app.js
```
* Pour le Issuer :
```console
node issuer/app.js
```
* Pour le Prover :
```console
node prover/app.js
```
* Pour le Verifier :
```console
node verifier/app.js
```

## Vidéo de démonstration
La vidéo de démonstration se trouce ci-dessous :
<object width="425" height="350">
  <param name="movie" value="#" />
  <param name="wmode" value="transparent" />
  <embed src="#"
         type="application/x-shockwave-flash"
         wmode="transparent" width="425" height="350" />
</object>
</hr>
