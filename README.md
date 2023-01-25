# ELECTRONIC HEALTH RECORDS MANAGEMENT SYSTEM
### Version
* Branche releases 1.0.X [(first version release)](https://github.com/mohamedberte/EHR_MANAGEMENT/tree/release/1.0.x)
## Objective
The health record management system implemented is a solution that allows patients to have full control over their identity and health attributes while facilitating access to information when needed.

## Actor
The health record management system involves 3 actors who all have a specific role in the exchange. We have the data provider called Issuer, the evidence giver called Prover and the evidence verifier called 
called Verifier.

![Credential Model](Docs/img/ACTOR.png)

Les différents rôles au niveau de la blockchain indy sont : 
* Trust Anchor: c'est l'entité qui est responsable de la création et de la gestion des identités numériques sur la plateforme. Il peut également être chargé de vérifier et de certifier les informations d'identité des utilisateurs.
* Steward: c'est l'entité qui gère et administre les identités numériques sur la plateforme. Il peut aider les utilisateurs à créer des identités et à gérer leurs informations d'identité.
* Monitor: c'est l'entité qui surveille l'utilisation de la plateforme et s'assure que toutes les transactions sont valides et conformes aux règles établies.
* Endorser: c'est l'entité qui approuve les transactions et les mises à jour d'identité sur la plateforme. Il peut être utilisé pour s'assurer que toutes les transactions sont conformes aux politiques de sécurité et de confidentialité établies.

## Web architecture
The web architecture uses several technologies that must be installed before being able to make manipulations. It consists of 4 services:
- Issuer with http://localhost:3000 have communication adress http://localhost:3000/issuer_server
- Prover with http://localhost:3010 have communication adress http://localhost:3000/prover_server
- Verifier with http://localhost:3020 have communication adress http://localhost:3000/verifier_server
- Steward with http://localhost:9000

![Credential Model](Docs/img/WEB_EHR.png)


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
Once the indy network is launched, we can now launch our servers but before that, we will install the packages necessary to launch our project with the following command:

```console
npm install
```
Then start the MongoDB services with :
```console
sudo service mongodb start
```
And on each terminal, we will run :
* For Steward :
```console
node nodes/app.js
```
* For Issuer :
```console
node issuer/app.js
```
* For Prover :
```console
node prover/app.js
```
* For Verifier :
```console
node verifier/app.js
```

## Demo video
The demonstration video is below
<object width="425" height="350">
  <param name="movie" value="#" />
  <param name="wmode" value="transparent" />
  <embed src="#"
         type="application/x-shockwave-flash"
         wmode="transparent" width="425" height="350" />
</object>
</hr>
