# ELECTRONIC HEALTH RECORDS MANAGEMENT SYSTEM
## Objectif
Le système de gestion des dossiers médicaux implémenté est une solution qui permet aux patients d'avoir le contrôle total sur leur identié ainsi que leurs attributs de santé tout en facilitant l'accès aux informations en cas de besoin.

## Acteurs
Le système de gestion des dossiers médicaux fait appel à 3 acteurs qui ont tous un rôle spécifique au niveau de des échanges. Nous avons le fournisseur de données appelé Issuer, le donneur de preuve appelé Prover et le vérificateur de 
preuve appelé Verifie.

![Credential Model](doc/cred-model.png)


## Requirements
* Python 2.7.16 (Exacty this version)
* libindy built and setuped [(Instructions)](https://github.com/TrustNetPK/indy-env-setup) 
* A locally running indy network on 127.0.0.1 [(Instructions)](https://github.com/TrustNetPK/indy-env-setup) 
* Node 8.x or greater


## Usage

```
git clone https://github.com/TrustNetPK/trustnet-nodejs-sample.git
cd trustnet-nodejs-sample
npm install
```


*Run the agents in following order

### To run verifier
```
cd trustnet-nodejs-sample/src
node verifier.js
```

### To run prover
```
cd trustnet-nodejs-sample/src
node prover.js
```

### To run issuer
```
cd trustnet-nodejs-sample/src
node issuer.js
```


## Demo Video
</hr>

[![DEMO](https://img.youtube.com/vi/f9Apo_SO0Os/0.jpg)](https://www.youtube.com/watch?v=f9Apo_SO0Os)

