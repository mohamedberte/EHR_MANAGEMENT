// express configuration
var express = require('express');
var router = express.Router();
var indy = require('indy-sdk');
var crypto = require('crypto');

const Request = require('../model/request');
const credDefinition = require('../model/credDefinition');



router.get('/', notLoggedIn, function(req, res){
    res.render('pages/index');
});
router.get("/accueil", isLoggedIn, function(req, res){
    res.render("pages/index-logged", { user : req.user.username, wallet : req.user.info_connect });
});


router.get('/login',notLoggedIn, function(req, res, next) {
    res.render('pages/login');
});

router.get('/signup',notLoggedIn, function(req, res, next) {
    res.render('pages/signup');
});

router.post('/get_did_key',isLoggedIn, async function(req, res, next) {
    var [did, verkey] = await indy.createAndStoreMyDid(req.body.param1, {});
    console.log("Generation OK : ", {'did': did, 'verkey': verkey});
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        data :  {'did': did, 'verkey': verkey},
        success : true
    }));
});

router.post('/sign_msg_request', isLoggedIn, async function(req, res, next){
    
    console.log(req.body.param1);
    // Calcul du hash du message
    var hash = crypto.createHash('sha256', req.body.param1).digest('base64');
    console.log("Hash : " + hash);
    const signature = await indy.cryptoSign(req.body.param2, req.body.param3, Buffer.from(hash, 'utf8'));
    
    console.log("Data Signed :" + signature)
    console.log(JSON.stringify(signature));
    console.log(Buffer.from(JSON.parse(JSON.stringify(signature)).data));

    var result =  await indy.cryptoVerify(req.body.param3, Buffer.from(hash, 'utf8'),Buffer.from(JSON.parse(JSON.stringify(signature)).data))
    if(result){
        console.log("Challenge local success");
    }
    else {
        console.log("challenge local failed")
    };

    res.setHeader('Content-Type', 'application/www-form-encoded');
    res.send(JSON.stringify({
        data :  signature,
        success : true
    }));
})

router.post('/prover_server', async function(req, res, next) {
    console.log("hey Request received", req.body.type_request);
    switch(req.body.type_request){
        case "GET_IDS_CREDENTIAL_REQUEST":
            var newRequest = new Request();
            newRequest.request(req.body.did, req.body.verkey, req.body.type_request,'PENDING', JSON.stringify({'schema' : req.body.s_id , 'c_def' : req.body.c_defId, 'c_offer' : req.body.c_Offer}), req.body.req_id, req.body.endpoint_to, req.body.endpoint_from);
            console.log(newRequest)
            newRequest.save((err, request) => {
                if (err){                
                    data = "Request rejected";
                    console.log(data);
                    res.send(JSON.stringify({
                        data : "OK",
                        success : false
                        }));
                }
                else {
                    console.log("Request OK");
                    res.send(JSON.stringify({
                        data : "OK",
                        success : true
                        }));    
                }
            })
            break;
        case "CERTIFIED_CREDENTIAL_REPLY" :
            var newRequest = new Request();
            newRequest.request(req.body.fromDid, "Allready know", req.body.type_request,'PENDING', JSON.stringify({'did' : req.body.did, 'data': req.body.data, 'metaData' : req.body.metaData, 'credDef' : req.body.credDef }), req.body.req_id, req.body.endpoint_to, req.body.endpoint_from);
            console.log(newRequest)
            newRequest.save((err, request) => {
                if (err){                
                    data = "Request rejected";
                    console.log(data);
                    res.send(JSON.stringify({
                        data : "OK",
                        success : false
                        }));
                }
                else {
                    console.log("Request OK");
                    res.send(JSON.stringify({
                        data : "OK",
                        success : true
                        }));    
                }
            })
            break;
        // Request for proof sent by the verifier   
        case "PROOF_REQUEST" :
            var newRequest = new Request();
            var nonce = req.body.nonce;
            newRequest.request(req.body.fromDid, req.body.fromVerkey, req.body.type_request,'PENDING', JSON.stringify({'schema' : req.body.schema, 'proofReq': req.body.proofReq, 'credId' : req.body.credId}), nonce, req.body.endpoint_to, req.body.endpoint_from);
            console.log(newRequest)
            newRequest.save((err, request) => {
                if (err){                
                    data = "Request rejected";
                    console.log(data);
                    res.send(JSON.stringify({
                        data : "OK",
                        success : false
                        }));
                }
                else {
                    console.log("Request OK");
                    res.send(JSON.stringify({
                        data : "OK",
                        success : true
                        }));    
                }
            })
            break;
    
    }
    

});

router.post('/manage_request', async function(req, res, next) {
    console.log(req.body.type_request);
    switch(req.body.type_request){
        case "GET_ALL_REQUEST":
            var allRequest = await Request.find({});
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                data : allRequest,
                success : true
            }));
            break;

        case "REJECT":
            Request.deleteOne({nonce: req.body.nonce}, async function(err, user){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        data : "Error",
                        success : false
                    }));        
                }
                else {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        data : "Deleted",
                        success : true
                    }));  
                }
        })
        break;

    }
    
});

router.post('/manage_credential',isLoggedIn, async function(req, res, next) {

    switch(req.body.type_request){
        case "WALLET_CREDENTIAL_INFO" :
            var credentials = await indy.proverGetCredentials(req.body.param1, req.body.param2);
            console.log("Credentials : ", credentials);
            if(credentials.length != 0){
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    data :  credentials,
                    success : true
                }));
            }
            else{
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    data :  "Rien n'a été trouvé dans votre wallet",
                    success : false
                }));
            }break;
        case "GET_CREDENTIAL_REQUEST" :
            console.log(req.body.credOffer)
            var schemaRequest = await indy.buildGetSchemaRequest(req.body.issuerDid, req.body.credOffer.schema_id);
            var schemaResponse = await indy.submitRequest(req.body.poolHandle, schemaRequest);
            var [, schema] = await indy.parseGetSchemaResponse(schemaResponse);
            console.log("Prover got schema from ledger : ");
            console.log(schema);
            // credential Def
            /*
            var credDefRequest = await indy.buildGetCredDefRequest(req.body.issuerDid, req.body.credOffer.cred_def_id);
            console.log("hum")
            var credDefresponse = await indy.submitRequest(req.body.poolHandle, credDefRequest);
            var [, credDef] = await indy.parseGetCredDefResponse(credDefresponse);
            console.log("Prover got credDef from ledger : " + credDef); */

            // Master secret :
            var masterSecret = await indy.proverCreateMasterSecret(req.body.wallet, undefined);
            console.log("Create a master secret");
            console.log(masterSecret);

            // metaData
            var [credReq, credReqMetadata] = await indy.proverCreateCredentialReq(req.body.wallet, req.body.did, req.body.credOffer,
                                                        req.body.credDef.value, masterSecret);

            console.log("Request Cred : " , credReq)
            console.log("Meta Data : ", credReqMetadata);

            res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    data :  {credRequest : credReq, metaData : credReqMetadata, schema : schema, credDef : req.body.credDef.value, credOffer : req.body.credOffer},
                    success : true
                }));
                break;

        case "SAVE_CREDENTIAL_IN_WALLET" :
                
                console.log("Credential : ");
                console.log(req.body.cred)
                // I save credential definition cause indy api buildGetCredDef() does'nt work
                // I need it for verification process with verifier
                console.log(req.body.credDef);
                var newCredDef = new credDefinition();
                newCredDef.request(req.body.cred.cred_def_id, JSON.stringify(req.body.credDef));
                console.log(newCredDef);
                newCredDef.save((err, request) => {
                    if (err){                
                        data = "Not Ok";
                        console.log(data);
                    }
                    else {
                        console.log("OK");
                    }
                })
            
            // store process
            var id = await indy.proverStoreCredential(
                req.body.wallet,
                undefined,
                req.body.metaData,
                req.body.cred,
                req.body.credDef,
                undefined
              );
              console.log("Value saving in wallet :");
              console.log(id);

              res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    data :  'id',
                    success : true
                }));
                break;
        case "GET_PROOF":
            console.log('Getting proof')
            var credentials = await indy.proverGetCredentialsForProofReq(req.body.wallet, req.body.data.proofReq.proofReq);
            console.log(JSON.stringify(credentials));
            var reqCredentialsProof = {self_attested_attributes:{}};

            // Getting of credential definition from Db (remerber : indy.buildGetCredDef does'nt work)
            credDefinition.findOne({'id': req.body.data.credId}, async function(err, request){
                if (request === null) {
                    console.log("Nothing associate to this Credential ID");
                    res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({
                            data : "Nothing found for credDefId",
                            success : false
                        }));
                }
                else {
                
                    console.log("Credential def got from Db : ", JSON.parse(request.credDef_value));

                    var reqAttr = {}
                    var reqPred = {}
 
                    var nbattr = req.body.data.proofReq.nb_attrReq;
                    var nbpred = req.body.data.proofReq.nb_predReq
                    // Construction of proof request data format to create it
                    for(var i=0;i<nbattr; i++){
                        Object.assign(reqAttr, {['attr'+(i+1)+'_referent']: {
                            cred_id: credentials.attrs['attr'+(i+1)+'_referent'][0].cred_info.referent,
                            revealed: true }});
                    }

                    for(var j=0;j<nbpred;j++){
                        Object.assign(reqPred, {['predicate'+(j+1)+'_referent']: {
                            cred_id: credentials.predicates['predicate'+(j+1)+'_referent'][0].cred_info.referent }});
                    }

                    reqCredentialsProof.requested_attributes = reqAttr;
                    reqCredentialsProof.requested_predicates = reqPred;

                    if (reqCredentialsProof.requested_attributes || reqCredentialsProof.requested_predicates){
                        console.log("requestProofFormat generated : ", reqCredentialsProof);
                        
                        // Master secret :
                        var masterSecret = await indy.proverCreateMasterSecret(req.body.wallet, undefined);
                        console.log("Create a master secret : ");
                        console.log(masterSecret);
                        
                        // Format
                        var schemas = {
                            [JSON.parse(req.body.data.schema).id] : JSON.parse(req.body.data.schema)
                        }
                        console.log(request.credDef_id)
                        var credDefs = {
                            [request.credDef_id] : JSON.parse(request.credDef_value)
                        }

                        console.log( "Format schemas : ", schemas)
                        console.log( "Format credentials : ", credDefs)
                        console.log('Prf request : ', req.body.data.proofReq.proofReq)
                        console.log("requestCredentialProof ", reqCredentialsProof)

                        // Proof
                        var proof = await indy.proverCreateProof(req.body.wallet,
                        req.body.data.proofReq.proofReq, reqCredentialsProof,masterSecret,
                            schemas, credDefs, {})
                        
                        console.log("Proof ready to be sent to verifier : " ,proof)
                        
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({
                            data :  {"proof" : proof, "proofReq" : req.body.data.proofReq.proofReq, "schemas" : schemas, "credDefs" : credDefs},
                            success : true
                        }));
                    };
                }});
                break;
            /*
            prover.requestedCredentials = {
                self_attested_attributes: {},
                requested_attributes: {
                  attr1_referent: {
                    cred_id: prover.credInfoForAttribute["referent"],
                    revealed: true
                  }
                },
                requested_predicates: {
                  predicate1_referent: {
                    cred_id: prover.credInfoForPredicate["referent"]
                  }
                }
              };

              prover.revocStates = {};

            prover.proof = await indy.proverCreateProof(
                prover.wallet,
                prover.proofReq,
                prover.requestedCredentials,
                prover.masterSecretId,
                prover.schemas,
                prover.credDefs,
                prover.revocStates
            );*/
            
                
    }
    
});


// check isLoggedIn
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// check notLoggedIn
function notLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/accueil');
    }
    next()
}

// Logout
router.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;


