// express configuration
var express = require('express');
var router = express.Router();
var indy = require('indy-sdk');
//
var crypto = require('crypto');
//
//Modele 
const Schema = require('../model/schema');
const Request = require('../model/request');
const { response } = require('express');



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


router.post('/schemas-info',isLoggedIn, async function(req, res, next) {

    var allSchema = await Schema.find({});
    var result = [];
    console.log(allSchema);
    if(allSchema.length != 0){
        var schemaRequest = null
        var response = null
        var [schemaID, schema] = [null, null];  

        for (var i=0; i<allSchema.length;i++){
            schemaRequest = await indy.buildGetSchemaRequest(req.body.param2, allSchema[i].id);
            response = await indy.signAndSubmitRequest(req.body.param1, req.body.param3, req.body.param2, schemaRequest);
            [schemaID, schema] = await indy.parseGetSchemaResponse(response);
            console.log("Schema got from ledger : ", schema);
            result.push(schema);
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data : result,
            success : true
        }));
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data : "rien a été trouvé",
            success : false
        }));
    }

    
});

router.post('/verifier_server', async function(req, res, next) {
    console.log("New request received ", req.body.type_request)
    res.setHeader('Content-Type', 'application/json');
    let data = null;
    switch(req.body.type_request){
        case "ATTRS_REQUEST" :
            var newRequest = new Request();
            var random = await indy.generateNonce();
            var hash = crypto.createHash('sha256', random).digest('base64');

            console.log('nonce = ' + random + "   hash = " +  hash);
            console.log('Data : ' + JSON.stringify(req.body.param2.data));
            newRequest.request(req.body.param2.did, req.body.param2.verkey, hash, req.body.type_request,'PENDING', JSON.stringify(req.body.param2.data), req.body.endpoint_to, req.body.endpoint_from);
            console.log(newRequest)
            newRequest.save((err, request) => {
                if (err){                
                    data = "Request rejected";
                    console.log(data);
                }
                else {
                    console.log("Challenge sent");
                    res.send(JSON.stringify({
                        data : random,
                        success : true
                        }));    
                }
            })
            break;
        
        case "CHALLENGE_REPLY" :
            console.log("Challenge Resp")
            var did = req.body.param2.did;
            var data_signed = req.body.param2.data;

            Request.findOne({did: did}, async function(err, request){
                if (request === null) {
                    console.log("Nothing associate to this DID");
                }
                else {
                    console.log(data_signed);
                    console.log(Buffer.from(data_signed.data));
                    console.log("verkey " + request.verkey +  " nonce " + Buffer.from(request.nonce, 'utf8'))
                    var result =  await indy.cryptoVerify(request.verkey, Buffer.from(request.nonce, 'utf8'), Buffer.from(data_signed.data))
                    if(result){
                        console.log("Challenge success");
                        res.send(JSON.stringify({
                            data : "Challenge success",
                            success : true
                            })); 
                    }
                    else {
                        console.log("challenge failed");
                        Request.deleteOne({nonce: req.body.type_request}, async function(err, user){
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify({
                                    data : "Challenge failed",
                                    success : false
                                }));        
                            }
                            else {
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify({
                                    data : "Challenge failed",
                                    success : true
                                }));  
                            }
                        })
                    }
                }});
                break;
            case "CREDENTIAL_REQUEST":
                var newRequest = new Request();
                var random = await indy.generateNonce();

                newRequest.request(req.body.data.credRequest.prover_did, "Already now", random, req.body.type_request,'PENDING', JSON.stringify(req.body.data), req.body.endpoint_to, req.body.endpoint_from);
                console.log(newRequest)
                newRequest.save((err, request) => {
                    if (err){                
                        data = "Request rejected";
                        console.log(data);

                        res.send(JSON.stringify({
                            data : "Request rejected",
                            success : false
                            }));  
                    }
                    else {
                        res.send(JSON.stringify({
                            data : "Request sent",
                            success : true
                            }));    
                    }
                })
                break;
            case "CREDENTIAL_PROOF" :
                // Proof received
                var newRequest = new Request();
                newRequest.request("Already now", "Already now", req.body.req_id, req.body.type_request,'PENDING', JSON.stringify(req.body.data), req.body.endpoint_to, req.body.endpoint_from);
                console.log(newRequest)
                newRequest.save((err, request) => {
                    if (err){                
                        data = "Request rejected";
                        console.log(data);
                        res.send(JSON.stringify({
                            data : "Request rejected",
                            success : false
                            }));  
                    }
                    else {
                        res.send(JSON.stringify({
                            data : "Request sent",
                            success : true
                            }));
                    }
                })
                break;
    }
});

router.post('/manage_request', async function(req, res, next) {
    console.log(req.body.param2);
    switch(req.body.param2){
        case "GET_ALL_REQUEST":
            var allRequest = await Request.find({});
            console.log(allRequest);    
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                data : allRequest,
                success : true
            }));
            break;

        case "REJECT":
            Request.deleteOne({nonce: req.body.param1}, async function(err, user){
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
        }); break;

        case "GET_SCHEMA_FROM_LEDGER" :
            try{
                var schemaRequest = await indy.buildGetSchemaRequest(req.body.did, req.body.schemaId);
                var response = await indy.signAndSubmitRequest(req.body.pool, req.body.wallet, req.body.did, schemaRequest);
                console.log(response)
            if(response.result){
                var [schemaID, schema] = await indy.parseGetSchemaResponse(response);
                console.log("Schema got from ledger : ", schema);

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                data : schema,
                success : true
                }));
            }
            else{
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                data : "Oups error",
                success : false
                }));
            };

            }
            catch(e){
                console.log(e);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                data : e.indyMessage,
                success : false
                }));
            }
            break;
        case "GET_NONCE":
            res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                data : await indy.generateNonce(),
                success : true
                }));
                break;
            

    }
    
});

router.post('/manage_credential',isLoggedIn, async function(req, res, next) {
    
    console.log(req.body.type_request);
    switch(req.body.type_request){
        case "CREATE_SCHEMA_CREDENTIAL":
            var [schemaID, schema] = await indy.issuerCreateSchema(req.body.did, req.body.s_name, req.body.s_version, req.body.s_value);
            var schemaRequest = await indy.buildSchemaRequest(req.body.did, schema);
            var response = await indy.signAndSubmitRequest(req.body.pool, req.body.wallet, req.body.did, schemaRequest)
            console.log(response);
            if(response.op != "REQNACK"){
                console.log("SCHEMA CREATED : " + schemaID, schema);
                var newSchema = new Schema();
                newSchema.id = schemaID;  
                newSchema.name = req.body.s_name
                newSchema.version = req.body.s_version;
                // Save newUser object to database
                newSchema.save((err, schema) => {
                if (err) {
                    console.log('error detected during save process');
                }
                else {
                    console.log('Save');
                }

               
            });
             // Crédential definition 
             var [credDefId, credDef ] = await indy.issuerCreateAndStoreCredentialDef(
                                                req.body.wallet,
                                                req.body.did,
                                                schema,
                                                req.body.tag,
                                                req.body.signtype,
                                                { support_revocation: false }
                                                ); // without revocation
            }
            var credRequest = await indy.buildCredDefRequest(req.body.did, credDef);
            var resCredR = await indy.signAndSubmitRequest(req.body.pool, req.body.wallet, req.body.did, credRequest);
            console.log(resCredR);
            console.log("Credential Definition Posted :" + credDefId + "Value : " + credDef)
            
            // Credential Offer Creating
            var credentialOffer = await indy.issuerCreateCredentialOffer(
                req.body.wallet,
                credDefId
              );
            console.log(credentialOffer);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
            data : response,
            schema : { 'id' : schemaID, 'value': schema},
            credDef : { 'id' : credDefId, 'value': credDef},
            credOffer : credentialOffer
            }));
            break;
        case "CERTIFIED_CREDENTIAL":
            const tailsConfig = {
                base_dir: getPathToIndy() + "/tails",
                uri_pattern: ""
              };
            const tailsWriter = await indy.openBlobStorageWriter(
                "default",
                tailsConfig
              );
            console.log(req.body.attr_val);
            var [cred, _i, _d] = await indy.issuerCreateCredential(req.body.wallet,
                                                req.body.credOffer,
                                                req.body.credReq,
                                                req.body.attr_val,
                                                null,
                                                tailsWriter);
            console.log("CREDENTIAL of PROVER");
            console.log(cred);
            res.send(JSON.stringify({
                data : cred,
                success : true              
            }));
            break;

        case "VERIFY_PROOF":
            // {} designed not revocation timestamp for 
            const verif = await indy.verifierVerifyProof(
                JSON.stringify(req.body.data.proofReq),
                JSON.stringify(req.body.data.proof),
                JSON.stringify(req.body.data.schemas),
                JSON.stringify(req.body.data.credDefs),
                {},
                {}
            );
            console.log(verif);
            if(verif){
                res.send(JSON.stringify({
                    data : verif,
                    success : verif              
                }));
            }else{
                res.send(JSON.stringify({
                    data : verif,
                    success : verif              
                }));
            }
            
            break;


    }
    
});


function getPathToIndy() {
    return require('os').homedir() + "/.indy_client"
}


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


