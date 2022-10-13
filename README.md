# ELECTRONIC HEALTH RECORDS MANAGEMENT SYSTEM
## Objectif
Le système de gestion des dossiers médicaux implémenté est une solution qui permet aux patients d'avoir le contrôle total sur leur identié ainsi que leurs attributs de santé tout en facilitant l'accès aux informations en cas de besoin.

## Acteurs
Le système de gestion des dossiers médicaux fait appel à 3 acteurs qui ont tous un rôle spécifique au niveau de des échanges. Nous avons le fournisseur de données appelé Issuer, le donneur de preuve appelé Prover et le vérificateur de 
preuve appelé Verifie.

![Credential Model](Docs/img/ACTOR.png)



## Architecture web
L'architecture web mise en place utilise plusieurs technologies qui doivent impérativement être installé au préalable avant de pouvoir faire des manipulations. Elle est constituée de 4 services :
- Issuer avec l'adresse http//:localhost:3000
- Prover avec l'adresse http//:localhost:3010
- Verifier avec l'adresse http//:localhost:3020
- Steward avec l'adresse http//:localhost:9000
![Credential Model](Docs/img/ARCHI_WEB_EHR.png)


### Requirements
* Python 2.7.16 (Exacty this version)
* libindy built and setuped [(Instructions)](https://github.com/TrustNetPK/indy-env-setup) 
* A locally running indy network on 127.0.0.1 [(Instructions)](https://github.com/TrustNetPK/indy-env-setup) 
* Node 8.x or greater


## Usage

... Update coming soon
